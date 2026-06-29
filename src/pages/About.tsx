import { useApp } from "../context/AppContext";

/**
 * 서비스 소개 페이지.
 * 노벨 바이블의 핵심 가치, 타겟, 비즈니스 모델, 수익 구조를
 * 투자자·파트너에게 보여주듯 한 페이지로 정리한다.
 */

const PAIN_POINTS = [
  {
    icon: "🌀",
    title: "설정이 무너진다",
    desc: "연재가 100화를 넘어가면 인물 나이, 사건 순서, 세계관 규칙이 작가의 기억에서 어긋나기 시작합니다. 독자는 그 오류를 가장 먼저 알아챕니다.",
  },
  {
    icon: "📚",
    title: "정리는 따로 논다",
    desc: "엑셀, 메모장, 위키에 흩어진 설정 자료는 원고와 동기화되지 않습니다. 결국 ‘찾는 시간’이 ‘쓰는 시간’을 잡아먹습니다.",
  },
  {
    icon: "⏳",
    title: "검수는 사람 몫",
    desc: "설정 오류 검수는 지금까지 작가나 편집자가 전 회차를 다시 읽으며 해 왔습니다. 회차가 쌓일수록 사실상 불가능해집니다.",
  },
];

const VALUES = [
  {
    step: "쓰기 전",
    icon: "🗂️",
    title: "세계관 정리",
    desc: "원고와 설정 자료를 올리면 AI가 인물·장소·사건·규칙을 설정 카드로 자동 정리합니다.",
  },
  {
    step: "쓰는 중",
    icon: "💬",
    title: "즉시 조회",
    desc: "“제비가 다친 다리가 어느 쪽이었지?” 묻는 즉시, 근거 문장과 함께 답합니다.",
  },
  {
    step: "쓴 뒤",
    icon: "🚨",
    title: "오류 검수",
    desc: "회차를 올리면 기존 설정과 어긋나는 부분을 찾아 고치는 방법까지 제안합니다.",
  },
  {
    step: "확장",
    icon: "💡",
    title: "관계별 시나리오 추천",
    desc: "기존 세계관을 지키면서, 인물 관계별로 다음 이야기의 방향과 키워드를 추천합니다. 글은 작가가 직접 씁니다.",
  },
];

const TARGETS = [
  {
    icon: "✍️",
    title: "웹소설 연재 작가",
    tag: "핵심 타겟",
    desc: "주 5회 이상 연재하며 설정 관리에 가장 큰 고통을 느끼는 국내 약 20만 명의 등록 작가.",
  },
  {
    icon: "🎬",
    title: "웹툰·드라마 각색 스튜디오",
    tag: "B2B",
    desc: "원작 IP를 각색할 때 세계관 정합성 검증이 필수인 제작 스튜디오와 매니지먼트사.",
  },
  {
    icon: "🏢",
    title: "플랫폼·출판사",
    tag: "제휴",
    desc: "소속 작가에게 집필 도구를 제공해 연재 이탈률을 낮추려는 콘텐츠 플랫폼.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "0원",
    desc: "취미 작가를 위한 시작점",
    features: ["작품 1개", "설정 카드 100장", "월 10회 오류 검사", "설정 지도 기본 보기"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "월 14,900원",
    desc: "연재 작가의 표준 도구",
    features: [
      "작품 무제한",
      "설정 카드 무제한",
      "실시간 설정 지킴이 (집필 중 오류 감지)",
      "회차별 세계관 지도",
      "관계별 시나리오 추천",
      "떡밥 회수 추적",
    ],
    highlight: true,
  },
  {
    name: "Studio",
    price: "협의",
    desc: "팀·스튜디오를 위한 B2B",
    features: [
      "팀 공유 세계관 워크스페이스",
      "IP 정합성 리포트",
      "API 연동 (사내 도구·CMS)",
      "전담 온보딩",
    ],
    highlight: false,
  },
];

const REVENUE = [
  {
    icon: "💳",
    title: "구독 수익",
    share: "주 수익원",
    desc: "Pro 구독이 핵심 수익원입니다. 설정 데이터가 쌓일수록 이전 비용이 커져 이탈률이 낮은 구조입니다.",
  },
  {
    icon: "🏢",
    title: "B2B 라이선스",
    share: "성장 동력",
    desc: "스튜디오·플랫폼 단위 계약. 작가 개인이 아닌 IP 단위로 과금해 객단가를 높입니다.",
  },
  {
    icon: "🔌",
    title: "세계관 API (로드맵)",
    share: "확장",
    desc: "정리된 세계관 데이터를 게임·굿즈·2차 창작 도구에 제공하는 API 수익 모델로 확장합니다.",
  },
];

export default function About() {
  const { navigate } = useApp();

  return (
    <div className="fade-up space-y-8 pb-10">
      {/* 히어로 */}
      <section className="card relative overflow-hidden p-8 text-center lg:p-12">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="relative">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-card">
            📚
          </div>
          <h1 className="text-3xl font-extrabold leading-snug text-stone-800 lg:text-4xl">
            작가의 세계관을 기억하는
            <br />
            AI 에이전트, <span className="text-amber-700">노벨 바이블</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-stone-600">
            작가가 입력한 세계관과 원고를 학습한 AI가 인물·사건·설정을 기억하고, 글쓰기
            오류를 방지하며, 세계관을 지키는 다음 이야기의 방향까지 추천해 줍니다.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button className="btn-primary px-7 py-3 text-lg" onClick={() => navigate("dashboard")}>
              체험해 보기 →
            </button>
            <button className="btn-ghost px-7 py-3 text-lg" onClick={() => navigate("atlas")}>
              🗺️ 세계관 지도 보기
            </button>
          </div>
        </div>
      </section>

      {/* 문제 정의 */}
      <section>
        <h2 className="mb-1 text-center text-2xl font-extrabold text-stone-800">
          연재가 길어질수록, 설정은 무너집니다
        </h2>
        <p className="mb-5 text-center text-base text-stone-500">
          노벨 바이블이 해결하는 세 가지 고질병
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {PAIN_POINTS.map((p) => (
            <div key={p.title} className="card p-6">
              <div className="text-3xl">{p.icon}</div>
              <h3 className="mt-2 text-lg font-bold text-stone-800">{p.title}</h3>
              <p className="mt-1 text-base leading-relaxed text-stone-600">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 핵심 가치 */}
      <section className="card p-7">
        <h2 className="mb-1 text-center text-2xl font-extrabold text-stone-800">
          집필의 모든 단계에 들어가는 핵심 가치
        </h2>
        <p className="mb-6 text-center text-base text-stone-500">
          쓰기 전 → 쓰는 중 → 쓴 뒤 → 확장까지, 하나의 세계관 데이터로 이어집니다
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <div key={v.title} className="relative rounded-2xl bg-paper-100 p-5">
              <span className="chip bg-amber-600 text-white">
                {i + 1}. {v.step}
              </span>
              <div className="mt-3 text-3xl">{v.icon}</div>
              <h3 className="mt-1 text-lg font-bold text-stone-800">{v.title}</h3>
              <p className="mt-1 text-base leading-relaxed text-stone-600">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 타겟 */}
      <section>
        <h2 className="mb-1 text-center text-2xl font-extrabold text-stone-800">누구를 위한 서비스인가요?</h2>
        <p className="mb-5 text-center text-base text-stone-500">
          개인 작가에서 시작해 IP를 다루는 모든 팀으로 확장합니다
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {TARGETS.map((t) => (
            <div key={t.title} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="text-3xl">{t.icon}</div>
                <span className="chip bg-emerald-100 text-emerald-800">{t.tag}</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-stone-800">{t.title}</h3>
              <p className="mt-1 text-base leading-relaxed text-stone-600">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 비즈니스 모델 */}
      <section className="card p-7">
        <h2 className="mb-1 text-center text-2xl font-extrabold text-stone-800">비즈니스 모델</h2>
        <p className="mb-6 text-center text-base text-stone-500">
          무료로 시작해, 연재가 깊어질수록 자연스럽게 Pro로
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border-2 p-6 ${
                p.highlight
                  ? "border-amber-400 bg-amber-50 shadow-card"
                  : "border-paper-300 bg-white"
              }`}
            >
              {p.highlight && <span className="chip bg-amber-600 text-white">가장 인기</span>}
              <h3 className="mt-2 text-xl font-extrabold text-stone-800">{p.name}</h3>
              <div className="mt-1 text-2xl font-extrabold text-amber-700">{p.price}</div>
              <p className="text-sm text-stone-500">{p.desc}</p>
              <ul className="mt-4 space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-base text-stone-700">
                    <span className="text-emerald-600">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 수익 구조 */}
      <section>
        <h2 className="mb-1 text-center text-2xl font-extrabold text-stone-800">수익 구조</h2>
        <p className="mb-5 text-center text-base text-stone-500">
          쌓일수록 떠나기 어려운 세계관 데이터가 수익의 해자입니다
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {REVENUE.map((r) => (
            <div key={r.title} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="text-3xl">{r.icon}</div>
                <span className="chip bg-blue-100 text-blue-800">{r.share}</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-stone-800">{r.title}</h3>
              <p className="mt-1 text-base leading-relaxed text-stone-600">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 왜 지금인가 + CTA */}
      <section className="card relative overflow-hidden p-8 text-center">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-200/50 blur-3xl" />
        <div className="relative">
          <h2 className="text-2xl font-extrabold text-stone-800">왜 지금일까요?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-stone-600">
            웹소설·웹툰 시장은 원작 IP의 2차 창작(웹툰화·영상화)으로 빠르게 확장되고
            있습니다. IP가 커질수록 <b className="text-stone-800">세계관 정합성</b>은 작품의
            품질이자 자산이 됩니다. 노벨 바이블은 그 정합성을 지키는 가장 가까운 도구로,
            작가의 첫 화면에서 시작합니다.
          </p>
          <button
            className="btn-primary mt-6 px-8 py-3 text-lg"
            onClick={() => navigate("dashboard")}
          >
            지금 설정 지도 보러 가기 →
          </button>
        </div>
      </section>
    </div>
  );
}
