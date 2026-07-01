import { useMemo, useState } from "react";
import { SeverityBadge, TypeBadge } from "../components/Badge";
import { BLOCK_TYPE_META } from "../components/meta";
import { Icon } from "../components/Icon";
import WorldMap from "../components/WorldMap";
import { useApp } from "../context/AppContext";
import { simulateConsistency } from "../utils/aiSim";

type HealthLevel = "good" | "warn" | "risk";

const LEVEL_META: Record<HealthLevel, { label: string; chip: string; icon: string }> = {
  good: { label: "잘 지켜지고 있어요", chip: "border border-line bg-paper-2 text-ink-mid", icon: "●" },
  warn: { label: "주의가 필요해요", chip: "border border-line bg-paper text-ink-soft", icon: "○" },
  risk: { label: "손봐야 해요", chip: "border border-signal bg-signal-bg text-signal", icon: "▲" },
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
        <span className="text-lg font-bold text-ink">{label}</span>
        <span className={`chip ${meta.chip}`}>
          {meta.icon} {meta.label}
        </span>
      </div>
      <p className="text-base leading-relaxed text-ink-soft">{note}</p>
    </div>
  );
}

/** 인물 토큰 (세계관 지도와 동일) — 무채색 원칙: 색이 아니라 이니셜 */
const CHAR_TOKEN: Record<string, string> = {
  c1: "도",
  c2: "윤",
  c3: "문",
  c4: "채",
  c5: "에",
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
    <section className="card p-6 lg:p-7">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-ink">현재 상황 브리핑</h2>
            <span className="chip bg-paper-2 text-ink-mid">최신 회차 기준</span>
          </div>
          <button
            className="text-sm font-semibold text-ink-soft transition hover:text-ink"
            onClick={() => navigate("atlas")}
          >
            세계관 지도에서 보기 →
          </button>
        </div>

        <div className="mt-5 grid items-start gap-y-5 lg:grid-cols-[230px_1fr] lg:gap-x-8">
          {/* 작품 속 시간 + 마지막 내용 — 무거운 박스 대신 얇은 좌측 잉크 룰 + 여백 */}
          <div className="border-l-2 border-ink pl-4">
            <div className="text-xs font-bold uppercase tracking-widest text-ink-faint">
              작품 속 시간
            </div>
            <div className="mt-0.5 text-2xl font-extrabold tracking-tight text-ink">{dateLine}</div>
            <div className="mt-1 font-mono text-sm text-ink-soft">{latest.title}</div>
            <p className="mt-4 text-base leading-relaxed text-ink-mid">
              <span className="font-bold text-ink">마지막 내용 — </span>
              {latest.summary}
            </p>
          </div>

          {/* 누가 어디서 무엇을 하다 끝났는지 — 두 열 상단 정렬 · 헤어라인 행 */}
          <div>
            <h3 className="mb-3 text-base font-bold text-ink">
              이 회차가 끝난 시점, 누가 어디서 무엇을
            </h3>
            <div className="space-y-4">
              {[...byZone.entries()].map(([zid, ps]) => (
                <div key={zid}>
                  {/* 위치 앵커 — 무거운 박스 대신 얇은 윤곽 라벨 */}
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-sm border border-line bg-paper px-2.5 py-1 text-sm text-ink-soft">
                    <Icon name="map-pin" size={14} className="shrink-0" /> {zoneName(zid)}
                  </div>
                  <ul>
                    {ps.map((p) => {
                      const b = blockOf(p.characterId);
                      // 의식(빙의 주체)=채운 원 ● / 몸·일반 인물=윤곽 링 ○ (색 아닌 형태로 이중부호)
                      const isMind = !!b?.attributes?.["의식"];
                      return (
                        <li
                          key={p.characterId}
                          className="grid cursor-pointer grid-cols-[26px_1fr] items-baseline gap-3 border-t border-line py-2 text-base text-ink-mid transition first:border-t-0 hover:text-ink"
                          onClick={() => openBlockDetail(p.characterId)}
                        >
                          <span
                            className={
                              isMind
                                ? "inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-ink text-xs font-bold text-paper"
                                : "inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border-[1.5px] border-ink-mid bg-transparent text-xs font-bold text-ink-mid"
                            }
                          >
                            {CHAR_TOKEN[p.characterId] ?? "?"}
                          </span>
                          <span className="leading-snug">
                            <b className="text-ink">{b?.name ?? p.characterId}</b>
                            <span className="text-ink-soft"> — {p.activity}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              {placements.length === 0 && (
                <p className="text-base text-ink-soft">이 회차의 위치 데이터가 아직 없습니다.</p>
              )}
            </div>
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
  const todos: { text: string; action: () => void; cta: string }[] = [];
  if (openConflicts.length > 0)
    todos.push({
      text: `설정 오류 ${openConflicts.length}건이 아직 해결되지 않았어요.`,
      action: () => navigate("conflicts"),
      cta: "오류 보러 가기",
    });
  if (needsReview.length > 0)
    todos.push({
      text: `확인이 필요한 설정 카드가 ${needsReview.length}장 있어요.`,
      action: () => navigate("blocks"),
      cta: "설정 사전 열기",
    });
  if (noEvidence.length > 0)
    todos.push({
      text: `근거 문장이 없는 설정 카드가 ${noEvidence.length}장 있어요. 원고를 더 올리면 채워져요.`,
      action: () => navigate("import"),
      cta: "원고 올리기",
    });
  if (!state.notes.some((n) => n.title.startsWith("시나리오 방향 메모")))
    todos.push({
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

  // 통계 — 박스 없는 헤어라인 스탯 행에 그대로 얹는다 (데이터·이동 동일)
  const stats: { label: string; value: number; accent: string; onClick: () => void }[] = [
    { label: "설정 카드 전체", value: blocks.length, accent: "text-ink", onClick: () => navigate("blocks") },
    { label: "인물", value: count("character"), accent: "text-ink", onClick: () => navigate("blocks") },
    { label: "장소", value: count("location"), accent: "text-ink", onClick: () => navigate("blocks") },
    { label: "사건", value: count("event"), accent: "text-ink", onClick: () => navigate("blocks") },
    { label: "관계", value: relations.length, accent: "text-ink", onClick: () => navigate("relations") },
    {
      label: "설정 오류",
      value: openConflicts.length,
      accent: openConflicts.length > 0 ? "text-signal" : "text-ink",
      onClick: () => navigate("conflicts"),
    },
  ];

  return (
    <div className="fade-up space-y-6">
      {/* 최신 회차 기준 현재 상황 브리핑: 가장 먼저 보이는 요약 */}
      <SituationBriefing />

      {/* 설정 지도: 인물·장소·사건 관계망 */}
      <WorldMap />

      {/* 작품 정보·점검·통계는 토글로 접어 둔다 */}
      <button
        className="flex w-full items-center justify-between rounded-sm border border-line bg-paper px-5 py-3.5 text-left text-lg font-bold text-ink-mid transition hover:bg-paper-2"
        onClick={() => setShowMore((v) => !v)}
      >
        <span>작품 정보 · 집필 점검 · 통계 {showMore ? "접기" : "펼치기"}</span>
        <span className="text-ink-faint">{showMore ? "▲" : "▼"}</span>
      </button>

      {showMore && (
        <>
      {/* 작품 카드 + 작업 흐름 */}
      <section className="card p-7">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint">지금 쓰고 있는 작품</div>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-ink">{project.title}</h2>
          <p className="mt-1 text-base text-ink-soft">{project.genre}</p>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-mid">
            {project.logline}
          </p>

          {/* 핵심 작업 흐름 3단계 */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              className="rounded-sm border border-line bg-paper-2 p-4 text-left transition hover:border-ink-mid"
              onClick={() => navigate("import")}
            >
              <Icon name="import" size={24} className="text-ink-soft" />
              <div className="mt-1 text-lg font-bold text-ink">① 원고 올리기</div>
              <p className="text-base text-ink-soft">새로 쓴 회차를 올리면 설정이 자동으로 저장돼요.</p>
            </button>
            <button
              className="rounded-sm border border-line bg-paper-2 p-4 text-left transition hover:border-ink-mid"
              onClick={() => navigate("plotroom", { plotTab: "recommend" })}
            >
              <Icon name="idea" size={24} className="text-ink-soft" />
              <div className="mt-1 text-lg font-bold text-ink">② 관계별 시나리오 추천</div>
              <p className="text-base text-ink-soft">저장된 설정을 지키며 다음 이야기의 방향과 키워드를 추천받아요.</p>
            </button>
            <button
              className="rounded-sm border border-line bg-paper-2 p-4 text-left transition hover:border-ink-mid"
              onClick={() => navigate("conflicts")}
            >
              <Icon name="conflicts" size={24} className="text-ink-soft" />
              <div className="mt-1 text-lg font-bold text-ink">③ 놓친 부분 검사</div>
              <p className="text-base text-ink-soft">설정끼리 어긋나는 부분을 찾아서 고쳐요.</p>
            </button>
          </div>
        </div>
      </section>

      {/* 집필 점검: 설정 일관성 · 떡밥 회수 (점수 대신 상태로 표시) */}
      <section className="grid gap-4 sm:grid-cols-2">
        <HealthCard level={canonLevel} label="설정 일관성" note={report.canonNote} />
        <HealthCard level={foreshadowLevel} label="떡밥 회수" note={report.foreshadowNote} />
      </section>

      {/* 통계 — 박스 없는 헤어라인 스탯 행 (큰 숫자 + 작은 라벨) */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={s.onClick}
            className="flex flex-col gap-1 bg-paper px-4 py-5 text-left transition hover:bg-paper-2"
          >
            <div className={`text-3xl font-bold leading-none ${s.accent}`}>{s.value}</div>
            <div className="text-sm text-ink-soft">{s.label}</div>
          </button>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* 채워야 할 내용 */}
        <section className="card p-5">
          <h3 className="mb-3 text-lg font-bold text-ink">채워야 할 내용</h3>
          <ul className="space-y-2">
            {todos.slice(0, 4).map((t, i) => (
              <li key={i} className="rounded-sm border border-line bg-paper-2 p-3">
                <p className="text-base leading-relaxed text-ink-mid">
                  {t.text}
                </p>
                <button className="mt-1 text-base font-semibold text-ink hover:underline" onClick={t.action}>
                  {t.cta} →
                </button>
              </li>
            ))}
            {todos.length === 0 && (
              <li className="rounded-sm bg-paper-2 p-3 text-base text-ink-mid border border-line">
                지금은 채울 내용이 없어요. 설정이 잘 정리되어 있습니다.
              </li>
            )}
          </ul>
        </section>

        {/* 최근 설정 오류 */}
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink">최근 발견된 설정 오류</h3>
            <button className="text-base text-ink hover:underline" onClick={() => navigate("conflicts")}>
              전체 보기 →
            </button>
          </div>
          <ul className="space-y-2">
            {openConflicts.slice(0, 3).map((c) => (
              <li
                key={c.id}
                className="cursor-pointer rounded-sm border border-line bg-paper-2 p-3 transition hover:border-ink-mid"
                onClick={() => navigate("conflicts")}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-base font-semibold text-ink">{c.title}</span>
                  <SeverityBadge severity={c.severity} />
                </div>
                <p className="line-clamp-2 text-sm text-ink-soft">{c.description}</p>
              </li>
            ))}
            {openConflicts.length === 0 && (
              <li className="rounded-sm bg-paper-2 p-3 text-base text-ink-mid border border-line">
                해결할 설정 오류가 없습니다.
              </li>
            )}
          </ul>
        </section>

        {/* 최근 저장된 설정 카드 */}
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink">최근 저장된 설정 카드</h3>
            <button className="text-base text-ink hover:underline" onClick={() => navigate("blocks")}>
              전체 보기 →
            </button>
          </div>
          <ul className="space-y-1.5">
            {recentBlocks.map((b) => (
              <li
                key={b.id}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 transition hover:bg-paper-2"
                onClick={() => openBlockDetail(b.id)}
              >
                <Icon name={BLOCK_TYPE_META[b.type].icon} size={16} className="shrink-0 text-ink-soft" />
                <span className="flex-1 truncate text-base font-medium text-ink-mid">{b.name}</span>
                <TypeBadge type={b.type} />
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-sm border border-line bg-paper-2 p-3 text-sm text-ink-soft">
            마지막으로 학습한 원고: <b className="text-ink">{lastEpisode?.title ?? "-"}</b>
          </div>
        </section>
      </div>
        </>
      )}
    </div>
  );
}
