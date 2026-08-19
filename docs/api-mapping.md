# s2 실 API 매핑 계약

목 백엔드(MSW) 위에 세운 s2 화면을 실제 백엔드에 연결할 때의 결정 사항을 고정한다.
필드가 1:1로 대응하지 않는 지점이 여러 곳 있어서, 구현 중에 즉흥적으로 정하지 않도록 여기에 먼저 적는다.

- Swagger: https://1-201-117-51.sslip.io/swagger-ui.html
- 관련 이슈: [#11](https://github.com/WriteGrow/WriteGrow-FE/issues/11)
- 백엔드: [WriteGrow/WriteGrow-BE](https://github.com/WriteGrow/WriteGrow-BE)

이 문서의 범위는 이슈 #11의 **① API 클라이언트 기반**과 **② 조회 화면**이다.
펜 획 전송과 분석 폴링(③④)은 후속 이슈에서 다룬다. 이유는 마지막 절에 적었다.

## 0. 전제

### MSW는 유지한다

지우지 않는다. 서버가 `AI_STUB=true`로 분석을 스텁 처리하고 있고, 개인 dev 서버라 언제 내려갈지 모른다.
목을 지우면 그 순간 개발이 멈추므로 전환 가능한 상태로 둔다.

`VITE_API_BASE_URL`로 전환한다.

| 값 | 동작 |
| --- | --- |
| 비어 있음 (기본) | 상대 경로로 요청 → MSW가 가로챈다 |
| `https://1-201-117-51.sslip.io` | 실서버로 직접 요청 |

`.env.example`을 커밋하고 실제 값은 `.env.local`에 둔다. `.env.local`은 `.gitignore`의 `*.local`이 이미 잡고 있다.

`src/main.tsx`의 `enableMocking()`은 현재 `import.meta.env.PROD`만 보고 있다.
base URL이 설정돼 있으면 워커를 띄우지 않도록 조건을 하나 더 붙인다. 안 그러면 MSW가 실서버 요청을 가로채거나 통과시키는지가 `onUnhandledRequest: 'bypass'` 설정에 의존하게 되어 헷갈린다.

### CORS·인증서는 문제없다

백엔드 `WebConfig`가 `allowedOriginPatterns("*")`로 열어 뒀고, `sslip.io` 인증서는 브라우저가 신뢰하는 유효한 인증서다.
Vite 프록시 없이 `localhost:5173`에서 직접 호출된다.

### 모든 응답은 엔벨로프에 싸여 있다

성공과 실패가 서로 다른 타입이다.

```
성공: { success: true,  data: T }
실패: { success: false, error: { code, message, fieldErrors } }
```

`fetch(...).then(r => r.json())`을 그대로 쓰면 화면이 `data`가 아니라 엔벨로프를 받는다.
`res.ok`를 확인하지 않는 현재 코드도 같이 고쳐야 한다 — 404가 와도 지금은 `json()`을 그대로 반환한다.

### `X-Profile-Id` 헤더가 전 엔드포인트 필수다

빠지면 요청이 실패한다. 클라이언트에서 한 곳에서 주입한다.

현재 `src/lib/devChild.ts`는 `DEV_CHILD_ID = 'child-1'`(string)이다.
실서버는 `Long`을 받고, 라이브 서버에 이미 있는 프로필은 다음과 같다.

| profileId | role | nickname |
| --- | --- | --- |
| 1 | `CHILD` | 민준 |
| 2 | `PARENTS` | 엄마 |
| 3 | `CHILD` | 서연 |

아동 화면은 **`1`**을 쓴다. 상수 이름도 값의 정체가 바뀌었으므로 `DEV_CHILD_PROFILE_ID`로 바꾸고 타입은 `number`로 둔다.

`writingStore.postId`가 `string | null`인데 실제 ID는 `number`다. 라우트 파라미터(`useParams`)는 항상 string으로 들어오므로 숫자로 바꿔 쓰는 지점을 명시적으로 둔다.

### `TOPICS`를 목에서 꺼낸다

주제 목록 API는 백엔드에 없다. `POST /api/writings`의 `topic`은 자유 문자열이다.
그런데 `WriteStart.tsx`와 `ChildHome.tsx`가 `TOPICS`를 `src/mocks/seed`에서 import한다 —
목을 끄면 프로덕션 코드가 목 모듈에 의존한 채로 남는다.

`TOPICS`를 `src/lib/topics.ts`로 옮긴다. 목이 켜져 있든 꺼져 있든 화면이 같은 출처를 쓴다.

## 1. 엔드포인트 매핑

`/api/children/...`, `/api/posts/...` 계열은 실제로 존재하지 않는다. 전부 `/api/writings` 아래로 바뀐다.

| 화면 | 목 | 실제 |
| --- | --- | --- |
| ChildHome, PostList | `GET /api/children/{childId}/posts` | `GET /api/writings` |
| PostDetail | `GET /api/posts/{postId}` | `GET /api/writings/{writingId}` |
| PostDetail, ChildHome | `GET /api/posts/{postId}/errors` | `GET /api/writings/{writingId}/errors` |

`GET /api/children/{childProfileId}/writings`도 존재하지만 이건 **보호자 화면(s3)용**이다.
아동 자신의 목록은 `GET /api/writings` + `X-Profile-Id`다. 헷갈리기 쉬우니 주의한다.

### 목록은 배열이 아니다

`GET /api/writings`는 `PageResponse`를 돌려준다.

```
{ content: WritingSummaryResponse[], page, size, totalElements, totalPages, last }
```

화면은 `posts?.map(...)`으로 배열을 기대하고 있으므로 `content`를 꺼내야 한다.
`page`/`size` 쿼리 파라미터를 받는다. ChildHome은 `slice(0, 5)`로 자르고 있는데 `size=5`로 서버에서 자르는 편이 낫다.

## 2. 필드 매핑

### `Post` → `WritingSummaryResponse` (목록)

| 목 | 실제 | 비고 |
| --- | --- | --- |
| `id: string` | `writingId: number` | 타입 변경 |
| `title` | `topic` | 실제로는 제목이 아니라 주제다 |
| `createdAt` | `createdAt` | 그대로 |
| `mode: 'pen' \| 'keyboard'` | `inputType: 'PEN' \| 'KEYBOARD'` | 대문자 enum |
| — | `preview` | 최종본 미리보기 30자. 신규 |
| — | `status` | `DRAFT \| SUBMITTED \| ANALYZED \| CONFIRMED \| ANALYSIS_FAILED`. 신규 |
| `errorCount` | **없음** | 아래 결정 참고 |
| `lowConfidenceCount` | **없음** | 아래 결정 참고 |
| `childId` | **없음** | 불필요. 헤더로 대체된다 |

### `Post` → `WritingDetailResponse` (상세)

| 목 | 실제 |
| --- | --- |
| `id` | `writingId: number` |
| `title` | `topic` |
| `content` | `finalText` (없으면 `originalText`로 폴백) |
| `createdAt` | `createdAt` |
| `mode` | `inputType` |

`revisions`, `handwriting`, `submittedAt`, `profileId`가 추가로 온다. 이 이슈에서는 쓰지 않는다.

### `ErrorItem` → `ErrorCandidateResponse`

| 목 | 실제 | 비고 |
| --- | --- | --- |
| `id: string` | **없음** | `key`로 쓸 게 없다. 아래 결정 참고 |
| `postId` | **없음** | 불필요 |
| `type: '맞춤법' \| '띄어쓰기' \| '문장부호'` | `errorType` (6종) + `errorTypeLabel` | 서버가 한글 라벨을 준다. FE에서 매핑하지 말고 `errorTypeLabel`을 그대로 쓴다 |
| `original` | `originalText` | |
| `suggestion` | `suggestion` | **이름이 같다.** `Hint.tsx`의 정답 비교 로직은 그대로 살아남는다 |
| `confidence` | `confidence` | |
| `confirmed: boolean` | **없음** | 아래 결정 참고 |
| — | `startIndex`, `endIndex`, `reason` | 신규 |

`errorType` 전체: `SPELLING`, `SPACING`, `FINAL_CONSONANT`, `PARTICLE_ENDING`, `SENTENCE_STRUCTURE`, `VOCABULARY`.
목의 3종보다 넓다. 유형별 분기가 있다면 나머지 3종의 폴백을 둔다.

### 오류 응답도 배열이 아니다

`GET /api/writings/{writingId}/errors`는 `WritingErrorsResponse`를 돌려준다.

```
{ writingId, status, analyzedText, errors: ErrorCandidateResponse[], analyzedAt, failureReason }
```

`errors`를 꺼내야 한다. 그리고 `status`가 `PENDING | PROCESSING | SUCCEEDED | FAILED`이므로
**분석이 아직 안 끝났거나 실패한 상태가 조회 화면에도 올 수 있다.** 빈 배열과 "분석 미완료"를 구분해서 다룬다.

## 3. 고정하는 결정

간극이 있는 지점은 다음과 같이 처리한다.

### `errorCount` / `lowConfidenceCount` — 표시를 `status` 기반으로 바꾼다

쓰이는 곳은 두 군데다.

- `ChildHome.tsx:101` — `post.errorCount > 0 ? '자기교정 성공' : '수정 완료'`
- `PostList.tsx:30` — `고친 것 {post.errorCount}개`

`WritingSummaryResponse`에 개수 필드가 없다. 글마다 `GET /errors`를 부르면 목록 길이만큼 N+1 요청이 되므로 하지 않는다.

대신 `status`로 라벨을 만든다.

| `status` | 라벨 |
| --- | --- |
| `CONFIRMED` | 수정 완료 |
| `ANALYZED` | 고칠 것 확인하기 |
| `SUBMITTED` | 분석 중 |
| `DRAFT` | 쓰던 글 |
| `ANALYSIS_FAILED` | 분석 실패 |

개수 대신 `preview`를 부제로 노출한다. 목록에서 글을 구분하는 데는 개수보다 본문 미리보기가 낫다 —
지금은 `title`이 곧 `topic`이라서 같은 주제의 글이 목록에서 전부 같은 제목으로 보인다.

개수 표시가 요구사항으로 확정되면 백엔드에 `WritingSummaryResponse` 필드 추가를 요청한다. FE에서 N+1로 우회하지 않는다.

### `ErrorItem.id` — `startIndex`를 key로 쓴다

`PostDetail.tsx:41`이 `key={error.id}`를 쓴다. 서버는 id를 주지 않는다.
`errorType`과 `startIndex`를 합쳐 `` `${errorType}-${startIndex}` ``로 만든다.
한 지점에 같은 유형의 오류가 둘 나올 수 없으므로 충돌하지 않는다. 배열 index는 쓰지 않는다.

### `confirmed` — 전부 확정된 것으로 다룬다

`ChildHome.tsx:28`이 `latestErrors?.find((e) => e.confirmed)`로 확정 오류를 고른다.

`GET /writings/{id}/errors`는 Swagger 설명대로 "교정 대상으로 **확정된** 오류"만 반환한다.
확신도가 낮아 걸러진 것은 `GET /writings/{id}/error-review`(보호자용)로 빠진다.
따라서 `confirmed` 필터는 의미가 없다. `errors[0]`으로 바꾼다.

### 목 핸들러는 손대지 않는다

MSW를 유지하기로 했지만, 이 이슈에서 `src/mocks/handlers.ts`를 실제 스펙에 맞춰 재작성하지는 않는다.
그러면 작업이 두 배가 되고, 목과 실서버 양쪽을 동시에 검증해야 한다.

목은 "실서버가 죽었을 때 화면이라도 뜨는" 폴백으로만 남긴다.
`VITE_API_BASE_URL`을 비워 두면 기존 목 경로로 도는 지금 상태가 유지되도록,
API 모듈이 base URL에 따라 경로와 파싱을 나누는 형태를 취한다.

목과 실서버의 응답 형태가 다르다는 점은 이 문서에 남는 알려진 부채다. 후속 이슈(③④)에서 목을 실 스펙으로 맞춘다.

## 4. 후속 이슈로 미루는 것과 그 이유

### ③ 펜 계층 — 획 데이터에 시간이 없다

`src/lib/pen/PenCanvas.tsx:4`가 획을 이렇게 들고 있다.

```ts
export type Stroke = number[][] // [x, y, pressure][]
```

백엔드 `POST /api/writings/{writingId}/strokes`가 요구하는 형태는 다르다.

```
{ batchSeq, strokes: [{ index, penDownAt, penUpAt, points: [{ x, y, t, pressure }] }] }
```

점마다 `t`(세션 시작 기준 경과 ms), 획마다 `penDownAt` / `penUpAt`이 필요하다. **현재 캔버스는 시간을 아예 기록하지 않는다.**
그리고 `ProcessMetricResponse`의 `pauseCount`, `longestPauseMs`, `avgStrokeDurationMs`, `hesitationPoints`가 전부 이 타이밍에서 계산된다.
시간을 안 보내면 분석의 절반이 비어서 돌아온다.

`POST /{writingId}/handwriting-image`도 멀티파트 PNG를 받는데, 현재 캔버스는 SVG `<path>`로 렌더링하고 있어 래스터화 코드가 없다.
`canvasWidth` / `canvasHeight`도 캡처하지 않는다.

즉 이건 API 연결이 아니라 펜 입력 계층 수정이다. 실기기 재검증(`docs/pen-input-device-checklist.md`)도 다시 필요하다.

### ④ 제출·분석 플로우 — 동기에서 비동기 폴링으로 바뀐다

`Analyzing.tsx`는 지금 글 생성과 분석을 하나의 mutation으로 끝낸다.
`POST /api/ocr`도 `{ strokeCount }`를 보내 텍스트를 받는데, **이 엔드포인트는 실제로 존재하지 않는다.** 목에만 있는 가짜다.

실제 플로우는 단계가 더 많고 비동기다.

```
POST  /api/writings                → writingId, status: DRAFT
      PEN      → POST /{id}/strokes (배치) + POST /{id}/handwriting-image
      KEYBOARD → PATCH /{id}
POST  /{id}/submit                 → 202, analysisInProgress: true
GET   /{id}/analysis               → 폴링: PENDING | PROCESSING → SUCCEEDED | FAILED
PATCH /{id}/text                   → 최종본 확정, status: CONFIRMED
GET   /{id}/errors                 → 교정 대상 오류
```

폴링, `ANALYSIS_FAILED` 처리, 재시도(`POST /{id}/analysis/retry`), 409 충돌 처리가 새로 필요하다.
`OcrConfirm` → `Analyzing` 구간의 화면 순서 자체가 바뀌므로 조회 화면과 같은 PR에 넣지 않는다.
