import { useEffect, useMemo, useRef, useState } from "react";
import { AppProvider } from "../context/AppContext";
import { buildInitialState } from "../data/mockData";
import { isAdminMode, submitLead, trackEvent } from "../utils/metrics";
import { Icon } from "../components/Icon";
import AskLoreAI from "./AskLoreAI";
import Conflicts from "./Conflicts";
import PlotRoom from "./PlotRoom";
import WorldAtlas from "./WorldAtlas";

const ROLE_KEY = "loreblock_role";

/** 첫 접속 시 묻는 사용자 역할 */
const ROLES: { key: string; icon: string; title: string; desc: string }[] = [
  { key: "작가", icon: "writing", title: "작가", desc: "지금 연재 중이거나 출간한 현직 작가" },
  { key: "지망생", icon: "sprout", title: "작가 지망생", desc: "작품을 준비 중인 예비 작가" },
  { key: "CP", icon: "building", title: "CP·에이전시", desc: "콘텐츠 제공사·매니지먼트·출판사" },
  { key: "그외", icon: "idea", title: "그 외", desc: "독자·업계 관계자 등" },
];

/** 사전 예약 시 선택하는 집필 장르 */
const GENRES = [
  "로맨스",
  "로맨스판타지",
  "판타지",
  "현대판타지",
  "무협",
  "미스터리·스릴러",
  "드라마·일반",
  "BL·GL",
  "기타",
];

/** 랜딩에서 바로 체험할 수 있는 기능들 (누르면 플로팅 데모) */
const FEATURES: {
  key: string;
  icon: string;
  title: string;
  desc: string;
  Comp: () => JSX.Element;
}[] = [
  { key: "atlas", icon: "atlas", title: "세계관 지도", desc: "회차별로 누가 어디 있는지 2D 지도로", Comp: WorldAtlas },
  { key: "conflicts", icon: "conflicts", title: "설정 오류 검수", desc: "어긋난 설정을 찾아 고치는 법까지", Comp: Conflicts },
  { key: "plotroom", icon: "plotroom", title: "캐릭터 회의실", desc: "관계별 시나리오 방향 추천", Comp: PlotRoom },
  { key: "ask", icon: "ask", title: "AI에게 물어보기", desc: "내 세계관에 대해 근거와 함께 답변", Comp: AskLoreAI },
];

const VALUE_PROPS = [
  {
    icon: "blocks",
    title: "세계관을 기억",
    desc: "원고와 설정을 올리면 인물·장소·사건·규칙을 설정 카드로 자동 정리합니다.",
  },
  {
    icon: "conflicts",
    title: "설정 오류 검수",
    desc: "회차가 쌓여도 어긋나는 설정을 찾아내 고치는 방법까지 알려 줍니다.",
  },
  {
    icon: "atlas",
    title: "회차별 세계관 지도",
    desc: "어느 회차에 누가 어디 있었는지 2D 지도로 한눈에 확인합니다.",
  },
];

export default function Landing({ onEnter }: { onEnter: () => void }) {
  const [email, setEmail] = useState("");
  const [genre, setGenre] = useState(""); // 선택한 장르 ("" = 미선택)
  const [genreOther, setGenreOther] = useState(""); // 기타 직접 입력
  const [interests, setInterests] = useState<string[]>([]); // 마음에 든 기능(복수)
  const [demoKey, setDemoKey] = useState<string | null>(null); // 열려 있는 플로팅 데모
  const [botField, setBotField] = useState(""); // 허니팟 (사람은 비워 둠)
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const adminMode = isAdminMode();

  // 첫 접속 역할 팝업 (작가/지망생/CP/그외)
  const [role, setRole] = useState<string>(() => localStorage.getItem(ROLE_KEY) || "");
  const [showRole, setShowRole] = useState(false);
  const roleInit = useRef(false);
  useEffect(() => {
    if (roleInit.current) return; // StrictMode 중복 방지
    roleInit.current = true;
    const stored = localStorage.getItem(ROLE_KEY);
    if (stored) trackEvent("role_select", stored); // 이번 방문 키에도 역할 기록
    else setShowRole(true); // 첫 접속 → 팝업
  }, []);

  const chooseRole = (r: string) => {
    setRole(r);
    localStorage.setItem(ROLE_KEY, r);
    trackEvent("role_select", r);
    setShowRole(false);
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  // 제출에 담을 장르: 기타면 직접 입력값(없으면 "기타")
  const resolvedGenre = genre === "기타" ? genreOther.trim() || "기타" : genre;
  const genreReady = genre !== "";
  const genreOtherReady = genre !== "기타" || genreOther.trim() !== "";
  const interestsReady = interests.length > 0;
  const canSubmit = emailValid && genreReady && genreOtherReady && interestsReady && status !== "loading";
  const showGenreError = submitAttempted && !genreReady;
  const showGenreOtherError = submitAttempted && !genreOtherReady;
  const showInterestsError = submitAttempted && !interestsReady;
  const showEmailError = submitAttempted && !emailValid;

  // 데모 모달이 열려 있는 동안에만 격리 상태를 만든다.
  const demoSeed = useMemo(() => (demoKey ? buildInitialState() : null), [demoKey]);
  const demoFeature = FEATURES.find((f) => f.key === demoKey) ?? null;

  // Esc로 데모 닫기
  useEffect(() => {
    if (!demoKey) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDemoKey(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [demoKey]);

  const toggleInterest = (title: string) => {
    const has = interests.includes(title);
    trackEvent(has ? "interest_remove" : "interest_add", title);
    setInterests((prev) =>
      prev.includes(title) ? prev.filter((x) => x !== title) : [...prev, title]
    );
  };

  const openDemo = (key: string, title: string) => {
    trackEvent("demo_open", title);
    setDemoKey(key);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!canSubmit) return;
    setStatus("loading");
    if (isAdminMode()) {
      setStatus("done");
      return;
    }
    if (botField.trim()) {
      setStatus("done");
      return;
    }
    try {
      await submitLead({
        email: email.trim(),
        role: role || localStorage.getItem(ROLE_KEY) || "",
        genre: resolvedGenre,
        genreOther: genre === "기타" ? genreOther.trim() : "",
        interests,
      });
      trackEvent("waitlist_submit");
      interests.forEach((t) => trackEvent("submit_interest", t));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* 상단 바 */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-left"
          title="노벨 바이블 첫 화면"
        >
          <div className="text-lg font-extrabold tracking-tight">노벨 바이블</div>
          <div className="text-xs text-ink-soft">작가를 위한 세계관 기록 도우미</div>
        </button>
        <div className="flex items-center gap-2">
          {role && (
            <button
              type="button"
              onClick={() => setShowRole(true)}
              className="chip cursor-pointer hover:bg-paper-2"
              title="역할 다시 선택"
            >
              {role} · 변경
            </button>
          )}
          {adminMode && (
            <span className="chip border border-line bg-paper-2 text-ink-mid">
              관리자 모드 · 저장 안 함
            </span>
          )}
          <button className="btn-ghost px-4 py-2 text-sm" onClick={onEnter}>
            데모 둘러보기 →
          </button>
        </div>
      </header>

      {/* 히어로 + 사전 예약 폼 */}
      <main className="mx-auto max-w-5xl px-5 pb-16">
        <section className="fade-up relative pt-6 pb-2 lg:pt-10">
          <div className="mx-auto max-w-3xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
              사전 예약 진행 중
            </span>
            <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.18] tracking-tight lg:text-[2.7rem]">
              100화가 넘어가도
              <br />
              설정이 무너지지 않게.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-mid">
              원고를 올리면 <b className="font-bold text-ink">노벨 바이블</b>이 인물·사건·설정을 대신 기억하고,
              어긋난 설정을 짚어 주고, 다음 이야기의 방향까지 제안하는 <b className="font-bold text-ink">작가용 세계관 도우미</b>예요.
            </p>

            {/* 무엇을 해주나 — 설문을 받기 전에 먼저 이해시킨다 */}
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {VALUE_PROPS.map((v) => (
                <div key={v.title} className="flex items-start gap-3 rounded-sm border border-line bg-paper p-4">
                  <Icon name={v.icon} size={22} className="mt-0.5 shrink-0 text-ink-soft" />
                  <div>
                    <div className="text-[15px] font-bold leading-snug text-ink">{v.title}</div>
                    <div className="mt-1 text-sm leading-relaxed text-ink-soft">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 폼 / 완료 메시지 */}
            {status === "done" ? (
              <div className="fade-up mx-auto mt-7 max-w-md rounded-sm border border-line bg-paper-2 p-6 text-center">
                <div className="text-lg font-extrabold text-ink">
                  사전 예약이 완료됐어요!
                </div>
                <p className="mt-1 text-base leading-relaxed text-ink-mid">
                  {adminMode
                    ? "관리자 모드라 서버에는 저장하지 않았어요. 그동안 데모를 먼저 둘러보시겠어요?"
                    : "출시 소식과 사전 예약자 한정 혜택을 가장 먼저 메일로 보내 드릴게요. 그동안 데모를 먼저 둘러보시겠어요?"}
                </p>
                <button className="btn-primary mt-4 px-6 py-2.5" onClick={onEnter}>
                  데모 둘러보기
                </button>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={submit}
                className="mt-8 max-w-2xl space-y-5 text-left"
              >
                {/* 허니팟 (봇 방지, 사용자에겐 숨김) */}
                <p className="hidden">
                  <label>
                    채우지 마세요:{" "}
                    <input
                      name="bot-field"
                      value={botField}
                      onChange={(e) => setBotField(e.target.value)}
                    />
                  </label>
                </p>
                <input type="hidden" name="role" value={role} />

                <div>
                  <div className="text-xl font-extrabold text-ink">30초면 끝나는 사전 예약</div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    아래 세 가지만 알려 주시면, 출시 때 사전 예약자 한정 혜택과 함께 가장 먼저 메일로 알려 드릴게요.
                  </p>
                </div>

                {/* 1. 집필 장르 분류 */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-ink">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-paper-2 text-xs text-ink-mid">
                      1
                    </span>
                    주로 집필하거나 관심 있는 장르는 무엇인가요?
                  </label>
                  <select
                    name="genre"
                    className={`input ${showGenreError ? "border-ink-mid focus:border-ink" : ""}`}
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    aria-label="주로 집필하는 장르"
                    aria-invalid={showGenreError}
                  >
                    <option value="" disabled>
                      주로 어떤 장르를 쓰시나요?
                    </option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g === "기타" ? "기타 (직접 입력)" : g}
                      </option>
                    ))}
                  </select>
                  {showGenreError && (
                    <p className="mt-1 text-sm font-semibold text-ink">
                      장르를 선택해 주세요.
                    </p>
                  )}
                </div>
                {genre === "기타" && (
                  <div className="fade-up">
                    <input
                      type="text"
                      className={`input ${showGenreOtherError ? "border-ink-mid focus:border-ink" : ""}`}
                      placeholder="어떤 장르인지 적어 주세요"
                      value={genreOther}
                      onChange={(e) => setGenreOther(e.target.value)}
                      aria-invalid={showGenreOtherError}
                    />
                    {showGenreOtherError && (
                      <p className="mt-1 text-sm font-semibold text-ink">
                        기타 장르를 직접 적어 주세요.
                      </p>
                    )}
                  </div>
                )}

                {/* 2. 기능 미리보기 + 관심 기능 선택 (장르와 이메일 사이) */}
                <div
                  className={`rounded-sm border bg-paper-2 p-3 transition ${
                    showInterestsError ? "border-ink-mid" : "border-line"
                  }`}
                >
                  <div className="mb-2 text-sm font-bold text-ink">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-line bg-paper-2 text-xs text-ink-mid">
                      2
                    </span>
                    어떤 기능이 가장 끌리나요?
                    <span className="ml-1 font-normal text-ink-faint">
                      카드를 누르면 바로 체험 · 우측 체크로 관심 표시(복수 선택)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {FEATURES.map((f) => {
                      const selected = interests.includes(f.title);
                      return (
                        <button
                          type="button"
                          key={f.key}
                          onClick={() => openDemo(f.key, f.title)}
                          className={`relative rounded-sm border p-3 text-left transition ${
                            selected
                              ? "border-ink bg-paper-2"
                              : "border-line bg-paper hover:border-ink-mid hover:bg-paper-2"
                          }`}
                        >
                          <span
                            role="checkbox"
                            aria-checked={selected}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleInterest(f.title);
                            }}
                            className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-sm border text-[11px] font-bold ${
                              selected
                                ? "border-ink bg-ink text-paper"
                                : "border-line bg-paper text-transparent hover:border-ink-mid"
                            }`}
                            title="관심 기능으로 표시"
                          >
                            ✓
                          </span>
                          <Icon name={f.icon} size={20} className="text-ink-soft" />
                          <div className="mt-1 pr-5 text-sm font-bold text-ink">{f.title}</div>
                          <div className="mt-0.5 text-xs leading-snug text-ink-soft">{f.desc}</div>
                          <div className="mt-1.5 text-xs font-semibold text-ink-mid">눌러서 체험 →</div>
                        </button>
                      );
                    })}
                  </div>
                  <input type="hidden" name="interests" value={interests.join(", ")} />
                  {showInterestsError && (
                    <p className="mt-2 text-sm font-semibold text-ink">
                      관심 있는 기능을 하나 이상 선택해 주세요.
                    </p>
                  )}
                </div>

                {/* 3. 이메일 */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-ink">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-paper-2 text-xs text-ink-mid">
                      3
                    </span>
                    출시 소식을 받을 이메일을 알려 주세요.
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="email"
                      name="email"
                      required
                      className={`input flex-1 ${showEmailError ? "border-ink-mid focus:border-ink" : ""}`}
                      placeholder="이메일 주소"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={showEmailError}
                    />
                    <button
                      type="submit"
                      className="btn-primary whitespace-nowrap px-6 py-3"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? "신청 중…" : "사전 예약하기"}
                    </button>
                  </div>
                  {showEmailError && (
                    <p className="mt-1 text-sm font-semibold text-ink">
                      받을 수 있는 이메일 주소를 입력해 주세요.
                    </p>
                  )}
                </div>
                {status === "error" && (
                  <p className="text-sm text-ink">
                    전송에 실패했어요. 잠시 후 다시 시도해 주세요.
                  </p>
                )}
                <p className="text-center text-xs text-ink-faint">
                  출시 안내 목적으로만 사용하고, 스팸은 보내지 않아요. 언제든 수신 거부할 수 있어요.
                </p>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm font-semibold text-ink hover:underline"
                    onClick={onEnter}
                  >
                    전체 데모를 처음부터 둘러볼게요 →
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        <p className="mt-12 text-center text-sm text-ink-faint">
          © 2026 노벨 바이블 · 작가의 세계관을 기억하는 AI · v1.0.0
        </p>
      </main>

      {/* 플로팅 기능 데모 모달 */}
      {demoFeature && demoSeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setDemoKey(null)}
          />
          <div className="relative z-10 flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-sm border border-line bg-paper shadow-pop">
            <div className="flex items-center justify-between gap-2 border-b border-line bg-paper-2 px-5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Icon name={demoFeature.icon} size={20} className="text-ink-soft" />
                <span className="text-lg font-extrabold text-ink">{demoFeature.title}</span>
                <span className="chip">체험 데모 · 「두 번째 각성」 예시</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`chip cursor-pointer ${
                    interests.includes(demoFeature.title)
                      ? "border-ink bg-ink text-paper"
                      : "hover:bg-paper-2"
                  }`}
                  onClick={() => toggleInterest(demoFeature.title)}
                >
                  {interests.includes(demoFeature.title) ? "✓ 관심 기능" : "관심 표시"}
                </button>
                <button
                  type="button"
                  className="rounded-sm px-2 py-1 text-ink-soft hover:bg-paper-2"
                  onClick={() => setDemoKey(null)}
                  aria-label="닫기"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-4 sm:p-5">
              {/* 격리된 데모 상태(두 번째 각성)로 실제 기능을 렌더링. localStorage 미저장 · 지표 미기록. */}
              <AppProvider seed={demoSeed} persist={false} track={false}>
                <demoFeature.Comp />
              </AppProvider>
            </div>
          </div>
        </div>
      )}

      {/* 첫 접속 역할 팝업 (크게) */}
      {showRole && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
          <div className="fade-up relative z-10 w-full max-w-lg rounded-sm border border-line bg-paper p-7 text-center shadow-pop sm:p-9">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint">노벨 바이블</div>
            <h2 className="mt-2 text-2xl font-extrabold text-ink">어떤 분이신가요?</h2>
            <p className="mt-1.5 text-base text-ink-soft">
              알려 주시면 더 잘 맞는 데모와 소식을 보여드릴게요.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => chooseRole(r.key)}
                  className="rounded-sm border border-line bg-paper p-4 text-left transition hover:border-ink-mid hover:bg-paper-2"
                >
                  <Icon name={r.icon} size={24} className="text-ink-soft" />
                  <div className="mt-1.5 text-lg font-extrabold text-ink">{r.title}</div>
                  <div className="mt-0.5 text-sm leading-snug text-ink-soft">{r.desc}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-5 text-sm text-ink-faint hover:text-ink-mid hover:underline"
              onClick={() => chooseRole("무응답")}
            >
              나중에 답할게요
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
