import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import type { Tile, WorldDate } from "../types";

const CELL = 26;

/** 타일별 배경색 + 위에 얹는 장식(프롭) */
const TILE_STYLE: Record<Tile, { bg: string; prop?: string }> = {
  void: { bg: "transparent" },
  grass: { bg: "#b6d29a" },
  soil: { bg: "#d8c39a" },
  path: { bg: "#e3d2ab" },
  floor: { bg: "#ece0c8" },
  wall: { bg: "#b59875" },
  water: { bg: "#a7d3e6" },
  sand: { bg: "#ecdcab" },
  tree: { bg: "#9cc07e", prop: "🌳" },
  rice: { bg: "#dcc987", prop: "🌾" },
  gourd: { bg: "#cfe0a6", prop: "gourd" },
  pot: { bg: "#cdb89a", prop: "🏺" },
};

/** 캐릭터 토큰 표현 (2D 스프라이트 대용) */
const CHAR_TOKEN: Record<string, { icon: string; ring: string; bg: string }> = {
  c1: { icon: "🙂", ring: "#d9a441", bg: "#fbf2dc" },
  c2: { icon: "😤", ring: "#8a7a64", bg: "#efe9df" },
  c3: { icon: "👩", ring: "#5aa97f", bg: "#e4f3ea" },
  c4: { icon: "👩‍🦰", ring: "#d9745f", bg: "#fbe7e3" },
  c5: { icon: "🐦", ring: "#5ba9cf", bg: "#e2f1f8" },
};

const FALLBACK_TOKEN = { icon: "🧭", ring: "#8a7a64", bg: "#efe9df" };

function dateText(d?: WorldDate): string {
  if (!d) return "시간 미상";
  return `작품 ${d.year}년차 · ${d.season}`;
}

function yearKey(d?: WorldDate): string {
  if (!d) return "0";
  return `${d.year}`;
}

function yearLabel(d?: WorldDate): string {
  if (!d) return "기타";
  return `작품 ${d.year}년차`;
}

const ZONE_KIND_ICON: Record<string, string> = {
  home: "🏠",
  village: "🛤️",
  faraway: "🌊",
};

export default function WorldAtlas() {
  const { state, openBlockDetail } = useApp();
  const episodes = useMemo(
    () => [...state.project.episodes].sort((a, b) => a.number - b.number),
    [state.project.episodes]
  );

  const lastEp = episodes[episodes.length - 1];
  const [episodeId, setEpisodeId] = useState<string>(lastEp?.id ?? "");
  const [zoneOverride, setZoneOverride] = useState<string | null>(null);
  const [focusCharId, setFocusCharId] = useState<string>("");
  const [hoverChar, setHoverChar] = useState<string | null>(null);

  const episode = episodes.find((e) => e.id === episodeId) ?? lastEp;

  // 이 회차의 배치 + 기본으로 보여줄 zone(주인공 흥부가 있는 곳 우선)
  const placementsThisEp = useMemo(
    () => state.placements.filter((p) => p.episodeId === episode?.id),
    [state.placements, episode?.id]
  );

  const defaultZoneId = useMemo(() => {
    if (placementsThisEp.length === 0) return state.zones[0]?.id ?? "";
    const hero = placementsThisEp.find((p) => p.characterId === "c1");
    return hero?.zoneId ?? placementsThisEp[0].zoneId;
  }, [placementsThisEp, state.zones]);

  const zoneId = zoneOverride ?? defaultZoneId;
  const zone = state.zones.find((z) => z.id === zoneId);
  const stage = state.stages.find((s) => s.zoneId === zoneId);

  const charsInZone = placementsThisEp.filter((p) => p.zoneId === zoneId);

  // 작품 연도 드롭다운
  const years = useMemo(() => {
    const map = new Map<string, { key: string; label: string }>();
    for (const e of episodes) {
      const k = yearKey(e.date);
      if (!map.has(k)) map.set(k, { key: k, label: yearLabel(e.date) });
    }
    return [...map.values()];
  }, [episodes]);

  // 이 회차에 등장하는 인물 (인물 드롭다운)
  const charsThisEp = useMemo(() => {
    const seen = new Set<string>();
    return placementsThisEp
      .filter((p) => (seen.has(p.characterId) ? false : (seen.add(p.characterId), true)))
      .map((p) => ({
        id: p.characterId,
        name: state.blocks.find((b) => b.id === p.characterId)?.name ?? p.characterId,
        zoneId: p.zoneId,
      }));
  }, [placementsThisEp, state.blocks]);

  const changeEpisode = (id: string) => {
    setEpisodeId(id);
    setZoneOverride(null); // 회차를 바꾸면 그 회차의 주요 장소로 자동 이동
    setFocusCharId("");
  };

  const changeYear = (key: string) => {
    const first = episodes.find((e) => yearKey(e.date) === key);
    if (first) changeEpisode(first.id);
  };

  // 인물을 고르면 그 회차에 그 인물이 있는 장소로 이동 + 강조
  const focusOnChar = (id: string) => {
    setFocusCharId(id);
    if (!id) return;
    const here = placementsThisEp.find((p) => p.characterId === id);
    if (here) setZoneOverride(here.zoneId);
  };

  return (
    <div className="fade-up space-y-5">
      {/* 헤더 + 작품 속 시간 HUD */}
      <section className="card relative overflow-hidden p-5 lg:p-6">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-3xl">🗺️</span>
              <h2 className="text-2xl font-extrabold text-stone-800">회차별 세계관 지도</h2>
              <span className="chip bg-emerald-500 text-white">NEW</span>
              <span className="chip bg-amber-100 text-amber-900">흥부와 놀부</span>
            </div>
            <p className="mt-1 max-w-2xl text-base text-stone-500">
              회차를 기준으로 그 시점에 누가 어느 곳에 있는지 2D 지도로 봅니다. 작품 연도·회차·인물을
              골라 가며 이야기의 동선을 한눈에 확인하세요.
            </p>
          </div>

          {/* 작품 속 시간 HUD */}
          <div className="rounded-2xl border border-paper-300 bg-paper-100 px-5 py-3 text-right">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-600">
              작품 속 시간
            </div>
            <div className="mt-0.5 text-2xl font-extrabold text-stone-800">
              {dateText(episode?.date)}
            </div>
            <div className="text-sm text-stone-500">
              {episode?.title} · {zone?.name ?? "-"}
            </div>
          </div>
        </div>

        {/* 드롭다운 3종: 작품 연도 / 회차 / 인물 */}
        <div className="relative mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="label">작품 연도</span>
            <select
              className="input"
              value={yearKey(episode?.date)}
              onChange={(e) => changeYear(e.target.value)}
            >
              {years.map((y) => (
                <option key={y.key} value={y.key}>
                  {y.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">회차</span>
            <select className="input" value={episode?.id} onChange={(e) => changeEpisode(e.target.value)}>
              {episodes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">인물 (위치로 이동)</span>
            <select
              className="input"
              value={focusCharId}
              onChange={(e) => focusOnChar(e.target.value)}
            >
              <option value="">전체 보기</option>
              {charsThisEp.map((c) => (
                <option key={c.id} value={c.id}>
                  {CHAR_TOKEN[c.id]?.icon ?? "🧭"} {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        {/* 좌측: 장소 레일 */}
        <aside className="card h-fit space-y-1 p-4">
          <div className="label mb-1">위치 이동</div>
          {state.zones.map((z) => {
            const count = placementsThisEp.filter((p) => p.zoneId === z.id).length;
            const active = z.id === zoneId;
            return (
              <button
                key={z.id}
                onClick={() => {
                  setZoneOverride(z.id);
                  setFocusCharId("");
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                  active
                    ? "bg-amber-100 font-bold text-amber-900"
                    : "text-stone-600 hover:bg-paper-100"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="text-xs">{ZONE_KIND_ICON[z.kind] ?? "📍"}</span>
                  <span className="truncate">{z.name}</span>
                </span>
                {count > 0 && (
                  <span className="chip bg-amber-600 text-white text-xs">{count}</span>
                )}
              </button>
            );
          })}
          <p className="px-1 pt-2 text-xs leading-relaxed text-stone-400">
            숫자는 이 회차에 그 장소에 있는 인물 수입니다.
          </p>
        </aside>

        {/* 우측: 2D 타일 지도 + 등장 인물 */}
        <section className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-stone-800">{zone?.name ?? "장소 없음"}</h3>
                <p className="text-sm text-stone-500">{zone?.blurb}</p>
              </div>
              <span className="chip bg-stone-100 text-stone-600">
                👥 이 회차 등장 {charsInZone.length}명
              </span>
            </div>

            {/* 타일 맵 */}
            <div className="overflow-x-auto">
              {stage ? (
                <div
                  className="relative mx-auto rounded-xl border border-paper-300"
                  style={{
                    width: stage.width * CELL,
                    height: stage.height * CELL,
                    backgroundColor: "#f4ecdc",
                  }}
                >
                  {/* 타일 */}
                  {stage.grid.map((rowArr, y) =>
                    rowArr.map((t, x) => {
                      const ts = TILE_STYLE[t];
                      return (
                        <div
                          key={`${x}-${y}`}
                          className="absolute flex items-center justify-center"
                          style={{
                            left: x * CELL,
                            top: y * CELL,
                            width: CELL,
                            height: CELL,
                            backgroundColor: ts.bg,
                            boxShadow:
                              t === "void"
                                ? undefined
                                : "inset 0 0 0 1px rgba(120,90,40,0.08)",
                            fontSize: 14,
                            lineHeight: 1,
                          }}
                        >
                          {ts.prop === "gourd" ? (
                            <span
                              style={{
                                width: 13,
                                height: 16,
                                borderRadius: "50% 50% 48% 48%",
                                background:
                                  "radial-gradient(circle at 40% 30%, #d6e8a8 0%, #9cc466 60%, #6f9a44 100%)",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                              }}
                            />
                          ) : (
                            ts.prop
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* 캐릭터 토큰 */}
                  {charsInZone.map((p) => {
                    const tok = CHAR_TOKEN[p.characterId] ?? FALLBACK_TOKEN;
                    const b = state.blocks.find((bl) => bl.id === p.characterId);
                    const active = hoverChar === p.characterId || focusCharId === p.characterId;
                    return (
                      <button
                        key={p.characterId}
                        className="absolute flex items-center justify-center rounded-full transition"
                        style={{
                          left: p.x * CELL + CELL / 2 - 14,
                          top: p.y * CELL + CELL / 2 - 14,
                          width: 28,
                          height: 28,
                          background: tok.bg,
                          border: `2px solid ${tok.ring}`,
                          boxShadow: active
                            ? `0 0 0 3px ${tok.ring}55, 0 2px 8px rgba(0,0,0,0.25)`
                            : "0 2px 5px rgba(0,0,0,0.2)",
                          fontSize: 14,
                          zIndex: active ? 30 : 20,
                          transform: active ? "scale(1.18)" : "scale(1)",
                        }}
                        title={`${b?.name ?? p.characterId} — ${p.activity}`}
                        onMouseEnter={() => setHoverChar(p.characterId)}
                        onMouseLeave={() => setHoverChar(null)}
                        onClick={() => openBlockDetail(p.characterId)}
                      >
                        {tok.icon}
                        {active && (
                          <span
                            className="pointer-events-none absolute left-1/2 top-full z-40 mt-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-paper-300 bg-white px-2 py-1 text-xs text-stone-700"
                            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }}
                          >
                            <b className="text-amber-700">{b?.name}</b> · {p.activity}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-stone-500">
                  이 장소의 지도 데이터가 아직 없습니다.
                </div>
              )}
            </div>

            {/* 타일 범례 */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-500">
              <Legend color="#b6d29a" label="마당·풀밭" />
              <Legend color="#ece0c8" label="마루·방" />
              <Legend color="#b59875" label="흙벽·담" />
              <Legend color="#a7d3e6" label="물가" />
              <Legend color="#ecdcab" label="모래" />
              <Legend prop="🌾" label="곳간·곡식" />
              <Legend prop="🏺" label="장독대" />
              <Legend gourd label="박" />
            </div>
          </div>

          {/* 이 회차·이 장소의 등장 인물 */}
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-800">지금 이 장소에 있는 인물</h3>
              <span className="text-sm text-stone-500">{episode?.title}</span>
            </div>
            {charsInZone.length === 0 ? (
              <p className="rounded-xl bg-paper-100 p-4 text-base text-stone-500">
                이 회차에 <b className="text-stone-700">{zone?.name}</b>에 있는 인물이 없습니다. 위
                드롭다운이나 왼쪽 장소 레일에서 다른 곳을 골라 보세요.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {charsInZone.map((p) => {
                  const tok = CHAR_TOKEN[p.characterId] ?? FALLBACK_TOKEN;
                  const b = state.blocks.find((bl) => bl.id === p.characterId);
                  const active = focusCharId === p.characterId;
                  return (
                    <li
                      key={p.characterId}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                        active
                          ? "border-amber-400 bg-amber-50"
                          : "border-paper-300 bg-paper-100 hover:border-amber-300"
                      }`}
                      onClick={() => openBlockDetail(p.characterId)}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{ background: tok.bg, border: `2px solid ${tok.ring}` }}
                      >
                        {tok.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-stone-800">{b?.name ?? p.characterId}</div>
                        <p className="truncate text-sm text-stone-500">{p.activity}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Legend({
  color,
  prop,
  gourd,
  label,
}: {
  color?: string;
  prop?: string;
  gourd?: boolean;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="flex h-4 w-4 items-center justify-center rounded"
        style={{ background: color ?? "#ece0c8", fontSize: 11 }}
      >
        {gourd ? (
          <span
            style={{
              width: 9,
              height: 11,
              borderRadius: "50% 50% 48% 48%",
              background:
                "radial-gradient(circle at 40% 30%, #d6e8a8 0%, #9cc466 60%, #6f9a44 100%)",
            }}
          />
        ) : (
          prop
        )}
      </span>
      {label}
    </span>
  );
}
