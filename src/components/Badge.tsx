import type { AIStatus, BlockType } from "../types";
import { AI_STATUS_META, BLOCK_TYPE_META, SEVERITY_META } from "./meta";
import { Icon } from "./Icon";

export function TypeBadge({ type }: { type: BlockType }) {
  const m = BLOCK_TYPE_META[type];
  return (
    <span className={`chip ${m.chip}`}>
      <Icon name={m.icon} size={13} className="shrink-0" />
      {m.label}
    </span>
  );
}

export function AIStatusBadge({ status }: { status: AIStatus }) {
  const m = AI_STATUS_META[status];
  return (
    <span className={`chip ${m.chip}`}>
      <Icon name={m.icon} size={13} className="shrink-0" />
      {m.label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: "high" | "medium" | "low" }) {
  const m = SEVERITY_META[severity];
  return <span className={`chip ${m.chip}`}>{m.label}</span>;
}

export function Tag({ children }: { children: string }) {
  return <span className="chip text-ink-soft">#{children}</span>;
}
