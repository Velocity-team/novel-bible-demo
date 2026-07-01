// PR 제목(컨벤셔널 커밋)과 본문(필수 섹션)이 규약을 따르는지 검증한다.
// 제목은 PR_TITLE, 본문은 PR_BODY 환경변수로 주입된다. 위반 시 비정상 종료(exit 1).

const title = process.env.PR_TITLE ?? "";
const body = process.env.PR_BODY ?? "";

// 제목 형식: `type : [TICKET] subject`
//   - type: 허용 목록 (CLAUDE.md 규약과 일치)
//   - [TICKET]: Jira 티켓 (예: [VEL-68]) — 대괄호 안 대문자 프로젝트키-숫자
//   - subject: 필수
// 예) feat : [VEL-68] Supabase 백엔드 기반 데모 데이터 수집 전환
const TITLE_RE =
  /^(feat|fix|docs|refactor|chore|test|style|perf|build|ci)\s*:\s*\[[A-Z]{2,}-\d+\]\s+\S.*$/;

// 필수 섹션. Self Checklist 는 존재만 확인하고 내용 채움은 강제하지 않는다.
// 그 외(Task Summary/Description/이슈 & Links)는 내용까지 채워져야 한다.
const required = ["Task Summary", "Description", "Self Checklist", "이슈 & Links"];
const contentRequired = new Set(["Task Summary", "Description", "이슈 & Links"]);

// 섹션명에 정규식 특수문자가 들어가도 안전하도록 이스케이프한다.
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sectionRaw(name) {
  const re = new RegExp(`^##\\s+${escapeRegExp(name)}\\s*$`, "im");
  const m = re.exec(body);
  if (!m) return null;
  const rest = body.slice(m.index + m[0].length);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

function meaningful(raw) {
  return raw
    .replace(/<!--[\s\S]*?-->/g, "") // HTML 주석 placeholder 제거
    .replace(/^\s*-\s*\[[ xX]\].*$/gm, "") // 체크박스 줄 제거
    .replace(/^\s*[-*]\s*$/gm, "") // 빈 bullet 제거
    .trim();
}

const errors = [];

// 1) 제목 검사
if (!TITLE_RE.test(title.trim())) {
  errors.push(
    `PR 제목 형식 위반: "${title}" — 예) feat : [VEL-68] 설명 (대괄호=Jira 티켓)`,
  );
}

// 2) 본문 필수 섹션 검사
for (const name of required) {
  const raw = sectionRaw(name);
  if (raw === null) {
    errors.push(`필수 섹션 누락: ## ${name}`);
    continue;
  }
  if (contentRequired.has(name) && meaningful(raw).length === 0) {
    errors.push(`섹션 내용이 비어 있음: ## ${name}`);
  }
}

// 3) Jira 티켓 존재 검증 — 시크릿이 모두 설정된 경우에만 수행한다.
//    404(없는 티켓)만 하드 실패. 인증/권한/장애(그 외 비정상 응답)는 경고만 →
//    오설정·일시 장애로 정상 PR 머지가 막히는 사고를 방지.
const ticket = (title.match(/\[([A-Z]{2,}-\d+)\]/) ?? [])[1] ?? null;
const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = process.env;

if (ticket && JIRA_BASE_URL && JIRA_EMAIL && JIRA_API_TOKEN) {
  try {
    const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");
    const url = `${JIRA_BASE_URL.replace(/\/+$/, "")}/rest/api/3/issue/${ticket}?fields=summary`;
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
    });
    if (res.status === 404) {
      errors.push(`Jira 티켓이 존재하지 않음: ${ticket}`);
    } else if (!res.ok) {
      console.log(`::warning::Jira 존재검증 건너뜀 (${ticket}): HTTP ${res.status}`);
    } else {
      const data = await res.json().catch(() => null);
      const summary = data?.fields?.summary;
      console.log(`Jira 티켓 확인됨: ${ticket}${summary ? ` — ${summary}` : ""}`);
    }
  } catch (e) {
    console.log(`::warning::Jira 존재검증 실패 (${ticket}): ${e.message}`);
  }
} else if (ticket) {
  console.log(`::warning::Jira 시크릿 미설정 — 티켓 존재검증 건너뜀 (${ticket})`);
}

if (errors.length > 0) {
  for (const e of errors) console.log(`::error::${e}`);
  console.error("\nPR 제목/본문이 규약을 따르지 않습니다. 제목은 `type : [TICKET] subject`, 본문은 .github/PULL_REQUEST_TEMPLATE.md 를 참고하세요.");
  process.exit(1);
}

console.log("PR 템플릿 검증 통과");
