import { useState } from "react";
import StatCard from "../components/StatCard";
import { Icon } from "../components/Icon";
import { useApp } from "../context/AppContext";

const SOURCE_TYPE_META: Record<string, { label: string; icon: string; chip: string }> = {
  manuscript: { label: "원고", icon: "doc", chip: "border border-line bg-paper-2 text-ink-mid" },
  excel: { label: "설정표", icon: "table", chip: "border border-line bg-paper-2 text-ink-mid" },
  manual: { label: "직접 입력", icon: "edit", chip: "border border-line bg-paper-2 text-ink-mid" },
  generated: { label: "추천 시나리오 메모", icon: "idea", chip: "border border-line bg-paper-2 text-ink-mid" },
};

const STATUS_META: Record<string, { label: string; chip: string }> = {
  synced: { label: "학습 완료", chip: "border border-line bg-paper-2 text-ink-mid" },
  needs_review: { label: "확인 필요", chip: "border border-line bg-paper-2 text-ink-mid" },
  failed: { label: "실패", chip: "border border-signal bg-signal-bg text-signal" },
};

export default function AIMemory() {
  const { state, rebuildMemory } = useApp();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuilt, setRebuilt] = useState(false);

  const manuscripts = state.memorySources.filter((m) => m.sourceType === "manuscript");
  const filtered = state.memorySources.filter(
    (m) =>
      (typeFilter === "all" || m.sourceType === typeFilter) &&
      (!query || m.title.includes(query))
  );

  const handleRebuild = () => {
    setRebuilding(true);
    setRebuilt(false);
    setTimeout(() => {
      rebuildMemory();
      setRebuilding(false);
      setRebuilt(true);
    }, 2000);
  };

  return (
    <div className="fade-up space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">AI 학습 현황</h2>
          <p className="text-base text-ink-soft">
            지금까지 올린 원고와 설정이 어떻게 학습되어 있는지 확인할 수 있어요.
            <span className="ml-1 text-sm text-ink-faint">
              (마지막 학습: {new Date(state.lastTrainedAt).toLocaleString("ko-KR")})
            </span>
          </p>
        </div>
        <button className="btn-primary inline-flex items-center justify-center gap-1.5" onClick={handleRebuild} disabled={rebuilding}>
          {rebuilding ? (
            "다시 학습하는 중…"
          ) : (
            <>
              <Icon name="refresh" size={16} /> 처음부터 다시 학습하기
            </>
          )}
        </button>
      </div>

      {rebuilding && (
        <div className="card flex items-center gap-3 p-5">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="pulse-dot h-2.5 w-2.5 rounded-full bg-ink-soft"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <span className="text-base text-ink-soft">
            설정 카드와 관계를 다시 학습하는 중… (원고 → 설정 카드 → 관계 → 오류 검사 순서)
          </span>
        </div>
      )}
      {rebuilt && !rebuilding && (
        <div className="fade-up rounded-sm border border-line bg-paper-2 p-4 text-base text-ink-mid">
          ✓ 다시 학습이 끝났습니다. 학습 기록이 갱신되었어요.
        </div>
      )}

      {/* 학습 요약 */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="학습한 원고" value={manuscripts.length} icon="doc" />
        <StatCard label="저장된 설정 카드" value={state.blocks.length} icon="blocks" accent="text-ink" />
        <StatCard label="저장된 관계" value={state.relations.length} icon="relations" accent="text-ink" />
        <StatCard
          label="저장된 사건"
          value={state.blocks.filter((b) => b.type === "event").length}
          icon="event"
          accent="text-ink"
        />
      </section>

      {/* 학습 기록 */}
      <section className="card p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-ink">
            학습 기록 ({state.memorySources.length})
          </h3>
          <div className="flex gap-2">
            <input
              className="input w-44"
              placeholder="기록 찾기…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="input w-40"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">종류: 전체</option>
              <option value="manuscript">원고</option>
              <option value="excel">설정표</option>
              <option value="manual">직접 입력</option>
              <option value="generated">추천 시나리오 메모</option>
            </select>
          </div>
        </div>
        <ul className="divide-y divide-line">
          {filtered.map((m) => {
            const tm = SOURCE_TYPE_META[m.sourceType];
            const sm = STATUS_META[m.status];
            return (
              <li key={m.id} className="flex items-center gap-3 py-3">
                <Icon name={tm.icon} size={22} className="shrink-0 text-ink-soft" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-medium text-ink">{m.title}</div>
                  <div className="text-sm text-ink-soft">
                    {new Date(m.updatedAt).toLocaleString("ko-KR")} · 설정 {m.learnedItems}건 학습
                  </div>
                </div>
                <span className={`chip ${tm.chip}`}>{tm.label}</span>
                <span className={`chip ${sm.chip}`}>● {sm.label}</span>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="py-6 text-center text-base text-ink-soft">
              조건에 맞는 기록이 없습니다.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
