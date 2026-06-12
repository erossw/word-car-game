# 기술 아키텍처
## Word Car Game

**버전**: 1.2
**작성일**: 2026-06-12

---

## 1. 기술 스택

| 레이어 | 기술 | 이유 |
|--------|------|------|
| 게임 엔진 | Phaser 3 (CDN) | 물리/충돌/씬 관리 내장, 빌드 불필요 |
| 렌더링 | HTML5 Canvas | Phaser 기반 |
| 이모지 렌더링 | Phaser Text 오브젝트 | Canvas 위 이모지 자연스럽게 출력 |
| 퀴즈 UI | HTML DOM + CSS | Canvas 위 오버레이, 접근성/스타일링 유리 |
| 점수 저장 | localStorage | 백엔드 없이 영속적 데이터 저장 |
| 빌드 도구 | 없음 | index.html CDN 직접 로드 |

---

## 2. 씬(Scene) 구조

```
Phaser.Game
├── BootScene       씬 초기화 및 에셋 로딩
├── MenuScene       메인 메뉴 + 하이스코어 진입
├── GameScene       핵심 게임 루프 (메인)
│   └── [이벤트] → QuizScene (DOM 오버레이)
└── ScoreScene      게임 오버 + 점수 등록 + 하이스코어
```

### 씬 전환 흐름

```
Boot → Menu → Game ──[아이템 수집]──→ Quiz (일시정지)
                ↑                         │
                │    [정답/오답 처리]      │
                └─────────────────────────┘
                │
             [게임 오버]
                ↓
             Score → Menu
```

---

## 3. 클래스 / 모듈 구조

### 3.1 씬 파일

| 파일 | 역할 |
|------|------|
| `src/scenes/BootScene.js` | Phaser 에셋 로드 (`window.wordManager`는 words.js 로드 시 자동 생성) |
| `src/scenes/MenuScene.js` | 시작 버튼, 하이스코어 버튼, 타이틀 |
| `src/scenes/GameScene.js` | 게임 루프: 스크롤, 충돌, HUD, 스테이지 관리 |
| `src/scenes/QuizScene.js` | DOM 오버레이 제어, 15초 타이머, 정오답 이벤트 |
| `src/scenes/ScoreScene.js` | 결과 표시, 이름 입력, localStorage 저장 |

### 3.2 게임 오브젝트

| 파일 | 클래스 | 역할 |
|------|--------|------|
| `src/objects/Car.js` | `Car` | 플레이어: 점프/앞뒤 이동 물리, 충돌, 1.5초 무적 처리 |
| `src/objects/Obstacle.js` | `ObstacleSpawner` | 장애물 생성/재활용 (오브젝트 풀링) |
| `src/objects/WordItem.js` | `WordItem` | 단어 아이템 생성, 수집 감지, 퀴즈 트리거 |

### 3.3 데이터 모듈

| 파일 | 내용 |
|------|------|
| `src/data/words.js` | 801개 단어 + `WordManager` 클래스 (셔플 덱 방식) |
| `src/data/stages.js` | 스테이지별 설정: `{ speed, obstacleInterval, gradeLevel, bgTheme, targetDistance }` |

---

## 4. 데이터 스키마

### 4.1 단어 데이터 (`words.js`)

```js
// 단어 항목 포맷
{
  word: "cat",
  emoji: "🐱",
  hint: "a small furry animal that says 'meow'",
  grade: 1
}
```

**총 801개, 학년별 수량:**

| 학년 | 단어 수 | 주요 카테고리 |
|------|--------|------------|
| 1 | 140개 | 동물, 색깔, 신체, 사물, 날씨, 기본 동사, 의류, 도형 |
| 2 | 149개 | 음식, 집안용품, 장소, 가족, 계절, 동사 확장 |
| 3 | 141개 | 학교/과목, 스포츠, 교통, 직업, 감정, 형용사 확장 |
| 4 | 149개 | 자연, 환경, 일상생활, 동사/부사 확장, 추상 명사 |
| 5 | 96개 | 추상어, 사회, 과학 기초 |
| 6 | 126개 | 과학 심화, 사회/문화, 고급 동사, 수학/통계 용어 |

distractors(오답 선택지 3개)는 저장하지 않고 `WordManager.getDistractors()`가 동적으로 생성합니다.

### 4.2 WordManager 클래스

**위치**: `src/data/words.js` 하단 — `<script src="src/data/words.js">` 로드 시 즉시 `window.wordManager = new WordManager()` 실행 (BootScene과 무관)

```js
class WordManager {
  init()                              // 학년별 셔플 덱 초기화 (게임 시작 시 1회)
  getWord(gradeLevel)                 // 다음 단어 반환, 덱 소진 시 재셔플
  getDistractors(correctWord, grade)  // 오답 3개 반환 (정답 제외 무작위)
  getTotalCount()                     // 전체 단어 수 반환
}
```

**출제 보장 원리:**
- 스테이지 진입 시 `getWord(gradeLevel)` 1회 호출
- 덱 포인터가 호출마다 1씩 증가 → **덱 소진 전까지 중복 없이 출제**
- 세션 내 모든 단어 소진 후 재셔플, 직전 마지막 단어와 연속 중복 방지 처리 포함

| 시나리오 | 동작 |
|---------|------|
| 스테이지 1 첫 플레이 | `getWord(1)` → 셔플 덱[0] |
| 스테이지 1 재시작 | `getWord(1)` → 셔플 덱[1] (포인터 이미 증가) |
| 세션 내 동일 학년 전체 소진 | 재셔플 후 덱[0]부터 |

### 4.3 스테이지 데이터 (`stages.js`)

```js
{
  stage: 1,
  gradeLevel: 1,          // WordManager에 전달할 학년
  scrollSpeed: 200,       // px/초
  obstacleInterval: 1000, // 장애물 생성 간격 (ms), 최소 600ms
  targetDistance: 500,    // 스테이지 클리어 거리 (px)
  bgTheme: "day"          // "day" | "evening" | "night" | "space"
}
```

### 4.4 점수 저장 스키마 (localStorage)

```js
// 키: "wordCarGame_scores"
// 값: JSON 배열 최대 10개
[
  {
    name: "PLAYER1",      // 플레이어 이름 (최대 10자)
    score: 2450,          // 최종 점수
    stage: 5,             // 도달 스테이지
    date: "2026-06-12"    // 게임 날짜 (YYYY-MM-DD)
  }
]
```

---

## 5. 게임 루프 (GameScene 내부)

### 스테이지 2-페이즈 흐름

```
[페이즈 1: 0% → 45%]
  달리기 + 장애물 피하기 (ObstacleSpawner 계속 활성)
  거리 45% 도달 → WordItem(별) 스폰 → 플레이어가 수집
    → Phaser 일시정지 → QuizScene 표시 (15초)
      → 정답 (quizPassed = true) : 게임 재개, 페이즈 2 진입
      → 오답                     : 목숨 -1, 정답 표시 후 재개 (quizPassed = false)

[페이즈 2: 45% → 100%]  (quizPassed = true 일 때만)
  계속 달리기 + 장애물 피하기
  거리 100% 도달 → completeStage() → 다음 스테이지
```

### update() 호출마다

```
  1. 배경 스크롤 이동
  2. Car 상태 업데이트 (중력 적용, 위치 계산, 방향에 따라 이모지 좌우 반전)
  3. ObstacleSpawner 틱 (장애물 생성/이동/재활용 — 페이즈 내내 중단 없이 활성)
  4. WordItem 상태 업데이트 (반짝임 애니메이션)
  5. 충돌 감지
     - Car vs Obstacle → 목숨 감소, 1.5초 무적 시작
     - Car vs WordItem → 수집, Phaser 일시정지, QuizScene 트리거
  6. 거리 누적 (scrollSpeed × delta / 1000) + 점수 증가 (+1점 / 10px)
  7. HUD 업데이트 (점수/콤보, 목숨, 노란색 거리 게이지)
  8. 거리 45% 도달 체크 → WordItem 스폰 (미수집 상태일 때 1회)
  9. quizPassed && 거리 100% 도달 체크 → completeStage()
 10. 목숨 0 체크 → ScoreScene 전환
```

---

## 6. 퀴즈 오버레이 아키텍처

퀴즈는 Phaser 씬이 아닌 **HTML DOM 오버레이**로 구현합니다.

이유:
- 버튼, 텍스트, 타이머 바를 CSS로 쉽게 스타일링
- 키보드 탐색, 접근성 지원
- Phaser 캔버스와 독립적으로 동작

흐름:
```
WordItem 수집
  → GameScene.pauseGame()         // Phaser 타임스케일 0
  → QuizScene.showQuiz(wordData)  // DOM 오버레이 표시
    → 타이머 시작 (15초)
    → 4개 선택지 렌더링 (정답 + getDistractors() 결과 섞기)
    → 플레이어 선택 or 시간 초과
      → 정답: onCorrect() → +100점, 스테이지 클리어
      → 오답: onWrong()  → 목숨 -1, 정답 표시
  → QuizScene.hideQuiz()          // DOM 오버레이 숨김
  → GameScene.resumeGame()        // Phaser 타임스케일 1
```

---

## 7. 디렉터리 구조

```
word-car-game/
├── index.html              # Phaser 3 CDN 로드, 캔버스 컨테이너, 퀴즈 오버레이 DOM
├── css/
│   └── style.css           # 오버레이, HUD, 메뉴 스타일
├── src/
│   ├── main.js             # Phaser.Game 설정, 씬 등록
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── MenuScene.js
│   │   ├── GameScene.js
│   │   ├── QuizScene.js
│   │   └── ScoreScene.js
│   ├── objects/
│   │   ├── Car.js
│   │   ├── Obstacle.js
│   │   └── WordItem.js
│   └── data/
│       ├── words.js        # WORDS_BY_GRADE 객체 + WordManager 클래스
│       └── stages.js
└── docs/
    ├── GDD.md
    ├── architecture.md     # (이 파일)
    └── word-list.md        # 설계 참고용 단어 목록
```

---

## 8. 성능 고려사항

- **오브젝트 풀링**: 장애물은 화면 밖으로 나가면 삭제하지 않고 재활용
- **이모지 렌더링**: Phaser Text 오브젝트 재사용, 생성/파괴 최소화
- **스케일링**: `Phaser.Scale.FIT` 모드로 모든 화면 크기 대응
- **모바일**: 화면 탭 점프와 좌우 가상 버튼 지원

---

## 9. Codex 구현 가이드

Codex가 코드를 작성할 때 참고할 핵심 계약:

### words.js → GameScene 인터페이스

```js
// GameScene 진입 시 (스테이지 시작마다 1회)
const wordData = window.wordManager.getWord(stageConfig.gradeLevel);
// wordData: { word: string, emoji: string, hint: string, grade: number }

// QuizScene에 전달할 오답 3개
const distractors = window.wordManager.getDistractors(wordData, stageConfig.gradeLevel);
// distractors: [string, string, string]
```

### QuizScene DOM 요소 ID (index.html과 연동)

```
#quiz-overlay    퀴즈 전체 컨테이너 (display: none ↔ flex)
#quiz-emoji      이모지 힌트 표시 영역
#quiz-hint       영어 정의 텍스트 영역
#quiz-timer-bar  타이머 진행 바 (CSS width % 애니메이션)
#quiz-choices    4개 버튼 컨테이너
```

### 점수 계산 규칙

| 이벤트 | 점수 |
|--------|------|
| 이동 거리 | +1점 / 10px |
| 스테이지 클리어 (퀴즈 정답 포함) | +150점 × 콤보 배율 |
| 빠른 정답 (5초 이내) | +50점 추가 |
| 연속 정답 2회 | ×1.5 배율 |
| 연속 정답 3회+ | ×2.0 배율 (최대) |

> 퀴즈 정답 점수와 스테이지 클리어 점수는 분리되지 않고 `completeStage()`에서 `150 × multiplier`로 한번에 지급됩니다.
> 오답 시에는 목숨만 감소하며 스테이지 클리어 점수가 없습니다.
