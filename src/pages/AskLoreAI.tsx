import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { simulateLoreAnswer } from "../utils/aiSim";
import { blockName, relationLabel } from "../utils/search";

const SUGGESTED = [
  "흥부와 놀부는 어떤 사이야?",
  "제비는 어느 쪽 다리를 다쳤어?",
  "박은 언제 탈 수 있어?",
  "박씨는 누가 줬어?",
  "흥부네 자식은 몇 명이야?",
  "아직 회수 안 된 떡밥이 있어?",
  "지금 설정 오류가 있는 부분은 어디야?",
  "다음 에피소드로 뭘 쓰면 좋을까?",
];

export default function AskLoreAI() {
  const { state, addChat, clearChat, openBlockDetail, navigate, navOptions } = useApp();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [demoHint, setDemoHint] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoAsked = useRef(false);

  const ask = (question: string, fromExample = false) => {
    const q = question.trim();
    if (!q || thinking) return;
    // 편의상 제공되는 체험 화면이라 미리 준비된 예시 질문에만 답한다.
    if (!fromExample && !SUGGESTED.includes(q)) {
      setDemoHint(true);
      setInput("");
      return;
    }
    setDemoHint(false);
    addChat({ role: "user", text: q, relatedBlockIds: [], relatedRelationIds: [], relatedConflictIds: [] });
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const a = simulateLoreAnswer(q, state);
      addChat({
        role: "ai",
        text: a.text,
        relatedBlockIds: a.blockIds,
        relatedRelationIds: a.relationIds,
        relatedConflictIds: a.conflictIds,
      });
      setThinking(false);
    }, 900);
  };

  useEffect(() => {
    if (navOptions.query && !autoAsked.current) {
      autoAsked.current = true;
      ask(navOptions.query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.chatHistory.length, thinking]);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard 미지원 환경 무시 */
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1200);
  };

  return (
    <div className="fade-up flex h-[calc(100vh-140px)] flex-col space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-800">AI에게 물어보기</h2>
          <p className="text-base text-stone-500">
            <b className="text-stone-700">「{state.project.title}」</b> 설정에 대해 물어보면, 저장된
            기록에서 관련 인물·사건·규칙을 찾아 답해 줘요.
          </p>
        </div>
        {state.chatHistory.length > 0 && (
          <button className="btn-ghost" onClick={clearChat}>
            대화 지우기
          </button>
        )}
      </div>

      {/* 채팅 영역 */}
      <div className="card flex-1 space-y-4 overflow-y-auto p-5">
        {state.chatHistory.length === 0 && !thinking && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <span className="text-5xl">💬</span>
            <p className="text-base text-stone-500">
              지금은 <b className="text-stone-700">「{state.project.title}」</b>를 예시로 답해 드려요.
              <br />
              아래 예시 질문을 눌러 시작해 보세요.
            </p>
            <div className="flex max-w-2xl flex-wrap justify-center gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  className="chip cursor-pointer border border-paper-300 bg-white px-4 py-2 text-base text-stone-600 transition hover:border-amber-400 hover:text-amber-800"
                  onClick={() => ask(s, true)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.chatHistory.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-amber-600 px-4 py-3 text-base text-white">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-start">
              <div className="max-w-[90%] space-y-3 rounded-2xl rounded-bl-md border border-paper-300 bg-paper-100 px-4 py-3">
                <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700">
                  📚 노벨 바이블 AI
                </div>
                <p className="text-base leading-relaxed text-stone-700">{m.text}</p>

                {m.relatedBlockIds.length > 0 && (
                  <div>
                    <div className="mb-1 text-sm font-bold text-stone-500">관련 설정 카드</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.relatedBlockIds.map((id) => (
                        <button
                          key={id}
                          className="chip cursor-pointer bg-violet-100 text-violet-800 hover:bg-violet-200"
                          onClick={() => openBlockDetail(id)}
                        >
                          {blockName(state, id)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {m.relatedRelationIds.length > 0 && (
                  <div>
                    <div className="mb-1 text-sm font-bold text-stone-500">관련 관계</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.relatedRelationIds.map((id) => {
                        const r = state.relations.find((x) => x.id === id);
                        return r ? (
                          <span key={id} className="chip border border-paper-300 bg-white text-stone-600">
                            {relationLabel(state, r)}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {m.relatedConflictIds.length > 0 && (
                  <div>
                    <div className="mb-1 text-sm font-bold text-stone-500">관련 설정 오류</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.relatedConflictIds.map((id) => {
                        const c = state.conflicts.find((x) => x.id === id);
                        return c ? (
                          <button
                            key={id}
                            className="chip cursor-pointer bg-red-100 text-red-700 hover:bg-red-200"
                            onClick={() => navigate("conflicts")}
                          >
                            🚨 {c.title}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {m.relatedBlockIds.length > 0 && (
                    <>
                      <button
                        className="btn-ghost px-3 py-1.5 text-sm"
                        onClick={() =>
                          navigate("dashboard", { graphFocusId: m.relatedBlockIds[0] })
                        }
                      >
                        🗺️ 지도에서 보기
                      </button>
                      <button
                        className="btn-ghost px-3 py-1.5 text-sm"
                        onClick={() => openBlockDetail(m.relatedBlockIds[0])}
                      >
                        🗂️ 설정 카드 열기
                      </button>
                    </>
                  )}
                  <button
                    className="btn-ghost px-3 py-1.5 text-sm"
                    onClick={() => copy(m.id, m.text)}
                  >
                    {copiedId === m.id ? "✓ 복사됨" : "📄 답변 복사"}
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {thinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-paper-300 bg-paper-100 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="pulse-dot h-2 w-2 rounded-full bg-amber-500"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
              <span className="text-base text-stone-500">저장된 설정을 찾아보는 중…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 추천 질문 (대화 중에도) */}
      {state.chatHistory.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SUGGESTED.slice(0, 4).map((s) => (
            <button
              key={s}
              className="chip shrink-0 cursor-pointer border border-paper-300 bg-white text-stone-500 hover:text-amber-800"
              onClick={() => ask(s, true)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 직접 입력 안내 (체험 화면) */}
      {demoHint && (
        <div className="fade-up rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <div className="text-base font-bold text-amber-900">
            💡 지금은 편의상 보여 드리는 체험 화면이에요
          </div>
          <p className="mt-1 text-sm leading-relaxed text-amber-800">
            직접 입력하신 질문에는 아직 답해 드릴 수 없어요. 아래 <b>예시 질문</b>을 눌러 체험해 보세요.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                className="chip cursor-pointer border border-amber-300 bg-white px-3 py-1.5 text-sm text-amber-800 transition hover:bg-amber-100"
                onClick={() => ask(s, true)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력 */}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="예: 제비가 마지막으로 나온 회차는?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(input)}
        />
        <button className="btn-primary px-6" onClick={() => ask(input)} disabled={thinking || !input.trim()}>
          물어보기
        </button>
      </div>
    </div>
  );
}
