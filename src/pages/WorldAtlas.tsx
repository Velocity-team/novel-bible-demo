import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useApp } from "../context/AppContext";
import type { CharacterPlacement, Tile, WorldBlock, WorldDate } from "../types";

/**
 * 인물 모노그램 — 색이 아니라 형태(의식=● 채운 원 / 몸=○ 윤곽 링) + 이니셜로 이중부호.
 * c1~c5는 기존 표기(도·윤·문·채·에)를 유지하고, 나머지는 이름 첫 글자를 쓴다.
 */
const CHAR_MONO: Record<string, string> = {
  c1: "도",
  c2: "윤",
  c3: "문",
  c4: "채",
  c5: "에",
};

function monogram(id: string, name?: string): string {
  return CHAR_MONO[id] ?? name?.trim()?.[0] ?? "?";
}

/**
 * 의식(빙의 주체) 여부 — 데이터에서 파생한다. '의식' 속성(정체 ≠ 몸 바인딩)을 가진 인물만
 * 채운 원(●)으로, 나머지는 윤곽 링(○)으로 그린다. 흑백에서도 형태로 구분된다.
 */
function isMind(block?: WorldBlock): boolean {
  return !!block?.attributes?.["의식"];
}

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
  home: "▣",
  village: "◎",
  faraway: "◈",
};

// ── 평면 도면 스키매틱: 타일 그리드를 구역 사각(도면)으로 파생 ──────────────
// 도면 여백(%). paper-2 '바닥'이 구역 사각 둘레에 얇게 보이도록 안쪽으로 들인다.
const MAP_INSET = 5;
const pct = (frac: number) => MAP_INSET + frac * (100 - 2 * MAP_INSET);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

type Rect = { x: number; y: number; w: number; h: number };

/** 조건에 맞는 타일들의 바운딩 박스(격자 좌표)와 개수. 없으면 null. */
function bboxOf(
  grid: Tile[][],
  match: (t: Tile) => boolean
): { rect: Rect; count: number } | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let count = 0;
  grid.forEach((row, y) =>
    row.forEach((t, x) => {
      if (!match(t)) return;
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    })
  );
  if (count === 0) return null;
  return { rect: { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }, count };
}

/** 도면 안에서 별도 구역으로 뽑을 특징 타일 (밀도가 높은 덩어리만 표기). */
const PLAN_FEATURES: { key: Tile; label: string }[] = [
  { key: "water", label: "수역 · 포탈" },
  { key: "gourd", label: "균열" },
];

/** 격자 좌표 Rect → 도면(% 기준) CSS 위치/크기. */
function rectStyle(r: Rect, width: number, height: number): CSSProperties {
  const span = 100 - 2 * MAP_INSET;
  return {
    left: `${pct(r.x / width)}%`,
    top: `${pct(r.y / height)}%`,
    width: `${(r.w / width) * span}%`,
    height: `${(r.h / height) * span}%`,
  };
}

/** 마커 배치 — 인물이 한곳에 몰리면 겹치지 않게 서로 밀어낸다. */
function laidOutMarkers(chars: CharacterPlacement[], width: number, height: number) {
  const pts = chars.map((p) => ({ p, fx: (p.x + 0.5) / width, fy: (p.y + 0.5) / height }));
  const MIN = 0.08; // 최소 간격(격자 비율)
  for (let i = 0; i < pts.length; i++) {
    for (let j = 0; j < i; j++) {
      let dx = pts[i].fx - pts[j].fx;
      let dy = pts[i].fy - pts[j].fy;
      let d = Math.hypot(dx, dy);
      if (d < MIN) {
        if (d < 1e-6) {
          const a = i * 2.399; // 완전히 겹칠 때 방사형으로 분산
          dx = Math.cos(a);
          dy = Math.sin(a);
          d = 1;
        }
        const push = (MIN - d) / 2;
        pts[i].fx += (dx / d) * push;
        pts[i].fy += (dy / d) * push;
        pts[j].fx -= (dx / d) * push;
        pts[j].fy -= (dy / d) * push;
      }
    }
  }
  return pts.map(({ p, fx, fy }) => ({
    p,
    left: `${pct(clamp01(fx))}%`,
    top: `${pct(clamp01(fy))}%`,
  }));
}

/** 정체성 형태 토큰: 의식=● 채운 원 / 몸=○ 윤곽 링. 색이 아닌 형태로 구분. */
function CharGlyph({
  mind,
  size = 30,
  children,
}: {
  mind: boolean;
  size?: number;
  children?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex flex-none items-center justify-center rounded-full font-bold leading-none ${
        mind
          ? "bg-ink text-paper"
          : "border-2 border-ink-mid bg-transparent text-ink-mid"
      }`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {children}
    </span>
  );
}

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

  // 이 회차의 배치 + 기본으로 보여줄 zone(주인공 도현이 있는 곳 우선)
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

  // 도면(구역 사각) 파생 — 타일 그리드에서 구조/특징 영역의 바운딩 박스를 뽑는다.
  const plan = useMemo(() => {
    if (!stage) return null;
    const primary =
      bboxOf(stage.grid, (t) => t !== "void")?.rect ??
      ({ x: 0, y: 0, w: stage.width, h: stage.height } as Rect);
    const features = PLAN_FEATURES.flatMap((f) => {
      const b = bboxOf(stage.grid, (t) => t === f.key);
      if (!b) return [];
      const density = b.count / (b.rect.w * b.rect.h);
      // 흩어진 특징(밀도 낮음)·너무 작은 덩어리는 도면 노이즈가 되므로 제외.
      if (b.count < 4 || density < 0.5) return [];
      return [{ label: f.label, rect: b.rect }];
    });
    return { primary, features };
  }, [stage]);

  const markers = useMemo(
    () => (stage ? laidOutMarkers(charsInZone, stage.width, stage.height) : []),
    [charsInZone, stage]
  );

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
      <section className="card p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-ink">회차별 세계관 지도</h2>
              <span className="chip bg-ink text-paper">NEW</span>
              <span className="chip">두 번째 각성</span>
            </div>
            <p className="mt-1 max-w-2xl text-base leading-relaxed text-ink-soft">
              회차를 기준으로 그 시점에 누가 어느 곳에 있는지 2D 지도로 봅니다. 작품 연도·회차·인물을
              골라 가며 이야기의 동선을 한눈에 확인하세요.
            </p>
          </div>

          {/* 작품 속 시간 HUD */}
          <div className="rounded-sm border border-line bg-paper-2 px-5 py-3 text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-ink-faint">
              작품 속 시간
            </div>
            <div className="mt-0.5 text-2xl font-bold text-ink">
              {dateText(episode?.date)}
            </div>
            <div className="text-sm text-ink-soft">
              {episode?.title} · {zone?.name ?? "-"}
            </div>
          </div>
        </div>

        {/* 드롭다운 3종: 작품 연도 / 회차 / 인물 */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
                  {monogram(c.id, c.name)} {c.name}
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
                className={`flex w-full items-center justify-between gap-2 rounded-sm border px-3 py-2 text-left text-sm transition ${
                  active
                    ? "border-ink bg-paper font-bold text-ink"
                    : "border-transparent text-ink-mid hover:bg-paper-2"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="text-xs text-ink-faint">{ZONE_KIND_ICON[z.kind] ?? "·"}</span>
                  <span className="truncate">{z.name}</span>
                </span>
                <span className="font-mono text-xs text-ink-faint">{count}명</span>
              </button>
            );
          })}
          <p className="px-1 pt-2 text-xs leading-relaxed text-ink-faint">
            숫자는 이 회차에 그 장소에 있는 인물 수입니다.
          </p>
        </aside>

        {/* 우측: 평면 도면 + 등장 인물 */}
        <section className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-ink">{zone?.name ?? "장소 없음"}</h3>
                <p className="text-sm text-ink-soft">{zone?.blurb}</p>
              </div>
              <span className="chip">
                이 회차 등장 {charsInZone.length}명
              </span>
            </div>

            {/* 평면 도면 스키매틱 (paper-2 바닥 + paper 구역 사각 + 모노그램 마커) */}
            {stage && plan ? (
              <div
                className="relative w-full rounded-sm border border-line bg-paper-2"
                style={{ height: 264 }}
              >
                {/* 구역 사각 — 도면형: paper 채움 + 헤어라인 + 좌상단 구역명 */}
                <div
                  className="absolute rounded-sm border border-line bg-paper"
                  style={rectStyle(plan.primary, stage.width, stage.height)}
                >
                  <span className="absolute left-2 top-1.5 text-xs text-ink-faint">
                    {stage.name}
                  </span>
                </div>

                {/* 특징 영역(수역/균열 등) — 윤곽 사각으로 도면 위에 표시 */}
                {plan.features.map((f) => (
                  <div
                    key={f.label}
                    className="absolute rounded-sm border border-line"
                    style={rectStyle(f.rect, stage.width, stage.height)}
                  >
                    <span className="absolute left-2 top-1.5 text-xs text-ink-faint">
                      {f.label}
                    </span>
                  </div>
                ))}

                {/* 빈 존 정직 상태 — 가짜 마커를 그리지 않는다 */}
                {charsInZone.length === 0 && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="text-sm text-ink-faint">이 회차엔 등장 인물 없음</span>
                  </div>
                )}

                {/* 인물 마커 — 무채 모노그램 (● 의식 / ○ 몸) */}
                {markers.map(({ p, left, top }) => {
                  const b = state.blocks.find((bl) => bl.id === p.characterId);
                  const mind = isMind(b);
                  const active = hoverChar === p.characterId || focusCharId === p.characterId;
                  return (
                    <button
                      key={p.characterId}
                      className="absolute -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0"
                      style={{ left, top, zIndex: active ? 30 : 20 }}
                      title={`${b?.name ?? p.characterId} — ${p.activity}`}
                      onMouseEnter={() => setHoverChar(p.characterId)}
                      onMouseLeave={() => setHoverChar(null)}
                      onClick={() => openBlockDetail(p.characterId)}
                    >
                      <span
                        className="relative inline-flex transition-transform"
                        style={{ transform: active ? "scale(1.1)" : undefined }}
                      >
                        {/* 선택/hover 강조 = 형태(얇은 잉크 링)로. 광택·그림자 없음. */}
                        {active && (
                          <span
                            className="pointer-events-none absolute rounded-full border border-ink"
                            style={{ inset: -4 }}
                          />
                        )}
                        <CharGlyph mind={mind}>{monogram(p.characterId, b?.name)}</CharGlyph>
                      </span>
                      {active && (
                        <span className="pointer-events-none absolute left-1/2 top-full z-40 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-sm border border-line bg-paper px-2 py-1 text-xs text-ink-mid">
                          <b className="text-ink">{b?.name}</b> · {p.activity}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-sm border border-line bg-paper-2 text-ink-soft">
                이 장소의 지도 데이터가 아직 없습니다.
              </div>
            )}

            {/* 도면 범례 — 평면 형태/스와치 (광택 볼 아님) */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <CharGlyph mind size={14} />
                의식(빙의 주체)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CharGlyph mind={false} size={14} />몸 / 일반 인물
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3.5 w-3.5 rounded-sm border border-line bg-paper" />
                구역
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3.5 w-3.5 rounded-sm border border-line bg-paper-2" />
                바닥
              </span>
            </div>
          </div>

          {/* 이 회차·이 장소의 등장 인물 */}
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">지금 이 장소에 있는 인물</h3>
              <span className="text-sm text-ink-soft">{episode?.title}</span>
            </div>
            {charsInZone.length === 0 ? (
              <p className="rounded-sm bg-paper-2 p-4 text-base leading-relaxed text-ink-soft">
                이 회차에 <b className="text-ink">{zone?.name}</b>에 있는 인물이 없습니다. 위
                드롭다운이나 왼쪽 장소 레일에서 다른 곳을 골라 보세요.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {charsInZone.map((p) => {
                  const b = state.blocks.find((bl) => bl.id === p.characterId);
                  const active = focusCharId === p.characterId;
                  return (
                    <li
                      key={p.characterId}
                      className={`flex cursor-pointer items-center gap-3 rounded-sm border p-3 transition ${
                        active
                          ? "border-ink bg-paper-2"
                          : "border-line bg-paper hover:bg-paper-2"
                      }`}
                      onClick={() => openBlockDetail(p.characterId)}
                    >
                      <CharGlyph mind={isMind(b)} size={36}>
                        {monogram(p.characterId, b?.name)}
                      </CharGlyph>
                      <div className="min-w-0">
                        <div className="font-bold text-ink">{b?.name ?? p.characterId}</div>
                        <p className="truncate text-sm text-ink-soft">{p.activity}</p>
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
