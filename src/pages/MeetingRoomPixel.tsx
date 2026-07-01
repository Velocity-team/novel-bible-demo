import type { MeetingTurn } from "../types";

/**
 * 캐릭터 캐스트 — 편집자형 평면 라인업.
 *
 * (이전: 픽셀아트 회의실 — 방 배경·창문·책장·족자·바닥 타일·8비트 스프라이트.
 *  픽셀/그라디언트/그림자/말풍선 광택을 전부 제거하고, 인물을 무채 모노그램 캐스트 행으로 렌더한다.)
 *
 * 기능·로직은 그대로다. PlotRoom이 넘기는 phase·activeTurn을 동일하게 소비한다:
 *   - isActive  = activeTurn?.characterId === id      → 지금 발언 중인 인물(강조 + 명조 반응 대사)
 *   - isDimmed  = phase === "done" && activeTurn && !isActive  → 흐림
 * CHARS의 id는 activeTurn.characterId와 짝지어 회의 상태를 구동하므로 유지한다.
 * 정체성은 색이 아니라 형태로: 의식 = 채운 원 ● / 몸·일반 = 윤곽 링 ○.
 */
const CHARS = [
  { id: "c1", initial: "도", name: "이서준〈강도현〉", role: "주인공 · 의식=강도현", mind: true },
  { id: "c3", initial: "서", name: "서문기", role: "백호 길드 노장", mind: false },
  { id: "c5", initial: "에", name: "관리자 '에르그'", role: "게이트 시스템 정령", mind: false },
  { id: "c4", initial: "채", name: "채린", role: "힐러 · 소꿉친구", mind: false },
  { id: "c2", initial: "윤", name: "윤가람", role: "청랑 길드 마스터", mind: false },
];

interface Props {
  phase: "idle" | "loading" | "done";
  activeTurn: MeetingTurn | null;
}

export default function MeetingRoomPixel({ phase, activeTurn }: Props) {
  // 상단 상태 라인(이전 바닥 배너 오버레이 대체) — 회의 시작 전에는 대사를 지어내지 않는다.
  const status =
    phase === "loading"
      ? "회의 준비 중"
      : phase === "done"
        ? "회의 중"
        : "상황을 입력하고 회의를 시작하세요";

  return (
    <div className="rounded-sm border border-line bg-paper p-5">
      {/* 상태 바 */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        {phase === "loading" ? (
          <span className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="pulse-dot h-1.5 w-1.5 rounded-full bg-ink-soft"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </span>
        ) : (
          <span
            className={`h-1.5 w-1.5 flex-none rounded-full ${
              phase === "done" && activeTurn ? "bg-ink" : "bg-ink-faint"
            }`}
          />
        )}
        <span className="text-ink-soft">{status}</span>
        {phase === "idle" && (
          <span className="text-ink-faint">· 각자의 기억으로 반응합니다</span>
        )}
      </div>

      {/* 캐스트 스트립 — 평면 모노그램 행 */}
      <div className="flex flex-wrap items-start gap-3">
        {CHARS.map((c) => {
          const isActive = activeTurn?.characterId === c.id;
          const isDimmed = phase === "done" && !!activeTurn && !isActive;
          return (
            <div
              key={c.id}
              className={`w-[200px] rounded-sm border p-4 transition duration-300 ${
                isActive ? "border-ink" : "border-line"
              } ${isDimmed ? "opacity-40" : "opacity-100"}`}
            >
              {/* 상단: 모노그램(●의식 / ○몸) + 이름 + 역할 */}
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-9 w-9 flex-none items-center justify-center rounded-full text-sm font-bold ${
                    c.mind
                      ? "bg-ink text-paper"
                      : "border-[1.5px] border-ink-mid bg-transparent text-ink-mid"
                  }`}
                >
                  {c.initial}
                </span>
                <div className="min-w-0">
                  <div className="text-[0.95rem] font-bold leading-tight text-ink">
                    {c.name}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-soft">{c.role}</div>
                </div>
              </div>

              {/* '회의 중' 얇은 잉크 밑줄 (활성일 때만 채워짐) */}
              <div
                className="mt-3 h-0.5 bg-ink transition-all duration-300"
                style={{ width: isActive ? "100%" : "0%" }}
              />

              {/* 반응 대사 — 작가의 목소리(명조). 활성 인물에게만. */}
              {isActive && activeTurn && (
                <div className="fade-up mt-3">
                  <p
                    className={`font-serif text-[0.9rem] leading-[1.85] ${
                      activeTurn.isAction ? "italic text-ink-mid" : "text-ink"
                    }`}
                  >
                    {activeTurn.isAction
                      ? `[${activeTurn.statement}]`
                      : `"${activeTurn.statement}"`}
                  </p>
                  <div className="mt-1.5 font-mono text-[0.68rem] text-ink-faint">
                    {[activeTurn.emotion, ...activeTurn.ragEpisodes].join(" · ")}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
