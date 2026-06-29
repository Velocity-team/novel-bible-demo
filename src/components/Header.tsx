import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { state, navigate, resetAll } = useApp();
  const [q, setQ] = useState("");
  const openConflicts = state.conflicts.filter((c) => c.status === "open").length;

  const submit = () => {
    if (!q.trim()) return;
    navigate("ask", { query: q.trim() });
    setQ("");
  };

  const startNewProject = () => {
    if (
      window.confirm(
        "새 작품을 등록할까요?\n지금 작품의 체험 데이터는 초기화되고, 작품 등록 화면으로 이동합니다."
      )
    ) {
      resetAll();
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-paper-300 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
      <button
        className="rounded-lg p-2 text-stone-600 hover:bg-paper-100 lg:hidden"
        onClick={onMenuClick}
        aria-label="메뉴 열기"
      >
        ☰
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-lg font-bold text-stone-800 sm:text-xl">
            {state.project.title}
          </h1>
          {openConflicts === 0 ? (
            <span className="chip hidden bg-emerald-100 text-emerald-800 sm:inline-flex">
              ● 설정 오류 없음
            </span>
          ) : (
            <span className="chip hidden bg-red-100 text-red-700 sm:inline-flex">
              설정 오류 {openConflicts}건
            </span>
          )}
        </div>
        <div className="hidden text-sm text-stone-500 sm:block">{state.project.genre}</div>
      </div>

      <div className="hidden items-center md:flex">
        <input
          className="input w-56 lg:w-72"
          placeholder="내 설정에 대해 물어보기…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
      </div>

      <button
        className="btn-ghost whitespace-nowrap"
        onClick={() => navigate("about")}
        title="노벨 바이블이 어떤 서비스인지 알아보기"
      >
        <span className="hidden lg:inline">💡 서비스 소개</span>
        <span className="lg:hidden">💡</span>
      </button>

      <button
        className="btn-ghost whitespace-nowrap"
        onClick={startNewProject}
        title="새 작품을 등록하고 처음부터 시작하기"
      >
        <span className="hidden lg:inline">✚ 새 작품 등록</span>
        <span className="lg:hidden">✚</span>
      </button>

      <button className="btn-primary whitespace-nowrap" onClick={() => navigate("import")}>
        <span className="hidden sm:inline">📥 새 원고 올리기</span>
        <span className="sm:hidden">📥</span>
      </button>
    </header>
  );
}
