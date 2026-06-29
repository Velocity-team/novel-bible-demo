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
    name: "흥부",
    type: "character",
    description: "마음씨 착한 동생. 가난하지만 다친 제비를 정성껏 돌봐준다.",
    firstAppearance: "1화",
    attributes: { 성격: "착함", 형편: "가난함", 가족: "아내와 자식 열두 명" },
    tags: ["주인공", "동생", "착한 사람"],
    aiStatus: "Learned",
    sourceEvidence: [
      "1화: “흥부는 형에게 쫓겨나면서도 원망 한마디 하지 않았다.”",
      "3화: “흥부는 부러진 제비 다리에 헝겊을 감아 주었다.”",
    ],
  }),
  block({
    id: "c2",
    name: "놀부",
    type: "character",
    description: "욕심 많은 형. 부모님의 유산을 독차지하고 흥부네를 내쫓는다.",
    firstAppearance: "1화",
    attributes: { 성격: "욕심 많음", 형편: "부자", 가족: "아내와 단둘" },
    tags: ["형", "욕심쟁이", "악역"],
    aiStatus: "Learned",
    sourceEvidence: ["1화: “놀부는 곳간 열쇠를 꼭 쥔 채 동생을 내쫓았다.”"],
  }),
  block({
    id: "c3",
    name: "흥부 아내",
    type: "character",
    description: "흥부와 함께 어려운 살림을 꾸려 가는 부지런한 사람.",
    firstAppearance: "1화",
    attributes: { 성격: "부지런함", 형편: "가난함" },
    tags: ["가족", "조연"],
    aiStatus: "Learned",
    sourceEvidence: ["1화: “흥부 아내는 남의 집 일을 도와주고 곡식을 얻어 왔다.”"],
  }),
  block({
    id: "c4",
    name: "놀부 아내",
    type: "character",
    description: "놀부만큼 인색한 사람. 밥을 구걸하러 온 흥부의 뺨을 밥주걱으로 때린다.",
    firstAppearance: "2화",
    attributes: { 성격: "인색함", 형편: "부자" },
    tags: ["악역", "조연"],
    aiStatus: "Conflict Risk",
    sourceEvidence: ["2화: “놀부 아내는 밥주걱으로 흥부의 뺨을 철썩 때렸다.”"],
  }),
  block({
    id: "c5",
    name: "제비",
    type: "character",
    description: "흥부네 처마에 둥지를 튼 제비. 구렁이에게서 떨어져 다리를 다친다.",
    firstAppearance: "3화",
    attributes: { 상태: "오른쪽 다리를 다침", 고향: "강남" },
    tags: ["은혜 갚는 동물", "핵심 인물"],
    aiStatus: "Learned",
    sourceEvidence: ["3화: “둥지에서 떨어진 제비는 오른쪽 다리가 부러져 있었다.”"],
  }),
  // ── 장소 ──────────────────────────────────────────────
  block({
    id: "l1",
    name: "흥부네 초가집",
    type: "location",
    description: "흥부 가족이 사는 다 쓰러져 가는 초가집. 제비가 둥지를 튼 곳이다.",
    firstAppearance: "1화",
    attributes: {},
    tags: ["흥부네", "집"],
    aiStatus: "Learned",
  }),
  block({
    id: "l2",
    name: "놀부네 기와집",
    type: "location",
    description: "놀부 부부가 사는 으리으리한 기와집. 곳간에 곡식이 가득하다.",
    firstAppearance: "1화",
    attributes: {},
    tags: ["놀부네", "집"],
    aiStatus: "Learned",
  }),
  block({
    id: "l3",
    name: "강남",
    type: "location",
    description: "제비들이 겨울을 나러 가는 따뜻한 남쪽 나라. 제비 임금님이 산다.",
    firstAppearance: "4화",
    attributes: {},
    tags: ["제비", "먼 나라"],
    aiStatus: "Learned",
  }),
  block({
    id: "l4",
    name: "박 넝쿨 지붕",
    type: "location",
    description: "박씨를 심은 흥부네 지붕. 가을이 되자 큰 박이 주렁주렁 열린다.",
    firstAppearance: "4화",
    attributes: { 위치: "흥부네 초가집 지붕" },
    tags: ["박", "보물"],
    aiStatus: "Imported from Excel",
    sourceEvidence: ["4화: “지붕 위 박 넝쿨에는 집채만 한 박이 세 통 열렸다.”"],
  }),
  // ── 무리(집단) ────────────────────────────────────────
  block({
    id: "o1",
    name: "흥부네 가족",
    type: "organization",
    description: "흥부 부부와 자식들. 가난하지만 서로 아끼며 산다.",
    firstAppearance: "1화",
    attributes: {},
    tags: ["가족", "주인공네"],
    aiStatus: "Learned",
  }),
  block({
    id: "o2",
    name: "놀부네 가족",
    type: "organization",
    description: "놀부 부부. 재산을 끌어안고 이웃에게 인색하게 군다.",
    firstAppearance: "1화",
    attributes: {},
    tags: ["가족", "악역네"],
    aiStatus: "Learned",
  }),
  block({
    id: "o3",
    name: "강남 제비 마을",
    type: "organization",
    description: "강남에 있는 제비들의 마을. 은혜를 입은 일을 기록해 두었다가 갚는다.",
    firstAppearance: "4화",
    attributes: {},
    tags: ["제비", "은혜 갚기"],
    aiStatus: "Imported from Excel",
  }),
  // ── 사건 ──────────────────────────────────────────────
  block({
    id: "e1",
    name: "유산 독차지",
    type: "event",
    description: "놀부가 부모님의 재산을 모두 차지하고 흥부네 가족을 내쫓은 사건.",
    episode: "1화",
    firstAppearance: "1화",
    attributes: {},
    tags: ["시작 사건"],
    aiStatus: "Learned",
  }),
  block({
    id: "e2",
    name: "밥주걱 사건",
    type: "event",
    description: "밥을 구걸하러 간 흥부가 놀부 아내에게 밥주걱으로 뺨을 맞은 사건.",
    episode: "2화",
    firstAppearance: "2화",
    attributes: {},
    tags: ["갈등"],
    aiStatus: "Learned",
  }),
  block({
    id: "e3",
    name: "제비 다리 치료",
    type: "event",
    description: "흥부가 구렁이에게서 떨어진 제비를 구해 부러진 다리를 치료해 준 사건.",
    episode: "3화",
    firstAppearance: "3화",
    attributes: {},
    tags: ["선행", "핵심 사건"],
    aiStatus: "Learned",
  }),
  block({
    id: "e4",
    name: "박씨 선물",
    type: "event",
    description: "강남에 다녀온 제비가 은혜를 갚으려고 박씨 하나를 물어다 준 사건.",
    episode: "4화",
    firstAppearance: "4화",
    attributes: { 중요도: "높음" },
    tags: ["보답", "복선"],
    aiStatus: "Learned",
    sourceEvidence: ["4화: “제비는 흥부의 손바닥에 박씨 하나를 떨어뜨렸다.”"],
  }),
  block({
    id: "e5",
    name: "박 타기",
    type: "event",
    description: "다 익은 박을 타자 금은보화와 쌀이 쏟아져 나와 흥부네가 부자가 된 사건.",
    episode: "5화",
    firstAppearance: "5화",
    attributes: { 중요도: "높음" },
    tags: ["보상", "핵심 사건"],
    aiStatus: "Learned",
  }),
  // ── 규칙 ──────────────────────────────────────────────
  block({
    id: "r1",
    name: "은혜 갚기 규칙",
    type: "rule",
    description: "제비는 진심으로 은혜를 베푼 사람에게만, 입은 만큼 보답한다.",
    attributes: {},
    tags: ["세계관 규칙", "보답"],
    aiStatus: "Learned",
  }),
  block({
    id: "r2",
    name: "박 타기 규칙",
    type: "rule",
    description: "박은 가을에 다 익은 뒤에만 탈 수 있다. 덜 익은 박은 아무것도 나오지 않는다.",
    attributes: {},
    tags: ["세계관 규칙", "박"],
    aiStatus: "Conflict Risk",
  }),
  block({
    id: "r3",
    name: "욕심의 대가",
    type: "rule",
    description: "보답을 바라고 일부러 꾸민 선행에는 보물 대신 재앙이 따른다.",
    attributes: {},
    tags: ["세계관 규칙", "교훈"],
    aiStatus: "Learned",
  }),
  // ── 물건 ──────────────────────────────────────────────
  block({
    id: "i1",
    name: "박씨",
    type: "item",
    description: "제비가 물어다 준 씨앗. 심으면 신비한 박이 열린다.",
    firstAppearance: "4화",
    attributes: {},
    tags: ["보물", "복선"],
    aiStatus: "Learned",
  }),
  block({
    id: "i2",
    name: "밥주걱",
    type: "item",
    description: "놀부 아내가 흥부의 뺨을 때린 밥주걱. 놀부네의 인색함을 보여주는 물건.",
    firstAppearance: "2화",
    attributes: {},
    tags: ["상징"],
    aiStatus: "Learned",
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
  rel("rel1", "c1", "형제", "c2"),
  rel("rel2", "c1", "소속", "o1"),
  rel("rel3", "c2", "소속", "o2"),
  rel("rel4", "c3", "가족", "c1"),
  rel("rel5", "c4", "가족", "c2"),
  rel("rel6", "o1", "거점", "l1"),
  rel("rel7", "o2", "거점", "l2"),
  rel("rel8", "c5", "은인", "c1"),
  rel("rel9", "c5", "소속", "o3"),
  rel("rel10", "e2", "장소", "l2"),
  rel("rel11", "e3", "장소", "l1"),
  rel("rel12", "i1", "소유자", "c1"),
  rel("rel13", "i2", "소유자", "c4"),
  rel("rel14", "r1", "적용대상", "c5"),
  rel("rel15", "r2", "사용조건", "", { targetLabel: "가을에 다 익은 박" }),
  rel("rel16", "r3", "위반결과", "", { targetLabel: "보물 대신 재앙" }),
  rel("rel17", "c2", "적대", "c1"),
  rel("rel18", "e4", "관련사건", "e3"),
  rel("rel19", "e5", "관련사건", "e4"),
  rel("rel20", "e4", "장소", "l1"),
  rel("rel21", "i1", "관련사건", "e5"),
  // ── 인물 사이를 잇는 사건 연결선 (설정 지도에서 선 위에 사건 이름이 표시됨) ──
  rel("ev1", "c2", "유산 독차지", "c1", { kind: "event", eventId: "e1", episode: "1화" }),
  rel("ev2", "c4", "밥주걱 사건", "c1", { kind: "event", eventId: "e2", episode: "2화" }),
  rel("ev3", "c1", "제비 다리 치료", "c5", { kind: "event", eventId: "e3", episode: "3화" }),
  rel("ev4", "c5", "박씨 선물", "c1", { kind: "event", eventId: "e4", episode: "4화" }),
];

export const mockConflicts: Conflict[] = [
  {
    id: "cf1",
    title: "흥부네 자식 수가 다름",
    type: "숫자/시간 오류",
    severity: "high",
    description: "1화에서는 흥부네 자식이 열두 명인데, 4화에서는 아홉 명으로 적혀 있습니다.",
    evidenceA: "1화 “흥부네 좁은 방에는 자식 열두 명이 옹기종기 모여 있었다.”",
    evidenceB: "4화 “아홉 남매는 박씨를 신기한 듯 들여다보았다.”",
    recommendation: "자식 수를 열두 명으로 통일하거나, 4화 문장을 ‘아이들은’처럼 숫자 없이 고쳐 보세요.",
    relatedBlockIds: ["c1", "o1"],
    status: "open",
    location: { episode: "4화", sentence: "“아홉 남매는 박씨를 신기한 듯 들여다보았다.”" },
    fixGuide: [
      "4화의 ‘아홉 남매’를 ‘열두 남매’로 고친다.",
      "숫자를 빼고 ‘아이들은’으로 바꿔 충돌을 피한다.",
      "설정 카드(흥부)의 가족 속성을 기준으로 전 회차를 검토한다.",
    ],
  },
  {
    id: "cf2",
    title: "제비가 다친 다리가 다름",
    type: "인물 상태 오류",
    severity: "high",
    description: "3화에서는 제비의 오른쪽 다리가 부러졌는데, 5화에서는 왼쪽 다리를 다쳤던 것으로 나옵니다.",
    evidenceA: "3화 “둥지에서 떨어진 제비는 오른쪽 다리가 부러져 있었다.”",
    evidenceB: "5화 “왼쪽 다리를 다쳤던 그 제비가 다시 날아왔다.”",
    recommendation: "다친 다리를 오른쪽으로 통일하세요. 첫 묘사(3화)가 기준이 됩니다.",
    relatedBlockIds: ["c5", "e3"],
    status: "open",
    location: { episode: "5화", sentence: "“왼쪽 다리를 다쳤던 그 제비가 다시 날아왔다.”" },
    fixGuide: [
      "5화의 ‘왼쪽 다리’를 ‘오른쪽 다리’로 고친다.",
      "설정 카드(제비)의 상태 속성을 기준으로 적는다.",
      "다리 방향이 이야기에 중요하지 않다면 ‘다쳤던 다리’로 표현을 바꾼다.",
    ],
  },
  {
    id: "cf3",
    title: "덜 익은 박을 타는 장면",
    type: "세계관 규칙 위반",
    severity: "medium",
    description:
      "박은 가을에 다 익은 뒤에만 탈 수 있다는 규칙이 있는데, 4화에서 한여름에 박을 타는 장면이 나옵니다.",
    evidenceA: "규칙 “박은 가을에 다 익은 뒤에만 탈 수 있다.”",
    evidenceB: "4화 “한여름 뙤약볕 아래, 흥부는 설익은 박에 톱을 대었다.”",
    recommendation: "장면의 계절을 가을로 바꾸거나, 덜 익은 박이라 아무것도 나오지 않는 장면으로 고치세요.",
    relatedBlockIds: ["r2", "i1"],
    status: "open",
    location: { episode: "4화", sentence: "“한여름 뙤약볕 아래, 흥부는 설익은 박에 톱을 대었다.”" },
    fixGuide: [
      "4화 장면의 계절을 가을로 바꾼다.",
      "덜 익은 박에서는 아무것도 나오지 않았다는 전개로 규칙을 지킨다.",
      "박 타기 장면 자체를 5화로 옮긴다.",
    ],
  },
  {
    id: "cf4",
    title: "박씨를 받기 전에 부자가 된 흥부",
    type: "사건 순서 오류",
    severity: "low",
    description:
      "흥부가 부자가 되는 것은 5화 박 타기 이후인데, 2화에 이미 ‘새로 산 기와집’이라는 표현이 나옵니다.",
    evidenceA: "5화 “박이 갈라지자 금은보화가 쏟아져 나왔다.”",
    evidenceB: "2화 “흥부는 새로 산 기와집 마루에 앉아 한숨을 쉬었다.”",
    recommendation: "2화의 ‘새로 산 기와집’을 ‘다 쓰러져 가는 초가집’으로 고치세요.",
    relatedBlockIds: ["c1", "l1", "e5"],
    status: "open",
    location: { episode: "2화", sentence: "“흥부는 새로 산 기와집 마루에 앉아 한숨을 쉬었다.”" },
    fixGuide: [
      "2화의 배경을 흥부네 초가집으로 고친다.",
      "부자가 되는 시점(5화) 이전 회차에서 재산 관련 표현을 점검한다.",
    ],
  },
];

export const mockProject: Project = {
  id: "p1",
  title: "흥부와 놀부",
  genre: "전래동화 / 가족 / 권선징악",
  logline:
    "욕심 많은 형 놀부에게 쫓겨난 착한 동생 흥부가, 다친 제비를 구해 준 보답으로 받은 박씨 덕분에 복을 받는 이야기",
  summary:
    "부모님의 유산을 독차지한 놀부는 동생 흥부네를 내쫓는다. 가난하지만 착하게 살던 흥부는 구렁이에게서 떨어져 다리가 부러진 제비를 정성껏 치료해 준다. 이듬해 봄, 강남에 다녀온 제비가 박씨 하나를 물어다 주고, 가을에 다 익은 박을 타자 금은보화가 쏟아져 나온다. 이를 샘낸 놀부는 일부러 제비 다리를 부러뜨리지만, 욕심으로 꾸민 선행에는 재앙이 따른다.",
  episodes: [
    { id: "ep1", title: "1화 쫓겨난 흥부네", number: 1, summary: "놀부가 유산을 독차지하고 흥부네 가족을 내쫓는다.", wordCount: 3200, date: { year: 1, season: "가을", label: "쫓겨난 해" } },
    { id: "ep2", title: "2화 밥주걱", number: 2, summary: "밥을 구걸하러 간 흥부가 놀부 아내에게 밥주걱으로 뺨을 맞는다.", wordCount: 2900, date: { year: 1, season: "겨울", label: "보릿고개" } },
    { id: "ep3", title: "3화 다친 제비", number: 3, summary: "흥부가 구렁이에게서 떨어진 제비의 부러진 오른쪽 다리를 치료해 준다.", wordCount: 3100, date: { year: 2, season: "여름", label: "제비가 온 해" } },
    { id: "ep4", title: "4화 박씨 선물", number: 4, summary: "강남에 다녀온 제비가 박씨를 물어다 주고, 지붕에 큰 박이 열린다.", wordCount: 3000, date: { year: 3, season: "봄", label: "이듬해 봄" } },
    { id: "ep5", title: "5화 박 타기", number: 5, summary: "다 익은 박을 타자 금은보화가 쏟아져 흥부네가 부자가 된다.", wordCount: 3400, date: { year: 3, season: "가을", label: "박 익은 가을" } },
    { id: "ep6", title: "6화 놀부의 욕심", number: 6, summary: "샘이 난 놀부가 일부러 제비 다리를 부러뜨리고 박씨를 기다린다.", wordCount: 3300, date: { year: 4, season: "봄", label: "놀부의 봄" } },
  ],
  canonRules: [
    "제비는 진심으로 은혜를 베푼 사람에게만 보답한다.",
    "박은 가을에 다 익은 뒤에만 탈 수 있다.",
    "보답을 바라고 꾸민 선행에는 보물 대신 재앙이 따른다.",
  ],
  generationConstraints: [
    "놀부는 마지막 회차 전까지 벌을 받으면 안 된다.",
    "놀부 박에서 무엇이 나오는지는 마지막 회차 전까지 밝히면 안 된다.",
    "제비가 사람처럼 길게 말하는 장면은 넣지 않는다.",
  ],
  forbiddenSettings: [
    "흥부가 놀부에게 직접 복수하는 전개 금지",
    "박에서 나온 보물을 도둑맞는 전개 금지",
    "덜 익은 박에서 보물이 나오는 장면 금지",
  ],
};

/** 회차별 원고 제목(있으면 사용, 없으면 'N화 원고') */
const MANUSCRIPT_TITLES: Record<number, string> = {
  1: "쫓겨난 흥부네",
  2: "밥주걱",
  3: "다친 제비",
  4: "박씨 선물",
  5: "박 타기",
  6: "놀부의 욕심",
  7: "놀부의 박",
  8: "도깨비의 방문",
  100: "다시 만난 제비",
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
  { id: "ms-excel", title: "설정 정리표 (엑셀)", sourceType: "excel", learnedItems: 9, status: "synced", updatedAt: "2026-06-02T11:41:00.000Z" },
  { id: "ms-memo", title: "인물 메모", sourceType: "manual", learnedItems: 4, status: "synced", updatedAt: "2026-06-02T11:42:00.000Z" },
];

export const mockNotes: ProjectNote[] = [
  {
    id: "n1",
    title: "놀부 박 복선",
    content:
      "놀부의 박에서 무엇이 나올지는 끝까지 숨긴다. 도깨비가 나와 재산을 가져가는 전개를 예고 없이 터뜨리면 효과가 크다.",
    relatedBlockIds: ["c2", "r3"],
    createdAt: T0,
  },
  {
    id: "n2",
    title: "제비 다리 방향 통일",
    content: "제비가 다친 다리는 ‘오른쪽’으로 통일한다. 3화 첫 묘사가 기준.",
    relatedBlockIds: ["c5"],
    createdAt: T0,
  },
  {
    id: "n3",
    title: "자식 수 표현",
    content: "흥부네 자식은 열두 명. 숫자가 중요하지 않은 장면에서는 ‘아이들’로 표현해 충돌을 줄인다.",
    relatedBlockIds: ["c1", "o1"],
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
      icon: "📄",
      detail: `${(2800 + ((n * 37) % 900)).toLocaleString()}자`,
    });
  }
  out.push({ id: "fx", name: "설정 정리표.xlsx", kind: "설정표", icon: "📊", detail: "인물·장소·규칙 9건" });
  out.push({ id: "fm", name: "인물 메모.txt", kind: "메모", icon: "📝", detail: "흥부·놀부·제비 메모" });
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
    name: "도깨비",
    description: "놀부의 박에서 나와 욕심의 대가를 치르게 하는 존재",
    episode: "7화",
    attribute: "역할=응징자",
    relationSource: "도깨비",
    relationType: "응징",
    relationTarget: "놀부",
    tags: "도깨비, 응징, 반전",
  },
  {
    type: "location",
    name: "놀부네 박밭",
    description: "놀부가 박씨를 심으려고 일부러 만든 밭",
    episode: "7화",
    attribute: "위치=놀부네 기와집 마당",
    relationSource: "놀부네 박밭",
    relationType: "장소",
    relationTarget: "놀부의 박 타기",
    tags: "박, 욕심",
  },
  {
    type: "event",
    name: "놀부의 박 타기",
    description: "놀부가 욕심으로 받은 박을 타는 사건. 보물 대신 재앙이 나온다.",
    episode: "7화",
    attribute: "중요도=높음",
    relationSource: "놀부의 박 타기",
    relationType: "관련사건",
    relationTarget: "박 타기",
    tags: "응징, 절정",
  },
  {
    type: "rule",
    name: "꾸민 선행의 박",
    description: "일부러 다치게 한 제비가 물어다 준 박씨에서는 재앙이 나온다.",
    episode: "7화",
    attribute: "적용대상=놀부",
    relationSource: "꾸민 선행의 박",
    relationType: "적용대상",
    relationTarget: "놀부",
    tags: "세계관 규칙, 교훈",
  },
];

export const excelRelationRows = [
  { source: "도깨비", type: "응징", target: "놀부" },
  { source: "놀부네 박밭", type: "장소", target: "놀부의 박 타기" },
  { source: "놀부의 박 타기", type: "관련사건", target: "박 타기" },
  { source: "꾸민 선행의 박", type: "적용대상", target: "놀부" },
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
  "적용대상",
  "사용조건",
  "위반결과",
  "원인",
  "결과",
  "응징",
  "약속",
  "배신",
  "관련사건",
];

/** 온보딩 학습 완료 후 채워지는 전체 데이터 */
// ── 회차별 세계관 지도(아틀라스) 목데이터 ──────────────────

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
  { id: "z-heungbu", kind: "home", name: "흥부네 초가집", blockId: "l1", blurb: "다 쓰러져 가는 초가집. 처마 밑에 제비가 둥지를 튼다." },
  { id: "z-roof", kind: "home", name: "박 넝쿨 지붕", blockId: "l4", blurb: "박씨를 심은 흥부네 지붕. 가을이 되면 집채만 한 박이 열린다." },
  { id: "z-nolbu", kind: "home", name: "놀부네 기와집", blockId: "l2", blurb: "으리으리한 기와집. 곳간에 곡식이 가득하고 장독대가 늘어서 있다." },
  { id: "z-village", kind: "village", name: "마을 길·장터", blurb: "흥부네와 놀부네를 잇는 동네 길. 소문이 오가는 곳." },
  { id: "z-gangnam", kind: "faraway", name: "강남 제비 마을", blockId: "l3", blurb: "제비들이 겨울을 나는 따뜻한 남쪽 나라. 은혜 장부가 있다." },
];

export const mockStages: StageMap[] = [
  makeStage("z-heungbu", "흥부네 마당", [
    ",,,,,,,,,,,,,,",
    ",T,,,,,==== ,,",
    ",,,,,,,=##= ,,",
    ",,::,,,=##= ,,",
    ",,::,,,::::,,,",
    ",,::,,,,,,,,,,",
    ",,,,,o,o,,,T,,",
    ",.,,,,,,,,,,,,",
    ",,,,,,,,,,,,,,",
  ]),
  makeStage("z-roof", "박이 열린 지붕", [
    "==============",
    "=############=",
    "=#GG##GG##GG#=",
    "=##GG##GG##G#=",
    "=#GG##GG##GG#=",
    "=##GG##GG##G#=",
    "=#GG##GG##GG#=",
    "=############=",
    "==============",
  ]),
  makeStage("z-nolbu", "놀부네 안마당", [
    ",,============",
    ",,=##########=",
    ",,=#=ooo=#RR#=",
    ",,=#=...=#RR#=",
    "::::.......::: ",
    ",,=#=ooo=#RR#=",
    ",,=#########=,",
    ",,===========,",
    ",,,,,,,,,,,,,,",
  ]),
  makeStage("z-village", "동네 갈림길", [
    ",,T,,,,,,T,,,,",
    ",,,,::::::,,,,",
    "::::::::::::::",
    ",,,,::,,::,,,,",
    ",T,,::,,::,,T,",
    ",,,,::,,::,,,,",
    "::::::::::::::",
    ",,,,::::::,,,,",
    ",,T,,,,,,,T,,,",
  ]),
  makeStage("z-gangnam", "강남 물가", [
    "~~~~~~~~~~~~~~",
    "~~~''''''~~~~~",
    "~~'',,,,''~~~~",
    "~'',TT,TT,'~~~",
    "~'',,,,,,''~~~",
    "~~'',,,,''~~~~",
    "~~~''''''~~~~~",
    "~~~~~''~~~~~~~",
    "~~~~~~~~~~~~~~",
  ]),
];

export const mockPlacements: CharacterPlacement[] = [
  // 1화 — 놀부네 기와집 (쫓겨남)
  { episodeId: "ep1", characterId: "c1", zoneId: "z-nolbu", x: 4, y: 4, activity: "보따리를 지고 형 집을 나선다" },
  { episodeId: "ep1", characterId: "c3", zoneId: "z-nolbu", x: 3, y: 5, activity: "아이들을 들쳐업고 뒤따른다" },
  { episodeId: "ep1", characterId: "c2", zoneId: "z-nolbu", x: 9, y: 3, activity: "대문 앞에서 동생을 내쫓는다" },
  { episodeId: "ep1", characterId: "c4", zoneId: "z-nolbu", x: 10, y: 5, activity: "곳간 문을 걸어 잠근다" },
  // 2화 — 밥주걱
  { episodeId: "ep2", characterId: "c1", zoneId: "z-nolbu", x: 6, y: 4, activity: "밥 한 술을 구걸한다" },
  { episodeId: "ep2", characterId: "c4", zoneId: "z-nolbu", x: 8, y: 4, activity: "밥주걱으로 흥부의 뺨을 때린다" },
  { episodeId: "ep2", characterId: "c2", zoneId: "z-nolbu", x: 10, y: 3, activity: "못 본 척 외면한다" },
  { episodeId: "ep2", characterId: "c3", zoneId: "z-heungbu", x: 5, y: 4, activity: "빈 솥을 보며 아이들을 달랜다" },
  // 3화 — 다친 제비 (흥부네)
  { episodeId: "ep3", characterId: "c1", zoneId: "z-heungbu", x: 6, y: 4, activity: "제비의 부러진 오른쪽 다리를 싸맨다" },
  { episodeId: "ep3", characterId: "c5", zoneId: "z-heungbu", x: 6, y: 2, activity: "처마 밑에 떨어져 파닥인다" },
  { episodeId: "ep3", characterId: "c3", zoneId: "z-heungbu", x: 4, y: 5, activity: "헝겊과 무명실을 가져다준다" },
  // 4화 — 박씨 선물 (강남 + 흥부네)
  { episodeId: "ep4", characterId: "c5", zoneId: "z-gangnam", x: 6, y: 4, activity: "강남에서 가장 묵직한 박씨를 고른다" },
  { episodeId: "ep4", characterId: "c1", zoneId: "z-heungbu", x: 6, y: 5, activity: "처마를 보며 제비를 기다린다" },
  { episodeId: "ep4", characterId: "c3", zoneId: "z-heungbu", x: 4, y: 5, activity: "박씨를 받아 마당에 심는다" },
  // 5화 — 박 타기 (지붕) + 소문 (놀부네)
  { episodeId: "ep5", characterId: "c1", zoneId: "z-roof", x: 6, y: 4, activity: "아내와 마주 앉아 박을 탄다" },
  { episodeId: "ep5", characterId: "c3", zoneId: "z-roof", x: 7, y: 4, activity: "톱의 다른 끝을 함께 잡는다" },
  { episodeId: "ep5", characterId: "c2", zoneId: "z-nolbu", x: 9, y: 3, activity: "흥부가 부자가 됐다는 소문을 듣는다" },
  { episodeId: "ep5", characterId: "c4", zoneId: "z-nolbu", x: 10, y: 5, activity: "비결을 캐물으라 부추긴다" },
  // 6화 — 놀부의 욕심 (놀부네)
  { episodeId: "ep6", characterId: "c2", zoneId: "z-nolbu", x: 6, y: 3, activity: "제비 다리를 일부러 부러뜨린다" },
  { episodeId: "ep6", characterId: "c5", zoneId: "z-nolbu", x: 6, y: 2, activity: "놀부 손에 붙들려 파닥인다" },
  { episodeId: "ep6", characterId: "c4", zoneId: "z-nolbu", x: 9, y: 5, activity: "박밭을 내다본다" },
  { episodeId: "ep6", characterId: "c1", zoneId: "z-heungbu", x: 5, y: 4, activity: "형의 소식을 걱정스레 듣는다" },
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
    canonScore: 87,
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

// ── PlotRoom 목데이터 ──────────────────────────────────────

export const mockPersonas: CharacterPersona[] = [
  {
    characterId: "c1",
    speechStyle:
      "공손하고 감사함이 묻어나는 말투. '그렇군요', '괜찮습니다', '감사합니다'를 자주 씁니다. 직접적인 거절 대신 돌려서 표현합니다.",
    personality: ["인내심이 강함", "남을 먼저 배려함", "불평 없이 현실을 수용함", "순수한 마음씨"],
    goals: ["가족을 굶기지 않는 것", "착하게 살아가는 것", "놀부 형과 언젠가 화해하는 것"],
    coreMemories: [
      { episode: "1화", content: "형에게 쫓겨나면서도 원망 한마디 하지 않았다." },
      { episode: "2화", content: "밥주걱으로 뺨을 맞고도 울며 돌아왔다." },
      { episode: "3화", content: "제비의 부러진 오른쪽 다리를 헝겊으로 싸매 주었다." },
      { episode: "4화", content: "제비가 박씨를 손바닥에 떨어뜨려 주던 순간." },
    ],
    forbiddenActions: [
      "놀부에게 직접 복수하기",
      "원망과 분노를 대놓고 표현하기",
      "탐욕스러운 행동",
      "제비에게 보답을 요구하기",
    ],
    ragSources: ["1화", "2화", "3화", "4화"],
  },
  {
    characterId: "c2",
    speechStyle:
      "명령조이고 차갑습니다. '내 것이다', '필요 없다', '꺼져라' 같은 단정적 표현을 씁니다. 자기 합리화가 많고, 속내와 겉 말이 다릅니다.",
    personality: ["탐욕스럽고 인색함", "냉정하고 계산적", "체면을 중시함", "감정을 잘 드러내지 않음"],
    goals: ["재산 유지 및 증식", "흥부보다 우월한 위치 유지", "아무에게도 지지 않기"],
    coreMemories: [
      { episode: "1화", content: "부모님 유산을 모두 차지하고 흥부를 내쫓은 날." },
      { episode: "5화", content: "흥부가 박을 타서 갑자기 부자가 됐다는 소식을 들었다." },
      { episode: "6화", content: "제비 다리를 일부러 부러뜨렸다." },
    ],
    forbiddenActions: [
      "재산을 자발적으로 나누기",
      "먼저 사과하기",
      "진심으로 선행하기",
      "약한 모습 보이기",
    ],
    ragSources: ["1화", "5화", "6화"],
  },
  {
    characterId: "c3",
    speechStyle:
      "걱정과 따뜻함이 섞인 말투. '여보', '아이들이요', '어떡해요' 같은 표현을 자주 씁니다. 직접적이지만 부드럽고, 현실적입니다.",
    personality: ["부지런하고 현실적", "가족을 최우선으로 생각", "걱정이 많지만 포기하지 않음", "실용적 판단력"],
    goals: ["아이들 굶기지 않기", "흥부 곁에서 함께 버티기", "현실적인 방법 찾기"],
    coreMemories: [
      { episode: "1화", content: "남의 집 일을 도와주고 곡식을 얻어 아이들을 먹인 날." },
      { episode: "3화", content: "흥부가 제비 다리를 싸매는 것을 지켜봤다." },
    ],
    forbiddenActions: ["체념하고 포기하기", "아이들에게 화풀이하기", "현실을 외면하기"],
    ragSources: ["1화", "2화", "3화"],
  },
  {
    characterId: "c4",
    speechStyle:
      "냉소적이고 직설적. '그게 어쨌다는 거야', '우리가 왜 줘야 해', '쓸데없이' 같은 표현을 씁니다. 말보다 행동이 앞서는 타입.",
    personality: ["인색하고 실리적", "놀부보다 더 탐욕스러움", "앞뒤 계산이 빠름", "표독스럽고 냉정함"],
    goals: ["재산 지키기", "흥부네와 거리 두기", "집 안에서 실권 쥐기"],
    coreMemories: [
      { episode: "2화", content: "밥주걱으로 흥부의 뺨을 때려 내쫓았다." },
      { episode: "5화", content: "흥부가 갑자기 부자가 됐다는 소식을 들었다." },
    ],
    forbiddenActions: ["인심 쓰기", "흥부에게 동정심 갖기", "약한 모습 보이기"],
    ragSources: ["2화", "5화"],
  },
  {
    characterId: "c5",
    speechStyle:
      "말을 하지 않습니다. 행동과 눈빛, 울음소리로만 의사를 표현합니다. 단순하고 직관적이며, 진심을 바로 알아봅니다.",
    personality: ["은혜를 기억하고 반드시 갚음", "순수하고 직관적", "의리 있음", "진심을 알아봄"],
    goals: ["입은 은혜 갚기", "강남의 사명 완수하기"],
    coreMemories: [
      { episode: "3화", content: "구렁이에게서 떨어져 오른쪽 다리가 부러졌다." },
      { episode: "3화", content: "흥부에게 부러진 다리를 치료받았다." },
      { episode: "4화", content: "강남에서 박씨를 받아 흥부에게 전했다." },
    ],
    forbiddenActions: [
      "욕심으로 온 자에게 박씨 주기",
      "긴 말 하기",
      "진심 없는 선행에 보답하기",
    ],
    ragSources: ["3화", "4화"],
  },
];

export const MEETING_SITUATIONS: string[] = [
  "흥부가 박을 지금 타야 할지, 가을까지 기다려야 할지 결정해야 한다.",
  "흥부가 놀부에게 다시 도움을 청하러 가야 할지 고민하고 있다.",
  "제비가 두 번째 박씨를 물어왔다. 놀부가 눈치를 채고 있다.",
];

const meetingTurnsA: MeetingTurn[] = [
  {
    characterId: "c1",
    characterName: "흥부",
    emotion: "차분함",
    statement:
      "제비가 준 박씨니 때를 따라야 할 것 같습니다. 아직 한여름인데, 서두르다 빈 박이 나오면 그야말로 낭패지요. 박은 가을에 다 익은 뒤에야 탄다고 하지 않았습니까.",
    ragEpisodes: ["3화", "4화"],
    internalThought: "가족이 굶고 있는데 기다리라니... 그래도 이 방법 외에 다른 길이 없다.",
  },
  {
    characterId: "c3",
    characterName: "흥부 아내",
    emotion: "초조함",
    statement:
      "여보, 아이들이 벌써 사흘째 배를 곯았어요. 박이 얼마나 익었는지 한 번만 눈으로 확인해봐도 안 될까요? 무작정 기다리다가 썩어버리면 어쩌려고요.",
    ragEpisodes: ["1화", "2화"],
    internalThought: "남편을 못 믿는 게 아니야. 그냥 아이들이 너무 불쌍해서.",
  },
  {
    characterId: "c5",
    characterName: "제비",
    emotion: "조용함",
    statement:
      "지붕 위 박 넝쿨을 잠시 바라보다가, 짧게 한 번 울고 날개를 접었다. 아직 때가 아님을 아는 듯.",
    ragEpisodes: ["3화", "4화"],
    isAction: true,
  },
  {
    characterId: "c2",
    characterName: "놀부",
    emotion: "비아냥",
    statement:
      "그 허름한 초가지붕에서 집채만 한 박이 열렸다고? 어디 한번 타봐라, 어차피 빈 박이거나 지푸라기나 나오겠지. 나랑은 상관없는 일이야.",
    ragEpisodes: ["1화", "5화"],
    internalThought: "혹시 진짜 뭔가 나오면 어쩌지? 그럼 내가 틀린 거잖아.",
  },
  {
    characterId: "c4",
    characterName: "놀부 아내",
    emotion: "냉담함",
    statement:
      "그나저나 박이 그렇게 크게 자랐다고요? 우리 집 지붕에도 씨를 뿌려봤으면 어땠을까 싶네. 아무튼 걔네 일은 걔네가 알아서 하겠죠.",
    ragEpisodes: ["5화"],
    internalThought: "제비... 혹시 우리도 다리 부러진 제비를 고쳐주면 될까?",
  },
  {
    characterId: "c1",
    characterName: "흥부",
    emotion: "결심",
    statement:
      "이틀만 더 기다리겠습니다. 제비가 울음으로 신호를 준다 했으니, 그 소리를 들으면 그때 타도록 하죠. 섣불리 움직이지 않겠습니다.",
    ragEpisodes: ["3화", "4화"],
    internalThought: "아이들 얼굴이 자꾸 눈에 밟힌다. 그래도 참자.",
  },
  {
    characterId: "c3",
    characterName: "흥부 아내",
    emotion: "수긍",
    statement:
      "...알겠어요. 이틀이요. 그 안에 제비가 신호를 주지 않으면 그때는 제 말을 들어줘야 해요. 아이들한테 더는 미룰 수가 없어요.",
    ragEpisodes: ["1화", "2화"],
    internalThought: "이틀... 이틀이라도 버텨보자.",
  },
  {
    characterId: "c5",
    characterName: "제비",
    emotion: "다짐",
    statement:
      "두 사람의 말이 끝나자 지붕에서 내려와 박 넝쿨 위를 한 바퀴 날더니, 흥부 곁에 가만히 앉았다. 기다리라는 듯, 혹은 함께 있겠다는 듯.",
    ragEpisodes: ["3화", "4화"],
    isAction: true,
  },
  {
    characterId: "c2",
    characterName: "놀부",
    emotion: "불안",
    statement:
      "...이틀 안에 박을 탄다고? 진짜로? 뭔가 나오면 동네방네 소문이 퍼질 텐데. 그거 신경 쓰인다고.",
    ragEpisodes: ["5화", "6화"],
    internalThought: "소문이 나면 나도 뭔가 해야 하는 분위기가 되잖아. 싫어.",
  },
];

const meetingTurnsB: MeetingTurn[] = [
  {
    characterId: "c1",
    characterName: "흥부",
    emotion: "망설임",
    statement:
      "형이 아무리 그래도... 피붙이인데, 한 번 더 찾아가 보면 어떨까요. 제가 부탁하는 방법이 잘못된 건 아닌지도 돌아봐야겠고요.",
    ragEpisodes: ["1화", "2화"],
    internalThought: "사실은 무서워. 또 쫓겨날 것 같아서.",
  },
  {
    characterId: "c3",
    characterName: "흥부 아내",
    emotion: "단호함",
    statement:
      "여보, 밥주걱으로 뺨까지 때린 사람한테 다시 가라고요? 이번엔 제가 허락 못 해요. 다른 방법을 찾아봐야지, 그쪽은 안 돼요.",
    ragEpisodes: ["2화"],
  },
  {
    characterId: "c2",
    characterName: "놀부",
    emotion: "냉정함",
    statement:
      "오겠지. 어차피 기댈 데가 나밖에 없으니까. 왔을 때 단단히 쫓아버려야지, 괜히 약한 소리 들어주다가 뭔가 내줄 것 같아.",
    ragEpisodes: ["1화"],
    internalThought: "근데 왜 기다려지는 거지.",
  },
  {
    characterId: "c4",
    characterName: "놀부 아내",
    emotion: "차가움",
    statement:
      "또 오면 이번엔 내가 직접 나서야겠어. 그쪽 어떻게 됐다는 소문 들었어요? 괜히 동정했다가 우리만 손해 봐요.",
    ragEpisodes: ["2화", "5화"],
  },
  {
    characterId: "c5",
    characterName: "제비",
    emotion: "걱정",
    statement:
      "흥부의 어깨 위에 살며시 앉아 깃털을 다듬었다. 두 눈이 놀부네 집 방향을 향해 있었다.",
    ragEpisodes: ["3화"],
    isAction: true,
  },
  {
    characterId: "c1",
    characterName: "흥부",
    emotion: "고뇌",
    statement:
      "당신 말이 맞아요. 그래도 한 가지만 물어봅시다. 만약 형이 문을 열어준다면, 그것만으로도 아이들이 겨울을 넘길 수 있을 텐데.",
    ragEpisodes: ["1화", "2화"],
    internalThought: "아내를 설득할 수 있을까. 아니, 설득보다는 함께 결정해야 한다.",
  },
  {
    characterId: "c3",
    characterName: "흥부 아내",
    emotion: "흔들림",
    statement:
      "...그 말을 들으니 저도 모르겠어요. 하지만 여보, 만약 이번에도 또 그런 일이 생기면 저는 정말 못 보내요. 아이들 앞에서 그 꼴을 보인다는 게.",
    ragEpisodes: ["2화"],
    internalThought: "남편이 또 얻어맞고 돌아오는 걸 아이들한테 보여주고 싶지 않아.",
  },
  {
    characterId: "c2",
    characterName: "놀부",
    emotion: "초조",
    statement:
      "흥부가 온다면... 그냥 쌀 한 됫박만 줘버릴까. 아니다, 그러면 매번 올 게 뻔하지. 절대 안 돼.",
    ragEpisodes: ["1화", "5화"],
    internalThought: "내가 왜 이걸 고민하고 있지. 줄 마음이 없다면서.",
  },
  {
    characterId: "c4",
    characterName: "놀부 아내",
    emotion: "결연",
    statement:
      "여보, 당신이 흔들리면 안 돼요. 한 번 들어주면 끝이 없어요. 오면 제가 먼저 나설 테니 걱정 마세요.",
    ragEpisodes: ["2화", "5화"],
    internalThought: "놀부가 마음 약해지는 꼴을 볼 수가 없어.",
  },
];

const meetingTurnsC: MeetingTurn[] = [
  {
    characterId: "c5",
    characterName: "제비",
    emotion: "급박함",
    statement:
      "흥부의 손 위에 두 번째 박씨를 내려놓고, 주위를 돌아보며 날카롭게 울었다. 누군가 지켜보고 있다는 것을 경계하는 듯.",
    ragEpisodes: ["4화"],
    isAction: true,
  },
  {
    characterId: "c1",
    characterName: "흥부",
    emotion: "놀람",
    statement:
      "또 박씨를... 제비야, 고맙구나. 그런데 왜 이렇게 서두르는 거냐. 무슨 일이 있는 거냐.",
    ragEpisodes: ["3화", "4화"],
  },
  {
    characterId: "c2",
    characterName: "놀부",
    emotion: "탐욕",
    statement:
      "제비가 또 왔다고? 흥부네 박씨를 더 받은 거야? 그 제비, 내 다리도 다쳐주면 되는데...",
    ragEpisodes: ["5화", "6화"],
    internalThought: "기회야. 이번에야말로.",
  },
  {
    characterId: "c3",
    characterName: "흥부 아내",
    emotion: "불안함",
    statement:
      "여보, 놀부 형네 쪽에서 뭔가 움직이는 것 같아요. 이 박씨, 서둘러 심어야 하는 거 아닐까요.",
    ragEpisodes: ["1화", "2화"],
  },
  {
    characterId: "c4",
    characterName: "놀부 아내",
    emotion: "욕심",
    statement:
      "제비가 저쪽 집만 찾아간다는 게 말이 돼요? 우리가 제비 다리 하나 고쳐주면 안 될까요. 이건 불공평한 거잖아요.",
    ragEpisodes: ["5화"],
    internalThought: "두 번째 박씨까지 받았다고? 절대 못 참지.",
  },
  {
    characterId: "c5",
    characterName: "제비",
    emotion: "경계",
    statement:
      "놀부네 방향을 한 번 쏘아보더니 흥부의 가슴팍에 박씨를 꼭 눌러 넣는 듯한 제스처를 취했다. 빨리 가져가라는 신호 같았다.",
    ragEpisodes: ["4화", "6화"],
    isAction: true,
  },
  {
    characterId: "c1",
    characterName: "흥부",
    emotion: "긴장",
    statement:
      "알겠다, 제비야. 오늘 안으로 심겠다. 여보, 우리 지금 바로 나가야 할 것 같아요. 형네가 눈치채기 전에.",
    ragEpisodes: ["3화", "4화"],
    internalThought: "형이 이걸 알게 되면... 생각하기 싫다.",
  },
  {
    characterId: "c2",
    characterName: "놀부",
    emotion: "질투",
    statement:
      "아무리 생각해도 억울해. 내가 뭘 잘못했다고 제비는 흥부만 찾아가는 거야. 나도 착하게 살면 되는 거 아니야?",
    ragEpisodes: ["1화", "5화"],
    internalThought: "착하게... 그게 되나.",
  },
  {
    characterId: "c3",
    characterName: "흥부 아내",
    emotion: "안도",
    statement:
      "여보, 제비가 우리를 두 번이나 찾아왔다는 건 그만한 이유가 있는 거예요. 어서 가요. 이번엔 꼭 잘 될 거예요.",
    ragEpisodes: ["1화", "2화"],
    internalThought: "이번엔 진짜 잘 될 것 같은 예감이 들어.",
  },
];

export function getMockMeetingTurns(situation: string): MeetingTurn[] {
  if (situation.includes("놀부") && (situation.includes("가") || situation.includes("도움") || situation.includes("형"))) {
    return meetingTurnsB;
  }
  if (situation.includes("두 번") || situation.includes("두번") || situation.includes("두번째") || situation.includes("두 번째")) {
    return meetingTurnsC;
  }
  return meetingTurnsA;
}

export const mockSubstoryCandidates: SubstoryCandidate[] = [
  {
    id: "sc1",
    type: "감정선 보강형",
    title: "흥부아내의 밤",
    summary:
      "가족을 위해 규칙을 어기고 싶은 충동과 남편을 믿고 기다리는 마음 사이에서 갈등하는 흥부아내. 아이들을 재우고 홀로 달빛 아래 박 넝쿨을 올려다보는 장면.",
    keyMoment:
      "달빛 아래 혼자 지붕을 올려다보는 흥부아내. 아이들의 잠든 숨소리와 텅 빈 부엌 사이에서 혼자 결심한다.",
    riskLevel: "낮음",
    riskReason:
      "기존 설정(박은 가을에 타야 함)을 어기지 않으며, 흥부아내의 심리를 깊이 있게 조명합니다. 메인 플롯의 흐름에 영향을 주지 않습니다.",
    relatedCharacterIds: ["c3", "c1"],
    relatedEpisodes: ["4화", "5화 이전"],
    relationLabel: "흥부 아내 ↔ 흥부",
    keywords: ["기다림", "달빛", "결심", "가족", "인내"],
  },
  {
    id: "sc2",
    type: "관계 변화형",
    title: "놀부의 균열",
    summary:
      "멀리서 흥부네 지붕에 열린 박을 지켜보는 놀부. 처음으로 부러움과 후회가 스쳐 지나가는 짧은 순간. 아내에게는 끝까지 내색하지 않는다.",
    keyMoment:
      "밤중에 홀로 흥부네 방향을 바라보는 놀부. 발걸음을 떼려다 멈추고 돌아선다.",
    riskLevel: "중간",
    riskReason:
      "놀부의 내면 변화를 너무 이르게 드러내면 6화의 의도적 선행 장면과 충돌할 수 있습니다. 감정을 '균열'에서 머물게 하고 행동으로 이어지지 않도록 주의가 필요합니다.",
    relatedCharacterIds: ["c2", "c4"],
    relatedEpisodes: ["5화"],
    relationLabel: "놀부 ↔ 흥부 (형제)",
    keywords: ["부러움", "후회", "균열", "밤", "내색 안 함"],
  },
  {
    id: "sc3",
    type: "복선 회수형",
    title: "제비의 선택",
    summary:
      "강남에서 수많은 박씨 중 흥부에게 줄 것을 고르는 제비의 짧은 장면. 흥부의 선행이 얼마나 값졌는지를 제비 시점에서 조명합니다.",
    keyMoment:
      "박씨가 가득한 강남의 창고. 제비가 가장 탐스럽고 묵직한 씨앗 하나를 고른다.",
    riskLevel: "낮음",
    riskReason:
      "이미 설정된 은혜 갚기 규칙을 시각화하는 것으로 설정 위반이 없습니다. 제비가 말하지 않는 범위에서 연출 가능하며, 기존 복선을 강화합니다.",
    relatedCharacterIds: ["c5", "c1"],
    relatedEpisodes: ["3화 이후", "4화 이전"],
    relationLabel: "제비 ↔ 흥부 (은인)",
    keywords: ["은혜 갚기", "박씨", "강남", "선택", "복선"],
  },
  {
    id: "sc4",
    type: "갈등 확장형",
    title: "마을 소문",
    summary:
      "흥부네 지붕에 집채만 한 박이 열렸다는 소문이 퍼지면서, 마을 이웃들 사이에 각자의 욕망과 반응이 드러나는 장면.",
    keyMoment:
      "우물가에 모인 이웃들. 누군가는 감탄하고, 누군가는 탐낸다. 놀부아내가 소문을 듣고 표정이 굳는다.",
    riskLevel: "중간",
    riskReason:
      "기존에 등장하지 않은 마을 이웃을 신규 등장시키면 설정이 늘어납니다. 기존 등장인물(놀부아내, 제비)로만 구성하면 위험도를 낮출 수 있습니다.",
    relatedCharacterIds: ["c4", "c2"],
    relatedEpisodes: ["4화", "5화"],
    relationLabel: "놀부 아내 ↔ 놀부",
    keywords: ["소문", "우물가", "욕망", "마을", "긴장"],
  },
  {
    id: "sc5",
    type: "코미디 완충형",
    title: "아이들의 박 소동",
    summary:
      "박 넝쿨이 한창 자라는 동안, 흥부네 아이 열두 명이 작은 박을 공 삼아 굴리며 소동을 피우는 장면. 가난해도 시끌벅적한 일상을 담습니다.",
    keyMoment:
      "아이들이 굴러다니는 박을 쫓아 마당을 뛰어다니다 흥부아내에게 혼나는 장면. 흥부가 뒤에서 웃음을 참는다.",
    riskLevel: "낮음",
    riskReason:
      "흥부네 자식 수(열두 명)를 자연스럽게 등장시키며, 기존 숫자 충돌 설정 오류(cf1)를 해소하는 데 도움이 됩니다. 메인 플롯에 영향 없음.",
    relatedCharacterIds: ["c1", "c3"],
    relatedEpisodes: ["4화", "5화 이전"],
    relationLabel: "흥부 ↔ 흥부 아내 (가족)",
    keywords: ["열두 남매", "박 소동", "웃음", "일상", "숫자 정리"],
  },
];

/**
 * 캐릭터 회의 결과를 키워드 중심으로 요약한다.
 * 완성 문장이 아니라, 작가가 방향을 잡을 때 참고할 키워드·관계 관찰만 뽑는다.
 */
export function getMeetingKeywords(situation: string): MeetingKeywordSummary {
  if (situation.includes("놀부") && situation.includes("도움")) {
    return {
      keywords: ["자존심", "거절", "형제의 골", "체면", "버티기"],
      relationInsights: [
        { relation: "흥부 ↔ 놀부", note: "도움을 청해도 받아들여지지 않는 골이 더 깊어진다." },
        { relation: "흥부 ↔ 흥부 아내", note: "아내는 차라리 다른 길을 찾자고 현실적으로 설득한다." },
      ],
    };
  }
  if (situation.includes("두 번째 박씨") || situation.includes("눈치")) {
    return {
      keywords: ["복선", "의심", "은혜 갚기", "들킬 위험", "선택"],
      relationInsights: [
        { relation: "제비 ↔ 흥부", note: "제비는 말없이 은혜의 크기만큼만 보답하려 한다." },
        { relation: "놀부 ↔ 흥부", note: "놀부의 의심이 다음 사건(놀부의 욕심)의 불씨가 된다." },
      ],
    };
  }
  // 기본: 박을 언제 탈지 결정하는 상황
  return {
    keywords: ["기다림", "박 타기 규칙", "가을", "가족 설득", "인내"],
    relationInsights: [
      { relation: "흥부 ↔ 흥부 아내", note: "지금 타고 싶은 마음과 규칙을 지키려는 마음이 부딪힌다." },
      { relation: "흥부 ↔ 제비", note: "제비가 준 박씨에 대한 믿음이 기다림의 근거가 된다." },
    ],
  };
}
