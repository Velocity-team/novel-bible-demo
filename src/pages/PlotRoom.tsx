import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import type {
  MeetingTurn,
  SubstoryCandidate,
  RiskLevel,
  SubstoryType,
} from "../types";
import {
  mockPersonas,
  getMockMeetingTurns,
  getMeetingKeywords,
  mockSubstoryCandidates,
  MEETING_SITUATIONS,
} from "../data/mockData";
import MeetingRoomPixel from "./MeetingRoomPixel";

type Tab = "persona" | "meeting" | "guardrail" | "recommend";

const LOADING_STEPS = [
  "Story Bible에서 작가 의도 가드레일 확인 중…",
  "Knowledge Graph에서 캐릭터 기억 조회 중…",
  "RAG: 관련 회차 검색 중…",
  "캐릭터 페르소나 적용 중…",
  "회의를 시작합니다…",
];

const SUBSTORY_TYPE_COLOR: Record<SubstoryType, string> = {
  "감정선 보강형": "bg-violet-100 text-violet-800",
  "관계 변화형": "bg-blue-100 text-blue-800",
  "복선 회수형": "bg-amber-100 text-amber-800",
  "갈등 확장형": "bg-red-100 text-red-700",
  "코미디 완충형": "bg-emerald-100 text-emerald-800",
};

const RISK_COLOR: Record<RiskLevel, string> = {
  낮음: "bg-emerald-100 text-emerald-800 border-emerald-200",
  중간: "bg-amber-100 text-amber-800 border-amber-200",
  높음: "bg-red-100 text-red-700 border-red-200",
};

const RISK_ICON: Record<RiskLevel, string> = {
  낮음: "🟢",
  중간: "🟡",
  높음: "🔴",
};

const CHAR_COLOR: Record<string, string> = {
  c1: "bg-amber-100 text-amber-900 border-amber-300",
  c2: "bg-stone-100 text-stone-800 border-stone-300",
  c3: "bg-emerald-100 text-emerald-900 border-emerald-300",
  c4: "bg-red-50 text-red-900 border-red-200",
  c5: "bg-sky-100 text-sky-900 border-sky-300",
};

const CHAR_AVATAR: Record<string, string> = {
  c1: "🪴",
  c2: "🏚️",
  c3: "🧺",
  c4: "🍚",
  c5: "🐦",
};

const VALID_TABS: Tab[] = ["persona", "meeting", "guardrail", "recommend"];

export default function PlotRoom() {
  const { state, navOptions, addNote } = useApp();
  const initialTab = VALID_TABS.includes(navOptions.plotTab as Tab)
    ? (navOptions.plotTab as Tab)
    : "persona";
  const [tab, setTab] = useState<Tab>(initialTab);

  // 추천 시나리오를 메모로 저장한 기록
  const [savedRecs, setSavedRecs] = useState<string[]>([]);

  // 회의
  const [situation, setSituation] = useState("");
  const [selectedChars, setSelectedChars] = useState<string[]>(["c1", "c2", "c3", "c4", "c5"]);
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [loadingStep, setLoadingStep] = useState(0);
  const [revealedTurns, setRevealedTurns] = useState(0);
  const [currentTurns, setCurrentTurns] = useState<MeetingTurn[]>([]);
  const [expandedThought, setExpandedThought] = useState<string | null>(null);
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);

  // 가드레일
  const [customGuardrails, setCustomGuardrails] = useState<string[]>([]);
  const [guardrailInput, setGuardrailInput] = useState("");

  // 서브스토리
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  // 편의상 제공되는 체험 화면: 직접 입력한 상황은 예시로 안내
  const [situationHint, setSituationHint] = useState(false);

  const characters = state.blocks.filter((b) => b.type === "character");

  const toggleChar = (id: string) => {
    setSelectedChars((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const startMeeting = () => {
    if (!situation.trim()) return;
    // 미리 준비된 예시 상황에만 회의가 진행된다(체험 화면).
    if (!MEETING_SITUATIONS.includes(situation.trim())) {
      setSituationHint(true);
      return;
    }
    setSituationHint(false);
    const turns = getMockMeetingTurns(situation).filter((t) =>
      selectedChars.includes(t.characterId)
    );
    setCurrentTurns(turns);
    setPhase("loading");
    setLoadingStep(0);
    setRevealedTurns(0);

    // 로딩 단계
    LOADING_STEPS.forEach((_, i) => {
      setTimeout(() => setLoadingStep(i), i * 480);
    });

    // 회의 전환
    setTimeout(() => {
      setPhase("done");
    }, LOADING_STEPS.length * 480 + 200);
  };

  // 발언 순차 공개
  useEffect(() => {
    if (phase !== "done") return;
    if (revealedTurns >= currentTurns.length) return;
    const t = setTimeout(() => {
      setRevealedTurns((n) => n + 1);
    }, revealedTurns === 0 ? 400 : 1800);
    return () => clearTimeout(t);
  }, [phase, revealedTurns, currentTurns.length]);

  const addGuardrail = () => {
    const v = guardrailInput.trim();
    if (!v) return;
    setCustomGuardrails((prev) => [...prev, v]);
    setGuardrailInput("");
  };

  const meetingComplete = phase === "done" && revealedTurns >= currentTurns.length;

  // 회의 결과를 키워드 중심으로 요약 (완성 문장이 아닌 방향 키워드)
  const keywordSummary = situation ? getMeetingKeywords(situation) : null;

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "persona", label: "캐릭터 페르소나", icon: "🎭" },
    { key: "meeting", label: "캐릭터 회의", icon: "🗣️" },
    { key: "guardrail", label: "작가 가드레일", icon: "🛡️" },
    { key: "recommend", label: "관계별 시나리오 추천", icon: "💡" },
  ];

  const saveRecAsNote = (candidate: SubstoryCandidate) => {
    if (savedRecs.includes(candidate.id)) return;
    addNote({
      title: `시나리오 방향 메모: ${candidate.title}`,
      content: `관계: ${candidate.relationLabel}\n키워드: ${candidate.keywords.join(
        ", "
      )}\n방향: ${candidate.summary}\n참고 장면: ${candidate.keyMoment}\n\n※ 방향 참고용 메모입니다. 실제 집필은 작가가 직접 합니다.`,
      relatedBlockIds: candidate.relatedCharacterIds,
    });
    setSavedRecs((prev) => [...prev, candidate.id]);
  };

  return (
    <div className="fade-up space-y-5">
      {/* 헤더 */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-3xl">🎬</span>
          <h2 className="text-2xl font-extrabold text-stone-800">캐릭터 회의실</h2>
          <span className="chip bg-emerald-500 text-white">NEW</span>
          <span className="chip bg-violet-100 text-violet-700">PlotRoom</span>
        </div>
        <p className="mt-1 text-base text-stone-500">
          캐릭터들이 각자의 기억·관계로 상황에 반응하면, 그 결과를 <b className="text-stone-700">키워드</b>로
          정리하고 <b className="text-stone-700">관계별 시나리오 방향</b>을 추천합니다. 추천은 키워드와
          방향까지 — 실제 집필은 작가가 직접 합니다.
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 rounded-2xl border border-paper-300 bg-paper-100 p-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              tab === t.key
                ? "bg-white text-stone-800 shadow-card"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── 탭 1: 캐릭터 페르소나 ── */}
      {tab === "persona" && (
        <div className="fade-up space-y-3">
          <p className="text-sm text-stone-500">
            Story Bible 데이터에서 자동 추출된 캐릭터 페르소나입니다. 에이전트가 회의 시 이 카드를 장기 기억으로 참조합니다.
          </p>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {mockPersonas.map((persona) => {
              const block = state.blocks.find((b) => b.id === persona.characterId);
              if (!block) return null;
              const isOpen = expandedPersona === persona.characterId;
              const colorClass = CHAR_COLOR[persona.characterId] ?? "bg-paper-100 text-stone-800 border-paper-300";

              return (
                <div key={persona.characterId} className={`card overflow-hidden border ${colorClass.split(" ")[2]}`}>
                  <div
                    className={`flex cursor-pointer items-center gap-3 p-4 ${colorClass.split(" ").slice(0, 2).join(" ")}`}
                    onClick={() => setExpandedPersona(isOpen ? null : persona.characterId)}
                  >
                    <span className="text-3xl">{CHAR_AVATAR[persona.characterId]}</span>
                    <div className="flex-1">
                      <div className="text-lg font-extrabold">{block.name}</div>
                      <div className="text-sm opacity-70">{block.description.slice(0, 40)}…</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {persona.ragSources.map((ep) => (
                        <span key={ep} className="chip bg-white/60 text-xs">{ep}</span>
                      ))}
                    </div>
                    <span className="text-stone-400">{isOpen ? "▲" : "▼"}</span>
                  </div>

                  {isOpen && (
                    <div className="fade-up space-y-3 p-4">
                      <div>
                        <div className="label">말투</div>
                        <p className="text-sm leading-relaxed text-stone-700">{persona.speechStyle}</p>
                      </div>
                      <div>
                        <div className="label">성격</div>
                        <div className="flex flex-wrap gap-1">
                          {persona.personality.map((p) => (
                            <span key={p} className="chip bg-paper-100 text-stone-600 text-xs">{p}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="label">목표</div>
                        <ul className="space-y-1">
                          {persona.goals.map((g) => (
                            <li key={g} className="flex items-start gap-2 text-sm text-stone-700">
                              <span className="mt-0.5 shrink-0 text-amber-500">→</span>{g}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="label">핵심 기억 (Knowledge Graph)</div>
                        <ul className="space-y-1">
                          {persona.coreMemories.map((m, i) => (
                            <li key={i} className="flex items-start gap-2 rounded-lg bg-paper-100 px-3 py-2 text-sm text-stone-700">
                              <span className="chip bg-white text-xs text-stone-500 shrink-0">{m.episode}</span>
                              {m.content}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="label">금지 행동</div>
                        <ul className="space-y-1">
                          {persona.forbiddenActions.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm text-red-700">
                              <span className="shrink-0">✕</span>{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 탭 2: 캐릭터 회의 ── */}
      {tab === "meeting" && (
        <div className="fade-up space-y-4">
        {/* 픽셀아트 회의실 씬 */}
        <MeetingRoomPixel
          phase={phase}
          activeTurn={
            phase === "done" && revealedTurns > 0 && !meetingComplete
              ? currentTurns[revealedTurns - 1]
              : null
          }
        />
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          {/* 설정 패널 */}
          <section className="card h-fit space-y-4 p-5">
            <div>
              <label className="label">상황 입력</label>
              <textarea
                className="input min-h-[90px] resize-none"
                placeholder="예: 흥부가 박을 지금 타야 할지, 가을까지 기다려야 할지 결정해야 한다."
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                disabled={phase !== "idle"}
              />
            </div>
            {situationHint && (
              <div className="fade-up rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm leading-relaxed text-amber-800">
                💡 지금은 편의상 보여 드리는 체험 화면이라, 직접 입력한 상황으로는 회의를 진행할 수 없어요.
                아래 <b>‘빠른 상황 선택’</b>에서 예시 상황을 눌러 주세요. 👇
              </div>
            )}
            <div>
              <label className="label">빠른 상황 선택 (예시)</label>
              <div className="space-y-1.5">
                {MEETING_SITUATIONS.map((s) => (
                  <button
                    key={s}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                      situation === s
                        ? "border-amber-400 bg-amber-50 text-amber-900"
                        : situationHint
                          ? "border-amber-300 bg-white text-stone-700 hover:bg-amber-50"
                          : "border-paper-300 bg-white text-stone-600 hover:bg-paper-100"
                    }`}
                    onClick={() => {
                      setSituation(s);
                      setSituationHint(false);
                    }}
                    disabled={phase !== "idle"}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">참여 캐릭터</label>
              <div className="flex flex-wrap gap-1.5">
                {characters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleChar(c.id)}
                    disabled={phase !== "idle"}
                    className={`chip cursor-pointer transition ${
                      selectedChars.includes(c.id)
                        ? "bg-amber-600 text-white"
                        : "border border-paper-300 bg-white text-stone-500 hover:bg-paper-100"
                    }`}
                  >
                    {CHAR_AVATAR[c.id]} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="btn-primary w-full py-3"
              onClick={startMeeting}
              disabled={phase !== "idle" || !situation.trim() || selectedChars.length === 0}
            >
              {phase === "idle" ? "🗣️ 회의 시작" : phase === "loading" ? "분석 중…" : "✓ 회의 완료"}
            </button>
            {phase !== "idle" && (
              <button
                className="btn-ghost w-full"
                onClick={() => {
                  setPhase("idle");
                  setSituation("");
                  setRevealedTurns(0);
                  setCurrentTurns([]);
                }}
              >
                초기화
              </button>
            )}
          </section>

          {/* 회의 결과 */}
          <section className="space-y-3">
            {phase === "idle" && (
              <div className="card flex min-h-72 flex-col items-center justify-center p-8 text-center">
                <span className="mb-3 text-5xl">🗣️</span>
                <p className="max-w-md text-base leading-relaxed text-stone-500">
                  상황을 입력하고 참여할 캐릭터를 선택하면, 각자의 기억·목표·관계를 바탕으로 반응합니다. 완성 문장이 아닌, 작가를 위한 창작 참고 자료입니다.
                </p>
              </div>
            )}

            {phase === "loading" && (
              <div className="card space-y-4 p-6">
                <div className="flex items-center gap-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="pulse-dot h-2.5 w-2.5 rounded-full bg-amber-500"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                  <span className="text-base font-semibold text-amber-800">분석 중</span>
                </div>
                <div className="space-y-2">
                  {LOADING_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-sm transition-opacity ${
                        i <= loadingStep ? "opacity-100" : "opacity-20"
                      }`}
                    >
                      <span className={`h-4 w-4 shrink-0 rounded-full text-xs flex items-center justify-center ${
                        i < loadingStep ? "bg-emerald-500 text-white" : i === loadingStep ? "bg-amber-500 text-white" : "bg-paper-300 text-stone-400"
                      }`}>
                        {i < loadingStep ? "✓" : i + 1}
                      </span>
                      <span className={i <= loadingStep ? "text-stone-700" : "text-stone-400"}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {phase === "done" && (
              <div className="fade-up card p-5">
                <div className="mb-1 text-xs font-bold uppercase tracking-widest text-stone-400">회의 상황</div>
                <p className="mb-4 text-base font-semibold text-stone-800">"{situation}"</p>
                <div className="space-y-4">
                  {currentTurns.slice(0, revealedTurns).map((turn, i) => {
                    const colorClass = CHAR_COLOR[turn.characterId] ?? "bg-paper-100 text-stone-800 border-paper-300";
                    const isThoughtOpen = expandedThought === `${i}`;
                    return (
                      <div key={i} className={`fade-up rounded-2xl border p-4 ${colorClass.split(" ")[2]} ${colorClass.split(" ").slice(0, 2).join(" ")}`}>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-xl">{CHAR_AVATAR[turn.characterId]}</span>
                          <span className="font-extrabold text-base">{turn.characterName}</span>
                          <span className="chip bg-white/70 text-xs">{turn.emotion}</span>
                          {turn.ragEpisodes.map((ep) => (
                            <span key={ep} className="chip bg-white/50 text-xs font-mono">📚 {ep}</span>
                          ))}
                        </div>
                        <p className={`text-base leading-relaxed ${turn.isAction ? "italic text-stone-600" : "text-stone-800"}`}>
                          {turn.isAction ? `[${turn.statement}]` : `"${turn.statement}"`}
                        </p>
                        {turn.internalThought && (
                          <div className="mt-2">
                            <button
                              className="text-xs text-stone-400 underline hover:text-stone-600"
                              onClick={() => setExpandedThought(isThoughtOpen ? null : `${i}`)}
                            >
                              {isThoughtOpen ? "▲ 속마음 닫기" : "▼ 속마음 보기"}
                            </button>
                            {isThoughtOpen && (
                              <div className="fade-up mt-1.5 rounded-xl border border-white/80 bg-white/60 px-3 py-2 text-sm italic text-stone-600">
                                (속으로) {turn.internalThought}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {revealedTurns < currentTurns.length && (
                    <div className="flex items-center gap-2 pl-2">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="pulse-dot h-2 w-2 rounded-full bg-amber-400"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                      <span className="text-sm text-stone-400">다음 발언 준비 중…</span>
                    </div>
                  )}

                  {meetingComplete && keywordSummary && (
                    <div className="fade-up rounded-2xl border border-violet-200 bg-violet-50 p-4">
                      <div className="mb-1 text-sm font-bold text-violet-700">
                        회의 요약 — 키워드
                      </div>
                      <p className="mb-2 text-xs text-violet-700/80">
                        {new Set(currentTurns.map((t) => t.characterId)).size}명의 캐릭터가{" "}
                        {currentTurns.length}번 반응한 결과에서 뽑은 방향 키워드입니다.
                      </p>
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {keywordSummary.keywords.map((k) => (
                          <span
                            key={k}
                            className="chip bg-white text-violet-800 border border-violet-200 text-sm font-semibold"
                          >
                            #{k}
                          </span>
                        ))}
                      </div>
                      <div className="mb-1 text-sm font-bold text-violet-700">관계별 관찰</div>
                      <ul className="space-y-1.5">
                        {keywordSummary.relationInsights.map((r, i) => (
                          <li
                            key={i}
                            className="rounded-xl border border-violet-100 bg-white/70 px-3 py-2 text-sm text-stone-700"
                          >
                            <span className="font-bold text-violet-700">{r.relation}</span>
                            <span className="text-stone-400"> — </span>
                            {r.note}
                          </li>
                        ))}
                      </ul>
                      <button
                        className="btn mt-3 bg-violet-600 text-white hover:bg-violet-700 text-sm"
                        onClick={() => setTab("recommend")}
                      >
                        💡 관계별 시나리오 추천 보기
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </section>
        </div>
        </div>
      )}

      {/* ── 탭 3: 작가 가드레일 ── */}
      {tab === "guardrail" && (
        <div className="fade-up grid gap-4 lg:grid-cols-2">
          {/* 기존 프로젝트 설정에서 불러온 가드레일 */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-700">Story Bible에서 불러온 가드레일</h3>
            <div className="card p-5 space-y-4">
              <div>
                <div className="label text-emerald-700">세계관 규칙 (캐논)</div>
                <ul className="space-y-2">
                  {state.project.canonRules.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-900">
                      <span className="shrink-0 text-emerald-500 font-bold">✓</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="label text-blue-700">메인 플롯 방향 (생성 제약)</div>
                <ul className="space-y-2">
                  {state.project.generationConstraints.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-900">
                      <span className="shrink-0 text-blue-500 font-bold">→</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="label text-red-700">금지 전개</div>
                <ul className="space-y-2">
                  {state.project.forbiddenSettings.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-900">
                      <span className="shrink-0 text-red-500 font-bold">✕</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-xs text-stone-400">작품 설정 페이지에서 수정할 수 있습니다.</p>
          </div>

          {/* 회의용 추가 가드레일 */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-stone-700">이번 회의 전용 가드레일</h3>
            <div className="card p-5 space-y-4">
              <p className="text-sm text-stone-500">
                이번 회의에서만 적용할 추가 제약을 입력하세요. 에이전트가 발언 생성 시 이를 참조합니다.
              </p>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="예: 놀부의 반성 장면은 이번 회의에 넣지 않는다"
                  value={guardrailInput}
                  onChange={(e) => setGuardrailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addGuardrail()}
                />
                <button className="btn-primary px-4" onClick={addGuardrail} disabled={!guardrailInput.trim()}>
                  추가
                </button>
              </div>
              {customGuardrails.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-paper-300 p-6 text-center text-sm text-stone-400">
                  추가된 가드레일이 없습니다
                </div>
              ) : (
                <ul className="space-y-2">
                  {customGuardrails.map((g, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      <span className="flex-1">⚑ {g}</span>
                      <button
                        className="text-xs text-stone-400 hover:text-red-500"
                        onClick={() => setCustomGuardrails((prev) => prev.filter((_, j) => j !== i))}
                      >
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="rounded-xl bg-paper-100 p-4 text-sm text-stone-500 leading-relaxed">
                <strong className="text-stone-700">유지해야 하는 관계 (기본값)</strong>
                <ul className="mt-2 space-y-1">
                  <li>· 흥부–놀부: 결말 전까지 화해하지 않음</li>
                  <li>· 제비–흥부: 은인 관계 유지 (역할 전환 금지)</li>
                  <li>· 흥부아내–흥부: 신뢰 관계 유지</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 탭 4: 관계별 시나리오 추천 ── */}
      {tab === "recommend" && (
        <div className="fade-up space-y-4">
          {!meetingComplete && phase !== "done" && (
            <div className="card flex flex-col items-center gap-3 p-10 text-center">
              <span className="text-5xl">💡</span>
              <p className="text-base text-stone-500">
                먼저 캐릭터 회의를 완료하면 관계별 시나리오 추천이 나옵니다.
              </p>
              <button className="btn-primary" onClick={() => setTab("meeting")}>
                🗣️ 캐릭터 회의 시작하기
              </button>
            </div>
          )}

          {(meetingComplete || phase === "done") && (
            <>
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm leading-relaxed text-violet-900">
                회의 키워드를 바탕으로 <b>인물 관계별</b> 시나리오 방향을 추천합니다. 키워드·방향·원작
                훼손 위험도까지만 제시하며, <b>완성된 글은 작가가 직접 씁니다.</b> 마음에 드는 방향은
                메모로 저장해 두세요.
              </div>
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {(mockSubstoryCandidates as SubstoryCandidate[]).map((c) => {
                  const isOpen = expandedCandidate === c.id;
                  const saved = savedRecs.includes(c.id);
                  return (
                    <div key={c.id} className="card overflow-hidden">
                      <div className="p-5">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <span className="chip bg-violet-100 text-violet-800 text-xs font-bold">
                            🔗 {c.relationLabel}
                          </span>
                          <span className={`chip border text-xs font-bold ${RISK_COLOR[c.riskLevel]}`}>
                            {RISK_ICON[c.riskLevel]} 원작 훼손 {c.riskLevel}
                          </span>
                        </div>
                        <div className="mb-2">
                          <span className={`chip ${SUBSTORY_TYPE_COLOR[c.type]} text-xs`}>{c.type}</span>
                        </div>
                        <h4 className="text-lg font-extrabold text-stone-800">{c.title}</h4>

                        {/* 키워드 위주 */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {c.keywords.map((k) => (
                            <span
                              key={k}
                              className="chip border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold"
                            >
                              #{k}
                            </span>
                          ))}
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-stone-600">{c.summary}</p>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {c.relatedCharacterIds.map((id) => {
                            const b = state.blocks.find((x) => x.id === id);
                            return b ? (
                              <span key={id} className="chip bg-paper-100 text-stone-500 text-xs">
                                {CHAR_AVATAR[id]} {b.name}
                              </span>
                            ) : null;
                          })}
                          {c.relatedEpisodes.map((ep) => (
                            <span key={ep} className="chip bg-paper-100 text-stone-500 text-xs font-mono">{ep}</span>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <button
                            className="text-xs text-stone-400 underline hover:text-stone-600"
                            onClick={() => setExpandedCandidate(isOpen ? null : c.id)}
                          >
                            {isOpen ? "▲ 닫기" : "▼ 참고 장면 · 위험 근거 보기"}
                          </button>
                          <button
                            className={`btn px-3 py-1.5 text-xs ${
                              saved
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-600 text-white hover:bg-amber-700"
                            }`}
                            onClick={() => saveRecAsNote(c)}
                            disabled={saved}
                          >
                            {saved ? "✓ 메모로 저장됨" : "📝 메모로 저장"}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="fade-up border-t border-paper-300 space-y-3 p-5">
                          <div>
                            <div className="label">참고 장면 방향</div>
                            <p className="text-sm leading-relaxed text-stone-700 rounded-xl bg-paper-100 px-3 py-2.5">
                              {c.keyMoment}
                            </p>
                          </div>
                          <div className={`rounded-xl border p-3 ${RISK_COLOR[c.riskLevel]}`}>
                            <div className="mb-1 text-xs font-bold">
                              {RISK_ICON[c.riskLevel]} 원작 훼손 위험도 {c.riskLevel} — 근거
                            </div>
                            <p className="text-xs leading-relaxed">{c.riskReason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
