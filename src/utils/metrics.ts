/**
 * 방문자별(고유 키) 행동 지표.
 * 페이지 진입마다 발급되는 고유 키(sid)를 붙여 중앙(Netlify Blobs)에 이벤트를 저장한다.
 * 방문자 전체 이메일·관심은 Netlify Forms(waitlist 제출)에서 본다.
 */

const ADMIN_MODE_KEY = "novelbible_admin_mode";

export function isAdminMode(): boolean {
  try {
    return localStorage.getItem(ADMIN_MODE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAdminMode(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(ADMIN_MODE_KEY, "true");
    else localStorage.removeItem(ADMIN_MODE_KEY);
  } catch {
    /* ignore */
  }
}

/** 페이지 로드(=한 번의 방문)마다 1개 발급되는 고유 키 */
function genId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return "v_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const SESSION_ID = genId();
export function getSessionId(): string {
  return SESSION_ID;
}

export type MetricType =
  | "role_select" // 첫 접속 팝업에서 역할 선택 (작가/지망생/CP/그외)
  | "demo_open" // 랜딩에서 기능 데모 카드를 열어 봄
  | "interest_add" // 관심 기능으로 선택
  | "interest_remove" // 관심 해제
  | "waitlist_submit" // 사전 예약(이메일) 제출
  | "submit_interest" // 제출에 포함된 관심 기능
  | "enter_demo" // '데모 둘러보기'로 전체 데모 진입
  | "app_feature"; // 전체 데모 안에서 기능(메뉴) 이동

export interface MetricEvent {
  ts: number;
  type: MetricType;
  feature?: string;
  /** 방문 고유 키 */
  sid: string;
}

export function trackEvent(type: MetricType, feature?: string): void {
  if (isAdminMode()) return;

  const ts = Date.now();
  try {
    fetch("/.netlify/functions/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sid: SESSION_ID, type, feature, ts }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

/** 백오피스용: 모든 방문자의 이벤트를 중앙에서 가져온다. */
export async function fetchCentralEvents(adminPassword: string): Promise<MetricEvent[]> {
  const res = await fetch("/.netlify/functions/metrics", {
    cache: "no-store",
    headers: { "x-admin-password": adminPassword },
  });
  if (!res.ok) throw new Error(`metrics ${res.status}`);
  const data = (await res.json()) as { events?: MetricEvent[] };
  return Array.isArray(data.events) ? data.events : [];
}

/** 백오피스용: 특정 방문 키의 중앙 이벤트를 삭제한다. */
export async function deleteCentralVisitor(adminPassword: string, sid: string): Promise<number> {
  const res = await fetch("/.netlify/functions/delete-metrics", {
    method: "POST",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      "x-admin-password": adminPassword,
    },
    body: JSON.stringify({ sid }),
  });
  if (!res.ok) throw new Error(`delete-metrics ${res.status}`);
  const data = (await res.json()) as { deleted?: number };
  return typeof data.deleted === "number" ? data.deleted : 0;
}

// ── 방문(키) 단위 요약 ──────────────────────────────────────

export interface VisitorSummary {
  sid: string;
  firstTs: number;
  lastTs: number;
  /** 첫 접속 팝업에서 고른 역할 (작가/지망생/CP/그외/무응답) */
  role?: string;
  /** 랜딩에서 열어본 데모 기능 (중복 제거) */
  demoFeatures: string[];
  /** 관심 표시한 기능 (중복 제거) */
  interests: string[];
  /** 이메일 제출 여부 */
  submitted: boolean;
  /** 전체 데모 진입 여부 */
  enteredDemo: boolean;
  /** 전체 데모 안에서 이동한 기능(페이지) 순서 (중복 제거, 진행 순) */
  appFeatures: string[];
  eventCount: number;
}

function uniqInOrder(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

/** 이벤트를 방문 키(sid)별로 묶어 요약 (최근 방문 먼저) */
export function groupByVisitor(events: MetricEvent[]): VisitorSummary[] {
  const map = new Map<string, MetricEvent[]>();
  for (const e of events) {
    const sid = e.sid || "legacy";
    const arr = map.get(sid) ?? [];
    arr.push(e);
    map.set(sid, arr);
  }

  const out: VisitorSummary[] = [];
  for (const [sid, evs] of map) {
    const sorted = [...evs].sort((a, b) => a.ts - b.ts);
    const roleEv = [...sorted].reverse().find((e) => e.type === "role_select");
    out.push({
      sid,
      firstTs: sorted[0]?.ts ?? 0,
      lastTs: sorted[sorted.length - 1]?.ts ?? 0,
      role: roleEv?.feature,
      demoFeatures: uniqInOrder(
        sorted.filter((e) => e.type === "demo_open").map((e) => e.feature ?? "")
      ).filter(Boolean),
      interests: uniqInOrder(
        sorted.filter((e) => e.type === "interest_add").map((e) => e.feature ?? "")
      ).filter(Boolean),
      submitted: sorted.some((e) => e.type === "waitlist_submit"),
      enteredDemo: sorted.some((e) => e.type === "enter_demo"),
      appFeatures: uniqInOrder(
        sorted.filter((e) => e.type === "app_feature").map((e) => e.feature ?? "")
      ).filter(Boolean),
      eventCount: sorted.length,
    });
  }
  return out.sort((a, b) => b.lastTs - a.lastTs);
}
