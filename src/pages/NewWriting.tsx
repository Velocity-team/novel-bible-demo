import { useMemo, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icon";
import { simulateCanonGuard, simulateManuscriptAnalysis } from "../utils/aiSim";

export default function NewWriting() {
  const { state, saveDraft, deleteDraft } = useApp();
  const [draftId, setDraftId] = useState<string | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [sceneTitle, setSceneTitle] = useState("");
  const [content, setContent] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const timer = useRef<number | null>(null);

  const guard = useMemo(() => simulateCanonGuard(content, state), [content, state]);

  const loadDraft = (id: string) => {
    const d = state.drafts.find((x) => x.id === id);
    if (!d) return;
    setDraftId(d.id);
    setEpisodeTitle(d.episodeTitle);
    setSceneTitle(d.sceneTitle);
    setContent(d.content);
    setAnalysisDone(false);
  };

  const continueEpisode = (epId: string) => {
    const ep = state.project.episodes.find((e) => e.id === epId);
    if (!ep) return;
    setDraftId(null);
    setEpisodeTitle(ep.title);
    setSceneTitle("이어쓰기");
    setContent(`(${ep.title} 줄거리: ${ep.summary})\n\n`);
    setAnalysisDone(false);
  };

  const handleSave = () => {
    const d = saveDraft({
      id: draftId ?? undefined,
      episodeTitle: episodeTitle || "제목 없는 회차",
      sceneTitle: sceneTitle || "제목 없는 장면",
      content,
      detectedBlockIds: state.blocks
        .filter((b) => content.includes(b.name))
        .map((b) => b.id),
      warnings: guard.warnings.map((w) => w.title),
    });
    setDraftId(d.id);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setAnalysisDone(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setAnalyzing(false);
      setAnalysisDone(true);
    }, 1500);
  };

  const analysis = analysisDone ? simulateManuscriptAnalysis(content) : null;

  const detectSection = (title: string, icon: string, items: string[]) => (
    <div>
      <div className="label flex items-center gap-1.5">
        <Icon name={icon} size={14} className="shrink-0" /> {title}
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {items.map((n) => (
            <span key={n} className="chip bg-paper-2">
              {n}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-faint">아직 없음</p>
      )}
    </div>
  );

  return (
    <div className="fade-up space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">새 회차 쓰기</h2>
          <p className="text-base text-ink-soft">
            글을 쓰는 동안 ‘설정 지킴이’가 저장된 설정과 어긋나는 부분을 바로 알려 줍니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="input w-52 py-2 text-base"
            value=""
            onChange={(e) => e.target.value && continueEpisode(e.target.value)}
          >
            <option value="">이전 회차 이어쓰기…</option>
            {state.project.episodes.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.title}
              </option>
            ))}
          </select>
          <select
            className="input w-52 py-2 text-base"
            value={draftId ?? ""}
            onChange={(e) => e.target.value && loadDraft(e.target.value)}
          >
            <option value="">저장해 둔 글 불러오기…</option>
            {state.drafts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.episodeTitle} / {d.sceneTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        {/* 글쓰기 영역 */}
        <section className="card flex flex-col p-6">
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <div>
              <label className="label">회차 제목</label>
              <input
                className="input"
                placeholder="예: 89화 해운대"
                value={episodeTitle}
                onChange={(e) => setEpisodeTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="label">장면 제목</label>
              <input
                className="input"
                placeholder="예: 부산 해운대 게이트"
                value={sceneTitle}
                onChange={(e) => setSceneTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="relative flex-1">
            <textarea
              className="input min-h-[380px] w-full resize-none font-serif text-lg leading-8"
              placeholder={
                "여기에 새 장면을 써 보세요…\n\n이렇게 써 보면 경고를 볼 수 있어요:\n· “하은채가 부산에서 살아 돌아왔다” → 죽은 인물 재등장 경고\n· “이서준은 C급이 되었다” → 각성 등급 불변 경고\n· “누나 이수아” → 가족 관계 경고"
              }
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setAnalysisDone(false);
              }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button className="btn-primary" onClick={handleSave}>
              {savedFlash ? "✓ 저장됐어요!" : "글 저장"}
            </button>
            <button className="btn-primary" onClick={handleAnalyze} disabled={analyzing || !content.trim()}>
              {analyzing ? "검사하는 중…" : "설정 오류 검사"}
            </button>
            {draftId && (
              <button
                className="btn-danger"
                onClick={() => {
                  deleteDraft(draftId);
                  setDraftId(null);
                  setEpisodeTitle("");
                  setSceneTitle("");
                  setContent("");
                }}
              >
                이 글 삭제
              </button>
            )}
            <span className="ml-auto text-sm text-ink-soft">
              <span className="font-mono tabular-nums">{content.length.toLocaleString()}</span>자 · 실시간 검사 켜짐
            </span>
          </div>
        </section>

        {/* 설정 지킴이 패널 */}
        <aside className="card max-h-[680px] space-y-4 overflow-y-auto p-5">
          <div className="flex items-center gap-2">
            <Icon name="shield" size={22} className="shrink-0 text-ink-soft" />
            <div>
              <div className="text-lg font-bold text-ink">설정 지킴이</div>
              <div className="text-sm text-ink-soft">
                작가가 잊어버린 설정을 AI가 대신 기억해서 알려 줘요.
              </div>
            </div>
          </div>

          {guard.warnings.length > 0 && (
            <div className="space-y-2">
              {guard.warnings.map((w, i) => (
                <div
                  key={i}
                  className={`fade-up rounded-sm border p-3 ${
                    w.severity === "high"
                      ? "border-signal bg-signal-bg"
                      : "border-line bg-paper-2"
                  }`}
                >
                  <div
                    className={`mb-1 flex items-center gap-1.5 text-base font-bold ${
                      w.severity === "high" ? "text-signal" : "text-ink-mid"
                    }`}
                  >
                    <Icon name="warning" size={16} className="shrink-0" /> {w.title}
                  </div>
                  <p className="text-sm leading-relaxed text-ink-mid">{w.message}</p>
                </div>
              ))}
            </div>
          )}

          {detectSection("이 글에 나온 인물", "character", guard.characters)}
          {detectSection("이 글에 나온 장소", "location", guard.locations)}
          {detectSection("이어지는 사건", "event", guard.events)}
          {detectSection("관련된 규칙", "rule", guard.rules)}

          <div>
            <div className="label flex items-center gap-1.5">
              <Icon name="check" size={14} className="shrink-0" /> 확인해 두면 좋은 것
            </div>
            <ul className="space-y-1">
              {guard.checkpoints.map((c, i) => (
                <li key={i} className="rounded-sm bg-paper-2 px-3 py-2 text-sm text-ink-mid">
                  {c}
                </li>
              ))}
              {guard.checkpoints.length === 0 && (
                <li className="text-sm text-ink-faint">
                  글을 쓰기 시작하면 확인할 내용이 표시됩니다.
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>

      {/* 검사 결과 */}
      {analyzing && (
        <section className="card flex items-center gap-3 p-6">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="pulse-dot h-2.5 w-2.5 rounded-full bg-ink-soft"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <span className="text-lg text-ink-soft">쓴 글을 저장된 설정과 비교하는 중…</span>
        </section>
      )}

      {analysis && (
        <section className="fade-up grid gap-3 md:grid-cols-3">
          <div className="card p-5">
            <div className="label">나온 인물 / 장소</div>
            <div className="flex flex-wrap gap-1">
              {[...guard.characters, ...guard.locations].map((n) => (
                <span key={n} className="chip border border-line bg-paper-2 text-ink-mid">{n}</span>
              ))}
              {guard.characters.length + guard.locations.length === 0 && (
                <span className="text-sm text-ink-faint">없음</span>
              )}
            </div>
          </div>
          <div className="card p-5">
            <div className="label">나온 사건 / 규칙</div>
            <div className="flex flex-wrap gap-1">
              {[...guard.events, ...guard.rules].map((n) => (
                <span key={n} className="chip border border-line bg-paper-2 text-ink-mid">{n}</span>
              ))}
              {guard.events.length + guard.rules.length === 0 && (
                <span className="text-sm text-ink-faint">없음</span>
              )}
            </div>
          </div>
          <div className={`card p-5 ${guard.warnings.length ? "border-signal" : ""}`}>
            <div className="label">어긋날 수 있는 부분</div>
            {guard.warnings.length > 0 ? (
              <ul className="space-y-1 text-sm text-signal">
                {guard.warnings.map((w, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Icon name="warning" size={14} className="shrink-0" /> {w.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-ink-mid">어긋나는 부분이 없어요.</p>
            )}
          </div>
          <div className="card p-5 md:col-span-3">
            <div className="label flex items-center gap-1.5">
              <Icon name="idea" size={14} className="shrink-0" /> 이렇게 해 보세요
            </div>
            <ul className="list-inside list-disc space-y-1 text-base text-ink-mid">
              <li>장면 첫 문장에 계절과 장소를 적어 두면 규칙 검사가 쉬워집니다.</li>
              <li>새 인물이 나오면 설정 사전에 먼저 카드로 저장해 두세요.</li>
              {guard.warnings.length > 0 && (
                <li>위에서 찾은 {guard.warnings.length}건을 고친 뒤 회차를 마무리하는 것을 추천합니다.</li>
              )}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
