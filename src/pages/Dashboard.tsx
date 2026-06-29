import { useMemo, useState } from "react";
import { SeverityBadge, TypeBadge } from "../components/Badge";
import { BLOCK_TYPE_META } from "../components/meta";
import StatCard from "../components/StatCard";
import WorldMap from "../components/WorldMap";
import { useApp } from "../context/AppContext";
import { simulateConsistency } from "../utils/aiSim";

type HealthLevel = "good" | "warn" | "risk";

const LEVEL_META: Record<HealthLevel, { label: string; chip: string; icon: string }> = {
  good: { label: "잘 지켜지고 있어요", chip: "bg-emerald-100 text-emerald-800", icon: "🟢" },
  warn: { label: "주의가 필요해요", chip: "bg-amber-100 text-amber-800", icon: "🟡" },
  risk: { label: "손봐야 해요", chip: "bg-red-100 text-red-700", icon: "🔴" },
};

/** 점수 대신 상태(좋음·주의·위험)로 보여주는 점검 카드 */
function HealthCard({
  level,
  label,
  note,
}: {
  level: HealthLevel;
  label: string;
  note: string;
}) {
  const meta = LEVEL_META[level];
  return (
    <div className="card p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-lg font-bold text-stone-800">{label}</span>
        <span className={`chip ${meta.chip}`}>
          {meta.icon} {meta.label}
        </span>
      </div>
      <p className="text-base leading-relaxed text-stone-500">{note}</p>
    </div>
  );
}

/** 인물 토큰 (세계관 지도와 동일) */
const CHAR_TOKEN: Record<string, string> = {
  c1: "🙂",
  c2: "😤",
  c3: "👩",
  c4: "👩‍🦰",
  c5: "🐦",
};

/** 최신 회차 기준으로 "지금 누가 어디서 무엇을" 하고 있었는지 브리핑하는 카드 */
function SituationBriefing() {
  const { state, navigate, openBlockDetail } = useApp();
  const { project, blocks } = state;

  const episodes = [...project.episodes].sort((a, b) => a.number - b.number);
  const latest = episodes[episodes.length - 1];
  if (!latest) return null;

  const placements = state.placements.filter((p) => p.episodeId === latest.id);
  const zoneName = (id: string) => state.zones.find((z) => z.id === id)?.name ?? id;
  const blockOf = (id: string) => blocks.find((b) => b.id === id);

  // 장소별로 인물 묶기
  const byZone = new Map<string, typeof placements>();
  for (const p of placements) {
    const arr = byZone.get(p.zoneId) ?? [];
    arr.push(p);
    byZone.set(p.zoneId, arr);
  }

  const d = latest.date;
  const dateLine = d ? `작품 ${d.year}년차 · ${d.season}` : "시간 미상";

  return (
    <section className="card relative overflow-hidden p-6 lg:p-7">
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📡</span>
            <h2 className="text-xl font-extrabold text-stone-800">현재 상황 브리핑</h2>
            <span className="chip bg-amber-100 text-amber-900">최신 회차 기준</span>
          </div>
          <button
            className="text-sm font-semibold text-amber-700 hover:underline"
            onClick={() => navigate("atlas")}
          >
            세계관 지도에서 보기 →
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr]">
          {/* 시간 + 마지막 내용 */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-600">
              작품 속 시간
            </div>
            <div className="mt-0.5 text-2xl font-extrabold text-stone-800">{dateLine}</div>
            <div className="mt-1 text-sm font-semibold text-stone-600">{latest.title}</div>
            <p className="mt-3 text-base leading-relaxed text-stone-500">
              <span className="font-bold text-stone-700">마지막 내용 — </span>
              {latest.summary}
            </p>
          </div>

          {/* 누가 어디서 무엇을 하다 끝났는지 */}
          <div className="space-y-2">
            <div className="label mb-0">이 회차가 끝난 시점, 누가 어디서 무엇을</div>
            {[...byZone.entries()].map(([zid, ps]) => (
              <div key={zid} className="rounded-xl border border-paper-300 bg-paper-100 p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-amber-700">
                  <span>📍</span> {zoneName(zid)}
                </div>
                <ul className="space-y-1">
                  {ps.map((p) => {
                    const b = blockOf(p.characterId);
                    return (
                      <li
                        key={p.characterId}
                        className="flex cursor-pointer items-start gap-2 text-base text-stone-700 hover:text-amber-700"
                        onClick={() => openBlockDetail(p.characterId)}
                      >
                        <span className="shrink-0">{CHAR_TOKEN[p.characterId] ?? "🧭"}</span>
                        <span>
                          <b className="text-stone-800">{b?.name ?? p.characterId}</b>
                          <span className="text-stone-500"> — {p.activity}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {placements.length === 0 && (
              <p className="rounded-xl bg-paper-100 p-3 text-base text-stone-500">
                이 회차의 위치 데이터가 아직 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { state, navigate, openBlockDetail } = useApp();
  const { blocks, relations, conflicts, project } = state;
  const report = useMemo(() => simulateConsistency(state), [state]);
  // '지금 쓰고 있는 작품'부터 아래 내용은 기본 접힘 (대시보드 정보량 줄이기)
  const [showMore, setShowMore] = useState(false);

  const count = (t: string) => blocks.filter((b) => b.type === t).length;
  const openConflicts = conflicts.filter((c) => c.status === "open");
  const needsReview = blocks.filter(
    (b) => b.aiStatus === "Needs Review" || b.aiStatus === "Conflict Risk"
  );
  const noEvidence = blocks.filter((b) => b.sourceEvidence.length === 0);
  const recentBlocks = [...blocks]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const lastEpisode = project.episodes[project.episodes.length - 1];

  // 아직 채워야 할 내용 안내
  const todos: { icon: string; text: string; action: () => void; cta: string }[] = [];
  if (openConflicts.length > 0)
    todos.push({
      icon: "🚨",
      text: `설정 오류 ${openConflicts.length}건이 아직 해결되지 않았어요.`,
      action: () => navigate("conflicts"),
      cta: "오류 보러 가기",
    });
  if (needsReview.length > 0)
    todos.push({
      icon: "👁️",
      text: `확인이 필요한 설정 카드가 ${needsReview.length}장 있어요.`,
      action: () => navigate("blocks"),
      cta: "설정 사전 열기",
    });
  if (noEvidence.length > 0)
    todos.push({
      icon: "📄",
      text: `근거 문장이 없는 설정 카드가 ${noEvidence.length}장 있어요. 원고를 더 올리면 채워져요.`,
      action: () => navigate("import"),
      cta: "원고 올리기",
    });
  if (!state.notes.some((n) => n.title.startsWith("시나리오 방향 메모")))
    todos.push({
      icon: "💡",
      text: "아직 받아 본 관계별 시나리오 추천이 없어요. 캐릭터 회의실에서 방향을 받아 볼까요?",
      action: () => navigate("plotroom", { plotTab: "recommend" }),
      cta: "시나리오 추천 받기",
    });

  const canonLevel: HealthLevel =
    report.canonConsistency >= 85 ? "good" : report.canonConsistency >= 70 ? "warn" : "risk";
  const foreshadowLevel: HealthLevel =
    report.foreshadowingRecovery >= 85
      ? "good"
      : report.foreshadowingRecovery >= 60
        ? "warn"
        : "risk";

  return (
    <div className="fade-up space-y-6">
      {/* 최신 회차 기준 현재 상황 브리핑: 가장 먼저 보이는 요약 */}
      <SituationBriefing />

      {/* 설정 지도: 인물·장소·사건 관계망 */}
      <WorldMap />

      {/* 작품 정보·점검·통계는 토글로 접어 둔다 */}
      <button
        className="flex w-full items-center justify-between rounded-2xl border border-paper-300 bg-white px-5 py-3.5 text-left text-lg font-bold text-stone-700 shadow-card transition hover:bg-paper-100"
        onClick={() => setShowMore((v) => !v)}
      >
        <span>📂 작품 정보 · 집필 점검 · 통계 {showMore ? "접기" : "펼치기"}</span>
        <span className="text-stone-400">{showMore ? "▲" : "▼"}</span>
      </button>

      {showMore && (
        <>
      {/* 작품 카드 + 작업 흐름 */}
      <section className="card relative overflow-hidden p-7">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="relative">
          <div className="mb-1 text-sm font-bold text-amber-700">지금 쓰고 있는 작품</div>
          <h2 className="text-3xl font-extrabold text-stone-800">{project.title}</h2>
          <p className="mt-1 text-base text-stone-500">{project.genre}</p>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-stone-700">
            {project.logline}
          </p>

          {/* 핵심 작업 흐름 3단계 */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-left transition hover:bg-amber-100"
              onClick={() => navigate("import")}
            >
              <div className="text-2xl">📥</div>
              <div className="mt-1 text-lg font-bold text-stone-800">① 원고 올리기</div>
              <p className="text-base text-stone-600">새로 쓴 회차를 올리면 설정이 자동으로 저장돼요.</p>
            </button>
            <button
              className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-left transition hover:bg-emerald-100"
              onClick={() => navigate("plotroom", { plotTab: "recommend" })}
            >
              <div className="text-2xl">💡</div>
              <div className="mt-1 text-lg font-bold text-stone-800">② 관계별 시나리오 추천</div>
              <p className="text-base text-stone-600">저장된 설정을 지키며 다음 이야기의 방향과 키워드를 추천받아요.</p>
            </button>
            <button
              className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-left transition hover:bg-red-100"
              onClick={() => navigate("conflicts")}
            >
              <div className="text-2xl">🚨</div>
              <div className="mt-1 text-lg font-bold text-stone-800">③ 놓친 부분 검사</div>
              <p className="text-base text-stone-600">설정끼리 어긋나는 부분을 찾아서 고쳐요.</p>
            </button>
          </div>
        </div>
      </section>

      {/* 집필 점검: 설정 일관성 · 떡밥 회수 (점수 대신 상태로 표시) */}
      <section className="grid gap-4 sm:grid-cols-2">
        <HealthCard level={canonLevel} label="🧭 설정 일관성" note={report.canonNote} />
        <HealthCard level={foreshadowLevel} label="🎣 떡밥 회수" note={report.foreshadowNote} />
      </section>

      {/* 통계 카드 */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="설정 카드 전체" value={blocks.length} icon="🗂️" onClick={() => navigate("blocks")} />
        <StatCard label="인물" value={count("character")} icon="👤" onClick={() => navigate("blocks")} />
        <StatCard label="장소" value={count("location")} icon="🏡" accent="text-teal-700" onClick={() => navigate("blocks")} />
        <StatCard label="사건" value={count("event")} icon="⚡" accent="text-amber-700" onClick={() => navigate("blocks")} />
        <StatCard label="관계" value={relations.length} icon="🔗" accent="text-blue-700" onClick={() => navigate("relations")} />
        <StatCard
          label="설정 오류"
          value={openConflicts.length}
          icon="🚨"
          accent={openConflicts.length > 0 ? "text-red-600" : "text-emerald-700"}
          onClick={() => navigate("conflicts")}
        />
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* 채워야 할 내용 */}
        <section className="card p-5">
          <h3 className="mb-3 text-lg font-bold text-stone-800">📌 채워야 할 내용</h3>
          <ul className="space-y-2">
            {todos.slice(0, 4).map((t, i) => (
              <li key={i} className="rounded-xl border border-paper-300 bg-paper-100 p-3">
                <p className="text-base leading-relaxed text-stone-700">
                  {t.icon} {t.text}
                </p>
                <button className="mt-1 text-base font-semibold text-amber-700 hover:underline" onClick={t.action}>
                  {t.cta} →
                </button>
              </li>
            ))}
            {todos.length === 0 && (
              <li className="rounded-xl bg-emerald-50 p-3 text-base text-emerald-800">
                지금은 채울 내용이 없어요. 설정이 잘 정리되어 있습니다. ✨
              </li>
            )}
          </ul>
        </section>

        {/* 최근 설정 오류 */}
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-800">최근 발견된 설정 오류</h3>
            <button className="text-base text-amber-700 hover:underline" onClick={() => navigate("conflicts")}>
              전체 보기 →
            </button>
          </div>
          <ul className="space-y-2">
            {openConflicts.slice(0, 3).map((c) => (
              <li
                key={c.id}
                className="cursor-pointer rounded-xl border border-paper-300 bg-paper-100 p-3 transition hover:border-red-300"
                onClick={() => navigate("conflicts")}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-base font-semibold text-stone-800">{c.title}</span>
                  <SeverityBadge severity={c.severity} />
                </div>
                <p className="line-clamp-2 text-sm text-stone-500">{c.description}</p>
              </li>
            ))}
            {openConflicts.length === 0 && (
              <li className="rounded-xl bg-emerald-50 p-3 text-base text-emerald-800">
                해결할 설정 오류가 없습니다. ✨
              </li>
            )}
          </ul>
        </section>

        {/* 최근 저장된 설정 카드 */}
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-stone-800">최근 저장된 설정 카드</h3>
            <button className="text-base text-amber-700 hover:underline" onClick={() => navigate("blocks")}>
              전체 보기 →
            </button>
          </div>
          <ul className="space-y-1.5">
            {recentBlocks.map((b) => (
              <li
                key={b.id}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-paper-100"
                onClick={() => openBlockDetail(b.id)}
              >
                <span className="text-lg">{BLOCK_TYPE_META[b.type].icon}</span>
                <span className="flex-1 truncate text-base font-medium text-stone-700">{b.name}</span>
                <TypeBadge type={b.type} />
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-xl bg-paper-100 p-3 text-sm text-stone-600">
            마지막으로 학습한 원고: <b className="text-stone-800">{lastEpisode?.title ?? "-"}</b>
          </div>
        </section>
      </div>
        </>
      )}
    </div>
  );
}
