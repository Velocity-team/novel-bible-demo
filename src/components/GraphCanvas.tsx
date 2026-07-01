import { useEffect, useMemo, useRef, useState } from "react";
import type { BlockType, Relation, WorldBlock } from "../types";
import {
  loadGraphPositions,
  saveGraphPositions,
  type NodePositions,
} from "../utils/storage";
import { BLOCK_TYPE_META } from "./meta";
import { Icon } from "./Icon";

export type GraphMode = "memory" | "focus" | "conflict" | "scenario";

interface Props {
  blocks: WorldBlock[];
  relations: Relation[];
  conflictBlockIds: Set<string>;
  mode: GraphMode;
  focusId?: string | null;
  scenarioBlockIds?: string[];
  typeFilter: BlockType | "all";
  searchQuery: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  height?: number;
}

const W = 960;
const H = 640;

/* ── 평면 벡터 노드 형태 ──────────────────────────────────
 * 유형은 '색'이 아니라 형태 + 명도 + 라벨로 이중부호화한다(흑백에서도 유지).
 * 인물=채운 원 · 무리=채운 라운드사각 · 장소=윤곽 원 · 사건=마름모 · 규칙=윤곽 사각 · 물건=작은 점.
 * 그라디언트·그림자·광택 없이 단색 flat 채움 + 1px 헤어라인만 쓴다.
 */
type NodeForm = "disc" | "ring" | "roundRect" | "rect" | "diamond" | "dot";
const NODE_FORM: Record<BlockType, NodeForm> = {
  character: "disc",
  organization: "roundRect",
  location: "ring",
  event: "diamond",
  rule: "rect",
  item: "dot",
};
const NODE_FILL: Record<BlockType, string> = {
  character: "#1d1d1f",
  organization: "#424245",
  location: "#ffffff",
  event: "#424245",
  rule: "#ffffff",
  item: "#86868b",
};
const NODE_LINE: Record<BlockType, string> = {
  character: "#1d1d1f",
  organization: "#424245",
  location: "#6e6e73",
  event: "#424245",
  rule: "#6e6e73",
  item: "#86868b",
};
const OUTLINE_TYPES = new Set<BlockType>(["location", "rule"]);

/** 평면 벡터 노드 하나. 부모 <g>가 이미 (x,y)로 translate 되어 있어 원점(0,0) 기준으로 그린다. */
function NodeGlyph({
  type,
  r,
  stroke,
  strokeWidth,
}: {
  type: BlockType;
  r: number;
  stroke: string | null;
  strokeWidth: number;
}) {
  const fill = NODE_FILL[type];
  const outline = OUTLINE_TYPES.has(type);
  const s = stroke ?? (outline ? NODE_LINE[type] : null);
  const sw = stroke ? strokeWidth : outline ? 1.6 : 0;
  const sp = s ? { stroke: s, strokeWidth: sw } : {};
  switch (NODE_FORM[type]) {
    case "disc":
    case "dot":
    case "ring":
      return <circle r={r} fill={fill} {...sp} />;
    case "roundRect":
      return <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={3} fill={fill} {...sp} />;
    case "rect":
      return <rect x={-r} y={-r} width={r * 2} height={r * 2} fill={fill} {...sp} />;
    case "diamond":
      return <rect x={-r} y={-r} width={r * 2} height={r * 2} transform="rotate(45)" fill={fill} {...sp} />;
    default:
      return null;
  }
}

/** 범례용 평면 스와치(노드와 같은 형태 언어). */
function LegendSwatch({ type }: { type: BlockType }) {
  const fill = NODE_FILL[type];
  const line = NODE_LINE[type];
  const box = { width: 15, height: 15, viewBox: "0 0 16 16" } as const;
  switch (NODE_FORM[type]) {
    case "disc":
      return (
        <svg {...box}>
          <circle cx="8" cy="8" r="7" fill={fill} />
        </svg>
      );
    case "ring":
      return (
        <svg {...box}>
          <circle cx="8" cy="8" r="6.4" fill="#ffffff" stroke={line} strokeWidth="1.4" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...box}>
          <rect x="3" y="3" width="10" height="10" transform="rotate(45 8 8)" fill={fill} />
        </svg>
      );
    case "rect":
      return (
        <svg {...box}>
          <rect x="3" y="3" width="10" height="10" fill="#ffffff" stroke={line} strokeWidth="1.4" />
        </svg>
      );
    case "roundRect":
      return (
        <svg {...box}>
          <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" fill={fill} />
        </svg>
      );
    case "dot":
      return (
        <svg {...box}>
          <circle cx="8" cy="8" r="4" fill={fill} />
        </svg>
      );
    default:
      return null;
  }
}

/* ── 결정적 난수 (새로고침해도 같은 배치) ───────────────── */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 작은 force 시뮬레이션으로 자연스럽게 흩어진 배치를 만든다.
 * (반발력 + 관계 스프링 + 중심 중력을 몇백 번 반복)
 */
function computeLayout(blocks: WorldBlock[], relations: Relation[]): NodePositions {
  const rng = mulberry32(20260612);
  const pos: NodePositions = {};
  const types: BlockType[] = ["character", "organization", "location", "event", "rule", "item"];
  const anchors = new Map<BlockType, { x: number; y: number }>();
  types.forEach((t, i) => {
    const a = (i / types.length) * Math.PI * 2 + rng() * 0.9;
    anchors.set(t, {
      x: W / 2 + Math.cos(a) * (180 + rng() * 80),
      y: H / 2 + Math.sin(a) * (130 + rng() * 60),
    });
  });
  blocks.forEach((b) => {
    const c = anchors.get(b.type) ?? { x: W / 2, y: H / 2 };
    pos[b.id] = {
      x: c.x + (rng() - 0.5) * 260,
      y: c.y + (rng() - 0.5) * 220,
    };
  });

  const ids = blocks.map((b) => b.id);
  const edges = relations
    .filter((r) => r.targetId && pos[r.sourceId] && pos[r.targetId])
    .map((r) => ({ a: r.sourceId, b: r.targetId, rest: r.kind === "event" ? 250 : 185 }));

  for (let it = 0; it < 300; it++) {
    const heat = 1 - it / 300;
    // 반발력
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const p = pos[ids[i]];
        const q = pos[ids[j]];
        let dx = p.x - q.x;
        let dy = p.y - q.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          dx = rng() - 0.5;
          dy = rng() - 0.5;
          d2 = 1;
        }
        const d = Math.sqrt(d2);
        const f = Math.min(26, 30000 / d2) * heat;
        p.x += (dx / d) * f;
        p.y += (dy / d) * f;
        q.x -= (dx / d) * f;
        q.y -= (dy / d) * f;
      }
    }
    // 관계 스프링
    for (const e of edges) {
      const p = pos[e.a];
      const q = pos[e.b];
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const f = (d - e.rest) * 0.02 * heat;
      p.x += (dx / d) * f;
      p.y += (dy / d) * f;
      q.x -= (dx / d) * f;
      q.y -= (dy / d) * f;
    }
    // 중심 중력 + 경계
    for (const id of ids) {
      const p = pos[id];
      p.x += (W / 2 - p.x) * 0.004;
      p.y += (H / 2 - p.y) * 0.006;
      p.x = Math.max(70, Math.min(W - 70, p.x));
      p.y = Math.max(56, Math.min(H - 64, p.y));
    }
  }
  Object.values(pos).forEach((p) => {
    p.x = Math.round(p.x);
    p.y = Math.round(p.y);
  });
  return pos;
}

/* ── 무리(집단) 경계: 멤버 점들을 감싸는 부드러운 폴리곤 ── */
function convexHull(points: { x: number; y: number }[]) {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (pts.length < 3) return pts;
  const cross = (o: any, a: any, b: any) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: typeof pts = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: typeof pts = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function smoothClosedPath(pts: { x: number; y: number }[]) {
  if (pts.length < 3) return "";
  const n = pts.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    if (i === 0) d += `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} `;
    d += `C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} `;
  }
  return d + "Z";
}

export default function GraphCanvas({
  blocks,
  relations,
  conflictBlockIds,
  mode,
  focusId,
  scenarioBlockIds = [],
  typeFilter,
  searchQuery,
  selectedId,
  onSelect,
  height = 640,
}: Props) {
  const [positions, setPositions] = useState<NodePositions>(() => loadGraphPositions());
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; block: WorldBlock } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    id: string | null;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
    panning: boolean;
  } | null>(null);

  // 저장된 위치가 없는 노드는 force 배치로 보충
  useEffect(() => {
    setPositions((prev) => {
      const missing = blocks.filter((b) => !prev[b.id]);
      if (missing.length === 0) return prev;
      const init = computeLayout(blocks, relations);
      const next = { ...prev };
      missing.forEach((b) => (next[b.id] = init[b.id] ?? { x: W / 2, y: H / 2 }));
      saveGraphPositions(next);
      return next;
    });
  }, [blocks, relations]);

  // 휠 줌 (커서 위치 기준)
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const sx = (e.clientX - rect.left) * (W / rect.width);
      const sy = (e.clientY - rect.top) * (H / rect.height);
      setScale((s) => {
        const ns = Math.max(0.4, Math.min(2.4, s * (e.deltaY < 0 ? 1.12 : 0.89)));
        setPan((p) => ({
          x: sx - ((sx - p.x) / s) * ns,
          y: sy - ((sy - p.y) / s) * ns,
        }));
        return ns;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const visibleBlocks = useMemo(
    () => blocks.filter((b) => typeFilter === "all" || b.type === typeFilter),
    [blocks, typeFilter]
  );
  const visibleIds = useMemo(() => new Set(visibleBlocks.map((b) => b.id)), [visibleBlocks]);

  const visibleRelations = useMemo(
    () =>
      relations.filter(
        (r) => r.targetId && visibleIds.has(r.sourceId) && visibleIds.has(r.targetId)
      ),
    [relations, visibleIds]
  );

  const degree = useMemo(() => {
    const d = new Map<string, number>();
    relations.forEach((r) => {
      if (!r.targetId) return;
      d.set(r.sourceId, (d.get(r.sourceId) ?? 0) + 1);
      d.set(r.targetId, (d.get(r.targetId) ?? 0) + 1);
    });
    return d;
  }, [relations]);

  // 호버한 노드의 이웃 (이웃 강조용)
  const hoverNeighbors = useMemo(() => {
    if (!hoverId) return null;
    const set = new Set<string>([hoverId]);
    relations.forEach((r) => {
      if (r.sourceId === hoverId && r.targetId) set.add(r.targetId);
      if (r.targetId === hoverId) set.add(r.sourceId);
    });
    return set;
  }, [hoverId, relations]);

  const focusNeighbors = useMemo(() => {
    if (mode !== "focus" || !focusId) return null;
    const set = new Set<string>([focusId]);
    relations.forEach((r) => {
      if (r.sourceId === focusId && r.targetId) set.add(r.targetId);
      if (r.targetId === focusId) set.add(r.sourceId);
    });
    return set;
  }, [mode, focusId, relations]);

  const scenarioOrder = useMemo(() => {
    const m = new Map<string, number>();
    scenarioBlockIds.forEach((id, i) => {
      if (!m.has(id)) m.set(id, i + 1);
    });
    return m;
  }, [scenarioBlockIds]);

  // 무리(조직) 경계 영역
  const orgHulls = useMemo(() => {
    return blocks
      .filter((o) => o.type === "organization" && visibleIds.has(o.id))
      .map((o) => {
        const memberIds = new Set<string>([o.id]);
        relations.forEach((r) => {
          if (!r.targetId) return;
          if (r.sourceId === o.id) memberIds.add(r.targetId);
          if (r.targetId === o.id) memberIds.add(r.sourceId);
        });
        const cloud: { x: number; y: number }[] = [];
        memberIds.forEach((id) => {
          if (!visibleIds.has(id)) return;
          const p = positions[id];
          if (!p) return;
          const pad = 44;
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2;
            cloud.push({ x: p.x + Math.cos(a) * pad, y: p.y + Math.sin(a) * pad });
          }
        });
        if (cloud.length < 8) return null;
        const hull = convexHull(cloud);
        const top = hull.reduce((m, p) => (p.y < m.y ? p : m), hull[0]);
        return { org: o, path: smoothClosedPath(hull), labelX: top.x, labelY: top.y - 6 };
      })
      .filter(Boolean) as { org: WorldBlock; path: string; labelX: number; labelY: number }[];
  }, [blocks, relations, positions, visibleIds]);

  const q = searchQuery.trim();
  const searchHit = (b: WorldBlock) => q !== "" && b.name.includes(q);

  const toLocal = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = (clientX - rect.left) * (W / rect.width);
    const sy = (clientY - rect.top) * (H / rect.height);
    return { x: (sx - pan.x) / scale, y: (sy - pan.y) / scale };
  };

  const onNodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = positions[id] ?? { x: W / 2, y: H / 2 };
    const local = toLocal(e.clientX, e.clientY);
    dragRef.current = {
      id,
      startX: local.x,
      startY: local.y,
      origX: p.x,
      origY: p.y,
      moved: false,
      panning: false,
    };
  };

  const onBgPointerDown = (e: React.PointerEvent) => {
    dragRef.current = {
      id: null,
      startX: e.clientX,
      startY: e.clientY,
      origX: pan.x,
      origY: pan.y,
      moved: false,
      panning: true,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    if (d.panning) {
      const rect = svgRef.current!.getBoundingClientRect();
      const dx = (e.clientX - d.startX) * (W / rect.width);
      const dy = (e.clientY - d.startY) * (H / rect.height);
      if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
      setPan({ x: d.origX + dx, y: d.origY + dy });
    } else if (d.id) {
      const local = toLocal(e.clientX, e.clientY);
      const dx = local.x - d.startX;
      const dy = local.y - d.startY;
      if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true;
      setTooltip(null);
      setPositions((prev) => ({
        ...prev,
        [d.id!]: { x: d.origX + dx, y: d.origY + dy },
      }));
    }
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (d.id) {
      if (!d.moved) {
        onSelect(selectedId === d.id ? null : d.id);
      } else {
        setPositions((prev) => {
          saveGraphPositions(prev);
          return prev;
        });
      }
    } else if (!d.moved) {
      onSelect(null);
    }
  };

  const onNodeEnter = (e: React.PointerEvent, b: WorldBlock) => {
    if (dragRef.current) return;
    setHoverId(b.id);
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, block: b });
  };

  const resetView = () => {
    const init = computeLayout(blocks, relations);
    setPositions(init);
    saveGraphPositions(init);
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const nodeRadius = (id: string) => 17 + Math.min(14, (degree.get(id) ?? 0) * 2.1);

  const dimmed = (id: string) => {
    if (focusNeighbors && !focusNeighbors.has(id)) return true;
    if (q !== "") {
      const b = blocks.find((x) => x.id === id);
      return !(b && searchHit(b));
    }
    return false;
  };

  const hoverDim = (id: string) => (hoverNeighbors ? !hoverNeighbors.has(id) : false);

  // 이차 곡선(사건 연결선)의 중점
  const quadMid = (a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x,
    y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y,
  });

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden rounded-sm border border-line bg-paper"
    >
      {/* 줌 컨트롤 */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
        <button
          className="btn-ghost h-9 w-9 bg-paper/90 p-0"
          onClick={() => setScale((s) => Math.min(2.4, s + 0.2))}
          title="확대"
        >
          <Icon name="add" size={16} />
        </button>
        <button
          className="btn-ghost h-9 w-9 bg-paper/90 p-0"
          onClick={() => setScale((s) => Math.max(0.4, s - 0.2))}
          title="축소"
        >
          <Icon name="minus" size={16} />
        </button>
        <button className="btn-ghost h-9 w-9 bg-paper/90 p-0" onClick={resetView} title="배치 다시 만들기">
          <Icon name="refresh" size={16} />
        </button>
      </div>

      {/* 범례 */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-sm border border-line bg-paper px-3 py-1.5">
        {(Object.keys(BLOCK_TYPE_META) as BlockType[]).map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <LegendSwatch type={t} />
            {BLOCK_TYPE_META[t].label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs font-medium text-ink-mid">
          <span className="inline-block h-px w-4 bg-ink-mid" />
          사건 연결선
        </span>
      </div>

      {/* 호버 툴팁 */}
      {tooltip && !dragRef.current && (
        <div
          className="pointer-events-none absolute z-20 w-56 rounded-sm border border-line bg-paper/95 p-3 backdrop-blur"
          style={{
            left: Math.min(tooltip.x + 14, (wrapRef.current?.clientWidth ?? 400) - 240),
            top: tooltip.y + 14,
          }}
        >
          <div className="flex items-center gap-1.5 text-sm font-bold text-ink">
            {tooltip.block.name}
            <span className="ml-auto rounded-full border border-line bg-paper px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft">
              {BLOCK_TYPE_META[tooltip.block.type].label}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">
            {tooltip.block.description}
          </p>
          <p className="mt-1 text-[10px] text-ink-faint">클릭하면 자세히 볼 수 있어요</p>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ height, width: "100%", touchAction: "none", cursor: "grab", display: "block" }}
        onPointerDown={onBgPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          onPointerUp();
          setHoverId(null);
          setTooltip(null);
        }}
      >
        <defs>
          <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.2" fill="rgba(110,110,115,0.12)" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#dots)" />

        <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
          {/* 무리 경계 (흐릿한 영역) */}
          {orgHulls.map((h) => {
            const isDim = dimmed(h.org.id) || hoverDim(h.org.id);
            return (
              <g key={h.org.id} opacity={isDim ? 0.15 : 1} style={{ transition: "opacity .2s" }}>
                <path
                  d={h.path}
                  fill="#424245"
                  fillOpacity={0.04}
                  stroke="#86868b"
                  strokeOpacity={0.7}
                  strokeWidth={1}
                  strokeDasharray="3 5"
                />
                <text
                  x={h.labelX}
                  y={h.labelY}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={600}
                  fill="#6e6e73"
                  opacity={0.7}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {h.org.name}
                </text>
              </g>
            );
          })}

          {/* 일반 관계선 */}
          {visibleRelations
            .filter((r) => r.kind !== "event")
            .map((r) => {
              const a = positions[r.sourceId];
              const b = positions[r.targetId];
              if (!a || !b) return null;
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              const active =
                hoverId === r.sourceId ||
                hoverId === r.targetId ||
                selectedId === r.sourceId ||
                selectedId === r.targetId;
              const isDim =
                (focusNeighbors &&
                  !(focusNeighbors.has(r.sourceId) && focusNeighbors.has(r.targetId))) ||
                (hoverNeighbors && !active);
              return (
                <g key={r.id} opacity={isDim ? 0.08 : 1} style={{ transition: "opacity .2s" }}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={active ? "#1d1d1f" : "#86868b"}
                    strokeWidth={active ? 1.5 : 1}
                  />
                  <text
                    x={mx}
                    y={my - 4}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight={active ? 700 : 500}
                    fill={active ? "#1d1d1f" : "#6e6e73"}
                    stroke="#ffffff"
                    strokeWidth={3}
                    paintOrder="stroke"
                    opacity={active ? 1 : 0}
                    style={{ pointerEvents: "none", userSelect: "none", transition: "opacity .2s" }}
                  >
                    {r.type}
                  </text>
                </g>
              );
            })}

          {/* 사건 연결선 (인물 ↔ 인물, 선 위에 사건 라벨) */}
          {visibleRelations
            .filter((r) => r.kind === "event")
            .map((r, i) => {
              const a = positions[r.sourceId];
              const b = positions[r.targetId];
              if (!a || !b) return null;
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
              const bend = 40 * (i % 2 === 0 ? 1 : -1);
              const c = {
                x: (a.x + b.x) / 2 + (-dy / d) * bend,
                y: (a.y + b.y) / 2 + (dx / d) * bend,
              };
              const m = quadMid(a, c, b);
              const label = `${r.type}${r.episode ? ` · ${r.episode}` : ""}`;
              const labelW = label.length * 10 + 18;
              const active =
                hoverId === r.sourceId ||
                hoverId === r.targetId ||
                selectedId === r.sourceId ||
                selectedId === r.targetId ||
                (r.eventId != null && (selectedId === r.eventId || hoverId === r.eventId));
              const isDim =
                (focusNeighbors &&
                  !(focusNeighbors.has(r.sourceId) && focusNeighbors.has(r.targetId))) ||
                (hoverNeighbors && !active);
              return (
                <g key={r.id} opacity={isDim ? 0.08 : 1} style={{ transition: "opacity .2s" }}>
                  <path
                    d={`M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`}
                    fill="none"
                    stroke={active ? "#1d1d1f" : "#6e6e73"}
                    strokeOpacity={active ? 1 : 0.7}
                    strokeWidth={active ? 3 : 2.2}
                    strokeDasharray="7 5"
                    className="event-flow"
                  />
                  <g
                    style={{ cursor: r.eventId ? "pointer" : "default" }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (r.eventId) onSelect(r.eventId);
                    }}
                  >
                    <rect
                      x={m.x - labelW / 2}
                      y={m.y - 11}
                      width={labelW}
                      height={22}
                      rx={11}
                      fill="#f5f5f7"
                      stroke="#6e6e73"
                      strokeOpacity={0.7}
                    />
                    <text
                      x={m.x}
                      y={m.y + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight={700}
                      fill="#424245"
                      style={{ userSelect: "none", pointerEvents: "none" }}
                    >
                      {label}
                    </text>
                  </g>
                </g>
              );
            })}

          {/* 노드 */}
          {visibleBlocks.map((b) => {
            const p = positions[b.id];
            if (!p) return null;
            const r = nodeRadius(b.id);
            const isSelected = selectedId === b.id;
            const isHover = hoverId === b.id;
            const isHit = searchHit(b);
            const isConflictMode = mode === "conflict" && conflictBlockIds.has(b.id);
            const hasConflict = conflictBlockIds.has(b.id);
            const scnOrder = mode === "scenario" ? scenarioOrder.get(b.id) : undefined;
            const isDim =
              dimmed(b.id) ||
              hoverDim(b.id) ||
              (mode === "scenario" && scenarioBlockIds.length > 0 && !scnOrder);

            const outline = OUTLINE_TYPES.has(b.type);
            let emph: string | null = null;
            let emphW = 2;
            if (isSelected || isHit) {
              emph = "#1d1d1f";
              emphW = outline ? 2.4 : 2;
            }
            if (isConflictMode) {
              emph = "#c8362b";
              emphW = outline ? 2.4 : 2;
            }
            if (scnOrder) {
              emph = "#6e6e73";
              emphW = outline ? 2.4 : 2;
            }
            const monoFs = Math.max(10, Math.min(14, r * 0.72));
            const label = b.name;
            // 라벨이 겹쳐 읽기 불가해지는 것을 막는 반투명 paper 배경 pill 폭(대략치)
            const labelW =
              Array.from(label).reduce(
                (w, ch) => w + (ch.charCodeAt(0) < 128 ? 6.6 : 11.5),
                0
              ) + 12;

            return (
              <g
                key={b.id}
                opacity={isDim ? 0.18 : 1}
                style={{ cursor: "pointer", transition: "opacity .2s" }}
                transform={`translate(${p.x},${p.y})`}
                onPointerDown={(e) => onNodePointerDown(e, b.id)}
                onPointerEnter={(e) => onNodeEnter(e, b)}
                onPointerLeave={() => {
                  setHoverId(null);
                  setTooltip(null);
                }}
              >
                {/* 선택/충돌 강조: 평면 헤어라인 링 (채움 없음) */}
                {(isSelected || isHit) && (
                  <circle r={r + 8} fill="none" stroke="#1d1d1f" strokeWidth={1.5} className="ring-pulse" />
                )}
                {isConflictMode && (
                  <circle r={r + 8} fill="none" stroke="#c8362b" strokeWidth={1.5} className="ring-pulse" />
                )}
                {/* 평면 벡터 노드 + (인물) 흰 모노그램 — hover 시 형태 그대로 살짝 확대 */}
                <g
                  transform={isHover ? "scale(1.1)" : undefined}
                  style={{ transition: "transform .15s" }}
                >
                  <NodeGlyph type={b.type} r={r} stroke={emph} strokeWidth={emphW} />
                  {b.type === "character" && (
                    <text
                      y={monoFs * 0.34}
                      textAnchor="middle"
                      fontSize={monoFs}
                      fontWeight={700}
                      fill="#ffffff"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {label[0]}
                    </text>
                  )}
                </g>
                {/* 노드 라벨: 겹침 방지용 반투명 paper pill 위에 */}
                <rect
                  x={-labelW / 2}
                  y={r + 5}
                  width={labelW}
                  height={15.5}
                  rx={2}
                  fill="rgba(255,255,255,0.86)"
                  style={{ pointerEvents: "none" }}
                />
                <text
                  y={r + 16}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight={isSelected || isHover ? 700 : 600}
                  fill={isSelected || isHit ? "#1d1d1f" : "#424245"}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {label}
                </text>
                {/* 충돌: 평면 signal 링(채움 없음) + 작은 점 하나 */}
                {hasConflict && !scnOrder && (
                  <g transform={`translate(${r - 3},${-r + 3})`} style={{ pointerEvents: "none" }}>
                    <circle r={5.5} fill="#ffffff" stroke="#c8362b" strokeWidth={1.6} />
                    <circle r={1.9} fill="#c8362b" />
                  </g>
                )}
                {scnOrder && (
                  <g transform={`translate(${r - 2},${-r + 2})`} style={{ pointerEvents: "none" }}>
                    <circle r={9} fill="#6e6e73" stroke="#ffffff" strokeWidth={1.5} />
                    <text
                      y={4}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight={700}
                      fill="#ffffff"
                      style={{ pointerEvents: "none" }}
                    >
                      {scnOrder}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
