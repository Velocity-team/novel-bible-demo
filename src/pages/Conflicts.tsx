import { useState } from "react";
import { SeverityBadge } from "../components/Badge";
import { useApp } from "../context/AppContext";
import type { Conflict, ConflictType } from "../types";
import { blockName } from "../utils/search";

const SEVERITIES = [
  { key: "all", label: "전체" },
  { key: "high", label: "심각" },
  { key: "medium", label: "보통" },
  { key: "low", label: "가벼움" },
] as const;

const CONFLICT_TYPES: (ConflictType | "all")[] = [
  "all",
  "인물 상태 오류",
  "숫자/시간 오류",
  "가족 관계 오류",
  "세계관 규칙 위반",
  "사건 순서 오류",
  "관계 충돌",
];

function ConflictCard({ conflict }: { conflict: Conflict }) {
  const { state, setConflictStatus, openBlockDetail } = useApp();
  const [showGuide, setShowGuide] = useState(false);
  const resolvedStyle = conflict.status !== "open" ? "opacity-60" : "";
  const isReal = conflict.severity === "high";

  return (
    <article className={`border-b border-line py-6 ${resolvedStyle}`}>
      <div className="flex gap-3">
        {/* 앞 점: 진짜 충돌(심각)=신호 채움 / 그 외=옅은 잉크 — 색 아닌 채움으로 이중부호화 */}
        <span
          className={`mt-2 h-2 w-2 shrink-0 rounded-full ${isReal ? "bg-signal" : "bg-ink-faint"}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <SeverityBadge severity={conflict.severity} />
            <span className="chip text-ink-mid">{conflict.type}</span>
            <span className="chip font-mono text-ink-soft">{conflict.location.episode}</span>
            {conflict.status === "resolved" && (
              <span className="chip text-ink-mid">해결했어요</span>
            )}
            {conflict.status === "ignored" && (
              <span className="chip text-ink-soft">넘어가기로 함</span>
            )}
          </div>

          <h3 className="text-lg font-bold text-ink">{conflict.title}</h3>
          <p className="mt-1 text-base leading-relaxed text-ink-soft">{conflict.description}</p>

          {/* 근거 — 원고 속 두 문장(작가의 글이므로 명조). 어긋난 쪽 B만 신호. */}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="border-l border-line pl-3">
              <div className="mb-1 text-sm font-bold text-ink-mid">원고 속 문장 A</div>
              <p className="font-serif text-base italic leading-relaxed text-ink-mid">{conflict.evidenceA}</p>
            </div>
            <div className="border-l border-signal pl-3">
              <div className="mb-1 text-sm font-bold text-signal">원고 속 문장 B</div>
              <p className="font-serif text-base italic leading-relaxed text-ink-mid">{conflict.evidenceB}</p>
            </div>
          </div>

          {/* 제안 — AI 추천(박스 없이 라인으로) */}
          <div className="mt-3">
            <span className="text-sm font-bold text-ink">AI가 추천하는 고치는 방법 — </span>
            <span className="text-base leading-relaxed text-ink-mid">{conflict.recommendation}</span>
          </div>

          {conflict.relatedBlockIds.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-bold text-ink-soft">관련 설정 카드</span>
              {conflict.relatedBlockIds.map((id) => (
                <button
                  key={id}
                  className="chip cursor-pointer text-ink-mid hover:bg-paper-2"
                  onClick={() => openBlockDetail(id)}
                >
                  {blockName(state, id)}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {conflict.status === "open" ? (
              <>
                <button className="btn-primary" onClick={() => setConflictStatus(conflict.id, "resolved")}>
                  해결했어요
                </button>
                <button className="btn-ghost" onClick={() => setConflictStatus(conflict.id, "ignored")}>
                  이건 넘어가기
                </button>
              </>
            ) : (
              <button className="btn-ghost" onClick={() => setConflictStatus(conflict.id, "open")}>
                다시 확인하기
              </button>
            )}
            <button className="btn-ghost" onClick={() => setShowGuide((s) => !s)}>
              자세한 수정 방법
            </button>
          </div>

          {showGuide && (
            <div className="fade-up mt-3 rounded-sm border border-line bg-paper-2 p-3">
              <div className="mb-1.5 text-sm font-bold text-ink-mid">이렇게 고칠 수 있어요</div>
              <ol className="list-inside list-decimal space-y-1 text-base leading-relaxed text-ink-mid">
                {conflict.fixGuide.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Conflicts() {
  const { state } = useApp();
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]["key"]>("all");
  const [ctype, setCtype] = useState<ConflictType | "all">("all");

  const filtered = state.conflicts.filter(
    (c) =>
      (severity === "all" || c.severity === severity) &&
      (ctype === "all" || c.type === ctype)
  );
  const open = filtered.filter((c) => c.status === "open");
  const closed = filtered.filter((c) => c.status !== "open");
  const all = state.conflicts;

  return (
    <div className="fade-up space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink">설정 오류 검사</h2>
        <p className="text-base leading-relaxed text-ink-soft">
          AI가 원고를 비교해 서로 어긋나는 설정을 찾아냈어요. 하나씩 확인하고 해결해 보세요.
        </p>
      </div>

      {/* 요약 통계 — 박스 없는 헤어라인 스탯 행 (큰 숫자 + 작은 라벨) */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-4">
        <div className="flex flex-col gap-1 bg-paper px-4 py-5">
          <div className="text-3xl font-bold leading-none text-ink">{all.length}</div>
          <div className="text-sm text-ink-soft">찾아낸 오류 전체</div>
        </div>
        <div className="flex flex-col gap-1 bg-paper px-4 py-5">
          <div
            className={`text-3xl font-bold leading-none ${
              all.filter((c) => c.status === "open").length > 0 ? "text-signal" : "text-ink"
            }`}
          >
            {all.filter((c) => c.status === "open").length}
          </div>
          <div className="text-sm text-ink-soft">아직 해결 전</div>
        </div>
        <div className="flex flex-col gap-1 bg-paper px-4 py-5">
          <div className="text-3xl font-bold leading-none text-ink">
            {all.filter((c) => c.status === "resolved").length}
          </div>
          <div className="text-sm text-ink-soft">해결함</div>
        </div>
        <div className="flex flex-col gap-1 bg-paper px-4 py-5">
          <div className="text-3xl font-bold leading-none text-ink">
            {all.filter((c) => c.status === "ignored").length}
          </div>
          <div className="text-sm text-ink-soft">넘어가기로 함</div>
        </div>
      </div>

      {/* 필터 */}
      <div className="card space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-bold text-ink-soft">심각한 정도</span>
          {SEVERITIES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSeverity(s.key)}
              className={`chip cursor-pointer transition ${
                severity === s.key
                  ? "border-ink bg-ink text-paper"
                  : "text-ink-mid hover:bg-paper-2"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-bold text-ink-soft">오류 종류</span>
          {CONFLICT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setCtype(t)}
              className={`chip cursor-pointer transition ${
                ctype === t
                  ? "border-ink bg-ink text-paper"
                  : "text-ink-mid hover:bg-paper-2"
              }`}
            >
              {t === "all" ? "전체" : t}
            </button>
          ))}
        </div>
      </div>

      {/* 미해결 */}
      <section>
        <h3 className="mb-1 text-lg font-bold text-ink">아직 해결 전 ({open.length})</h3>
        {open.map((c) => (
          <ConflictCard key={c.id} conflict={c} />
        ))}
        {open.length === 0 && (
          <div className="border-t border-line py-6 text-base text-ink-soft">
            해결할 설정 오류가 없습니다. 설정이 잘 지켜지고 있어요.
          </div>
        )}
      </section>

      {/* 처리됨 */}
      {closed.length > 0 && (
        <section>
          <h3 className="mb-1 mt-2 text-lg font-bold text-ink-soft">처리한 오류 ({closed.length})</h3>
          {closed.map((c) => (
            <ConflictCard key={c.id} conflict={c} />
          ))}
        </section>
      )}
    </div>
  );
}
