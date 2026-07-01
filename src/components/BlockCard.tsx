import type { WorldBlock } from "../types";
import { AIStatusBadge, Tag, TypeBadge } from "./Badge";

export default function BlockCard({
  block,
  selected,
  onClick,
}: {
  block: WorldBlock;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`card w-full p-5 text-left transition ${
        selected ? "border-ink bg-paper-2" : "hover:border-ink-mid"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <TypeBadge type={block.type} />
        <AIStatusBadge status={block.aiStatus} />
        {block.firstAppearance && (
          <span className="chip text-ink-soft">첫 등장 {block.firstAppearance}</span>
        )}
      </div>
      <div className="mb-1 text-lg font-bold text-ink">{block.name}</div>
      <p className="mb-2 line-clamp-2 text-base leading-relaxed text-ink-soft">
        {block.description}
      </p>
      <div className="flex flex-wrap gap-1">
        {block.tags.slice(0, 4).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
    </button>
  );
}
