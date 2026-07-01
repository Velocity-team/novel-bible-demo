import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { aiRecall } from "../utils/aiSim";
import { relationNatural } from "../utils/search";
import { AIStatusBadge, SeverityBadge, Tag, TypeBadge } from "./Badge";
import { BLOCK_TYPE_META } from "./meta";
import { Icon } from "./Icon";

/** 어느 화면에서나 열 수 있는 오른쪽 상세 패널 */
export default function BlockDetailPanel() {
  const {
    state,
    detailBlockId,
    openBlockDetail,
    updateBlock,
    deleteBlock,
    deleteRelation,
    navigate,
  } = useApp();
  const block = state.blocks.find((b) => b.id === detailBlockId) ?? null;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    firstAppearance: "",
    tags: "",
    attributes: "",
  });
  const [notes, setNotes] = useState("");
  const [recall, setRecall] = useState<string | null>(null);

  useEffect(() => {
    if (block) {
      setForm({
        name: block.name,
        description: block.description,
        firstAppearance: block.firstAppearance ?? "",
        tags: block.tags.join(", "),
        attributes: Object.entries(block.attributes)
          .map(([k, v]) => `${k}=${v}`)
          .join(", "),
      });
      setNotes(block.canonNotes);
      setEditing(false);
      setRecall(null);
    }
  }, [block?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!block) return null;

  const relations = state.relations.filter(
    (r) => r.sourceId === block.id || r.targetId === block.id
  );
  const conflicts = state.conflicts.filter((c) => c.relatedBlockIds.includes(block.id));

  const saveEdit = () => {
    const attributes: Record<string, string> = {};
    form.attributes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((pair) => {
        const [k, ...rest] = pair.split("=");
        if (k && rest.length) attributes[k.trim()] = rest.join("=").trim();
      });
    updateBlock(block.id, {
      name: form.name.trim() || block.name,
      description: form.description,
      firstAppearance: form.firstAppearance || undefined,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      attributes,
    });
    setEditing(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
        onClick={() => openBlockDetail(null)}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-paper transition-transform">
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              <TypeBadge type={block.type} />
              <AIStatusBadge status={block.aiStatus} />
            </div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
              <Icon name={BLOCK_TYPE_META[block.type].icon} size={18} className="shrink-0 text-ink-soft" />
              {block.name}
            </h2>
          </div>
          <button
            className="rounded-sm p-1.5 text-ink-faint transition hover:bg-paper-2 hover:text-ink-mid"
            onClick={() => openBlockDetail(null)}
            aria-label="닫기"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="label">이름</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                <label className="label">첫 등장 (예: 3화)</label>
                <input
                  className="input"
                  value={form.firstAppearance}
                  onChange={(e) => setForm({ ...form, firstAppearance: e.target.value })}
                />
              </div>
              <div>
                <label className="label">속성 (이름=값, 쉼표로 구분)</label>
                <input
                  className="input"
                  placeholder="성격=착함, 형편=가난함"
                  value={form.attributes}
                  onChange={(e) => setForm({ ...form, attributes: e.target.value })}
                />
              </div>
              <div>
                <label className="label">태그 (쉼표로 구분)</label>
                <input
                  className="input"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <button className="btn-primary flex-1" onClick={saveEdit}>
                  저장
                </button>
                <button className="btn-ghost flex-1" onClick={() => setEditing(false)}>
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-base leading-relaxed text-ink-mid">{block.description}</p>

              {Object.keys(block.attributes).length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(block.attributes).map(([k, v]) => (
                    <div key={k} className="rounded-sm bg-paper-2 px-3 py-2">
                      <div className="text-xs font-bold text-ink-soft">{k}</div>
                      <div className="text-base font-medium text-ink">{v}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {block.firstAppearance && (
                  <span className="chip text-ink-soft">첫 등장 {block.firstAppearance}</span>
                )}
                {block.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </>
          )}

          {/* AI 기억 요약 */}
          <section>
            <button
              className="btn-primary w-full"
              onClick={() => setRecall(aiRecall(block.id, state))}
            >
              AI가 기억하는 내용 보기
            </button>
            {recall && (
              <div className="fade-up mt-2 rounded-sm border border-line bg-paper-2 p-3 text-base leading-relaxed text-ink-mid">
                {recall}
              </div>
            )}
          </section>

          {/* 근거 문장 */}
          <section>
            <h3 className="label">원고 속 근거 문장</h3>
            {block.sourceEvidence.length > 0 ? (
              <ul className="space-y-1.5">
                {block.sourceEvidence.map((e, i) => (
                  <li
                    key={i}
                    className="prose-writer rounded-sm border border-line bg-paper-2 px-3 py-2 italic"
                  >
                    {e}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-soft">
                아직 연결된 근거 문장이 없습니다. 원고를 올리면 자동으로 채워집니다.
              </p>
            )}
          </section>

          {/* 작가 메모 */}
          <section>
            <h3 className="label">작가 메모</h3>
            <textarea
              className="input min-h-16 text-sm"
              placeholder="이 설정에 대한 메모를 남겨 보세요…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => updateBlock(block.id, { canonNotes: notes })}
            />
          </section>

          {/* 관계 */}
          <section>
            <h3 className="label">관계 ({relations.length})</h3>
            <ul className="space-y-1.5">
              {relations.map((r) => (
                <li
                  key={r.id}
                  className="group flex items-center justify-between gap-2 rounded-sm bg-paper-2 px-3 py-2 text-sm text-ink-mid"
                >
                  <span>{relationNatural(state, r)}</span>
                  <button
                    className="hidden text-ink-faint hover:text-signal group-hover:block"
                    onClick={() => deleteRelation(r.id)}
                    title="관계 삭제"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </li>
              ))}
              {relations.length === 0 && (
                <li className="text-sm text-ink-soft">아직 연결된 관계가 없습니다.</li>
              )}
            </ul>
          </section>

          {/* 오류 */}
          {conflicts.length > 0 && (
            <section>
              <h3 className="label">관련 설정 오류</h3>
              <ul className="space-y-1.5">
                {conflicts.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-2 rounded-sm border border-signal bg-signal-bg px-3 py-2 text-sm"
                  >
                    <span className="text-ink-mid">{c.title}</span>
                    <SeverityBadge severity={c.severity} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="flex gap-2 border-t border-line px-5 py-3">
          {!editing && (
            <button className="btn-ghost inline-flex flex-1 items-center justify-center gap-1.5" onClick={() => setEditing(true)}>
              <Icon name="edit" size={16} /> 수정
            </button>
          )}
          <button
            className="btn-ghost inline-flex flex-1 items-center justify-center gap-1.5"
            onClick={() => {
              openBlockDetail(null);
              navigate("dashboard", { graphFocusId: block.id });
            }}
          >
            <Icon name="map" size={16} /> 지도에서 보기
          </button>
          <button
            className="btn-danger"
            onClick={() => {
              if (confirm(`'${block.name}' 카드와 연결된 관계를 모두 삭제할까요?`)) {
                deleteBlock(block.id);
              }
            }}
            aria-label="삭제"
          >
            <Icon name="delete" size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
