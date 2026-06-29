import { useEffect, useState } from "react";
import BlockDetailPanel from "./components/BlockDetailPanel";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useApp } from "./context/AppContext";
import { trackEvent } from "./utils/metrics";
import About from "./pages/About";
import AIMemory from "./pages/AIMemory";
import AskLoreAI from "./pages/AskLoreAI";
import BackOffice from "./pages/BackOffice";
import Conflicts from "./pages/Conflicts";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import ManuscriptImport from "./pages/ManuscriptImport";
import Onboarding from "./pages/Onboarding";
import PlotRoom from "./pages/PlotRoom";
import ProjectSettings from "./pages/ProjectSettings";
import WorldAtlas from "./pages/WorldAtlas";
import WorldBlocks from "./pages/WorldBlocks";

export default function App() {
  const { state, page } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  // 도메인 접속 시 가장 먼저 보이는 사전 예약 랜딩.
  const [entered, setEntered] = useState(false);
  // 데모 진입 시에는 '새 작품 등록' 화면부터 보여 준다.
  const [demoFlow, setDemoFlow] = useState(false);

  // 비공개 백오피스: UI에 노출하지 않고 #backoffice 링크로만 접속.
  const [hashRoute, setHashRoute] = useState(() => window.location.hash.replace(/^#/, ""));
  useEffect(() => {
    const onHash = () => setHashRoute(window.location.hash.replace(/^#/, ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  if (hashRoute === "backoffice") {
    return <BackOffice />;
  }

  const enterDemo = () => {
    trackEvent("enter_demo");
    setEntered(true);
    setDemoFlow(true);
    window.scrollTo(0, 0);
  };
  const exitToLanding = () => {
    setEntered(false);
    setDemoFlow(false);
    window.scrollTo(0, 0);
  };

  if (!entered) {
    return <Landing onEnter={enterDemo} />;
  }

  // '데모 둘러보기'로 들어오면 작품 등록(1단계)부터 시작한다.
  if (demoFlow) {
    return (
      <Onboarding initialStep={1} onComplete={() => setDemoFlow(false)} onExit={exitToLanding} />
    );
  }

  // 처음 사용하는 작가는 온보딩(작품 정보 → 원고 올리기 → AI 학습)부터 시작한다.
  if (!state.onboarded) {
    return <Onboarding onExit={exitToLanding} />;
  }

  return (
    <div className="min-h-screen bg-[#faf6ef] text-stone-800">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onExit={exitToLanding} />
      <div className="lg:pl-72">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-7xl p-4 lg:p-6">
          {page === "dashboard" && <Dashboard />}
          {(page === "import" || page === "writing") && <ManuscriptImport />}
          {page === "memory" && <AIMemory />}
          {(page === "blocks" || page === "relations") && <WorldBlocks />}
          {page === "about" && <About />}
          {page === "ask" && <AskLoreAI />}
          {page === "conflicts" && <Conflicts />}
          {page === "settings" && <ProjectSettings />}
          {page === "atlas" && <WorldAtlas />}
          {(page === "plotroom" || page === "scenario") && <PlotRoom />}
        </main>
      </div>
      <BlockDetailPanel />
    </div>
  );
}
