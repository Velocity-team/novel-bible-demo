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
      { key: "ask", label: "AI에게 물어보기", icon: "💬" },
      { key: "dashboard", label: "내 작품 한눈에", icon: "🏠" },
    ],
  },
  {
    title: "세계관 기록",
    items: [
      { key: "atlas", label: "세계관 지도", icon: "🗺️", badge: "NEW" },
      { key: "blocks", label: "설정 사전", icon: "🗂️" },
      { key: "import", label: "원고·설정 불러오기", icon: "📥" },
      { key: "memory", label: "AI 학습 현황", icon: "🧠" },
    ],
  },
  {
    title: "집필 도우미",
    items: [
      { key: "plotroom", label: "캐릭터 회의실", icon: "🎬", badge: "NEW" },
      { key: "conflicts", label: "설정 오류 검사", icon: "🚨" },
    ],
  },
  {
    title: "관리",
    items: [{ key: "settings", label: "작품 설정", icon: "⚙️" }],
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
        <div className="fixed inset-0 z-30 bg-stone-900/40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-paper-300 bg-white transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-3 px-5 py-5 text-left transition hover:opacity-80"
          title="노벨 바이블 첫 화면으로"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-card">
            📚
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-stone-800">
              노벨 바이블
            </div>
            <div className="text-xs text-stone-500">작가를 위한 세계관 기록 도우미</div>
          </div>
        </button>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          {MENU_GROUPS.map((g, gi) => (
            <div key={gi}>
              {g.title && (
                <div className="mb-1 px-3 text-xs font-bold uppercase tracking-wider text-stone-400">
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
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-base transition ${
                        active
                          ? "bg-amber-100 font-bold text-amber-900"
                          : "text-stone-600 hover:bg-paper-100 hover:text-stone-800"
                      }`}
                    >
                      <span className="text-lg">{m.icon}</span>
                      <span className="flex-1 text-left">{m.label}</span>
                      {m.badge && !active && (
                        <span className="chip bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                          {m.badge}
                        </span>
                      )}
                      {m.key === "conflicts" && openConflicts > 0 && (
                        <span className="chip bg-red-100 text-red-700">{openConflicts}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-paper-300 px-5 py-4 text-sm leading-relaxed text-stone-500">
          원고를 저장할수록 AI가 작품을 더 정확하게 기억합니다.
        </div>
      </aside>
    </>
  );
}
