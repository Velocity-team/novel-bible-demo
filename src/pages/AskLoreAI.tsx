import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icon";
import { simulateLoreAnswer } from "../utils/aiSim";
import { blockName, relationLabel } from "../utils/search";

const SUGGESTED = [
  "주인공은 누구야? 강도현이랑 이서준은 무슨 관계야?",
  "하은채는 왜 죽었다가 살아나?",
  "주인공 각성 등급이 왜 문제야?",
  "윤가람은 어떤 인물이야?",
  "회귀랑 빙의 설정을 정리해줘",
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
          <h2 className="text-2xl font-bold tracking-tight text-ink">AI에게 물어보기</h2>
          <p className="text-base leading-relaxed text-ink-soft">
            <b className="text-ink-mid">「{state.project.title}」</b> 설정에 대해 물어보면, 저장된
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
            <Icon name="chat" size={40} className="text-ink-faint" />
            <p className="text-base leading-relaxed text-ink-soft">
              지금은 <b className="text-ink-mid">「{state.project.title}」</b>를 예시로 답해 드려요.
              <br />
              아래 예시 질문을 눌러 시작해 보세요.
            </p>
            <div className="flex max-w-2xl flex-wrap justify-center gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  className="chip cursor-pointer px-4 py-2 text-base text-ink-mid transition hover:border-ink-mid hover:text-ink"
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
              <div className="max-w-[80%] rounded-sm bg-paper-2 px-4 py-3 text-base leading-relaxed text-ink">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-start">
              <div className="max-w-[90%] space-y-3">
                <div className="text-sm text-ink-soft">노벨 바이블 AI</div>
                <p className="prose-writer">{m.text}</p>

                {m.relatedBlockIds.length > 0 && (
                  <div>
                    <div className="mb-1 text-sm font-bold text-ink-soft">관련 설정 카드</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.relatedBlockIds.map((id) => (
                        <button
                          key={id}
                          className="chip cursor-pointer border border-line bg-paper-2 text-ink-mid hover:bg-paper-300"
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
                    <div className="mb-1 text-sm font-bold text-ink-soft">관련 관계</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.relatedRelationIds.map((id) => {
                        const r = state.relations.find((x) => x.id === id);
                        return r ? (
                          <span key={id} className="chip text-ink-mid">
                            {relationLabel(state, r)}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {m.relatedConflictIds.length > 0 && (
                  <div>
                    <div className="mb-1 text-sm font-bold text-ink-soft">관련 설정 오류</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.relatedConflictIds.map((id) => {
                        const c = state.conflicts.find((x) => x.id === id);
                        return c ? (
                          <button
                            key={id}
                            className="chip cursor-pointer border border-signal bg-signal-bg text-signal hover:bg-signal hover:text-paper"
                            onClick={() => navigate("conflicts")}
                          >
                            <Icon name="alert" size={13} className="shrink-0" /> {c.title}
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
                        지도에서 보기
                      </button>
                      <button
                        className="btn-ghost px-3 py-1.5 text-sm"
                        onClick={() => openBlockDetail(m.relatedBlockIds[0])}
                      >
                        설정 카드 열기
                      </button>
                    </>
                  )}
                  <button
                    className="btn-ghost px-3 py-1.5 text-sm"
                    onClick={() => copy(m.id, m.text)}
                  >
                    {copiedId === m.id ? "복사됨" : "답변 복사"}
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {thinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-sm border border-line bg-paper-2 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="pulse-dot h-2 w-2 rounded-full bg-ink-soft"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
              <span className="text-base text-ink-soft">저장된 설정을 찾아보는 중…</span>
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
              className="chip shrink-0 cursor-pointer text-ink-soft hover:text-ink"
              onClick={() => ask(s, true)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 직접 입력 안내 (체험 화면) */}
      {demoHint && (
        <div className="fade-up rounded-sm border border-line bg-paper-2 p-4">
          <div className="text-base font-bold text-ink">
            지금은 편의상 보여 드리는 체험 화면이에요
          </div>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            직접 입력하신 질문에는 아직 답해 드릴 수 없어요. 아래 <b>예시 질문</b>을 눌러 체험해 보세요.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                className="chip cursor-pointer px-3 py-1.5 text-sm text-ink-mid transition hover:bg-paper-2"
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
          placeholder="예: 하은채가 마지막으로 나온 회차는?"
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
