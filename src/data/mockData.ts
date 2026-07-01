import type {
  AppState,
  CharacterPersona,
  CharacterPlacement,
  Conflict,
  MapZone,
  MeetingKeywordSummary,
  MemorySource,
  MeetingTurn,
  Project,
  ProjectNote,
  Relation,
  StageMap,
  SubstoryCandidate,
  Tile,
  WorldBlock,
} from "../types";

// ============================================================================
// 「두 번째 각성」 — 회귀·빙의·멀티타임라인 헌터물 (데모용 완전 오리지널 합성 소설)
// 소스 오브 트루스: novel-bible-demo/content/bible.md · outline.md · chapters/
// ============================================================================

const T0 = "2026-06-01T09:00:00.000Z";

const block = (
  b: Omit<WorldBlock, "createdAt" | "updatedAt" | "canonNotes" | "sourceEvidence"> &
    Partial<Pick<WorldBlock, "canonNotes" | "sourceEvidence">>
): WorldBlock => ({
  canonNotes: "",
  sourceEvidence: [],
  createdAt: T0,
  updatedAt: T0,
  ...b,
});

export const mockBlocks: WorldBlock[] = [
  // ── 인물 ──────────────────────────────────────────────
  block({
    id: "c1",
    name: "이서준〈강도현〉",
    type: "character",
    description:
      "주인공. 몸은 각성에 실패해 '폐급'으로 조롱받던 이서준, 의식은 전생 S급 헌터 강도현이다. 종말급 게이트에서 죽은 뒤 10년 전 이서준의 몸으로 회귀·빙의했다. 전생의 공략 지식을 지닌 채 등급을 숨기고 움직인다.",
    firstAppearance: "1화",
    attributes: {
      의식: "강도현 (전생 S급 헌터)",
      "현재 몸": "이서준 (각성 실패자)",
      "회귀 회차": "3회차",
      "표면 등급": "E급(위장)",
    },
    tags: ["주인공", "회귀", "빙의", "강도현", "이서준"],
    aiStatus: "Learned",
    sourceEvidence: [
      "1화: “거울 속에는 스물한 살의 낯선 얼굴이 있었다. 이서준.”",
      "1화: “기억만은 분명히 그의 것이었다. 흑일에서 죽은 그 순간까지.”",
    ],
  }),
  block({
    id: "c2",
    name: "윤가람",
    type: "character",
    description:
      "국내 최대 청랑 길드의 마스터, S급 헌터. 전생(1·2회차)엔 강도현의 동료였으나 이번 생엔 아직 남남이자 라이벌이다. 도현의 비정상적인 실력을 의심하면서도 설명 못 할 기시감을 느낀다.",
    firstAppearance: "11화",
    attributes: { 등급: "S급", 소속: "청랑 길드", "전생 관계": "강도현의 동료" },
    tags: ["라이벌", "S급", "청랑 길드", "전생 동료"],
    aiStatus: "Learned",
    sourceEvidence: ["66화: “윤가람은 그를 오래전부터 알던 사람처럼 느꼈다.”"],
  }),
  block({
    id: "c3",
    name: "서문기",
    type: "character",
    description:
      "백호 길드의 노장 부관이자 도현의 조력자. 은퇴한 B급 베테랑으로, 도현의 정체(회귀·빙의)를 가장 먼저 눈치챈다. 말수는 적지만 전장을 보는 눈이 깊다.",
    firstAppearance: "17화",
    attributes: { 등급: "B급(은퇴)", 소속: "백호 길드", 역할: "부관" },
    tags: ["조력자", "멘토", "백호 길드"],
    aiStatus: "Learned",
  }),
  block({
    id: "c4",
    name: "채린",
    type: "character",
    description:
      "힐러 겸 정찰형 헌터. 이서준의 어릴 적 소꿉친구라, 빙의한 도현을 보며 '서준이가 변했다'고 느낀다. 빙의 흔적(r4)을 가장 가까이서 감시하는 인물.",
    firstAppearance: "5화",
    attributes: { 등급: "C급", 소속: "백호 길드", "이서준과의 관계": "소꿉친구" },
    tags: ["파트너", "힐러", "소꿉친구"],
    aiStatus: "Learned",
    sourceEvidence: ["5화: “채린은 서준이 변했다며 경계 반, 걱정 반의 눈으로 보았다.”"],
  }),
  block({
    id: "c5",
    name: "관리자 '에르그'",
    type: "character",
    description:
      "각성자에게만 보이는 시스템 메시지의 발신자. 인간이 아니라 게이트 시스템의 인격/정령이다. 회귀의 근원이자, 도현에게 회차를 '왜' 반복시키는지 답하지 않는 수수께끼 존재.",
    firstAppearance: "1화",
    attributes: { 정체: "게이트 시스템 인격", 형태: "반투명 안내창", 인간여부: "비인간" },
    tags: ["시스템", "비인간", "회귀의 근원", "수수께끼"],
    aiStatus: "Needs Review",
    sourceEvidence: ["1화: “〈세 번째 삶을 환영합니다.〉 관리자의 메시지였다.”"],
  }),
  block({
    id: "c6",
    name: "하은채",
    type: "character",
    description:
      "상암 공략대의 신입 헌터(D급). 47화에서 대원들을 지키다 전사하지만, 88화 도현의 선택으로 세계선이 바뀌며 89화 부산에서 살아 등장한다. '도현이 구하지 못한 첫 죽음'이자 '분기의 증거'.",
    firstAppearance: "8화",
    attributes: { 등급: "D급", 소속: "상암 공략대", "생사(47화)": "전사", "생사(89화)": "생존" },
    tags: ["신입", "분기의 증거", "상암", "부산"],
    aiStatus: "Conflict Risk",
    sourceEvidence: [
      "47화: “하은채는 상암 게이트의 무너지는 균열 아래에서 끝내 숨을 거뒀다.”",
      "89화: “부산 해운대 게이트의 포탈 앞에서, 하은채가 활을 겨눈 채 웃었다.”",
    ],
  }),
  block({
    id: "c7",
    name: "이수아",
    type: "character",
    description:
      "이서준의 여동생. 오빠가 달라진 것을 눈치채지만 말하지 않는다. 도현을 '이서준'으로 붙드는 인간적 무게.",
    firstAppearance: "2화",
    attributes: { "이서준과의 관계": "여동생" },
    tags: ["가족", "빙의 흔적"],
    aiStatus: "Learned",
  }),
  block({
    id: "c8",
    name: "마태오",
    type: "character",
    description:
      "균열교의 사도. 브레이크를 예술처럼 여기는 광신자로, 흑막의 하수인. 상암 게이트 사건의 배후에 있다.",
    firstAppearance: "26화",
    attributes: { 소속: "균열교", 역할: "사도" },
    tags: ["악역", "균열교", "광신자"],
    aiStatus: "Learned",
  }),
  block({
    id: "c9",
    name: "남궁현",
    type: "character",
    description:
      "한국 헌터 협회장. 질서를 위해서라면 개인을 버리는 관료. 도현을 '변수'로 분류하고 견제한다.",
    firstAppearance: "20화",
    attributes: { 소속: "헌터 협회", 직책: "협회장" },
    tags: ["협회", "권력자", "회색"],
    aiStatus: "Learned",
  }),
  block({
    id: "c10",
    name: "도지혁",
    type: "character",
    description: "청랑 길드 부마스터. 윤가람의 오른팔로, 백호 길드와 도현을 집요하게 견제한다.",
    firstAppearance: "25화",
    attributes: { 등급: "A급", 소속: "청랑 길드", 직책: "부마스터" },
    tags: ["청랑 길드", "견제"],
    aiStatus: "Learned",
  }),
  block({
    id: "c11",
    name: "백나래",
    type: "character",
    description: "백호 길드의 첫 공채 헌터(B급 탱커). 도현이 처음으로 스카우트한 동료.",
    firstAppearance: "18화",
    attributes: { 등급: "B급", 소속: "백호 길드", 역할: "탱커" },
    tags: ["백호 길드", "탱커", "첫 동료"],
    aiStatus: "Learned",
  }),
  block({
    id: "c12",
    name: "'흑관(黑冠)'",
    type: "character",
    description:
      "균열교의 교주. 정체 불명의 최종 흑막으로, 흑일 게이트를 앞당겨 열려 한다. 도현의 '반복(회귀)'을 아는 듯한 낌새를 보인다.",
    firstAppearance: "73화",
    attributes: { 소속: "균열교", 직책: "교주", 정체: "불명" },
    tags: ["최종 흑막", "균열교", "회귀를 아는 자"],
    aiStatus: "Needs Review",
  }),
  // ── 장소 ──────────────────────────────────────────────
  block({
    id: "l1",
    name: "서울 상암 게이트",
    type: "location",
    description: "A급 대형 게이트. 47화에 브레이크 직전까지 가는 붕괴 사건의 무대. 하은채가 전사하는 곳.",
    firstAppearance: "47화",
    attributes: { 등급: "A급", 위치: "서울 상암" },
    tags: ["게이트", "상암", "붕괴 사건"],
    aiStatus: "Learned",
    sourceEvidence: ["47화: “서울 상암 게이트. A급.”"],
  }),
  block({
    id: "l2",
    name: "부산 해운대 게이트",
    type: "location",
    description: "A급 게이트. 89화 공략 무대. 47화에 죽었어야 할 하은채가 살아 함께 싸우는, 분기의 증거가 드러나는 곳.",
    firstAppearance: "89화",
    attributes: { 등급: "A급", 위치: "부산 해운대" },
    tags: ["게이트", "부산", "분기"],
    aiStatus: "Learned",
    sourceEvidence: ["89화: “부산 해운대 게이트. A급.”"],
  }),
  block({
    id: "l3",
    name: "헌터 협회 본부",
    type: "location",
    description: "여의도. 각성 등급 판정소와 게이트 관제를 맡는 국가기관의 심장부.",
    firstAppearance: "12화",
    attributes: { 위치: "여의도" },
    tags: ["협회", "등급 판정"],
    aiStatus: "Learned",
  }),
  block({
    id: "l4",
    name: "백호 길드 본부",
    type: "location",
    description: "합정. 도현이 이서준의 이름으로 세운 신생 길드의 거점. 30화에 창설된다.",
    firstAppearance: "30화",
    attributes: { 위치: "합정" },
    tags: ["길드", "백호", "거점"],
    aiStatus: "Learned",
  }),
  block({
    id: "l5",
    name: "청랑 길드 본부",
    type: "location",
    description: "강남. 국내 최대 규모의 기성 길드 청랑의 본부.",
    firstAppearance: "11화",
    attributes: { 위치: "강남" },
    tags: ["길드", "청랑"],
    aiStatus: "Learned",
  }),
  block({
    id: "l6",
    name: "흑일(黑日) 게이트",
    type: "location",
    description: "전생(1·2회차)에 인류가 패배한 종말급 게이트. 도현이 죽은 곳이자 회귀의 시작점. 3회차엔 아직 열리지 않았다.",
    firstAppearance: "1화",
    attributes: { 등급: "종말급", 상태: "3회차엔 미개방" },
    tags: ["게이트", "종말급", "회귀 시작점"],
    aiStatus: "Learned",
    sourceEvidence: ["1화: “흑일(黑日)이 하늘을 삼켰다.”"],
  }),
  block({
    id: "l7",
    name: "수문(水門) 던전",
    type: "location",
    description: "초반 도현이 폐급의 몸으로 불가능한 공략을 해내 협회의 주목을 받는 D급 던전.",
    firstAppearance: "4화",
    attributes: { 등급: "D급" },
    tags: ["던전", "실력 증명"],
    aiStatus: "Learned",
  }),
  block({
    id: "l8",
    name: "재(灰)의 갱도",
    type: "location",
    description: "각성석 원료를 캐는 광산. 균열교가 노리는 74화 쟁탈전의 무대.",
    firstAppearance: "74화",
    attributes: { 용도: "각성석 채굴" },
    tags: ["광산", "각성석", "쟁탈전"],
    aiStatus: "Imported from Excel",
  }),
  block({
    id: "l9",
    name: "이서준의 집",
    type: "location",
    description: "반지하 원룸. 빙의 직후 도현이 눈뜨는 곳. 빙의 흔적(r4)의 무대.",
    firstAppearance: "1화",
    attributes: { 형태: "반지하 원룸" },
    tags: ["집", "빙의", "출발점"],
    aiStatus: "Learned",
  }),
  block({
    id: "l10",
    name: "협회 훈련장",
    type: "location",
    description: "등급 재측정과 모의전이 이뤄지는 곳. 58화 재측정 서류에서 CF-A 충돌이 드러난다.",
    firstAppearance: "39화",
    attributes: { 용도: "등급 재측정·모의전" },
    tags: ["협회", "재측정"],
    aiStatus: "Learned",
  }),
  // ── 무리(조직) ────────────────────────────────────────
  block({
    id: "o1",
    name: "한국 헌터 협회",
    type: "organization",
    description: "각성·게이트·길드를 관리하는 국가기관. 등급 판정과 게이트 배정을 맡는다.",
    firstAppearance: "12화",
    attributes: {},
    tags: ["국가기관", "협회"],
    aiStatus: "Learned",
  }),
  block({
    id: "o2",
    name: "백호(白虎) 길드",
    type: "organization",
    description: "3회차에서 도현이 이서준의 이름으로 세우는 신생 길드. 30화 창설.",
    firstAppearance: "30화",
    attributes: { 창설: "30화" },
    tags: ["길드", "주인공네", "신생"],
    aiStatus: "Conflict Risk",
  }),
  block({
    id: "o3",
    name: "청랑(靑狼) 길드",
    type: "organization",
    description: "국내 최대 규모의 기성 길드이자 라이벌. 마스터는 윤가람.",
    firstAppearance: "11화",
    attributes: {},
    tags: ["길드", "라이벌", "최대 규모"],
    aiStatus: "Learned",
  }),
  block({
    id: "o4",
    name: "균열교(龜裂敎)",
    type: "organization",
    description: "게이트를 '신의 문'으로 숭배하며 브레이크를 방조·조장하는 광신 집단. 흑막.",
    firstAppearance: "26화",
    attributes: {},
    tags: ["악역 조직", "광신", "흑막"],
    aiStatus: "Learned",
  }),
  block({
    id: "o5",
    name: "상암 공략대",
    type: "organization",
    description: "47화 상암 게이트에 투입된 협회 합동 공략대(임시 편성). 하은채가 여기 소속으로 전사한다.",
    firstAppearance: "41화",
    attributes: { 편성: "임시" },
    tags: ["공략대", "상암", "임시 편성"],
    aiStatus: "Learned",
  }),
  // ── 사건 ──────────────────────────────────────────────
  block({
    id: "e1",
    name: "흑일 전멸과 회귀",
    type: "event",
    description: "흑일 게이트에서 인류 공략대가 전멸하고 강도현이 죽는다. 그 순간 10년 전으로 회귀한다.",
    episode: "1화",
    firstAppearance: "1화",
    attributes: { 시점: "전생" },
    tags: ["시작 사건", "회귀"],
    aiStatus: "Learned",
  }),
  block({
    id: "e2",
    name: "빙의 각성",
    type: "event",
    description: "강도현의 의식이 이서준의 몸에서 눈을 뜬다. 3회차의 시작.",
    episode: "1화",
    firstAppearance: "1화",
    attributes: { 중요도: "높음" },
    tags: ["빙의", "각성", "핵심 사건"],
    aiStatus: "Learned",
  }),
  block({
    id: "e3",
    name: "수문 던전 공략",
    type: "event",
    description: "폐급의 몸으로 불가능한 D급 던전 공략을 해내 협회의 주목을 받는다.",
    episode: "4화",
    firstAppearance: "4화",
    attributes: {},
    tags: ["실력 증명"],
    aiStatus: "Learned",
  }),
  block({
    id: "e4",
    name: "E급 판정",
    type: "event",
    description: "협회 등급 판정에서 이서준(도현)은 최하위 E급 판정을 받는다(위장 성공).",
    episode: "12화",
    firstAppearance: "12화",
    attributes: { "판정 등급": "E급" },
    tags: ["등급 판정", "위장"],
    aiStatus: "Learned",
    sourceEvidence: ["12화: “협회는 이서준에게 최하위 E급 판정을 내렸다.”"],
  }),
  block({
    id: "e5",
    name: "백나래 스카우트",
    type: "event",
    description: "도현이 백나래를 첫 동료로 스카우트하며 길드 창설을 준비한다.",
    episode: "18화",
    firstAppearance: "18화",
    attributes: {},
    tags: ["동료", "길드 준비"],
    aiStatus: "Learned",
    sourceEvidence: ["18화: “그는 백호 길드의 이름으로 함께 가자고 손을 내밀었다.”"],
  }),
  block({
    id: "e6",
    name: "백호 길드 창설",
    type: "event",
    description: "도현이 이서준의 이름으로 백호 길드를 정식 창설한다. 합정에 거점을 세운다.",
    episode: "30화",
    firstAppearance: "30화",
    attributes: { 중요도: "높음" },
    tags: ["길드 창설", "핵심 사건"],
    aiStatus: "Learned",
    sourceEvidence: ["30화: “백호 길드가 협회 인가를 받아 정식으로 창설되었다.”"],
  }),
  block({
    id: "e7",
    name: "균열교의 준동",
    type: "event",
    description: "균열교가 대형 게이트를 노린다는 정황이 처음 드러난다. 협회가 상암 공략대를 편성한다.",
    episode: "41화",
    firstAppearance: "41화",
    attributes: {},
    tags: ["균열교", "전조"],
    aiStatus: "Learned",
  }),
  block({
    id: "e8",
    name: "상암 게이트 붕괴",
    type: "event",
    description: "브레이크 직전, 하은채가 대원들을 지키다 전사한다. 도현이 지식이 있어도 구하지 못한 첫 죽음.",
    episode: "47화",
    firstAppearance: "47화",
    attributes: { 중요도: "높음" },
    tags: ["붕괴", "상실", "핵심 사건"],
    aiStatus: "Conflict Risk",
    sourceEvidence: ["47화: “하은채는 상암 게이트의 무너지는 균열 아래에서 끝내 숨을 거뒀다.”"],
  }),
  block({
    id: "e9",
    name: "어긋나는 미래",
    type: "event",
    description: "전생과 결정적으로 달라진 미래 앞에서 도현이 처음으로 크게 흔들린다.",
    episode: "52화",
    firstAppearance: "52화",
    attributes: {},
    tags: ["회차 간섭", "전환점"],
    aiStatus: "Learned",
  }),
  block({
    id: "e10",
    name: "C급 재표기",
    type: "event",
    description: "협회 재측정 서류에 도현(이서준)이 C급으로 표기된다. 등급 불변 규칙(r2)과 어긋난다.",
    episode: "58화",
    firstAppearance: "58화",
    attributes: { "표기 등급": "C급" },
    tags: ["재측정", "충돌 유발"],
    aiStatus: "Conflict Risk",
    sourceEvidence: ["58화: “재측정 서류의 등급란에는 C급이라 적혀 있었다.”"],
  }),
  block({
    id: "e11",
    name: "윤가람과의 대립",
    type: "event",
    description: "청랑 길드 윤가람과 도현이 처음으로 공식 대립한다. 서로의 실력을 인정하며 부딪친다.",
    episode: "66화",
    firstAppearance: "66화",
    attributes: {},
    tags: ["대립", "라이벌"],
    aiStatus: "Learned",
  }),
  block({
    id: "e12",
    name: "회귀 분기점",
    type: "event",
    description: "도현이 전생엔 하지 않았던 선택(하은채를 부산 작전에 배치)을 한다. 세계선이 갈린다.",
    episode: "88화",
    firstAppearance: "88화",
    attributes: { 중요도: "높음" },
    tags: ["분기", "선택", "핵심 사건"],
    aiStatus: "Learned",
  }),
  block({
    id: "e13",
    name: "부산의 생존자",
    type: "event",
    description: "47화에 죽었어야 할 하은채가 부산 해운대 게이트에서 살아 함께 싸운다. 88화 분기의 결과.",
    episode: "89화",
    firstAppearance: "89화",
    attributes: { 중요도: "높음" },
    tags: ["생존", "분기의 증거"],
    aiStatus: "Conflict Risk",
    sourceEvidence: ["89화: “상암에서 죽었어야 할 그녀가, 이곳에서 숨 쉬고 있었다.”"],
  }),
  block({
    id: "e14",
    name: "흑일 재대면",
    type: "event",
    description: "전생 전멸의 무대였던 흑일 게이트가 다시 열린다. 3회차의 도현은 다른 결말을 향해 나아간다.",
    episode: "100화",
    firstAppearance: "100화",
    attributes: { 중요도: "높음" },
    tags: ["결말", "흑일"],
    aiStatus: "Needs Review",
  }),
  // ── 규칙 ──────────────────────────────────────────────
  block({
    id: "r1",
    name: "게이트-브레이크 법칙",
    type: "rule",
    description: "게이트를 제한시간 내 공략하지 못하면 브레이크가 일어나 몬스터가 현실로 유출된다.",
    attributes: {},
    tags: ["세계관 규칙", "게이트"],
    aiStatus: "Learned",
  }),
  block({
    id: "r2",
    name: "각성 등급 불변",
    type: "rule",
    description: "한 번 판정된 각성 등급은 바뀌지 않는다. 재각성 없이 등급이 오르내리면 설정 오류다.",
    attributes: {},
    tags: ["세계관 규칙", "각성", "등급"],
    aiStatus: "Conflict Risk",
  }),
  block({
    id: "r3",
    name: "회귀 법칙",
    type: "rule",
    description: "강도현은 죽으면 10년 전 이서준의 몸 시점으로 되돌아온다. 기억은 그대로 유지된다.",
    attributes: {},
    tags: ["세계관 규칙", "회귀", "핵심 설정"],
    aiStatus: "Learned",
  }),
  block({
    id: "r4",
    name: "빙의 흔적",
    type: "rule",
    description: "이서준의 몸에는 원래 주인의 습관과 인간관계가 남아 있어, 도현은 완전히 '이서준'을 연기할 수 없다.",
    attributes: {},
    tags: ["세계관 규칙", "빙의"],
    aiStatus: "Learned",
  }),
  block({
    id: "r5",
    name: "시스템 메시지",
    type: "rule",
    description: "각성자만 볼 수 있는 반투명 안내창. 관리자(에르그)가 띄운다고 알려져 있다.",
    attributes: {},
    tags: ["세계관 규칙", "시스템"],
    aiStatus: "Learned",
  }),
  block({
    id: "r6",
    name: "회차 간섭",
    type: "rule",
    description: "회차가 반복될수록 세계선이 미세하게 달라진다. 전생 지식이 그대로 유효하지 않을 수 있다.",
    attributes: {},
    tags: ["세계관 규칙", "멀티타임라인"],
    aiStatus: "Learned",
  }),
  // ── 물건 ──────────────────────────────────────────────
  block({
    id: "i1",
    name: "각성석",
    type: "item",
    description: "등급 판정과 거래에 쓰이는 결정. 게이트 코어에서 정제한다.",
    firstAppearance: "12화",
    attributes: {},
    tags: ["결정", "판정"],
    aiStatus: "Learned",
  }),
  block({
    id: "i2",
    name: "흑요(黑曜)의 파편",
    type: "item",
    description: "전생 도현의 S급 아티팩트 조각. 3회차엔 아직 흩어져 있어, 도현이 조각을 모은다.",
    firstAppearance: "10화",
    attributes: { 상태: "흩어짐" },
    tags: ["아티팩트", "전생 유물", "복선"],
    aiStatus: "Learned",
  }),
  block({
    id: "i3",
    name: "이서준의 낡은 단검",
    type: "item",
    description: "몸의 원주인 이서준이 쓰던 물건. 빙의 흔적(r4)의 상징.",
    firstAppearance: "2화",
    attributes: {},
    tags: ["유품", "빙의 흔적", "상징"],
    aiStatus: "Learned",
  }),
  block({
    id: "i4",
    name: "게이트 코어",
    type: "item",
    description: "게이트 최심부의 핵. 부수면 게이트가 닫힌다. 각성석의 원료.",
    firstAppearance: "4화",
    attributes: {},
    tags: ["게이트", "핵심"],
    aiStatus: "Learned",
  }),
  block({
    id: "i5",
    name: "봉인석",
    type: "item",
    description: "균열교가 흑일 게이트를 앞당겨 여는 데 쓰는 열쇠.",
    firstAppearance: "79화",
    attributes: {},
    tags: ["열쇠", "균열교", "복선"],
    aiStatus: "Needs Review",
  }),
];

const rel = (
  id: string,
  sourceId: string,
  type: string,
  targetId: string,
  extra?: Partial<Relation>
): Relation => ({
  id,
  sourceId,
  targetId,
  type,
  origin: "mock",
  createdAt: T0,
  ...extra,
});

export const mockRelations: Relation[] = [
  // 정체성(빙의) — 이서준의 몸에 강도현의 의식
  rel("rel1", "c1", "빙의", "", { targetLabel: "강도현 (전생 의식)", evidence: "1화 빙의 각성" }),
  // 소속
  rel("rel2", "c1", "소속", "o2"),
  rel("rel3", "c3", "소속", "o2"),
  rel("rel4", "c4", "소속", "o2"),
  rel("rel5", "c11", "소속", "o2"),
  rel("rel6", "c2", "소속", "o3"),
  rel("rel7", "c10", "소속", "o3"),
  rel("rel8", "c9", "소속", "o1"),
  rel("rel9", "c8", "소속", "o4"),
  rel("rel10", "c12", "소속", "o4"),
  rel("rel11", "c6", "소속", "o5"),
  // 거점
  rel("rel12", "o2", "거점", "l4"),
  rel("rel13", "o3", "거점", "l5"),
  rel("rel14", "o1", "거점", "l3"),
  rel("rel15", "o5", "거점", "l1"),
  rel("rel16", "o4", "거점", "l8"),
  // 인물 관계
  rel("rel17", "c7", "가족", "c1", { evidence: "이서준의 여동생" }),
  rel("rel18", "c4", "조력자", "c1", { evidence: "소꿉친구 · 파트너" }),
  rel("rel19", "c3", "조력자", "c1", { evidence: "정체를 눈치챈 부관" }),
  rel("rel20", "c11", "조력자", "c1"),
  rel("rel21", "c1", "적대", "c2", { evidence: "현생 라이벌" }),
  rel("rel22", "c1", "적대", "o4", { evidence: "균열교와 대립" }),
  rel("rel23", "c12", "적대", "c1", { evidence: "최종 흑막" }),
  rel("rel24", "c10", "적대", "c1"),
  rel("rel25", "c2", "조력자", "c1", { evidence: "97화 전생 기억 후 공조", episode: "97화" }),
  rel("rel26", "c5", "은인", "c1", { evidence: "회귀를 부여한 존재" }),
  // 사건-장소
  rel("rel27", "e1", "장소", "l6"),
  rel("rel28", "e2", "장소", "l9"),
  rel("rel29", "e3", "장소", "l7"),
  rel("rel30", "e4", "장소", "l3"),
  rel("rel31", "e6", "장소", "l4"),
  rel("rel32", "e8", "장소", "l1"),
  rel("rel33", "e10", "장소", "l10"),
  rel("rel34", "e13", "장소", "l2"),
  rel("rel35", "e14", "장소", "l6"),
  // 소유·아이템
  rel("rel36", "i2", "소유자", "c1"),
  rel("rel37", "i3", "소유자", "c1"),
  rel("rel38", "i5", "소유자", "o4"),
  // 규칙 적용
  rel("rel39", "r2", "적용대상", "c1", { evidence: "등급 불변 — 위장 등급" }),
  rel("rel40", "r3", "적용대상", "c1", { evidence: "회귀 대상" }),
  rel("rel41", "r4", "적용대상", "c1"),
  rel("rel42", "r1", "사용조건", "", { targetLabel: "제한시간 초과 시 브레이크" }),
  // 사건 인과
  rel("rel43", "e2", "관련사건", "e1", { evidence: "회귀 → 빙의" }),
  rel("rel44", "e8", "관련사건", "e7", { evidence: "균열교 준동 → 상암 붕괴" }),
  rel("rel45", "e10", "관련사건", "e4", { evidence: "E급 → C급 표기" }),
  rel("rel46", "e13", "관련사건", "e12", { evidence: "분기 → 부산 생존" }),
  rel("rel47", "e12", "관련사건", "e8", { evidence: "상암의 상실이 분기 선택을 부름" }),
  // 인물 사이 사건 연결선 (설정 지도에서 선 위에 사건 이름 표시)
  rel("ev1", "c5", "빙의 각성", "c1", { kind: "event", eventId: "e2", episode: "1화" }),
  rel("ev2", "c1", "상암 게이트 붕괴", "c6", { kind: "event", eventId: "e8", episode: "47화" }),
  rel("ev3", "c1", "부산의 생존자", "c6", { kind: "event", eventId: "e13", episode: "89화" }),
  rel("ev4", "c2", "윤가람과의 대립", "c1", { kind: "event", eventId: "e11", episode: "66화" }),
  rel("ev5", "c8", "균열교의 준동", "c1", { kind: "event", eventId: "e7", episode: "41화" }),
  rel("ev6", "c11", "백나래 스카우트", "c1", { kind: "event", eventId: "e5", episode: "18화" }),
];

export const mockConflicts: Conflict[] = [
  {
    id: "cf1",
    title: "주인공 각성 등급이 뒤바뀜 (E급 → C급)",
    type: "숫자/시간 오류",
    severity: "high",
    description:
      "각성 등급은 한 번 정해지면 바뀌지 않는다는 규칙(각성 등급 불변)이 있는데, 주인공의 등급이 12화 E급에서 58화 C급으로 서술됩니다. 그 사이 재각성 사건이 없습니다.",
    evidenceA: "12화 “협회는 이서준에게 최하위 E급 판정을 내렸다.”",
    evidenceB: "58화 “재측정 서류의 등급란에는 C급이라 적혀 있었다.”",
    recommendation:
      "위장 등급이 들통난 설정이라면 재각성/재측정 사건을 명시하거나, 표기를 ‘E급(위장)’으로 통일하세요.",
    relatedBlockIds: ["c1", "r2"],
    status: "open",
    location: { episode: "58화", sentence: "“재측정 서류의 등급란에는 C급이라 적혀 있었다.”" },
    fixGuide: [
      "58화의 C급을 ‘E급(위장)’으로 되돌린다.",
      "등급이 오른 이유(재측정·정체 노출)를 사건으로 명시한다.",
      "설정 카드(각성 등급 불변)를 기준으로 전 회차 등급 표기를 점검한다.",
    ],
  },
  {
    id: "cf2",
    title: "죽은 인물이 살아서 등장 (하은채)",
    type: "인물 상태 오류",
    severity: "high",
    description:
      "하은채는 47화 서울 상암 게이트에서 전사했는데, 89화 부산 해운대 게이트에 살아서 등장합니다. 부활이나 생존을 설명하는 서술이 없습니다.",
    evidenceA: "47화 “하은채는 상암 게이트의 무너지는 균열 아래에서 끝내 숨을 거뒀다.”",
    evidenceB: "89화 “부산 해운대 게이트의 포탈 앞에서, 하은채가 활을 겨눈 채 웃었다.”",
    recommendation:
      "88화 회귀 분기로 하은채가 산 것이 의도라면, 89화 앞에 ‘세계선이 바뀌어 상암에 가지 않았다’는 연결을 명시하세요. 의도가 아니라면 한쪽을 고쳐야 합니다.",
    relatedBlockIds: ["c6", "l1", "l2"],
    status: "open",
    location: { episode: "89화", sentence: "“부산 해운대 게이트의 포탈 앞에서, 하은채가 활을 겨눈 채 웃었다.”" },
    fixGuide: [
      "88화 분기와 89화 생존을 잇는 설명(배치 변경)을 본문에 넣는다.",
      "의도가 아니라면 89화의 하은채를 다른 인물로 바꾼다.",
      "설정 카드(하은채)의 생사 속성을 회차별로 나눠 관리한다.",
    ],
  },
  {
    id: "cf3",
    title: "창설 전인 길드가 이미 등장 (백호 길드)",
    type: "사건 순서 오류",
    severity: "medium",
    description:
      "백호 길드는 30화에 창설되는데, 18화 대사에서 이미 ‘백호 길드의 이름으로’ 활동하는 것처럼 언급됩니다.",
    evidenceA: "30화 “백호 길드가 협회 인가를 받아 정식으로 창설되었다.”",
    evidenceB: "18화 “그는 백호 길드의 이름으로 함께 가자고 손을 내밀었다.”",
    recommendation: "18화의 대사를 ‘앞으로 세울 길드’처럼 미래형으로 바꾸거나, 창설 시점을 앞당기세요.",
    relatedBlockIds: ["o2"],
    status: "open",
    location: { episode: "18화", sentence: "“그는 백호 길드의 이름으로 함께 가자고 손을 내밀었다.”" },
    fixGuide: [
      "18화 대사를 ‘내가 세울 길드’처럼 미래형으로 고친다.",
      "백호 길드 창설(30화)을 18화 이전으로 옮긴다.",
    ],
  },
  {
    id: "cf4",
    title: "소꿉친구가 초면처럼 소개됨 (채린)",
    type: "관계 충돌",
    severity: "medium",
    description:
      "채린은 이서준의 어릴 적 소꿉친구로 설정돼 있는데, 34화에서 ‘처음 보는 힐러’로 소개됩니다.",
    evidenceA: "설정: 채린은 이서준과 어릴 적부터 알고 지낸 소꿉친구다.",
    evidenceB: "34화 “처음 보는 힐러가 팀에 합류했다. 이름은 채린이라 했다.”",
    recommendation: "34화의 소개를 ‘오랜만에 다시 만난’으로 바꾸세요. 빙의로 태도가 달라졌을 뿐 관계는 그대로입니다.",
    relatedBlockIds: ["c4", "c1"],
    status: "open",
    location: { episode: "34화", sentence: "“처음 보는 힐러가 팀에 합류했다.”" },
    fixGuide: [
      "34화 소개를 ‘어릴 적 친구 채린이 다시 합류했다’로 고친다.",
      "빙의로 서먹해진 것과 초면인 것을 구분해 서술한다.",
    ],
  },
  {
    id: "cf5",
    title: "제한시간을 넘겼는데 브레이크가 없음",
    type: "세계관 규칙 위반",
    severity: "medium",
    description:
      "게이트는 제한시간 내 공략하지 못하면 브레이크가 일어난다는 규칙이 있는데, 51화에서 공략이 사흘이나 지체됐는데도 게이트가 조용합니다.",
    evidenceA: "규칙 “게이트를 제한시간 내 공략하지 못하면 브레이크가 일어난다.”",
    evidenceB: "51화 “공략은 사흘이나 지체됐지만, 상암 게이트는 조용했다.”",
    recommendation: "브레이크가 지연된 이유(균열교의 개입, 특수 게이트)를 설명하거나, 지체 시간을 제한시간 안으로 줄이세요.",
    relatedBlockIds: ["r1", "l1"],
    status: "open",
    location: { episode: "51화", sentence: "“공략은 사흘이나 지체됐지만, 상암 게이트는 조용했다.”" },
    fixGuide: [
      "브레이크가 늦춰진 특수 사유를 본문에 넣는다.",
      "51화의 지체 시간을 제한시간 내로 줄인다.",
    ],
  },
  {
    id: "cf6",
    title: "채린의 등급이 다름 (C급 → B급)",
    type: "인물 상태 오류",
    severity: "low",
    description: "채린은 C급 힐러로 설정돼 있는데, 72화에서 B급 힐러로 나옵니다.",
    evidenceA: "설정: 채린은 C급 힐러다.",
    evidenceB: "72화 “B급 힐러 채린이 앞으로 나섰다.”",
    recommendation: "채린이 승급했다면 승급 사건을 넣고, 아니라면 72화를 C급으로 고치세요.",
    relatedBlockIds: ["c4"],
    status: "open",
    location: { episode: "72화", sentence: "“B급 힐러 채린이 앞으로 나섰다.”" },
    fixGuide: ["72화를 ‘C급 힐러 채린’으로 고친다.", "승급했다면 그 사건을 별도로 넣는다."],
  },
  {
    id: "cf7",
    title: "백호 길드원 수가 오락가락함",
    type: "숫자/시간 오류",
    severity: "low",
    description: "45화에서는 백호 길드원이 열두 명인데, 63화에서는 여덟 명으로 줄어 있습니다. 이탈 서술이 없습니다.",
    evidenceA: "45화 “백호 길드원은 이제 열두 명이 되었다.”",
    evidenceB: "63화 “여덟 명뿐인 백호 길드는 여전히 작았다.”",
    recommendation: "길드원 수를 하나로 통일하거나, 인원이 준 이유(이탈·전사)를 넣으세요.",
    relatedBlockIds: ["o2"],
    status: "open",
    location: { episode: "63화", sentence: "“여덟 명뿐인 백호 길드는 여전히 작았다.”" },
    fixGuide: ["길드원 수를 한쪽으로 통일한다.", "인원이 준 사건을 넣어 흐름을 맞춘다."],
  },
  {
    id: "cf8",
    title: "여동생이 누나로 불림 (이수아)",
    type: "가족 관계 오류",
    severity: "low",
    description: "이수아는 이서준의 여동생으로 설정돼 있는데, 26화에서 ‘누나’로 나옵니다.",
    evidenceA: "설정: 이수아는 이서준의 여동생이다.",
    evidenceB: "26화 “누나 이수아가 걱정스러운 눈으로 그를 보았다.”",
    recommendation: "26화의 ‘누나’를 ‘여동생’으로 고치세요.",
    relatedBlockIds: ["c7", "c1"],
    status: "open",
    location: { episode: "26화", sentence: "“누나 이수아가 걱정스러운 눈으로 그를 보았다.”" },
    fixGuide: ["26화의 ‘누나’를 ‘여동생’으로 고친다."],
  },
  {
    id: "cf9",
    title: "주인공이 아직 없던 사건을 미리 앎 (의도된 설정)",
    type: "숫자/시간 오류",
    severity: "low",
    description:
      "도현이 아직 일어나지 않은 사건을 미리 아는 장면이 반복됩니다. 얼핏 시점 오류처럼 보이지만, 회귀 설정(회귀 법칙)상 전생 기억이므로 의도된 연출입니다. — ‘의도됨’으로 표시해 검사에서 제외했습니다.",
    evidenceA: "9화 “도현은 아직 열리지도 않은 게이트의 위치를 정확히 짚었다.”",
    evidenceB: "규칙 “강도현은 죽으면 10년 전으로 회귀하며 기억을 유지한다.”",
    recommendation: "오류가 아니라 회귀 설정입니다. ‘의도됨’으로 두면 검사가 이 장면을 진짜 오류와 구분합니다.",
    relatedBlockIds: ["c1", "r3"],
    status: "ignored",
    location: { episode: "9화", sentence: "“도현은 아직 열리지도 않은 게이트의 위치를 정확히 짚었다.”" },
    fixGuide: ["회귀 설정임을 캐논 노트에 명시한다.", "‘의도됨’으로 표시해 검사 대상에서 제외한다."],
  },
];

export const mockProject: Project = {
  id: "p1",
  title: "두 번째 각성",
  genre: "현대 판타지 / 회귀 · 빙의 / 헌터",
  logline:
    "종말급 게이트에서 죽은 S급 헌터의 의식이, 10년 전 폐급 각성자의 몸에서 눈을 뜬다. 전생의 지식으로 남의 몸·이름으로 다시 각성해 정해진 파멸을 뒤집으려 하지만, 회차를 반복할수록 미래가 어긋난다.",
  summary:
    "세계 최강이라 불리던 S급 헌터 강도현은 인류를 삼킨 종말급 게이트 〈흑일〉에서 동료를 모두 잃고 죽는다. 다음 순간 그는 10년 전, 각성에 실패해 폐급으로 조롱받던 이서준의 몸에서 눈을 뜬다(빙의+회귀, 3회차). 그는 등급을 숨긴 채 백호 길드를 세우고, 전생 지식으로 재앙을 앞질러 막으려 한다. 그러나 47화 상암 게이트에서 신입 하은채를 구하지 못하며 '지식이 곧 구원은 아님'을 뼈저리게 안다. 88화, 도현은 전생엔 없던 선택으로 세계선을 바꾸고, 89화 부산에서 죽었어야 할 하은채가 살아 돌아온다. 청랑 길드 윤가람(전생 동료)과 균열교, 그리고 회귀의 근원 '에르그'를 향해, 3회차의 도현은 전생과 다른 결말을 향해 나아간다.\n\n[100화 아웃라인 요약]\n1부(1~20화) 빌린 몸의 각성·실력 증명·위장. 2부(21~40화) 백호 길드 창설과 세력화. 3부(41~60화) 상암의 첫 상실과 재측정. 4부(61~80화) 청랑과의 대립·정체 발각·균열교. 5부(81~100화) 회귀 분기·부산 생존·흑일 재대면. (전체 회차별 비트는 content/outline.md 참고)",
  episodes: [
    { id: "ep1", title: "1화 두 번째 눈뜸", number: 1, summary: "흑일에서 죽은 강도현이 이서준의 몸에서 눈뜬다. 빙의+회귀(3회차).", wordCount: 3200, date: { year: 1, season: "봄", label: "회귀 3회차 · 각성" } },
    { id: "ep4", title: "4화 수문 던전", number: 4, summary: "폐급의 몸으로 불가능한 D급 던전 공략을 해내 협회의 주목을 받는다.", wordCount: 3050, date: { year: 1, season: "봄", label: "실력 증명" } },
    { id: "ep12", title: "12화 E급", number: 12, summary: "협회 등급 판정에서 최하위 E급을 받는다(위장 성공).", wordCount: 2980, date: { year: 1, season: "여름", label: "위장" } },
    { id: "ep18", title: "18화 첫 동료", number: 18, summary: "백나래를 스카우트하며 길드 창설을 준비한다.", wordCount: 3100, date: { year: 1, season: "여름", label: "길드 준비" } },
    { id: "ep30", title: "30화 백호", number: 30, summary: "이서준의 이름으로 백호 길드를 정식 창설한다.", wordCount: 3300, date: { year: 1, season: "가을", label: "길드 창설" } },
    { id: "ep41", title: "41화 공략대", number: 41, summary: "균열교의 준동으로 협회가 상암 공략대를 편성한다.", wordCount: 3150, date: { year: 1, season: "가을", label: "전조" } },
    { id: "ep47", title: "47화 상암", number: 47, summary: "상암 게이트 붕괴. 하은채가 대원들을 지키다 전사한다.", wordCount: 3600, date: { year: 1, season: "겨울", label: "첫 상실" } },
    { id: "ep52", title: "52화 어긋남", number: 52, summary: "전생과 달라진 미래 앞에서 도현이 처음으로 크게 흔들린다.", wordCount: 3000, date: { year: 1, season: "겨울", label: "회차 간섭" } },
    { id: "ep58", title: "58화 C급", number: 58, summary: "협회 재측정 서류에 C급으로 표기된다(등급 불변과 충돌).", wordCount: 2950, date: { year: 2, season: "봄", label: "재측정" } },
    { id: "ep66", title: "66화 대립", number: 66, summary: "청랑 길드 윤가람과 첫 공식 대립. 서로의 실력을 인정한다.", wordCount: 3250, date: { year: 2, season: "봄", label: "라이벌" } },
    { id: "ep82", title: "82화 발각", number: 82, summary: "서문기가 도현의 정체(회귀·빙의)를 확신하고 곁을 지킨다.", wordCount: 3200, date: { year: 2, season: "여름", label: "정체" } },
    { id: "ep88", title: "88화 분기", number: 88, summary: "전생엔 없던 선택으로 하은채를 부산 작전에 배치한다. 세계선이 갈린다.", wordCount: 3400, date: { year: 2, season: "여름", label: "회귀 분기" } },
    { id: "ep89", title: "89화 해운대", number: 89, summary: "부산 해운대 게이트. 죽었어야 할 하은채가 살아 함께 싸운다.", wordCount: 3500, date: { year: 2, season: "여름", label: "분기의 증거" } },
    { id: "ep100", title: "100화 흑일 재대면", number: 100, summary: "전생 전멸의 무대 흑일이 다시 열린다. 다른 결말을 향해.", wordCount: 4000, date: { year: 2, season: "가을", label: "결말" } },
  ],
  canonRules: [
    "강도현은 죽으면 10년 전 이서준의 몸으로 회귀하며 기억을 유지한다.",
    "한 번 판정된 각성 등급은 바뀌지 않는다.",
    "게이트를 제한시간 내 공략하지 못하면 브레이크가 일어난다.",
    "회차가 반복될수록 세계선이 미세하게 달라진다(전생 지식의 오차).",
  ],
  generationConstraints: [
    "도현의 정체(강도현·회귀·빙의)를 아군에게 함부로 밝히지 않는다.",
    "흑관(균열교 교주)의 정체는 후반부 전까지 밝히지 않는다.",
    "에르그가 회차의 이유를 명확히 설명하는 장면은 마지막까지 아낀다.",
  ],
  forbiddenSettings: [
    "재각성 사건 없이 각성 등급이 오르내리는 전개 금지",
    "죽은 인물이 설명 없이 부활하는 전개 금지(88화 분기 제외)",
    "전생 지식이 100% 그대로 들어맞는 전개 금지(회차 간섭 위반)",
  ],
};

/** 회차별 원고 제목(있으면 사용, 없으면 'N화 원고') */
const MANUSCRIPT_TITLES: Record<number, string> = {
  1: "두 번째 눈뜸",
  4: "수문 던전",
  12: "E급",
  18: "첫 동료",
  30: "백호",
  41: "공략대",
  47: "상암",
  52: "어긋남",
  58: "C급",
  66: "대립",
  74: "재의 갱도",
  82: "발각",
  88: "분기",
  89: "해운대",
  93: "봉인",
  100: "흑일 재대면",
};

/** 작가가 100편의 원고를 통째로 올렸다는 규모감을 위해 1~100화 원고를 모두 학습 기록으로 둔다. */
function buildManuscriptSources(): MemorySource[] {
  const base = Date.parse("2026-06-02T10:00:00.000Z");
  const out: MemorySource[] = [];
  for (let n = 1; n <= 100; n++) {
    const title = MANUSCRIPT_TITLES[n] ? `${n}화 ${MANUSCRIPT_TITLES[n]}` : `${n}화 원고`;
    out.push({
      id: `ms${n}`,
      title,
      sourceType: "manuscript",
      learnedItems: 4 + ((n * 7) % 8),
      status: "synced",
      updatedAt: new Date(base + n * 60000).toISOString(),
    });
  }
  return out;
}

export const mockMemorySources: MemorySource[] = [
  ...buildManuscriptSources(),
  { id: "ms-excel", title: "설정 정리표 (엑셀)", sourceType: "excel", learnedItems: 11, status: "synced", updatedAt: "2026-06-02T11:41:00.000Z" },
  { id: "ms-memo", title: "인물·세계관 메모", sourceType: "manual", learnedItems: 5, status: "synced", updatedAt: "2026-06-02T11:42:00.000Z" },
];

export const mockNotes: ProjectNote[] = [
  {
    id: "n1",
    title: "각성 등급 표기 통일",
    content:
      "도현(이서준)의 표면 등급은 ‘E급(위장)’으로 통일한다. 재각성/정체 노출 사건 없이 등급이 오르는 표기는 설정 오류(각성 등급 불변)다. 58화 C급 표기 주의.",
    relatedBlockIds: ["c1", "r2"],
    createdAt: T0,
  },
  {
    id: "n2",
    title: "하은채 생사 분기 관리",
    content:
      "하은채는 47화(상암)에서 전사, 88화 분기 이후 89화(부산)에서 생존. 이 둘은 세계선이 갈린 결과이므로, 89화 앞에 배치 변경을 반드시 연결해 ‘부활’로 보이지 않게 한다.",
    relatedBlockIds: ["c6", "e12"],
    createdAt: T0,
  },
  {
    id: "n3",
    title: "에르그 정체 복선",
    content: "관리자 에르그가 회차를 반복시키는 이유는 99화 전까지 아끼기. 초반엔 시스템 메시지 발신자로만 노출.",
    relatedBlockIds: ["c5", "r3"],
    createdAt: T0,
  },
  {
    id: "n4",
    title: "윤가람 전생 기억",
    content: "윤가람의 기시감(전생 동료)은 66화 대립 → 97화 각성으로 회수. 그 전까지 ‘설명 못 할 익숙함’으로만 흘린다.",
    relatedBlockIds: ["c2", "c1"],
    createdAt: T0,
  },
  {
    id: "n5",
    title: "회귀 지식의 오차",
    content: "회차 간섭 규칙 때문에 전생 지식이 100% 맞으면 안 된다. 상암(47화)처럼 어긋나는 지점을 의도적으로 배치해 긴장을 만든다.",
    relatedBlockIds: ["r6", "e8"],
    createdAt: T0,
  },
];

/** 온보딩에서 보여줄 가상의 파일 목록 */
export interface OnboardingFile {
  id: string;
  name: string;
  kind: "원고" | "설정표" | "메모";
  icon: string;
  detail: string;
  /** 원고 회차 번호 */
  seq?: number;
}

/** 작가의 PC에 있는 원고 총 편수 */
export const MANUSCRIPT_TOTAL = 100;

/** 1~100화 원고 + 설정표·메모를 모두 만든다(온보딩에서 전부 보여 준다). */
function buildOnboardingFiles(): OnboardingFile[] {
  const out: OnboardingFile[] = [];
  for (let n = 1; n <= MANUSCRIPT_TOTAL; n++) {
    const name = MANUSCRIPT_TITLES[n] ? `${n}화 ${MANUSCRIPT_TITLES[n]}.txt` : `${n}화 원고.txt`;
    out.push({
      id: `f${n}`,
      seq: n,
      name,
      kind: "원고",
      icon: "doc",
      detail: `${(2800 + ((n * 37) % 900)).toLocaleString()}자`,
    });
  }
  out.push({ id: "fx", name: "설정 정리표.xlsx", kind: "설정표", icon: "table", detail: "인물·장소·규칙 11건" });
  out.push({ id: "fm", name: "인물·세계관 메모.txt", kind: "메모", icon: "file-text", detail: "도현·윤가람·에르그 메모" });
  return out;
}

export const ONBOARDING_FILES: OnboardingFile[] = buildOnboardingFiles();

/** 엑셀(설정표) 업로드 미리보기용 목데이터 */
export interface ExcelRow {
  type: string;
  name: string;
  description: string;
  episode: string;
  attribute: string;
  relationSource: string;
  relationType: string;
  relationTarget: string;
  tags: string;
}

export const excelPreviewRows: ExcelRow[] = [
  {
    type: "character",
    name: "진서율",
    description: "지하 경매장의 정보상. 회색지대에서 도현에게 정보를 파는 조력자.",
    episode: "14화",
    attribute: "역할=정보상",
    relationSource: "진서율",
    relationType: "조력자",
    relationTarget: "이서준〈강도현〉",
    tags: "정보상, 회색지대, 조력자",
  },
  {
    type: "location",
    name: "지하 경매장",
    description: "아이템과 정보가 거래되는 회색지대.",
    episode: "14화",
    attribute: "위치=구도심 지하",
    relationSource: "지하 경매장",
    relationType: "거점",
    relationTarget: "진서율",
    tags: "경매장, 회색지대",
  },
  {
    type: "event",
    name: "재의 갱도 쟁탈전",
    description: "각성석 광산을 두고 백호와 균열교가 충돌하는 74화 사건.",
    episode: "74화",
    attribute: "중요도=높음",
    relationSource: "재의 갱도 쟁탈전",
    relationType: "장소",
    relationTarget: "재의 갱도",
    tags: "각성석, 쟁탈전",
  },
  {
    type: "rule",
    name: "코어 회수 법칙",
    description: "게이트 최심부의 코어를 부수면 게이트가 닫힌다. 코어는 각성석의 원료.",
    episode: "4화",
    attribute: "적용대상=모든 게이트",
    relationSource: "코어 회수 법칙",
    relationType: "적용대상",
    relationTarget: "게이트 코어",
    tags: "세계관 규칙, 게이트",
  },
];

export const excelRelationRows = [
  { source: "진서율", type: "조력자", target: "이서준〈강도현〉" },
  { source: "지하 경매장", type: "거점", target: "진서율" },
  { source: "재의 갱도 쟁탈전", type: "장소", target: "재의 갱도" },
  { source: "코어 회수 법칙", type: "적용대상", target: "게이트 코어" },
];

export const RELATION_TYPES = [
  "가족",
  "형제",
  "소속",
  "적대",
  "은인",
  "조력자",
  "소유자",
  "거점",
  "장소",
  "빙의",
  "적용대상",
  "사용조건",
  "원인",
  "결과",
  "배신",
  "약속",
  "관련사건",
];

// ── 회차별 세계관 지도(아틀라스) 목데이터 ──────────────────
// 타일 팔레트(내부 식별자). WorldAtlas가 무채색 스타일 + 헌터용 라벨로 그린다.
//   floor/wall=구조물, water=포탈/바다, sand=해변, path=통로, grass/soil/tree=옥외,
//   gourd=균열, pot=각성석/보급, rice=설비 (semantic repurpose)

const TILE_OF: Record<string, Tile> = {
  " ": "void",
  ",": "grass",
  ".": "soil",
  ":": "path",
  "#": "floor",
  "=": "wall",
  "~": "water",
  "'": "sand",
  T: "tree",
  R: "rice",
  G: "gourd",
  o: "pot",
};

/** 14칸 너비로 행을 맞춘다(부족하면 빈칸으로 채움). */
function row14(s: string): Tile[] {
  const padded = (s + "              ").slice(0, 14);
  return padded.split("").map((ch) => TILE_OF[ch] ?? "void");
}

function makeStage(zoneId: string, name: string, rows: string[]): StageMap {
  const grid = rows.map(row14);
  return { id: `stage-${zoneId}`, zoneId, name, width: 14, height: grid.length, grid };
}

export const mockZones: MapZone[] = [
  { id: "z-home", kind: "home", name: "이서준의 집", blockId: "l9", blurb: "반지하 원룸. 빙의한 도현이 처음 눈뜬 곳. 낡은 단검이 놓여 있다." },
  { id: "z-sumun", kind: "faraway", name: "수문 던전", blockId: "l7", blurb: "D급 던전. 폐급의 몸으로 불가능한 공략을 해내 협회의 눈에 든 곳." },
  { id: "z-assoc", kind: "home", name: "헌터 협회 본부", blockId: "l3", blurb: "여의도. 각성 등급 판정소와 게이트 관제의 심장부." },
  { id: "z-baekho", kind: "home", name: "백호 길드 본부", blockId: "l4", blurb: "합정. 도현이 이서준의 이름으로 세운 신생 길드의 거점." },
  { id: "z-sangam", kind: "village", name: "서울 상암 게이트", blockId: "l1", blurb: "A급 게이트. 47화 붕괴 사건의 무대. 하은채가 전사한 곳." },
  { id: "z-haeundae", kind: "village", name: "부산 해운대 게이트", blockId: "l2", blurb: "A급 게이트. 89화 무대. 죽었어야 할 하은채가 살아 돌아온 곳." },
  { id: "z-heukil", kind: "faraway", name: "흑일 게이트", blockId: "l6", blurb: "종말급 게이트. 전생 전멸의 무대이자 회귀의 시작점." },
];

export const mockStages: StageMap[] = [
  makeStage("z-home", "반지하 원룸", [
    "==============",
    "=############=",
    "=#..o.....##=,",
    "=#........##=,",
    "=#...##...##=,",
    "=#...##....#=,",
    "=#........:#=,",
    "=#####::####=,",
    "==============",
  ]),
  makeStage("z-sumun", "수문 던전 최심부", [
    "==============",
    "=####~~~~####=",
    "=###~~~~~~##G=",
    "=##~~~~~~~~#G=",
    "::#~~~GG~~~#::",
    "=##~~~~~~~~#o=",
    "=###~~~~~~##o=",
    "=####~~~~####=",
    "==============",
  ]),
  makeStage("z-assoc", "협회 판정소", [
    "==============",
    "=RR#######RR#=",
    "=RR#o...o#RR#=",
    "=##......###:=",
    "::::......::::",
    "=##......###:=",
    "=RR#o...o#RR#=",
    "=RR########R#=",
    "==============",
  ]),
  makeStage("z-baekho", "백호 길드 본부", [
    ",,============",
    ",,=####RR####=",
    ",,=#..o..o.##=",
    "::::........::",
    ",,=#..oGo..##=",
    ",,=#......###=",
    ",,=####::####=",
    ",,==========,,",
    ",,,,,,,,,,,,,,",
  ]),
  makeStage("z-sangam", "상암 게이트 (붕괴)", [
    "==== ==  =====",
    "=##= .. G ##=,",
    "=#.  GG~~G .#=",
    ":.  ~~~~~~  .:",
    ".  ~~GGGG~~  .",
    ":.  ~~~~~~  .:",
    "=#.  G~~G  .#=",
    "=##=  ..  =##=",
    "== ===  ===  =",
  ]),
  makeStage("z-haeundae", "해운대 게이트 (해변)", [
    "~~~~~~~~~~~~~~",
    "~~~~~~~~~~~~~~",
    "''''~~~~~~''''",
    "'''''~GG~'''''",
    ".''''~~~~''''.",
    ":.'''''''''.::",
    ",,.''''''''.,,",
    ",T,,.''''.,,T,",
    ",,,,,,,,,,,,,,",
  ]),
  makeStage("z-heukil", "흑일 게이트", [
    "==============",
    "=  GG    GG  =",
    "= G~~G  G~~G =",
    "=  GG    GG  =",
    "=    GGGG    =",
    "=  GG    GG  =",
    "= G~~G  G~~G =",
    "=  GG    GG  =",
    "==============",
  ]),
];

export const mockPlacements: CharacterPlacement[] = [
  // 1화 — 이서준의 집 (빙의 각성)
  { episodeId: "ep1", characterId: "c1", zoneId: "z-home", x: 6, y: 4, activity: "이서준의 몸에서 눈을 뜬다 (빙의)" },
  { episodeId: "ep1", characterId: "c5", zoneId: "z-home", x: 8, y: 3, activity: "〈세 번째 삶을 환영합니다〉 안내창을 띄운다" },
  { episodeId: "ep1", characterId: "c7", zoneId: "z-home", x: 3, y: 6, activity: "달라진 오빠를 조심스레 살핀다" },
  // 4화 — 수문 던전 (실력 증명)
  { episodeId: "ep4", characterId: "c1", zoneId: "z-sumun", x: 6, y: 4, activity: "전생 지식으로 코어를 정확히 노린다" },
  { episodeId: "ep4", characterId: "c4", zoneId: "z-sumun", x: 3, y: 4, activity: "변해버린 서준을 정찰 위치에서 지켜본다" },
  // 12화 — 협회 (E급 판정)
  { episodeId: "ep12", characterId: "c1", zoneId: "z-assoc", x: 6, y: 4, activity: "각성석에 손을 대 E급 판정을 받는다 (위장)" },
  { episodeId: "ep12", characterId: "c9", zoneId: "z-assoc", x: 9, y: 2, activity: "판정 결과를 의심스럽게 지켜본다" },
  // 30화 — 백호 길드 창설
  { episodeId: "ep30", characterId: "c1", zoneId: "z-baekho", x: 6, y: 3, activity: "백호 길드 창설 서류에 서명한다" },
  { episodeId: "ep30", characterId: "c3", zoneId: "z-baekho", x: 4, y: 4, activity: "부관으로서 곁을 지킨다" },
  { episodeId: "ep30", characterId: "c11", zoneId: "z-baekho", x: 8, y: 4, activity: "첫 길드원으로 합류를 확정한다" },
  // 41화 — 협회 (공략대 편성)
  { episodeId: "ep41", characterId: "c9", zoneId: "z-assoc", x: 6, y: 4, activity: "상암 공략대 편성을 지시한다" },
  { episodeId: "ep41", characterId: "c6", zoneId: "z-assoc", x: 4, y: 4, activity: "신입으로 공략대에 배정된다" },
  { episodeId: "ep41", characterId: "c1", zoneId: "z-assoc", x: 9, y: 5, activity: "다가올 붕괴를 홀로 예감한다" },
  // 47화 — 상암 게이트 붕괴 (하은채 전사)
  { episodeId: "ep47", characterId: "c6", zoneId: "z-sangam", x: 6, y: 4, activity: "무너지는 균열 아래로 뛰어들어 대원들을 밀어낸다" },
  { episodeId: "ep47", characterId: "c1", zoneId: "z-sangam", x: 3, y: 3, activity: "손을 뻗지만 닿지 못한다" },
  { episodeId: "ep47", characterId: "c8", zoneId: "z-sangam", x: 11, y: 6, activity: "그림자 속에서 봉인을 앞당겨 터뜨린다" },
  // 58화 — 협회 훈련장 (C급 재표기) — 여기선 협회로 표시
  { episodeId: "ep58", characterId: "c1", zoneId: "z-assoc", x: 6, y: 4, activity: "재측정 서류에서 C급 표기를 발견한다" },
  { episodeId: "ep58", characterId: "c9", zoneId: "z-assoc", x: 9, y: 3, activity: "위장이 흔들리는 도현을 주시한다" },
  // 82화 — 백호 (정체 발각)
  { episodeId: "ep82", characterId: "c3", zoneId: "z-baekho", x: 6, y: 3, activity: "도현의 정체(회귀·빙의)를 확신한다" },
  { episodeId: "ep82", characterId: "c1", zoneId: "z-baekho", x: 4, y: 4, activity: "오래 감춰온 진실 앞에 선다" },
  // 89화 — 부산 해운대 (하은채 생존)
  { episodeId: "ep89", characterId: "c1", zoneId: "z-haeundae", x: 5, y: 5, activity: "살아 있는 하은채를 보고 말을 잃는다" },
  { episodeId: "ep89", characterId: "c6", zoneId: "z-haeundae", x: 8, y: 5, activity: "활을 겨눈 채 웃는다 (분기의 증거)" },
  { episodeId: "ep89", characterId: "c4", zoneId: "z-haeundae", x: 3, y: 6, activity: "달라진 세계선을 함께 밟는다" },
  // 100화 — 흑일 재대면
  { episodeId: "ep100", characterId: "c1", zoneId: "z-heukil", x: 6, y: 4, activity: "전생 전멸의 무대에 다시 선다" },
  { episodeId: "ep100", characterId: "c2", zoneId: "z-heukil", x: 4, y: 4, activity: "전생 기억을 되찾은 채 어깨를 나란히 한다" },
  { episodeId: "ep100", characterId: "c5", zoneId: "z-heukil", x: 9, y: 3, activity: "회차의 의미를 처음으로 언급한다" },
];

export function buildLearnedState(): Omit<AppState, "onboarded" | "project"> & {
  project: Project;
} {
  return {
    project: structuredClone(mockProject),
    blocks: structuredClone(mockBlocks),
    relations: structuredClone(mockRelations),
    conflicts: structuredClone(mockConflicts),
    drafts: [],
    scenarios: [],
    notes: structuredClone(mockNotes),
    memorySources: structuredClone(mockMemorySources),
    chatHistory: [],
    checkedSuggestions: [],
    canonScore: 82,
    lastTrainedAt: new Date().toISOString(),
    zones: structuredClone(mockZones),
    stages: structuredClone(mockStages),
    placements: structuredClone(mockPlacements),
  };
}

/** 온보딩 전 빈 상태 */
export function buildEmptyState(): AppState {
  return {
    onboarded: false,
    project: {
      id: "p1",
      title: "",
      genre: "",
      logline: "",
      summary: "",
      episodes: [],
      canonRules: [],
      generationConstraints: [],
      forbiddenSettings: [],
    },
    blocks: [],
    relations: [],
    conflicts: [],
    drafts: [],
    scenarios: [],
    notes: [],
    memorySources: [],
    chatHistory: [],
    checkedSuggestions: [],
    canonScore: 0,
    lastTrainedAt: T0,
    zones: [],
    stages: [],
    placements: [],
  };
}

export function buildInitialState(): AppState {
  return { onboarded: true, ...buildLearnedState() };
}

// ── PlotRoom(캐릭터 회의실) 목데이터 ─────────────────────────

export const mockPersonas: CharacterPersona[] = [
  {
    characterId: "c1",
    speechStyle:
      "간결하고 단정적. 말을 아끼고 속내를 잘 드러내지 않는다. '됐어', '내가 안다', '아무도 안 죽어' 같은 짧은 문장을 쓴다. 전생 지식을 근거로 확신에 차 있다.",
    personality: ["냉정하고 계산적", "동료의 죽음만은 못 견딤", "정체를 숨기는 데 능함", "미래를 아는 자의 고독"],
    goals: ["흑일의 파멸을 막는 것", "이번엔 아무도 죽지 않게 하는 것", "정체(강도현·회귀)를 숨기는 것"],
    coreMemories: [
      { episode: "전생", content: "흑일 게이트에서 동료를 모두 잃고 스스로도 죽었다." },
      { episode: "1화", content: "이서준의 몸에서 눈을 떴다. 세 번째 삶." },
      { episode: "47화", content: "지식이 있어도 하은채를 구하지 못했다." },
      { episode: "89화", content: "선택을 바꾸자, 죽었어야 할 하은채가 살아 있었다." },
    ],
    forbiddenActions: [
      "정체(강도현·회귀·빙의)를 함부로 밝히기",
      "전생 지식을 근거 없이 남발하기",
      "동료를 미끼로 쓰기",
      "감정에 휩쓸려 계획을 깨기",
    ],
    ragSources: ["1화", "12화", "47화", "58화", "89화"],
  },
  {
    characterId: "c2",
    speechStyle:
      "오만하지만 정중한 존대. 강자를 존중한다. '흥미롭군', '자네', '증명해 보게' 같은 표현을 쓴다. 도현에게 설명 못 할 기시감을 느낀다.",
    personality: ["자존심이 강함", "강자를 인정하는 무인", "의심이 많음", "설명 못 할 기시감(전생)"],
    goals: ["최강임을 증명하는 것", "청랑 길드의 위세 유지", "도현의 정체를 밝혀내는 것"],
    coreMemories: [
      { episode: "11화", content: "무명의 실력자(도현)의 소문을 처음 들었다." },
      { episode: "66화", content: "도현과 부딪치며 오래 알던 사람 같은 익숙함을 느꼈다." },
      { episode: "97화", content: "전생 기억의 편린을 되찾고 도현과 공조했다." },
    ],
    forbiddenActions: ["약자를 함부로 짓밟기", "먼저 비겁하게 굴기", "기시감을 인정하기(97화 전까지)"],
    ragSources: ["11화", "66화", "97화"],
  },
  {
    characterId: "c3",
    speechStyle:
      "낮고 담담한 노장의 말투. 말수가 적고 핵심만 짚는다. '그 눈은 전장을 아는 눈이야', '자네가 누구든' 같은 표현을 쓴다.",
    personality: ["과묵하고 통찰력 있음", "전장을 읽는 눈", "도현의 정체를 눈치챔", "충직함"],
    goals: ["도현을 지키는 것", "백호 길드를 세우는 것", "정체를 알고도 곁을 지키는 것"],
    coreMemories: [
      { episode: "17화", content: "도현의 눈빛에서 전장을 아는 자의 그림자를 봤다." },
      { episode: "82화", content: "도현이 회귀·빙의한 자임을 확신했다. 그래도 곁을 지켰다." },
    ],
    forbiddenActions: ["도현의 정체를 남에게 발설하기", "전장에서 동요하기", "충심을 저버리기"],
    ragSources: ["17화", "30화", "82화"],
  },
  {
    characterId: "c4",
    speechStyle:
      "밝고 직설적이지만 예리하다. '너 진짜 서준이 맞아?', '뭔가 이상해' 같은 말로 툭툭 던진다. 걱정을 농담으로 감춘다.",
    personality: ["밝고 씩씩함", "예리한 관찰력", "이서준의 변화를 감지", "정 많음"],
    goals: ["팀을 살리는 것(힐러)", "달라진 서준의 정체를 알아내는 것", "곁을 지키는 것"],
    coreMemories: [
      { episode: "5화", content: "소꿉친구 서준이 완전히 달라진 것을 처음 느꼈다." },
      { episode: "76화", content: "도현에게 ‘너 누구야?’라고 직접 물었다." },
    ],
    forbiddenActions: ["동료를 두고 도망치기", "관찰을 포기하기", "정을 완전히 끊기"],
    ragSources: ["5화", "34화", "76화"],
  },
  {
    characterId: "c5",
    speechStyle:
      "사람처럼 말하지 않는다. 반투명 안내창의 시스템 문구로만 표현한다. 〈…〉 꺾쇠 안의 짧고 무심한 통보. 감정이 없고, 이유를 설명하지 않는다.",
    personality: ["기계적이고 무심함", "회차의 근원", "이유를 답하지 않음", "관측만 통보함"],
    goals: ["회차를 관측하고 기록하는 것", "(불명) 도현에게 반복을 시키는 목적"],
    coreMemories: [
      { episode: "1화", content: "〈세 번째 삶을 환영합니다.〉" },
      { episode: "47화", content: "〈세계선이 관측되었습니다.〉" },
      { episode: "89화", content: "〈미관측 분기에 진입했습니다.〉" },
    ],
    forbiddenActions: [
      "회차의 이유를 명확히 설명하기(99화 전까지)",
      "사람처럼 길게 대화하기",
      "감정을 드러내기",
    ],
    ragSources: ["1화", "47화", "89화"],
  },
];

export const MEETING_SITUATIONS: string[] = [
  "이번 게이트를 지금 공략할지, 전생 지식을 믿고 때를 기다릴지 도현이 결정해야 한다.",
  "청랑 길드 윤가람에게 협력을 청해야 할지 도현이 고민하고 있다.",
  "하은채를 상암이 아니라 부산 작전에 배치할지 정해야 한다. 세계선이 바뀔 수 있다.",
];

const meetingTurnsA: MeetingTurn[] = [
  {
    characterId: "c1",
    characterName: "이서준〈강도현〉",
    emotion: "냉정",
    statement:
      "지금 들어가면 전생과 배치가 다르다. 균열교가 손을 댄 흔적이 있어. 내 지식이 통하는지부터 확인하고, 하루만 늦춘다.",
    ragEpisodes: ["4화", "47화"],
    internalThought: "전생이 그대로 맞아떨어진 적이 없었다. 이번에도 어긋날 것이다.",
  },
  {
    characterId: "c3",
    characterName: "서문기",
    emotion: "담담",
    statement:
      "자네 판단을 믿네. 다만 하루를 늦추면 브레이크 제한시간이 빠듯해져. 물러설 선을 미리 정해 두지.",
    ragEpisodes: ["17화", "30화"],
    internalThought: "저 눈은 이미 이 전장을 겪어 본 자의 눈이다.",
  },
  {
    characterId: "c4",
    characterName: "채린",
    emotion: "걱정",
    statement:
      "또 혼자 다 짊어지려고 하지. 서준이… 아니, 너 요즘 진짜 미래를 아는 사람처럼 군다? 무섭게.",
    ragEpisodes: ["5화", "34화"],
    internalThought: "이 낯선 확신이 서준의 것이 아니라는 걸, 나만 아는 걸까.",
  },
  {
    characterId: "c2",
    characterName: "윤가람",
    emotion: "오만",
    statement:
      "E급이 게이트 배치를 읽는다고? 흥미롭군. 그 근거 없는 확신, 어디까지 맞나 지켜보겠네.",
    ragEpisodes: ["11화", "66화"],
    internalThought: "저 자를 보면 왜 오래 알던 것 같지.",
  },
  {
    characterId: "c5",
    characterName: "관리자 '에르그'",
    emotion: "무심",
    statement: "〈경고: 관측된 전생 데이터와 현재 세계선의 오차가 12% 이상입니다.〉",
    ragEpisodes: ["47화"],
    isAction: true,
  },
  {
    characterId: "c1",
    characterName: "이서준〈강도현〉",
    emotion: "결심",
    statement:
      "하루 늦춘다. 대신 후미 대원은 내가 직접 맡는다. 이번엔… 아무도 뒤에 두고 오지 않아.",
    ragEpisodes: ["47화", "89화"],
    internalThought: "하은채. 이번엔 반드시.",
  },
];

const meetingTurnsB: MeetingTurn[] = [
  {
    characterId: "c1",
    characterName: "이서준〈강도현〉",
    emotion: "망설임",
    statement:
      "윤가람에게 손을 내밀어야 하나. 전생엔 등을 맡겼던 자다. 하지만 지금의 그는 나를 모른다.",
    ragEpisodes: ["11화", "66화"],
    internalThought: "그를 다시 잃고 싶지 않다. 그게 약점이 될 걸 알면서도.",
  },
  {
    characterId: "c3",
    characterName: "서문기",
    emotion: "신중",
    statement: "청랑과 손잡으면 균열교를 막을 힘은 생기지. 대신 자네 정체를 캐려 들 걸세. 각오는 됐나.",
    ragEpisodes: ["82화"],
  },
  {
    characterId: "c2",
    characterName: "윤가람",
    emotion: "경계",
    statement:
      "백호의 그 E급이 내게 협력을 청한다? 재밌군. 하지만 자네가 뭘 숨기는지부터 말해야 손을 잡지.",
    ragEpisodes: ["66화"],
    internalThought: "이 익숙함의 정체를, 나는 왜 자꾸 캐고 싶은 걸까.",
  },
  {
    characterId: "c4",
    characterName: "채린",
    emotion: "직설",
    statement: "청랑이랑? 도지혁이 우리 뒤통수 친 게 몇 번인데. 나는 반대. …근데 네가 정하면 따를게.",
    ragEpisodes: ["34화"],
  },
  {
    characterId: "c1",
    characterName: "이서준〈강도현〉",
    emotion: "결단",
    statement:
      "숨기는 건 있다. 하지만 흑일 앞에선 그런 게 의미 없어져. 딱 필요한 만큼만 보여주고 손을 잡는다.",
    ragEpisodes: ["66화", "97화"],
    internalThought: "97화의 그를 믿는다. 언젠가 기억해 낼 테니.",
  },
];

const meetingTurnsC: MeetingTurn[] = [
  {
    characterId: "c1",
    characterName: "이서준〈강도현〉",
    emotion: "긴장",
    statement:
      "하은채를 상암이 아니라 부산으로 돌린다. 전생엔 없던 수다. 세계선이 어떻게 튈지 나도 몰라. 그래도 상암에서 다시 잃을 순 없어.",
    ragEpisodes: ["47화", "88화"],
    internalThought: "미래를 모르는 선택은 처음이다. 두렵다. 그런데 이상하게, 홀가분하다.",
  },
  {
    characterId: "c3",
    characterName: "서문기",
    emotion: "묵직",
    statement: "전생을 벗어나는 첫수로군. 지식이 사라진 자리에서 자네가 어떤 지휘관인지, 이제 진짜로 보이겠어.",
    ragEpisodes: ["82화"],
    internalThought: "이 아이는 미래를 아는 게 아니라, 미래를 바꾸려는 것이다.",
  },
  {
    characterId: "c6",
    characterName: "하은채",
    emotion: "씩씩함",
    statement: "부산이요? 좋아요. 어디든 상관없어요. 대장 곁이면 뒤는 제가 지킬게요.",
    ragEpisodes: ["47화"],
    internalThought: "왜 대장은 나를 볼 때마다 그렇게 아픈 얼굴을 하지.",
  },
  {
    characterId: "c4",
    characterName: "채린",
    emotion: "놀람",
    statement: "너 방금… 미래를 ‘모른다’고 했어? 처음이야, 그런 말. 뭔가 바뀌고 있는 거지?",
    ragEpisodes: ["76화"],
  },
  {
    characterId: "c5",
    characterName: "관리자 '에르그'",
    emotion: "무심",
    statement: "〈경고: 선택이 관측 범위를 벗어납니다. 이후 세계선은 예측 불가.〉",
    ragEpisodes: ["89화"],
    isAction: true,
  },
  {
    characterId: "c1",
    characterName: "이서준〈강도현〉",
    emotion: "결심",
    statement: "예측 불가라도 좋다. 정해진 죽음보다는 낫지. 하은채, 부산이다. 이번엔 반드시 데리고 나온다.",
    ragEpisodes: ["88화", "89화"],
    internalThought: "처음으로, 내가 아는 결말이 아닌 곳으로 간다.",
  },
];

export function getMockMeetingTurns(situation: string): MeetingTurn[] {
  if (situation.includes("윤가람") || situation.includes("청랑") || situation.includes("협력")) {
    return meetingTurnsB;
  }
  if (situation.includes("하은채") || situation.includes("부산") || situation.includes("배치") || situation.includes("분기")) {
    return meetingTurnsC;
  }
  return meetingTurnsA;
}

export const mockSubstoryCandidates: SubstoryCandidate[] = [
  {
    id: "sc1",
    type: "감정선 보강형",
    title: "빈방의 단검",
    summary:
      "빙의 직후, 도현이 이서준의 낡은 단검을 집어 드는 밤. 남의 몸·남의 기억 사이에서 '나는 누구인가'를 홀로 되짚는 조용한 장면.",
    keyMoment: "반지하 방, 손에 익지 않는 단검의 무게. 거울 속 낯선 얼굴과 오래 마주 본다.",
    riskLevel: "낮음",
    riskReason:
      "빙의 설정을 심화할 뿐 메인 플롯을 건드리지 않습니다. 도현의 내면과 빙의 흔적(r4)을 자연스럽게 조명합니다.",
    relatedCharacterIds: ["c1", "c7"],
    relatedEpisodes: ["1화", "2화"],
    relationLabel: "이서준〈강도현〉 ↔ 이수아",
    keywords: ["빙의", "정체성", "단검", "밤", "고독"],
  },
  {
    id: "sc2",
    type: "관계 변화형",
    title: "익숙한 낯선 사람",
    summary:
      "윤가람이 도현에게서 느끼는 설명 못 할 기시감을 그의 시점에서 짧게 조명한다. 전생 동료였음을 독자만 알게 하는 아이러니.",
    keyMoment: "대련이 끝난 뒤, 윤가람이 도현의 뒷모습을 오래 바라보며 '왜 낯익지'라고 중얼거린다.",
    riskLevel: "중간",
    riskReason:
      "윤가람의 기시감을 너무 이르게 드러내면 97화 기억 회수의 충격이 줄어듭니다. '설명 못 할 익숙함' 선에서 멈춰야 합니다.",
    relatedCharacterIds: ["c2", "c1"],
    relatedEpisodes: ["66화", "97화 이전"],
    relationLabel: "윤가람 ↔ 이서준〈강도현〉 (전생 동료)",
    keywords: ["기시감", "전생", "라이벌", "복선", "아이러니"],
  },
  {
    id: "sc3",
    type: "복선 회수형",
    title: "관측되지 않는 아이",
    summary:
      "하은채를 부산으로 돌린 뒤, 에르그의 시스템 메시지가 처음으로 '예측 불가'를 띄운다. 회귀 지식이 닿지 않는 첫 미래를 시각화한다.",
    keyMoment: "포탈 앞, 안내창에 뜨는 〈미관측 분기〉. 도현의 얼굴에 두려움과 옅은 희망이 함께 번진다.",
    riskLevel: "낮음",
    riskReason:
      "이미 심어 둔 회차 간섭(r6)과 88화 분기를 강화하는 회수입니다. 설정 위반이 없고 긴장을 끌어올립니다.",
    relatedCharacterIds: ["c1", "c6"],
    relatedEpisodes: ["88화", "89화"],
    relationLabel: "이서준〈강도현〉 ↔ 하은채",
    keywords: ["분기", "미관측", "회귀", "희망", "복선 회수"],
  },
  {
    id: "sc4",
    type: "갈등 확장형",
    title: "협회의 저울",
    summary:
      "도현의 등급이 재측정에서 흔들리자, 협회장 남궁현이 그를 '변수'로 다루기 시작한다. 아군도 적도 아닌 권력의 압박을 확장한다.",
    keyMoment: "재측정 서류를 사이에 둔 남궁현과 도현. 저울 위에 놓인 것은 등급이 아니라 정체다.",
    riskLevel: "중간",
    riskReason:
      "협회를 새 압박 축으로 키우면 이야기가 넓어지지만, 균열교 라인과 분산될 수 있습니다. 남궁현의 동기를 '질서'로 좁혀야 합니다.",
    relatedCharacterIds: ["c9", "c1"],
    relatedEpisodes: ["58화", "60화"],
    relationLabel: "남궁현 ↔ 이서준〈강도현〉",
    keywords: ["등급", "재측정", "권력", "변수", "압박"],
  },
  {
    id: "sc5",
    type: "코미디 완충형",
    title: "폐급의 첫 회식",
    summary:
      "백호 길드 창설 후 첫 회식. 냉정한 도현과 씩씩한 채린, 과묵한 서문기, 무뚝뚝한 백나래가 어설프게 어울리는 시끌벅적한 일상.",
    keyMoment: "‘E급 길드마스터’를 놀리는 채린과, 표정 하나 안 변하고 계산을 치우는 도현. 서문기가 옅게 웃는다.",
    riskLevel: "낮음",
    riskReason:
      "무거운 회귀 서사 사이의 완충으로, 길드원 관계를 데워 줍니다. 메인 플롯에 영향이 없고 캐릭터 매력을 높입니다.",
    relatedCharacterIds: ["c1", "c4"],
    relatedEpisodes: ["30화", "31화"],
    relationLabel: "백호 길드 (도현 ↔ 채린 ↔ 서문기)",
    keywords: ["회식", "일상", "웃음", "동료애", "완충"],
  },
];

/**
 * 캐릭터 회의 결과를 키워드 중심으로 요약한다.
 * 완성 문장이 아니라, 작가가 방향을 잡을 때 참고할 키워드·관계 관찰만 뽑는다.
 */
export function getMeetingKeywords(situation: string): MeetingKeywordSummary {
  if (situation.includes("윤가람") || situation.includes("협력") || situation.includes("청랑")) {
    return {
      keywords: ["기시감", "전생 동료", "불신과 협력", "정체 노출 위험", "공조"],
      relationInsights: [
        { relation: "도현 ↔ 윤가람", note: "전생의 신뢰와 현생의 불신이 한 사람 안에서 부딪친다." },
        { relation: "도현 ↔ 서문기", note: "서문기는 정체가 드러날 위험을 감수할 가치가 있는지를 묻는다." },
      ],
    };
  }
  if (situation.includes("하은채") || situation.includes("부산") || situation.includes("분기")) {
    return {
      keywords: ["회귀 분기", "미관측 미래", "죄책감", "선택의 대가", "구원"],
      relationInsights: [
        { relation: "도현 ↔ 하은채", note: "47화의 상실이 88화의 선택을 낳는다. 구원의 시도이자 도박." },
        { relation: "도현 ↔ 에르그", note: "지식이 닿지 않는 첫 미래 앞에서 관리자마저 ‘예측 불가’를 띄운다." },
      ],
    };
  }
  // 기본: 이번 게이트를 언제 공략할지 결정하는 상황
  return {
    keywords: ["전생 지식", "회차 오차", "제한시간", "지휘 판단", "선행 대응"],
    relationInsights: [
      { relation: "도현 ↔ 서문기", note: "미래를 아는 확신과 브레이크 제한시간 사이에서 현실적 선을 잡는다." },
      { relation: "도현 ↔ 채린", note: "채린은 도현의 낯선 확신에서 ‘서준이 아닌 무언가’를 감지한다." },
    ],
  };
}
