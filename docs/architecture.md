# 기술 아키텍처
## Word Car Game

**버전**: 1.0  
**작성일**: 2026-06-11

---

## 1. 기술 스택

| 레이어 | 기술 | 버전 | 이유 |
|--------|------|------|------|
| 게임 엔진 | Phaser 3 | 3.x (CDN) | 물리/충돌/씬 관리 내장, 빌드 불필요 |
| 렌더링 | HTML5 Canvas | 브라우저 내장 | Phaser 기반 |
| 이모지 렌더링 | Phaser Text 오브젝트 | - | Canvas 위에 이모지 자연스럽게 출력 |
| 퀴즈 UI | HTML DOM + CSS | - | Canvas 위 오버레이, 접근성 유리 |
| 점수 저장 | localStorage | 브라우저 내장 | 백엔드 없이 영속적 데이터 저장 |
| 빌드 도구 | 없음 | - | index.html CDN 직접 로드 |

---

## 2. 씬(Scene) 구조

```
Phaser.Game
├── BootScene       로딩/초기화
├── MenuScene       메인 메뉴
├── GameScene       핵심 게임 루프 (메인)
│   └── [이벤트] → QuizScene (오버레이 팝업)
└── ScoreScene      게임 오버 + 점수 등록 + 하이스코어
```

### 씬 전환 흐름

```
Boot → Menu → Game ──[아이템 수집]──→ Quiz (일시정지)
                 ↑                        │
                 │   [정답/오답 처리]      │
                 └────────────────────────┘
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
| `src/scenes/BootScene.js` | Phaser 에셋 로드, 씬 이니셜라이저 |
| `src/scenes/MenuScene.js` | 시작 버튼, 하이스코어 버튼, 타이틀 |
| `src/scenes/GameScene.js` | 게임 루프: 스크롤, 충돌, HUD, 스테이지 |
| `src/scenes/QuizScene.js` | DOM 오버레이 제어, 타이머, 정오답 이벤트 |
| `src/scenes/ScoreScene.js` | 결과 표시, 이름 입력, localStorage 저장 |

### 3.2 게임 오브젝트

| 파일 | 클래스 | 역할 |
|------|--------|------|
| `src/objects/Car.js` | `Car` | 플레이어: 점프, 충돌, 무적 처리 |
| `src/objects/Obstacle.js` | `ObstacleSpawner` | 장애물 생성/재활용 (오브젝트 풀링) |
| `src/objects/WordItem.js` | `WordItem` | 단어 아이템 생성, 수집 감지, 퀴즈 트리거 |

### 3.3 데이터 모듈

| 파일 | 내용 |
|------|------|
| `src/data/words.js` | 학년별 단어 배열. 각 단어: `{ word, hint, emoji, distractors[] }` |
| `src/data/stages.js` | 스테이지별 설정: `{ speed, obstacleFreq, gradeLevel, bgTheme, targetDistance }` |

---

## 4. 데이터 스키마

### 4.1 단어 데이터 (`words.js`)

```js
// 예시 구조 (단어 1개)
{
  word: "cat",           // 정답 단어
  hint: "a small furry animal that says 'meow'",  // 영어 정의
  emoji: "🐱",           // 힌트 이모지
  distractors: ["dog", "bird", "fish"],  // 오답 선택지 3개
  grade: 1               // 학년 수준 (1~6)
}
```

### 4.2 스테이지 데이터 (`stages.js`)

```js
// 예시 구조 (스테이지 1개)
{
  stage: 1,
  gradeLevel: 1,           // 단어 학년 수준
  scrollSpeed: 200,        // 픽셀/초
  obstacleInterval: 3000,  // 장애물 생성 간격 (ms)
  targetDistance: 500,     // 스테이지 클리어 거리 (px)
  bgTheme: "day"           // 배경 테마
}
```

### 4.3 점수 저장 스키마 (localStorage)

```js
// localStorage 키: "wordCarGame_scores"
// 값: JSON 배열 (최대 10개)
[
  {
    name: "PLAYER1",        // 플레이어 이름 (최대 10자)
    score: 2450,            // 최종 점수
    stage: 5,               // 도달 스테이지
    date: "2026-06-11"      // 게임 날짜 (YYYY-MM-DD)
  }
]
```

---

## 5. 게임 루프 (GameScene 내부)

```
update() 호출마다:
  1. 배경 스크롤 이동
  2. Car 상태 업데이트 (중력 적용, 위치 계산)
  3. ObstacleSpawner 틱 (장애물 생성/이동/재활용)
  4. WordItem 상태 업데이트 (반짝임 애니메이션)
  5. 충돌 감지
     - Car vs Obstacle → 목숨 감소, 무적 시간 시작
     - Car vs WordItem → 수집, QuizScene 트리거
  6. 거리 누적 + 점수 증가
  7. HUD 업데이트 (점수, 목숨, 거리 게이지)
  8. 목숨 0 체크 → ScoreScene 전환
```

---

## 6. 퀴즈 오버레이 아키텍처

퀴즈는 Phaser 씬이 아닌 **HTML DOM 오버레이**로 구현합니다.

이유:
- 버튼, 텍스트, 타이머 바 등 CSS로 쉽게 스타일링 가능
- 접근성 (키보드 탐색, 스크린리더) 지원
- Phaser 캔버스와 독립적으로 동작

흐름:
```
WordItem 수집
  → GameScene.pauseGame()       // Phaser 타임스케일 0
  → QuizScene.showQuiz(word)    // DOM 오버레이 표시
    → 타이머 시작 (15초)
    → 플레이어 선택
      → 정답: onCorrect()
      → 오답: onWrong()
  → QuizScene.hideQuiz()        // DOM 오버레이 숨김
  → GameScene.resumeGame()      // Phaser 타임스케일 1
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
│       ├── words.js
│       └── stages.js
└── docs/
    ├── GDD.md
    ├── architecture.md     # (이 파일)
    └── word-list.md
```

---

## 8. 성능 고려사항

- **오브젝트 풀링**: 장애물은 화면 밖으로 나가면 삭제하지 않고 재활용
- **이모지 렌더링**: Phaser Text 오브젝트 재사용, 생성/파괴 최소화
- **스케일링**: `Phaser.Scale.FIT` 모드로 모든 화면 크기 대응
- **모바일**: 터치 입력은 `Phaser.Input.Touch` 이용

---

## 9. 확장 가능성 (미래 고려)

| 기능 | 방법 |
|------|------|
| 단어 DB 추가 | `words.js`에 배열 항목만 추가 |
| 새 장애물 타입 | `Obstacle.js`의 타입 enum 확장 |
| 멀티플레이 | WebSocket 서버 추가 (현재 스코프 외) |
| 백엔드 점수 저장 | localStorage → API 교체 |
