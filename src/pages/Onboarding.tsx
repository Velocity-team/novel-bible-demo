import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icon";
import { MANUSCRIPT_TOTAL, ONBOARDING_FILES, type OnboardingFile } from "../data/mockData";

/**
 * 처음 사용하는 작가를 위한 시작 화면.
 * ① 서비스 소개 → ② 작품 정보 입력 → ③ 원고·설정 파일 끌어다 놓기 → ④ AI 학습 → 대시보드
 */

const LEARN_STEPS = [
  { label: "원고를 읽고 있어요", icon: "book" },
  { label: "인물과 장소를 찾아내고 있어요", icon: "search" },
  { label: "관계와 규칙을 연결하고 있어요", icon: "relations" },
  { label: "설정끼리 어긋나는 곳을 검사하고 있어요", icon: "shield" },
];

export default function Onboarding({
  initialStep = 0,
  onComplete,
  onExit,
}: {
  /** 데모 진입 시 작품 등록(1)부터 시작하도록 */
  initialStep?: number;
  onComplete?: () => void;
  /** 로고를 누르면 랜딩으로 */
  onExit?: () => void;
} = {}) {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(initialStep); // 0 소개, 1 작품 정보, 2 파일, 3 학습
  const [form, setForm] = useState({
    title: "두 번째 각성",
    genre: "현대 판타지 / 회귀 · 빙의 / 헌터",
    logline:
      "종말급 게이트에서 죽은 S급 헌터의 의식이 10년 전 폐급 각성자의 몸에서 눈을 뜬다. 전생 지식으로 남의 몸·이름으로 다시 각성해 정해진 파멸을 뒤집으려는 회귀·빙의 헌터물.",
  });
  const [dropped, setDropped] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [learnStep, setLearnStep] = useState(0);
  const timers = useRef<number[]>([]);

  const droppedFiles = ONBOARDING_FILES.filter((f) => dropped.includes(f.id));

  // 원고 1~100편을 모두 보여 주고, '원고 전부 추가' 버튼으로 한 번에 올린다(드래그 없음).
  const manuscripts = ONBOARDING_FILES.filter((f) => f.kind === "원고");
  const allDropped = dropped.length >= ONBOARDING_FILES.length;
  const droppedManuCount = droppedFiles.filter((f) => f.kind === "원고").length;
  const droppedExtraCount = droppedFiles.filter((f) => f.kind !== "원고").length;
  const manuscriptsReady = droppedManuCount >= MANUSCRIPT_TOTAL;
  const addAllFiles = () => setDropped(ONBOARDING_FILES.map((f) => f.id));

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const addFile = (id: string) =>
    setDropped((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const startLearning = () => {
    setStep(3);
    setProgress(0);
    setLearnStep(0);
    const total = 4200;
    // 진행도 게이지
    const start = Date.now();
    const tick = window.setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - start) / total) * 100));
      setProgress(p);
      if (p >= 100) clearInterval(tick);
    }, 80);
    timers.current.push(tick as unknown as number);
    // 단계 문구
    LEARN_STEPS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setLearnStep(i), (total / 4) * i));
    });
    timers.current.push(
      window.setTimeout(() => {
        completeOnboarding(form);
        onComplete?.();
      }, total + 400)
    );
  };

  const FileBox = ({ f }: { f: OnboardingFile }) => {
    const added = dropped.includes(f.id);
    return (
      <button
        type="button"
        onClick={() => addFile(f.id)}
        className={`flex items-center gap-2.5 rounded-sm border px-3 py-2.5 text-left transition ${
          added ? "border-ink bg-paper-2" : "border-line bg-paper hover:border-ink-mid"
        }`}
      >
        <Icon name="doc" size={18} className="shrink-0 text-ink-soft" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-ink">{f.name}</div>
          <div className="text-xs text-ink-soft">
            {f.kind} · {f.detail}
          </div>
        </div>
        {added && <span className="shrink-0 font-bold text-ink-mid">✓</span>}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-paper px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        {/* 로고 (누르면 랜딩으로) */}
        <button
          type="button"
          onClick={onExit}
          className="mx-auto mb-8 flex flex-col items-center justify-center text-center"
          title="노벨 바이블 첫 화면으로"
        >
          <div className="text-2xl font-extrabold tracking-tight text-ink">노벨 바이블</div>
          <div className="text-sm text-ink-soft">작가를 위한 세계관 기록 도우미</div>
        </button>

        {/* 진행 단계 표시 */}
        {step < 3 && (
          <div className="mb-6 flex items-center justify-center gap-2">
            {["소개", "작품 정보", "원고 올리기"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-bold ${
                    i <= step ? "bg-ink text-paper" : "bg-paper-2 text-ink-soft"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-base ${
                    i === step ? "font-bold text-ink" : "text-ink-soft"
                  }`}
                >
                  {label}
                </span>
                {i < 2 && <span className="mx-1 text-ink-faint">—</span>}
              </div>
            ))}
          </div>
        )}

        {/* ① 소개 */}
        {step === 0 && (
          <div className="fade-up card p-8 text-center">
            <h1 className="text-3xl font-extrabold leading-snug text-ink">
              원고를 차곡차곡 저장하면,
              <br />
              AI가 작품의 설정을 대신 기억해 드려요
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-mid">
              소설을 쓰다 보면 인물 나이, 사건 순서, 세계관 규칙이 헷갈리기 쉽습니다.
              노벨 바이블에 원고와 설정을 넣어 두면, 글을 쓸 때 꺼내 보고, 새 에피소드를
              만들 때 도움을 받고, 놓친 부분이 없는지 검사할 수 있어요.
            </p>
            <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
              {[
                { icon: "blocks", title: "1. 저장하고 정리하기", desc: "원고를 올리면 인물·장소·사건·규칙이 설정 카드로 정리됩니다." },
                { icon: "idea", title: "2. 관계별 시나리오 추천", desc: "저장된 설정을 지키며 다음 이야기의 방향과 키워드를 추천받습니다. 글은 작가가 씁니다." },
                { icon: "conflicts", title: "3. 놓친 부분 검사하기", desc: "설정끼리 어긋나는 부분을 AI가 찾아내고 고치는 방법을 알려 줍니다." },
              ].map((c) => (
                <div key={c.title} className="rounded-sm bg-paper-2 p-5">
                  <Icon name={c.icon} size={24} className="text-ink-soft" />
                  <div className="mt-2 text-lg font-bold text-ink">{c.title}</div>
                  <p className="mt-1 text-base leading-relaxed text-ink-mid">{c.desc}</p>
                </div>
              ))}
            </div>
            <button className="btn-primary mt-8 px-8 py-3 text-lg" onClick={() => setStep(1)}>
              시작하기 →
            </button>
          </div>
        )}

        {/* ② 작품 정보 */}
        {step === 1 && (
          <div className="fade-up card space-y-5 p-8">
            <div>
              <h2 className="text-2xl font-extrabold text-ink">어떤 작품인가요?</h2>
              <p className="mt-1 text-base text-ink-soft">
                작품 정보를 적어 두면, AI가 그 작품을 기억할 준비를 합니다.
              </p>
            </div>
            <div className="rounded-sm border border-line bg-paper-2 p-4 text-base leading-relaxed text-ink-mid">
              <b>지금은 미리 둘러보는 체험 화면이에요.</b> 이해를 돕기 위해 회귀·빙의 헌터 소설
              「두 번째 각성」을 <b>예시로 미리 채워 두었습니다.</b> 직접 입력하실 필요 없이,
              아래 <b>‘다음 →’</b> 버튼만 누르면 체험이 이어집니다. (원하시면 내 작품 정보로 바꿔 적어도 됩니다.)
            </div>
            <div>
              <label className="label">작품 제목</label>
              <input
                className="input text-lg"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="label">장르</label>
              <input
                className="input"
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
              />
            </div>
            <div>
              <label className="label">
                한 줄 소개 <span className="font-normal text-ink-faint">(선택)</span>
              </label>
              <textarea
                className="input min-h-24"
                placeholder="작품을 한 줄로 요약하기 어렵다면 비워 두세요. 나중에 언제든 채울 수 있어요."
                value={form.logline}
                onChange={(e) => setForm({ ...form, logline: e.target.value })}
              />
              <p className="mt-1 text-sm text-ink-faint">
                한 줄 소개나 줄거리처럼 요약이 필요한 항목은 건너뛰어도 됩니다. 원고를
                올리면 AI가 정리를 도와드려요.
              </p>
            </div>
            <div className="flex justify-between">
              <button className="btn-ghost" onClick={() => setStep(0)}>
                ← 이전
              </button>
              <button
                className="btn-primary px-8"
                onClick={() => setStep(2)}
                disabled={!form.title.trim()}
              >
                다음 →
              </button>
            </div>
          </div>
        )}

        {/* ③ 파일 끌어다 놓기 */}
        {step === 2 && (
          <div className="fade-up space-y-5">
            <div className="card p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-ink">
                    원고를 올려 주세요
                  </h2>
                  <p className="mt-1 text-base text-ink-soft">
                    지금까지 쓴 원고 {MANUSCRIPT_TOTAL}편을 한 번에 올려 AI에게 학습시킵니다. (체험용
                    예시 파일이에요 — 아래 <b>‘원고 전부 추가’</b> 버튼만 누르면 됩니다)
                  </p>
                </div>
                <button
                  className="btn-primary whitespace-nowrap px-7 py-3 text-lg"
                  onClick={startLearning}
                  disabled={droppedFiles.length === 0}
                >
                  AI 학습 시작
                </button>
              </div>

              {/* 큰 '원고 전부 추가' 버튼 */}
              <button
                type="button"
                onClick={addAllFiles}
                disabled={allDropped}
                className={`mt-5 w-full rounded-sm py-5 text-xl font-extrabold transition ${
                  allDropped
                    ? "cursor-default border border-line bg-paper-2 text-ink-mid"
                    : "border border-ink bg-ink text-paper hover:bg-black"
                }`}
              >
                {allDropped
                  ? `✓ 원고 ${MANUSCRIPT_TOTAL}편 모두 추가됨`
                  : "원고 전부 추가하기"}
              </button>
              <p className="mt-2 text-center text-sm text-ink-soft">
                {droppedFiles.length === 0
                  ? `버튼을 누르면 1~${MANUSCRIPT_TOTAL}화 원고가 한 번에 올라갑니다`
                  : `원고 ${droppedManuCount}편 · 그 외 자료 ${droppedExtraCount}건 추가됨`}
              </p>

              {/* 내 컴퓨터의 원고 (1~100편 전부) */}
              <div className="mt-5">
                <div className="label">내 컴퓨터의 원고 (총 {MANUSCRIPT_TOTAL}편)</div>
                <div className="grid max-h-[420px] gap-2 overflow-y-auto rounded-sm border border-line bg-paper-2 p-3 sm:grid-cols-2">
                  {manuscripts.map((f) => (
                    <FileBox key={f.id} f={f} />
                  ))}
                </div>
                <p className="mt-2 text-xs text-ink-faint">
                  설정 정리표·인물 메모도 ‘원고 전부 추가’에 함께 포함됩니다. (목록을 눌러 하나씩
                  추가할 수도 있어요)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button className="btn-ghost" onClick={() => setStep(1)}>
                ← 이전
              </button>
            </div>
          </div>
        )}

        {/* ④ 학습 진행 */}
        {step === 2 && manuscriptsReady && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-bold text-ink-mid">원고 {MANUSCRIPT_TOTAL}편 추가 완료</div>
                <div className="text-base font-extrabold text-ink">이제 AI가 작품을 학습할 준비가 끝났어요.</div>
              </div>
              <button
                type="button"
                className="btn-primary min-h-14 shrink-0 px-8 text-lg"
                onClick={startLearning}
              >
                AI 학습 시작
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-up card p-10 text-center">
            <h2 className="text-2xl font-extrabold text-ink">
              「{form.title}」을(를) 학습하고 있어요
            </h2>
            <p className="mt-2 text-base text-ink-soft">
              넣어 주신 원고 {droppedManuCount}편에서 설정을 뽑아내는 중입니다.
            </p>

            <div className="mx-auto mt-8 max-w-md">
              <div className="h-4 overflow-hidden rounded-full bg-paper-2">
                <div
                  className="h-full rounded-full bg-ink transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 font-mono text-lg font-bold tabular-nums text-ink">{progress}%</div>
            </div>

            <ul className="mx-auto mt-6 max-w-md space-y-2 text-left">
              {LEARN_STEPS.map((s, i) => (
                <li
                  key={s.label}
                  className={`flex items-center gap-3 rounded-sm px-4 py-2.5 text-base ${
                    i < learnStep
                      ? "bg-paper-2 text-ink-mid"
                      : i === learnStep
                        ? "bg-paper-2 font-bold text-ink"
                        : "text-ink-faint"
                  }`}
                >
                  <span className="flex-none text-ink-soft">
                    <Icon name={i < learnStep ? "check" : s.icon} size={16} />
                  </span>
                  {s.label}
                  {i === learnStep && (
                    <span className="ml-auto flex gap-1">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="pulse-dot h-1.5 w-1.5 rounded-full bg-ink-soft"
                          style={{ animationDelay: `${d * 0.2}s` }}
                        />
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
