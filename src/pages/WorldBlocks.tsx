import { useEffect, useMemo, useState } from "react";
import BlockCard from "../components/BlockCard";
import { BLOCK_TYPE_META } from "../components/meta";
import { Icon } from "../components/Icon";
import Modal from "../components/Modal";
import { useApp } from "../context/AppContext";
import type { BlockType } from "../types";
import RelationBuilder from "./RelationBuilder";

const TYPE_FILTERS: { key: BlockType | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "character", label: "인물" },
  { key: "location", label: "장소" },
  { key: "event", label: "사건" },
  { key: "organization", label: "무리" },
  { key: "rule", label: "규칙" },
  { key: "item", label: "물건" },
];

export default function WorldBlocks() {
  const { state, detailBlockId, openBlockDetail, addBlock, navOptions, page } = useApp();
  // 설정 사전 안에 '관계 만들기'를 탭으로 합쳤다.
  const [tab, setTab] = useState<"cards" | "relations">(
    page === "relations" ? "relations" : "cards"
  );
  useEffect(() => {
    setTab(page === "relations" ? "relations" : "cards");
  }, [page]);
  const [typeFilter, setTypeFilter] = useState<BlockType | "all">("all");
  const [query, setQuery] = useState(navOptions.query ?? "");
  const [tagFilter, setTagFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "character" as BlockType,
    description: "",
    firstAppearance: "",
    tags: "",
    attributes: "",
  });

  const allTags = useMemo(
    () => [...new Set(state.blocks.flatMap((b) => b.tags))].sort(),
    [state.blocks]
  );

  const filtered = state.blocks.filter((b) => {
    if (typeFilter !== "all" && b.type !== typeFilter) return false;
    if (tagFilter && !b.tags.includes(tagFilter)) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const submitAdd = () => {
    if (!form.name.trim()) return;
    const attributes: Record<string, string> = {};
    form.attributes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((pair) => {
        const [k, ...rest] = pair.split("=");
        if (k && rest.length) attributes[k.trim()] = rest.join("=").trim();
      });
    const nb = addBlock({
      name: form.name.trim(),
      type: form.type,
      description: form.description,
      firstAppearance: form.firstAppearance || undefined,
      attributes,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      aiStatus: "Manually Added",
      sourceEvidence: [],
      canonNotes: "",
    });
    setShowAdd(false);
    setForm({ name: "", type: "character", description: "", firstAppearance: "", tags: "", attributes: "" });
    openBlockDetail(nb.id);
  };

  return (
    <div className="fade-up space-y-5">
      {/* 설정 카드 / 관계 만들기 전환 */}
      <div className="flex gap-1 rounded-sm border border-line bg-paper-2 p-1.5">
        {([
          ["cards", "설정 카드"],
          ["relations", "관계 만들기"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 rounded-sm px-3 py-2 text-sm font-semibold transition ${
              tab === k ? "bg-paper text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "relations" && <RelationBuilder />}

      {tab === "cards" && (
      <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">설정 사전</h2>
          <p className="text-base leading-relaxed text-ink-soft">
            작품의 인물·장소·사건·규칙이 카드로 정리되어 있어요. 카드를 누르면 자세히 볼 수 있습니다.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          + 설정 카드 직접 만들기
        </button>
      </div>

      {/* 필터 */}
      <div className="card space-y-3 p-5">
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`chip inline-flex cursor-pointer items-center gap-1 px-4 py-2 text-base transition ${
                typeFilter === f.key
                  ? "border-ink bg-ink text-paper"
                  : "text-ink-mid hover:bg-paper-2"
              }`}
            >
              {f.key !== "all" && (
                <Icon name={BLOCK_TYPE_META[f.key].icon} size={14} className="shrink-0" />
              )}
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="input flex-1"
            placeholder="이름, 설명, 태그로 찾기…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="input sm:w-52"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="">태그: 전체</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 카드 목록 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((b) => (
          <BlockCard
            key={b.id}
            block={b}
            selected={detailBlockId === b.id}
            onClick={() => openBlockDetail(b.id)}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="card p-10 text-center text-base text-ink-soft">
          조건에 맞는 설정 카드가 없습니다.
        </div>
      )}

      {/* 추가 모달 */}
      <Modal open={showAdd} title="설정 카드 직접 만들기" onClose={() => setShowAdd(false)}>
        <div className="space-y-3">
          <div>
            <label className="label">종류</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as BlockType })}
            >
              {Object.entries(BLOCK_TYPE_META).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">이름 *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: 마을 훈장님"
            />
          </div>
          <div>
            <label className="label">설명</label>
            <textarea
              className="input min-h-20"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">첫 등장</label>
            <input
              className="input"
              value={form.firstAppearance}
              onChange={(e) => setForm({ ...form, firstAppearance: e.target.value })}
              placeholder="예: 7화"
            />
          </div>
          <div>
            <label className="label">속성 (이름=값, 쉼표로 구분)</label>
            <input
              className="input"
              value={form.attributes}
              onChange={(e) => setForm({ ...form, attributes: e.target.value })}
              placeholder="성격=엄격함, 형편=보통"
            />
          </div>
          <div>
            <label className="label">태그 (쉼표로 구분)</label>
            <input
              className="input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="조연, 마을 사람"
            />
          </div>
          <button className="btn-primary w-full" onClick={submitAdd} disabled={!form.name.trim()}>
            카드 만들기
          </button>
        </div>
      </Modal>
      </div>
      )}
    </div>
  );
}
