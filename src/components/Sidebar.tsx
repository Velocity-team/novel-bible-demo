import { useApp } from "../context/AppContext";
import type { PageKey } from "../types";

/** 작가의 작업 흐름(보관·정리 → 집필 도우미)에 맞춰 묶은 메뉴 */
const MENU_GROUPS: {
  title: string | null;
  items: { key: PageKey; label: string; icon: string; badge?: string }[];
}[] = [
  {
    title: null,
    items: [
      { key: "ask", label: "AI에게 물어보기", icon: "ask" },
      { key: "dashboard", label: "내 작품 한눈에", icon: "dashboard" },
    ],
  },
  {
    title: "세계관 기록",
    items: [
      { key: "atlas", label: "세계관 지도", icon: "atlas", badge: "NEW" },
      { key: "blocks", label: "설정 사전", icon: "blocks" },
      { key: "import", label: "원고·설정 불러오기", icon: "import" },
      { key: "memory", label: "AI 학습 현황", icon: "memory" },
    ],
  },
  {
    title: "집필 도우미",
    items: [
      { key: "plotroom", label: "캐릭터 회의실", icon: "plotroom", badge: "NEW" },
      { key: "conflicts", label: "설정 오류 검사", icon: "conflicts" },
    ],
  },
  {
    title: "관리",
    items: [{ key: "settings", label: "작품 설정", icon: "settings" }],
  },
];

export default function Sidebar({
  mobileOpen,
  onClose,
  onExit,
}: {
  mobileOpen: boolean;
  onClose: () => void;
  /** 로고를 누르면 랜딩으로 */
  onExit?: () => void;
}) {
  const { page, navigate, state } = useApp();
  const openConflicts = state.conflicts.filter((c) => c.status === "open").length;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-line bg-paper transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={onExit}
          className="block px-5 py-6 text-left transition hover:opacity-70"
          title="노벨 바이블 첫 화면으로"
        >
          <div className="text-xl font-extrabold tracking-tight text-ink">노벨 바이블</div>
          <div className="mt-0.5 text-xs text-ink-soft">작가를 위한 세계관 기록 도우미</div>
        </button>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {MENU_GROUPS.map((g, gi) => (
            <div key={gi}>
              {g.title && (
                <div className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  {g.title}
                </div>
              )}
              <div className="space-y-0.5">
                {g.items.map((m) => {
                  const active = page === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => {
                        navigate(m.key);
                        onClose();
                      }}
                      className={`flex w-full items-center border-l-2 px-3 py-2.5 text-base transition ${
                        active
                          ? "border-ink font-bold text-ink"
                          : "border-transparent text-ink-soft hover:text-ink"
                      }`}
                    >
                      <span className="flex-1 text-left">{m.label}</span>
                      {m.badge && !active && (
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                          {m.badge}
                        </span>
                      )}
                      {m.key === "conflicts" && openConflicts > 0 && (
                        <span className="text-sm font-semibold text-signal">{openConflicts}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-line px-5 py-4 text-sm leading-relaxed text-ink-soft">
          원고를 저장할수록 AI가 작품을 더 정확하게 기억합니다.
        </div>
      </aside>
    </>
  );
}
