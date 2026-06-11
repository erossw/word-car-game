# 🚗 Word Car Game

초등학생을 위한 영어 단어 학습 웹 게임.  
자동차가 자동으로 달리면서 장애물을 피하고, ⭐ 아이템을 먹으면 영어 단어 퀴즈가 나타나 정답을 맞춰야 스테이지를 클리어하는 사이드스크롤 런닝 게임입니다.

## 게임 개요

| 항목 | 내용 |
|------|------|
| 장르 | 사이드스크롤 런닝 + 어휘 퀴즈 |
| 대상 | 초등학교 1~6학년 |
| 플랫폼 | 웹 브라우저 (PC + 모바일) |
| 단어 | 영어 (English vocabulary) |
| 비주얼 | 이모지 + CSS |

## 핵심 기능

- 🚗 자동 주행하는 자동차 — 스페이스/탭으로 점프
- 🕳️ 구덩이, 🪨 바위, 🌵 선인장 등 장애물 회피
- ⭐ 단어 아이템 수집 → 영어 퀴즈 팝업
- 4지선다 퀴즈로 정답 선택 → 스테이지 클리어
- 스테이지 진행마다 속도 증가 및 난이도 상승
- 점수 기록 Top 10 (localStorage 저장)

## 게임 조작

| 입력 | 동작 |
|------|------|
| `Space` / `↑` 방향키 | 점프 |
| 화면 탭 (모바일) | 점프 |
| 퀴즈 보기 클릭 | 단어 선택 |

## 스테이지 구조

| 스테이지 | 학년 수준 | 예시 단어 |
|---------|---------|---------|
| 1~5 | 1~2학년 | cat, dog, sun, red, big |
| 6~10 | 3~4학년 | apple, happy, school, friend |
| 11~15 | 5~6학년 | adventure, message, exercise |
| 16+ | 혼합 무한 | 계속 상승 |

## 프로젝트 구조

```
word-car-game/
├── index.html              # 게임 진입점
├── css/
│   └── style.css           # UI 스타일 (퀴즈 팝업, HUD)
├── src/
│   ├── main.js             # Phaser 3 게임 설정
│   ├── scenes/
│   │   ├── BootScene.js    # 로딩
│   │   ├── MenuScene.js    # 메인 메뉴
│   │   ├── GameScene.js    # 핵심 게임 루프
│   │   ├── QuizScene.js    # 퀴즈 처리
│   │   └── ScoreScene.js   # 결과 화면
│   ├── objects/
│   │   ├── Car.js          # 플레이어 자동차
│   │   ├── Obstacle.js     # 장애물 스포너
│   │   └── WordItem.js     # 단어 아이템
│   └── data/
│       ├── words.js        # 학년별 영어 단어 DB
│       └── stages.js       # 스테이지 설정
└── docs/
    ├── GDD.md              # 게임 디자인 문서
    ├── architecture.md     # 기술 아키텍처
    └── word-list.md        # 영어 단어 목록
```

## 기술 스택

- **게임 엔진**: [Phaser 3](https://phaser.io/) (CDN)
- **렌더링**: HTML5 Canvas + 이모지 Text 오브젝트
- **퀴즈 UI**: HTML + CSS 오버레이
- **점수 저장**: localStorage (Top 10)
- **빌드**: 없음 — 브라우저에서 직접 실행

## 실행 방법

```bash
# 로컬 서버 실행 (npx 필요)
cd word-car-game
npx serve .

# 브라우저에서 http://localhost:3000 접속
```

## 문서

- [게임 디자인 문서 (GDD)](docs/GDD.md)
- [기술 아키텍처](docs/architecture.md)
- [영어 단어 목록](docs/word-list.md)
