# Supabase API Specification

LoreBlock 데모의 이메일 수집과 사용자 행동 로그 수집을 Netlify Functions/Blobs에서 Supabase Edge Functions/Postgres로 이전하기 위한 API 스펙이다.

## 1. 기본 원칙

- 프론트엔드는 `src/utils/metrics.ts`를 통해 API를 호출한다.
- 공개 API는 익명 사용자가 호출할 수 있으나, 허용된 Origin만 받는다.
- 관리자 API는 `x-admin-password` 헤더로 보호한다.
- 이벤트 수집 실패는 데모 사용을 막지 않는다. 프론트에서는 `catch` 후 조용히 무시한다.
- 시간 값은 기존 코드와 호환되도록 Unix epoch milliseconds(`Date.now()`)를 기본으로 한다.

## 2. Base URL

```text
VITE_SUPABASE_FUNCTIONS_URL=https://<project-ref>.supabase.co/functions/v1
```

예시:

```ts
fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/track-event`, ...)
```

## 3. 공통 헤더

공개 API:

```http
content-type: application/json
```

관리자 API:

```http
content-type: application/json
x-admin-password: <BACKOFFICE_PASSWORD>
```

Supabase Edge Function 내부에서는 `SUPABASE_SERVICE_ROLE_KEY`를 사용해 DB에 접근한다. 이 키는 프론트에 노출하지 않는다.

## 4. 이벤트 타입

기존 `MetricType`과 동일하게 유지한다.

```ts
type MetricType =
  | "role_select"
  | "demo_open"
  | "interest_add"
  | "interest_remove"
  | "waitlist_submit"
  | "submit_interest"
  | "enter_demo"
  | "app_feature";
```

## 5. POST /track-event

사용자 행동 이벤트를 저장한다.

### Request

```json
{
  "sid": "8fdc1f8a-7f6d-4df4-b1f4-3c7b9f927a41",
  "type": "demo_open",
  "feature": "세계관 분석",
  "ts": 1719630000000
}
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `sid` | string | yes | 페이지 로드마다 발급되는 방문 세션 ID |
| `type` | `MetricType` | yes | 이벤트 종류 |
| `feature` | string | no | 기능명, 역할명, 관심 항목 등 |
| `ts` | number | yes | 클라이언트 발생 시각 |

### Response

```json
{
  "ok": true,
  "id": "uuid"
}
```

### Errors

- `400`: `sid`, `type`, `ts` 누락 또는 잘못된 이벤트 타입
- `403`: 허용되지 않은 Origin
- `500`: DB 저장 실패

## 6. POST /submit-lead

이메일 사전예약 정보를 저장한다. 기존 Netlify Forms `waitlist` 제출을 대체한다.

### Request

```json
{
  "sid": "8fdc1f8a-7f6d-4df4-b1f4-3c7b9f927a41",
  "email": "user@example.com",
  "role": "작가",
  "genre": "로맨스",
  "genreOther": "",
  "interests": ["세계관 분석", "플롯 점검"],
  "ts": 1719630000000
}
```

### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `sid` | string | yes | 방문 세션 ID |
| `email` | string | yes | 수집 이메일 |
| `role` | string | no | 랜딩에서 선택한 사용자 역할 |
| `genre` | string | no | 선택 장르 |
| `genreOther` | string | no | 직접 입력 장르 |
| `interests` | string[] | no | 관심 기능 목록 |
| `ts` | number | yes | 제출 시각 |

### Response

```json
{
  "ok": true,
  "id": "uuid"
}
```

### Side Effect

저장 성공 후 `waitlist_submit` 이벤트를 별도 저장하거나, 프론트에서 기존처럼 `/track-event`를 추가 호출한다. 구현 단순화를 위해 1차 버전은 프론트가 기존 `trackEvent("waitlist_submit")`를 유지한다.

### Errors

- `400`: 이메일 형식 오류 또는 필수값 누락
- `409`: 같은 이메일 중복 제출. 중복 허용 정책이면 `200`으로 기존 행을 업데이트한다.
- `403`: 허용되지 않은 Origin
- `500`: DB 저장 실패

## 7. GET /admin-events

백오피스에서 전체 행동 이벤트를 조회한다.

### Request

```http
GET /admin-events
x-admin-password: <BACKOFFICE_PASSWORD>
```

선택 쿼리:

```text
?limit=1000&from=1719543600000&to=1719630000000
```

### Response

```json
{
  "events": [
    {
      "sid": "8fdc1f8a-7f6d-4df4-b1f4-3c7b9f927a41",
      "type": "demo_open",
      "feature": "세계관 분석",
      "ts": 1719630000000
    }
  ]
}
```

`src/utils/metrics.ts`의 `fetchCentralEvents()`가 바로 사용할 수 있도록 기존 응답 형태 `{ events: MetricEvent[] }`를 유지한다.

### Errors

- `401`: 관리자 비밀번호 누락 또는 불일치
- `500`: DB 조회 실패

## 8. GET /admin-leads

백오피스에서 이메일 사전예약 목록을 조회한다.

### Request

```http
GET /admin-leads
x-admin-password: <BACKOFFICE_PASSWORD>
```

선택 쿼리:

```text
?limit=500&from=1719543600000&to=1719630000000
```

### Response

```json
{
  "leads": [
    {
      "id": "uuid",
      "sid": "8fdc1f8a-7f6d-4df4-b1f4-3c7b9f927a41",
      "email": "user@example.com",
      "role": "작가",
      "genre": "로맨스",
      "genreOther": "",
      "interests": ["세계관 분석", "플롯 점검"],
      "ts": 1719630000000,
      "createdAt": "2026-06-29T07:00:00.000Z"
    }
  ]
}
```

### Errors

- `401`: 관리자 비밀번호 누락 또는 불일치
- `500`: DB 조회 실패

## 9. POST /admin-delete-visitor

특정 방문자 세션의 이벤트를 삭제한다. 백오피스의 기존 방문자 삭제 기능을 대체한다.

### Request

```json
{
  "sid": "8fdc1f8a-7f6d-4df4-b1f4-3c7b9f927a41"
}
```

### Response

```json
{
  "ok": true,
  "deleted": 12
}
```

`src/utils/metrics.ts`의 `deleteCentralVisitor()`가 바로 사용할 수 있도록 `deleted` 숫자를 유지한다.

### Errors

- `400`: `sid` 누락
- `401`: 관리자 비밀번호 누락 또는 불일치
- `500`: DB 삭제 실패

## 10. DB 테이블 초안

### events

```sql
create table public.events (
  id uuid primary key default gen_random_uuid(),
  sid text not null,
  type text not null,
  feature text,
  ts bigint not null,
  created_at timestamptz not null default now()
);

create index events_sid_idx on public.events (sid);
create index events_ts_idx on public.events (ts desc);
create index events_type_idx on public.events (type);
```

### leads

```sql
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  sid text not null,
  email text not null,
  role text,
  genre text,
  genre_other text,
  interests text[] not null default '{}',
  ts bigint not null,
  created_at timestamptz not null default now()
);

create unique index leads_email_unique_idx on public.leads (lower(email));
create index leads_sid_idx on public.leads (sid);
create index leads_ts_idx on public.leads (ts desc);
```

## 11. 환경 변수

프론트(Netlify):

```text
VITE_SUPABASE_FUNCTIONS_URL=https://<project-ref>.supabase.co/functions/v1
VITE_CLARITY_PROJECT_ID=<optional>
```

Supabase Edge Functions:

```text
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
BACKOFFICE_PASSWORD=<admin-password>
ALLOWED_ORIGIN=https://loreblock-demo.netlify.app
```

## 12. 구현 순서

1. Supabase 프로젝트를 생성한다.
2. `events`, `leads` 테이블을 생성한다.
3. Edge Functions `track-event`, `submit-lead`, `admin-events`, `admin-leads`, `admin-delete-visitor`를 만든다.
4. Netlify와 Supabase에 환경 변수를 등록한다.
5. `src/utils/metrics.ts`의 Netlify Function URL을 Supabase API로 교체한다.
6. `src/pages/Landing.tsx`의 Netlify Forms 제출을 `/submit-lead` 호출로 교체한다.
7. `src/pages/BackOffice.tsx`에서 이메일 목록 조회가 필요하면 `/admin-leads`를 연결한다.
8. 배포 후 실제 랜딩 제출, 데모 클릭, 백오피스 조회를 검증한다.
9. 검증 완료 후 `netlify/functions/*` 제거 여부를 결정한다.
