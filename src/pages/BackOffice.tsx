import { useCallback, useMemo, useState, type FormEvent } from "react";
import {
  deleteCentralVisitor,
  fetchCentralEvents,
  fetchCentralLeads,
  groupByVisitor,
  isAdminMode,
  setAdminMode,
  type LeadEvent,
  type MetricEvent,
  type VisitorSummary,
} from "../utils/metrics";

const FEATURE_ICON: Record<string, string> = {
  "세계관 지도": "🗺️",
  "설정 오류 검수": "🚨",
  "캐릭터 회의실": "🎬",
  "AI에게 물어보기": "💬",
};

const ROLE_ICON: Record<string, string> = {
  작가: "✍️",
  지망생: "🌱",
  CP: "🏢",
  그외: "💡",
  무응답: "🤐",
  미확인: "❔",
};

/** 전체 데모 안에서 이동한 페이지(key) → 한글 라벨 */
const PAGE_LABEL: Record<string, string> = {
  dashboard: "🏠 내 작품 한눈에",
  import: "📥 원고·설정 불러오기",
  writing: "✒️ 새 회차 쓰기",
  memory: "🧠 AI 학습 현황",
  blocks: "🗂️ 설정 사전",
  relations: "🔗 관계 만들기",
  about: "💡 서비스 소개",
  ask: "💬 AI에게 물어보기",
  conflicts: "🚨 설정 오류 검사",
  settings: "⚙️ 작품 설정",
  atlas: "🗺️ 세계관 지도",
  plotroom: "🎬 캐릭터 회의실",
  scenario: "✨ 에피소드",
};

const pageLabel = (k: string) => PAGE_LABEL[k] ?? k;

function fmt(ts: number) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortKey(sid: string) {
  return sid.replace(/-/g, "").slice(0, 8);
}

function Chip({ children, tone = "stone" }: { children: React.ReactNode; tone?: string }) {
  const map: Record<string, string> = {
    stone: "bg-stone-800 text-stone-200",
    amber: "bg-amber-500/20 text-amber-300",
    emerald: "bg-emerald-500/20 text-emerald-300",
    blue: "bg-blue-500/20 text-blue-300",
  };
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}

export default function BackOffice() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [events, setEvents] = useState<MetricEvent[]>([]);
  const [leads, setLeads] = useState<LeadEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [adminMode, setAdminModeState] = useState(() => isAdminMode());
  const [deletingSid, setDeletingSid] = useState<string | null>(null);
  const visitors = useMemo(() => groupByVisitor(events), [events]);

  const loadCentral = useCallback(async (adminPassword = password) => {
    if (!adminPassword) return;
    setLoading(true);
    setErr(null);
    try {
      const [ev, leadRows] = await Promise.all([
        fetchCentralEvents(adminPassword),
        fetchCentralLeads(adminPassword),
      ]);
      setEvents(ev);
      setLeads(leadRows);
    } catch {
      setErr("중앙 데이터를 불러오지 못했어요. 비밀번호를 다시 확인해 주세요.");
      setEvents([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [password]);

  const unlock = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const [ev, leadRows] = await Promise.all([
        fetchCentralEvents(password),
        fetchCentralLeads(password),
      ]);
      setEvents(ev);
      setLeads(leadRows);
      setAdminMode(true);
      setAdminModeState(true);
      setUnlocked(true);
    } catch {
      setAuthError("비밀번호가 맞지 않아요. 힌트를 다시 확인해 주세요.");
    }
  };

  const refresh = () => loadCentral();

  const kpi = useMemo(() => {
    return {
      total: visitors.length,
      submitted: leads.length,
      entered: visitors.filter((v) => v.enteredDemo).length,
      openedDemo: visitors.filter((v) => v.demoFeatures.length > 0).length,
    };
  }, [leads.length, visitors]);

  // 역할(작가/지망생/CP/그외/무응답)별 방문 수
  const roleBreakdown = useMemo(() => {
    const order = ["작가", "지망생", "CP", "그외", "무응답"];
    const counts: Record<string, number> = {};
    for (const v of visitors) {
      const r = v.role || "미확인";
      counts[r] = (counts[r] ?? 0) + 1;
    }
    const keys = [...new Set([...order, ...Object.keys(counts)])].filter((k) => counts[k]);
    return keys.map((k) => ({ role: k, count: counts[k] }));
  }, [visitors]);

  const exportCsv = () => {
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const rows = [
      ["visitor_key", "role", "first_visit", "opened_demos", "interests", "email_submitted", "entered_full_demo", "app_features_clicked", "events"],
      ...visitors.map((v: VisitorSummary) => [
        v.sid,
        v.role ?? "",
        new Date(v.firstTs).toISOString(),
        v.demoFeatures.join(" | "),
        v.interests.join(" | "),
        v.submitted ? "Y" : "N",
        v.enteredDemo ? "Y" : "N",
        v.appFeatures.map(pageLabel).join(" | "),
        String(v.eventCount),
      ]),
    ];
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `novelbible-visitors-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exitToSite = () => {
    window.location.hash = "";
  };

  const toggleAdminMode = () => {
    const next = !adminMode;
    setAdminMode(next);
    setAdminModeState(next);
  };

  const deleteVisitor = async (visitor: VisitorSummary) => {
    const label = shortKey(visitor.sid);
    const ok = window.confirm(
      `방문 키 ${label}의 서버 기록 ${visitor.eventCount}건을 삭제할까요?\n삭제한 기록은 되돌릴 수 없습니다.`
    );
    if (!ok) return;

    setDeletingSid(visitor.sid);
    setErr(null);
    try {
      await deleteCentralVisitor(password, visitor.sid);
      setEvents((prev) => prev.filter((event) => event.sid !== visitor.sid));
    } catch {
      setErr("서버 기록을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeletingSid(null);
    }
  };

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950 px-4 text-stone-100">
        <form
          onSubmit={unlock}
          className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900 p-7 shadow-card"
        >
          <div className="text-3xl">🔐</div>
          <h1 className="mt-3 text-2xl font-extrabold">노벨 바이블 백오피스</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-400">
            관리자 전용 화면입니다. 비밀번호를 입력해 주세요.
          </p>
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            힌트: 관리자의 생일
          </div>
          <label className="mt-5 block">
            <span className="mb-1.5 block text-sm font-bold text-stone-300">비밀번호</span>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              className={`w-full rounded-xl border bg-stone-950 px-3.5 py-3 text-base text-white outline-none transition focus:ring-2 ${
                authError
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-stone-700 focus:border-amber-500 focus:ring-amber-500/30"
              }`}
              placeholder="MMDD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {authError && <p className="mt-2 text-sm font-semibold text-red-300">{authError}</p>}
          <button className="mt-5 w-full rounded-xl bg-amber-600 px-4 py-3 font-bold text-white transition hover:bg-amber-500">
            들어가기
          </button>
          <button
            type="button"
            className="mt-3 w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-sm font-semibold text-stone-300 transition hover:bg-stone-700"
            onClick={exitToSite}
          >
            사이트로 돌아가기
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-6 text-stone-100">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold">
              🛠️ 노벨 바이블 백오피스
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
                비공개 · 링크 전용
              </span>
              {adminMode && (
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">
                  관리자 모드 ON · 내 활동 저장 안 함
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-stone-400">
              방문(키)마다 ① 열어본 데모 기능 ② 이메일 제출 여부 ③ 전체 데모에서 누른 기능을 독립적으로
              봅니다. 데이터 출처:{" "}
              <b className="text-emerald-300">{loading ? "불러오는 중…" : "전체 방문자 (중앙 서버)"}</b>
              {err && <span className="ml-1 text-red-300">· {err}</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-lg bg-stone-800 px-3 py-2 text-sm font-semibold hover:bg-stone-700" onClick={refresh}>
              ↻ 새로고침
            </button>
            <button
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                adminMode
                  ? "bg-emerald-900/60 text-emerald-200 hover:bg-emerald-900"
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
              onClick={toggleAdminMode}
            >
              {adminMode ? "관리자 모드 끄기" : "관리자 모드 켜기"}
            </button>
            <button className="rounded-lg bg-stone-800 px-3 py-2 text-sm font-semibold hover:bg-stone-700" onClick={exportCsv}>
              ⬇ CSV 내보내기
            </button>
            <button className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-bold text-white hover:bg-amber-500" onClick={exitToSite}>
              ← 사이트로
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "총 방문(고유 키)", value: kpi.total },
            { label: "데모 열어본 방문", value: kpi.openedDemo },
            { label: "전체 데모 진입", value: kpi.entered },
            { label: "이메일 제출", value: kpi.submitted },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl border border-stone-800 bg-stone-900 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">{k.label}</div>
              <div className="mt-1 text-3xl font-extrabold">{k.value}</div>
            </div>
          ))}
        </div>

        {/* 역할 분포 */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
          <h2 className="mb-3 text-lg font-bold">역할 분포 (첫 접속 응답)</h2>
          {roleBreakdown.length === 0 ? (
            <p className="text-sm text-stone-500">아직 역할 응답이 없습니다.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {roleBreakdown.map((r) => (
                <span
                  key={r.role}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3 py-1.5 text-sm font-semibold"
                >
                  {ROLE_ICON[r.role] ?? "•"} {r.role}
                  <b className="text-amber-300">{r.count}</b>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 이메일 리드 */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
          <h2 className="mb-3 text-lg font-bold">이메일 리드 ({leads.length})</h2>
          {leads.length === 0 ? (
            <p className="text-sm text-stone-500">아직 수집된 이메일이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase text-stone-500">
                  <tr className="border-b border-stone-800">
                    <th className="py-2 pr-3">이메일</th>
                    <th className="py-2 pr-3">방문 키</th>
                    <th className="py-2 pr-3">역할</th>
                    <th className="py-2 pr-3">장르</th>
                    <th className="py-2 pr-3">관심 기능</th>
                    <th className="py-2">제출 시각</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 8).map((lead) => (
                    <tr key={lead.id} className="border-b border-stone-800/70 align-top">
                      <td className="py-2.5 pr-3 font-semibold text-emerald-300">{lead.email}</td>
                      <td className="py-2.5 pr-3 font-mono text-amber-300">{shortKey(lead.sid)}</td>
                      <td className="py-2.5 pr-3 text-stone-300">{lead.role || "—"}</td>
                      <td className="py-2.5 pr-3 text-stone-300">{lead.genre || lead.genreOther || "—"}</td>
                      <td className="py-2.5 pr-3">
                        {lead.interests.length === 0 ? (
                          <span className="text-stone-600">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {lead.interests.map((interest) => (
                              <Chip key={interest} tone="emerald">
                                {interest}
                              </Chip>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 text-stone-400">{fmt(lead.ts)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {leads.length > 8 && (
            <p className="mt-3 text-xs text-stone-500">최근 8개 이메일만 표시합니다.</p>
          )}
        </div>

        {/* 방문(키)별 독립 표 */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
          <h2 className="mb-3 text-lg font-bold">방문자별 활동 ({visitors.length})</h2>
          {visitors.length === 0 ? (
            <p className="rounded-xl bg-stone-800/60 p-4 text-sm text-stone-400">
              아직 기록된 방문이 없습니다. 랜딩에서 데모를 열어 보거나 ‘데모 둘러보기’로 들어가면 방문
              키가 생성되고 여기 쌓입니다.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] text-left text-sm">
                <thead className="text-xs uppercase text-stone-500">
                  <tr className="border-b border-stone-800">
                    <th className="py-2 pr-3">방문 키</th>
                    <th className="py-2 pr-3">역할</th>
                    <th className="py-2 pr-3">시각</th>
                    <th className="py-2 pr-3">열어본 데모 기능</th>
                    <th className="py-2 pr-3">이메일</th>
                    <th className="py-2 pr-3">전체 데모</th>
                    <th className="py-2 pr-3">데모에서 누른 기능</th>
                    <th className="py-2">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((v) => (
                    <tr key={v.sid} className="border-b border-stone-800/70 align-top">
                      <td className="py-2.5 pr-3 font-mono text-amber-300">{shortKey(v.sid)}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        {v.role ? `${ROLE_ICON[v.role] ?? ""} ${v.role}` : <span className="text-stone-600">—</span>}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-stone-400">{fmt(v.firstTs)}</td>
                      <td className="py-2.5 pr-3">
                        {v.demoFeatures.length === 0 ? (
                          <span className="text-stone-600">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {v.demoFeatures.map((f) => (
                              <Chip key={f} tone="amber">
                                {FEATURE_ICON[f] ?? ""} {f}
                              </Chip>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        {v.submitted ? <Chip tone="emerald">✅ 제출</Chip> : <span className="text-stone-600">—</span>}
                      </td>
                      <td className="py-2.5 pr-3">
                        {v.enteredDemo ? <Chip tone="blue">진입</Chip> : <span className="text-stone-600">—</span>}
                      </td>
                      <td className="py-2.5 pr-3">
                        {v.appFeatures.length === 0 ? (
                          <span className="text-stone-600">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {v.appFeatures.map((p) => (
                              <Chip key={p}>{pageLabel(p)}</Chip>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5">
                        <button
                          className="rounded-md bg-red-900/60 px-2 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={deletingSid === v.sid}
                          onClick={() => deleteVisitor(v)}
                        >
                          {deletingSid === v.sid ? "삭제 중…" : "삭제"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-xs text-stone-500">
            ※ 삭제는 중앙 서버 기록에서 해당 방문 키의 이벤트를 제거합니다. 방문 키는 페이지에 들어올 때마다
            새로 발급됩니다(새로고침=새 방문).
          </p>
        </div>
      </div>
    </div>
  );
}
