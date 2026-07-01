import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "./Icon";

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
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-paper px-4 py-3 lg:px-6">
      <button
        className="rounded-sm p-2 text-ink-soft hover:bg-paper-2 lg:hidden"
        onClick={onMenuClick}
        aria-label="메뉴 열기"
      >
        <Icon name="menu" size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate text-lg font-bold text-ink sm:text-xl">
            {state.project.title}
          </h1>
          {openConflicts === 0 ? (
            <span className="chip hidden border border-line bg-paper-2 text-ink-mid sm:inline-flex">
              ● 설정 오류 없음
            </span>
          ) : (
            <span className="chip hidden border border-signal bg-signal-bg text-signal sm:inline-flex">
              설정 오류 {openConflicts}건
            </span>
          )}
        </div>
        <div className="hidden text-sm text-ink-soft sm:block">{state.project.genre}</div>
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
        className="btn-ghost inline-flex items-center gap-1.5 whitespace-nowrap"
        onClick={() => navigate("about")}
        title="노벨 바이블이 어떤 서비스인지 알아보기"
      >
        <Icon name="about" size={16} />
        <span className="hidden lg:inline">서비스 소개</span>
      </button>

      <button
        className="btn-ghost inline-flex items-center gap-1.5 whitespace-nowrap"
        onClick={startNewProject}
        title="새 작품을 등록하고 처음부터 시작하기"
      >
        <Icon name="add" size={16} />
        <span className="hidden lg:inline">새 작품 등록</span>
      </button>

      <button className="btn-primary inline-flex items-center gap-1.5 whitespace-nowrap" onClick={() => navigate("import")}>
        <Icon name="import" size={16} />
        <span className="hidden sm:inline">새 원고 올리기</span>
      </button>
    </header>
  );
}
