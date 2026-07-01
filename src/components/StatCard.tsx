import { Icon } from "./Icon";

export default function StatCard({
  label,
  value,
  icon,
  accent = "text-ink",
  onClick,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full flex-col items-start gap-1 p-4 text-left transition enabled:hover:bg-paper-2 disabled:cursor-default"
    >
      <div className={`text-3xl font-bold leading-none tracking-tight ${accent}`}>{value}</div>
      <div className="flex items-center gap-1.5 text-ink-soft">
        <Icon name={icon} size={13} className="shrink-0 text-ink-faint" />
        <span className="truncate text-sm">{label}</span>
      </div>
    </button>
  );
}
