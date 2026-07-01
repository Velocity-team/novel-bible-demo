import { useEffect, useMemo, useState } from "react";
import { AIStatusBadge, SeverityBadge, TypeBadge } from "./Badge";
import GraphCanvas, { type GraphMode } from "./GraphCanvas";
import { BLOCK_TYPE_META } from "./meta";
import { Icon } from "./Icon";
import { useApp } from "../context/AppContext";
import type { BlockType } from "../types";
import { aiRecall } from "../utils/aiSim";
import { relationNatural } from "../utils/search";

const MODES: { key: GraphMode; label: string; hint: string }[] = [
  { key: "memory", label: "전체 보기", hint: "저장된 모든 설정 카드와 관계를 보여줍니다." },
  { key: "focus", label: "인물 중심 보기", hint: "고른 인물과 바로 연결된 카드만 또렷하게 보여줍니다." },
  { key: "conflict", label: "오류 위험 보기", hint: "설정 오류와 얽힌 카드를 빨간색으로 표시합니다." },
  { key: "scenario", label: "추천 시나리오 보기", hint: "최근 저장한 ‘관계별 시나리오 추천 메모’에 묶인 카드를 표시합니다." },
];

const TYPE_FILTERS: { key: BlockType | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "character", label: "인물" },
  { key: "location", label: "장소" },
  { key: "event", label: "사건" },
  { key: "organization", label: "무리" },
  { key: "rule", label: "규칙" },
  { key: "item", label: "물건" },
];

/** 대시보드 첫 화면을 차지하는 설정 지도 섹션 */
export default function WorldMap() {
  const { state, navOptions, openBlockDetail } = useApp();
  const [mode, setMode] = useState<GraphMode>(
    (navOptions.graphMode as GraphMode) ?? "memory"
  );
  const [typeFilter, setTypeFilter] = useState<BlockType | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    navOptions.graphFocusId ?? null
  );
  const [focusCharId, setFocusCharId] = useState<string>(
    navOptions.graphFocusId ?? "c1"
  );
  const [recall, setRecall] = useState<string | null>(null);

  // 다른 화면에서 "지도에서 보기"로 넘어올 때 포커스/모드를 따라간다
  useEffect(() => {
    if (navOptions.graphFocusId) {
      setSelectedId(navOptions.graphFocusId);
      setFocusCharId(navOptions.graphFocusId);
      setRecall(null);
    }
    if (navOptions.graphMode) setMode(navOptions.graphMode as GraphMode);
  }, [navOptions.graphFocusId, navOptions.graphMode]);

  const conflictBlockIds = useMemo(
    () =>
      new Set(
        state.conflicts
          .filter((c) => c.status === "open")
          .flatMap((c) => c.relatedBlockIds)
      ),
    [state.conflicts]
  );

  // 추천 시나리오 메모(캐릭터 회의실에서 저장)에 묶인 카드를 경로로 본다
  const recNotes = state.notes.filter((n) => n.title.startsWith("시나리오 방향 메모"));
  const lastScenario = recNotes[recNotes.length - 1];
  const selected = state.blocks.find((b) => b.id === selectedId) ?? null;
  const selectedRelations = selected
    ? state.relations.filter((r) => r.sourceId === selected.id || r.targetId === selected.id)
    : [];
  const selectedConflicts = selected
    ? state.conflicts.filter((c) => c.relatedBlockIds.includes(selected.id))
    : [];
  const characters = state.blocks.filter((b) => b.type === "character");

  return (
    <section className="card space-y-4 p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">설정 지도</h2>
          <p className="text-base text-ink-soft">
            인물·장소·사건이 어떻게 이어져 있는지 한눈에 봅니다. 동그라미를 끌어 옮기고,
            휠로 확대하고, 올려놓으면 이어진 카드가 빛나요.
          </p>
        </div>
        <input
          className="input w-full sm:w-64"
          placeholder="이름으로 찾기 (강조 표시)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 보기 방식 + 종류 필터 */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`chip cursor-pointer px-4 py-2 text-base transition ${
                mode === m.key
                  ? "border-ink bg-ink text-paper"
                  : "text-ink-mid hover:bg-paper-2"
              }`}
              title={m.hint}
            >
              {m.label}
            </button>
          ))}
          {mode === "focus" && (
            <select
              className="input w-44 py-1.5 text-base"
              value={focusCharId}
              onChange={(e) => setFocusCharId(e.target.value)}
            >
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`chip cursor-pointer transition ${
                typeFilter === f.key
                  ? "border-ink bg-ink text-paper"
                  : "text-ink-soft hover:bg-paper-2"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-soft">
          {MODES.find((m) => m.key === mode)?.hint}
          {mode === "scenario" && !lastScenario && " (아직 저장한 추천 시나리오가 없습니다. ‘캐릭터 회의실 › 관계별 시나리오 추천’에서 방향을 받아 메모로 저장해 보세요.)"}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <GraphCanvas
          blocks={state.blocks}
          relations={state.relations}
          conflictBlockIds={conflictBlockIds}
          mode={mode}
          focusId={mode === "focus" ? focusCharId : null}
          scenarioBlockIds={mode === "scenario" ? lastScenario?.relatedBlockIds ?? [] : []}
          typeFilter={typeFilter}
          searchQuery={search}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setRecall(null);
          }}
          height={540}
        />

        {/* 선택한 카드 정보 */}
        <aside className="card max-h-[540px] overflow-y-auto p-5">
          {selected ? (
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex flex-wrap gap-1.5">
                  <TypeBadge type={selected.type} />
                  <AIStatusBadge status={selected.aiStatus} />
                </div>
                <h3 className="flex items-center gap-2 text-xl font-bold text-ink">
                  <Icon name={BLOCK_TYPE_META[selected.type].icon} size={18} className="shrink-0 text-ink-soft" />
                  {selected.name}
                </h3>
                <p className="mt-1 text-base leading-relaxed text-ink-soft">
                  {selected.description}
                </p>
              </div>

              <div>
                <h4 className="label">이어진 관계 ({selectedRelations.length})</h4>
                <ul className="space-y-1">
                  {selectedRelations.map((r) => (
                    <li key={r.id} className="rounded-sm bg-paper-2 px-3 py-2 text-sm text-ink-soft">
                      {relationNatural(state, r)}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedConflicts.length > 0 && (
                <div>
                  <h4 className="label">관련 설정 오류</h4>
                  <ul className="space-y-1">
                    {selectedConflicts.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between rounded-sm border border-signal bg-signal-bg px-3 py-2 text-sm"
                      >
                        <span>{c.title}</span>
                        <SeverityBadge severity={c.severity} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className="btn-primary w-full"
                onClick={() => setRecall(aiRecall(selected.id, state))}
              >
                AI가 기억하는 내용 보기
              </button>
              {recall && (
                <div className="fade-up rounded-sm border border-line bg-paper-2 p-3 text-base leading-relaxed text-ink-mid">
                  {recall}
                </div>
              )}

              <button className="btn-ghost w-full" onClick={() => openBlockDetail(selected.id)}>
                설정 카드 자세히 보기
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-60 flex-col items-center justify-center text-center text-base text-ink-soft">
              <Icon name="map" size={32} className="mb-2 text-ink-faint" />
              지도의 동그라미를 누르면
              <br />
              설명, 관계, 오류를
              <br />
              여기서 볼 수 있어요.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
