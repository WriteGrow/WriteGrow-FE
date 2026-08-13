# WriteGrow-FE

초등 AI 문해력 코치 — 아동 글쓰기·교정(s2)과 보호자 리포트·검토(s3)를 목 백엔드 위의 PWA로 구현한다. 배경과 범위는 [`docs/frontend-plan.md`](docs/frontend-plan.md) 참고.

## 시작하기

```bash
npm install
npm run dev
```

`http://localhost:5173`을 열면 `/child`로 리다이렉트된다. s1(로그인)이 아직 없어서, 화면 우측 하단의 **아동 / 보호자** 스위처로 역할을 바꿔가며 `/child`·`/parent`를 오갈 수 있다. API는 전부 MSW가 목으로 응답한다 (`src/mocks`).

## 스크립트

| 명령                              | 설명                                                      |
| --------------------------------- | --------------------------------------------------------- |
| `npm run dev`                     | 개발 서버                                                 |
| `npm run build`                   | 타입체크 + 프로덕션 빌드 (PWA 매니페스트·서비스워커 포함) |
| `npm run preview`                 | 빌드 결과 로컬 확인 — PWA 설치 여부는 이 서버로 확인한다  |
| `npm run lint`                    | ESLint                                                    |
| `npm run format` / `format:check` | Prettier 적용 / 검사                                      |

## 폴더 구조

```
src/
  app/              라우터(역할 가드) · queryClient
  features/
    writing/        s2 — 아동 글쓰기·교정
    report/         s3 — 보호자 리포트·검토
  lib/pen/          펜 입력 (Pointer Events · perfect-freehand) — Phase 1
  components/ui/    저학년 접근성 프리미티브, 레이아웃 셸
  mocks/            MSW 핸들러 · 시드 데이터
  stores/           zustand (역할 등 클라이언트 상태)
```

## 진행 상태

- **Phase 0 (기반)** — 완료. `/child`, `/parent` 라우트와 레이아웃, MSW 목 API, PWA 매니페스트/서비스워커, 역할 가드.
- **Phase 1 (펜 입력 스파이크)** — 예정.

자세한 단계별 계획은 [`docs/frontend-plan.md`](docs/frontend-plan.md)에 있다.
