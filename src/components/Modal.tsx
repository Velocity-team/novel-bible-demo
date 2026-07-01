import type { ReactNode } from "react";
import { Icon } from "./Icon";

export default function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`card fade-up shadow-pop max-h-[85vh] w-full overflow-y-auto p-6 ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-ink">{title}</h3>
          <button
            className="rounded-sm p-1.5 text-ink-faint transition hover:bg-paper-2 hover:text-ink-mid"
            onClick={onClose}
            aria-label="닫기"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
