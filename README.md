# Greening API

내 공간에 맞는 식물을 추천하고 구매·센서 관리·성장 기록·퀘스트 보상을 제공하는 REST API입니다.

## 시작하기

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

기본 주소는 `http://localhost:4000`, 상태 확인은 `GET /health`입니다. 방 사진 분석에는 `AI_API_KEY`가, 이미지 저장에는 S3 호환 저장소 설정이 필요합니다. API 키는 브라우저에 전달하지 않고 서버에서만 사용합니다.

## 주요 API

| Method | Path | 설명 |
|---|---|---|
| POST | `/api/v1/auth/register` | 회원가입 |
| POST | `/api/v1/auth/login` | 로그인과 토큰 발급 |
| POST | `/api/v1/auth/refresh` | 리프레시 토큰 회전 |
| GET/POST | `/api/v1/spaces` | 내 공간 조회/등록 |
| POST | `/api/v1/spaces/:id/analyze` | 방 사진 AI 분석 (`multipart`, `image`) |
| POST | `/api/v1/spaces/:id/recommendations` | 환경 기반 식물 추천 |
| GET | `/api/v1/plants` | 식물 카탈로그 |
| GET/POST | `/api/v1/my-plants` | 반려식물 목록/등록 |
| POST | `/api/v1/my-plants/:id/logs` | 성장 기록 (`multipart`, 선택 `image`) |
| GET | `/api/v1/quests` | 성장 퀘스트 목록 |
| POST | `/api/v1/my-plants/:id/quests/:questId/claim` | 달성 보상 수령 |
| POST | `/api/v1/sensors/devices` | 센서 등록 및 장치 키 1회 발급 |
| POST | `/api/v1/sensors/readings` | 센서 데이터 수집 (`X-Device-Key`) |
| GET/POST | `/api/v1/orders` | 주문 목록/생성 |

## 설계상 중요한 점

- 비밀번호는 Argon2id로 해시하고 access token은 짧게, refresh token은 DB에 해시하여 보관·회전합니다.
- 모든 SQL은 파라미터 바인딩을 사용합니다. 주문과 보상 지급은 트랜잭션으로 처리합니다.
- 사진은 메모리에서 크기·메타데이터를 정리한 후 S3 호환 저장소로 전송합니다.
- AI 분석은 인테리어 적합 조건을 보조할 뿐입니다. 실제 조도 추천은 센서값을 우선합니다.
- `FIRST_LEAF`는 사진 의미 검증이 필요한 퀘스트라 현재 자동 지급에서 제외했습니다. 운영자 검수 또는 별도 이미지 검증 모델을 연결한 뒤 승인해야 합니다.
- 결제 승인, 배송사/화원 배정, 식물 교체 보증은 외부 사업자 선택이 필요한 다음 단계입니다. 주문 API는 결제 전 `pending` 주문까지만 안전하게 생성합니다.

## 운영 전 체크

실서비스에서는 TLS, 관리형 PostgreSQL 백업, 비밀 관리자, S3 비공개 버킷+서명 URL, 악성 이미지 검사, 결제 웹훅 서명 검증, 센서 키 교체, 모니터링/감사 로그를 추가하세요. DB 연결의 `rejectUnauthorized` 설정은 이용할 PostgreSQL 공급자의 CA 구성에 맞춰야 합니다.

## 웹 프론트엔드

반응형 웹은 `web` 폴더에 있습니다. API 서버를 먼저 실행한 뒤 별도 터미널에서 실행하세요.

```bash
cd web
npm install
npm run dev
```

웹 주소는 `http://localhost:3000`, API 주소는 기본적으로 `http://localhost:4000`입니다. 다른 API 서버를 사용할 때는 `web/.env`의 `NEXT_PUBLIC_API_URL`을 변경하세요.
