export type BlockType =
  | "character"
  | "location"
  | "event"
  | "organization"
  | "rule"
  | "item";

/** 설정 카드가 어떻게 만들어졌는지 표시하는 상태 */
export type AIStatus =
  | "Learned"
  | "Manually Added"
  | "Imported from Excel"
  | "Needs Review"
  | "Conflict Risk";

export interface WorldBlock {
  id: string;
  name: string;
  type: BlockType;
  description: string;
  episode?: string;
  firstAppearance?: string;
  attributes: Record<string, string>;
  tags: string[];
  aiStatus: AIStatus;
  sourceEvidence: string[];
  canonNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  /** targetId가 빈 문자열일 때 자유 텍스트 대상(예: "가을에 다 익은 박") */
  targetLabel?: string;
  type: string;
  /** "event"면 두 인물을 잇는 사건 연결선 (설정 지도에서 선 위에 사건 이름 표시) */
  kind?: "event";
  /** kind가 "event"일 때 해당 사건 설정 카드 id */
  eventId?: string;
  evidence?: string;
  episode?: string;
  origin?: "mock" | "manual" | "excel" | "analysis";
  createdAt: string;
}

export type ConflictType =
  | "인물 상태 오류"
  | "숫자/시간 오류"
  | "가족 관계 오류"
  | "세계관 규칙 위반"
  | "사건 순서 오류"
  | "관계 충돌";

export interface Conflict {
  id: string;
  title: string;
  type: ConflictType;
  severity: "high" | "medium" | "low";
  description: string;
  evidenceA: string;
  evidenceB: string;
  recommendation: string;
  relatedBlockIds: string[];
  status: "open" | "resolved" | "ignored";
  location: { episode: string; sentence: string };
  fixGuide: string[];
}

export interface Episode {
  id: string;
  title: string;
  number: number;
  summary: string;
  wordCount: number;
  /** 회차 시점의 작품 속 시간(연도·계절) */
  date?: WorldDate;
}

/** 작품 속(인게임) 시간. 동화라 연·월 대신 연도 차수와 계절로 표현한다. */
export interface WorldDate {
  /** 작품 1년차 = 1, 이듬해 = 2 … */
  year: number;
  /** 봄·여름·가을·겨울 */
  season: "봄" | "여름" | "가을" | "겨울";
  /** HUD에 덧붙일 짧은 설명 (예: "쫓겨난 해") */
  label?: string;
}

// ── 회차별 세계관 지도(아틀라스) 전용 타입 ──────────────────

export type Tile =
  | "void"
  | "grass"
  | "soil"
  | "path"
  | "floor"
  | "wall"
  | "water"
  | "sand"
  | "tree"
  | "rice"
  | "gourd"
  | "pot";

/** 흥부네 초가집·놀부네 기와집·강남 같은 큰 장소 단위 */
export interface MapZone {
  id: string;
  kind: "home" | "village" | "faraway";
  name: string;
  /** 연결된 장소 설정 카드 id (있으면 클릭 시 설정 카드 열기) */
  blockId?: string;
  /** 한 줄 설명 (HUD에 표시) */
  blurb: string;
}

/** 한 zone의 실제 타일 배치(2D 맵). grid[y][x] */
export interface StageMap {
  id: string;
  zoneId: string;
  name: string;
  width: number;
  height: number;
  grid: Tile[][];
}

/** 특정 회차에 어떤 캐릭터가 어느 zone의 어디(x,y)에서 무엇을 하는지 */
export interface CharacterPlacement {
  episodeId: string;
  characterId: string;
  zoneId: string;
  x: number;
  y: number;
  activity: string;
}

export interface Project {
  id: string;
  title: string;
  genre: string;
  logline: string;
  summary: string;
  episodes: Episode[];
  canonRules: string[];
  generationConstraints: string[];
  forbiddenSettings: string[];
}

export interface MemorySource {
  id: string;
  title: string;
  sourceType: "manuscript" | "excel" | "manual" | "generated";
  learnedItems: number;
  status: "synced" | "needs_review" | "failed";
  updatedAt: string;
}

export interface Scenario {
  id: string;
  title: string;
  purpose: string;
  mainCharacterId: string;
  relatedEventId?: string;
  tone: string;
  length: string;
  includedBlockIds: string[];
  excludedBlockIds: string[];
  outline: string;
  scenes: string[];
  usedSettings: string[];
  conflictCheck: string[];
  authorNote: string;
  createdAt: string;
}

export interface Draft {
  id: string;
  episodeTitle: string;
  sceneTitle: string;
  content: string;
  detectedBlockIds: string[];
  warnings: string[];
  updatedAt: string;
}

export interface ProjectNote {
  id: string;
  title: string;
  content: string;
  relatedBlockIds: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  relatedBlockIds: string[];
  relatedRelationIds: string[];
  relatedConflictIds: string[];
  createdAt: string;
}

export interface AppState {
  /** 처음 사용 안내(온보딩)를 끝냈는지 여부 */
  onboarded: boolean;
  project: Project;
  blocks: WorldBlock[];
  relations: Relation[];
  conflicts: Conflict[];
  drafts: Draft[];
  scenarios: Scenario[];
  notes: ProjectNote[];
  memorySources: MemorySource[];
  chatHistory: ChatMessage[];
  checkedSuggestions: string[];
  canonScore: number;
  lastTrainedAt: string;
  /** 회차별 세계관 지도 데이터 */
  zones: MapZone[];
  stages: StageMap[];
  placements: CharacterPlacement[];
}

export type PageKey =
  | "dashboard"
  | "writing"
  | "import"
  | "memory"
  | "blocks"
  | "relations"
  | "scenario"
  | "ask"
  | "conflicts"
  | "settings"
  | "about"
  | "atlas"
  | "plotroom";

// ── PlotRoom 전용 타입 ─────────────────────────────────────

export interface CharacterPersona {
  characterId: string;
  speechStyle: string;
  personality: string[];
  goals: string[];
  coreMemories: { episode: string; content: string }[];
  forbiddenActions: string[];
  ragSources: string[];
}

export interface MeetingTurn {
  characterId: string;
  characterName: string;
  emotion: string;
  statement: string;
  internalThought?: string;
  ragEpisodes: string[];
  isAction?: boolean;
}

export type SubstoryType =
  | "감정선 보강형"
  | "관계 변화형"
  | "복선 회수형"
  | "갈등 확장형"
  | "코미디 완충형";

export type RiskLevel = "낮음" | "중간" | "높음";

export interface SubstoryCandidate {
  id: string;
  type: SubstoryType;
  title: string;
  summary: string;
  keyMoment: string;
  riskLevel: RiskLevel;
  riskReason: string;
  relatedCharacterIds: string[];
  relatedEpisodes: string[];
  /** 이 추천이 다루는 인물 관계 (예: "흥부 ↔ 흥부 아내") */
  relationLabel: string;
  /** 방향을 한눈에 보여 주는 키워드 묶음 */
  keywords: string[];
}

/** 캐릭터 회의 결과를 키워드 중심으로 요약한 묶음 */
export interface MeetingKeywordSummary {
  /** 회의에서 뽑힌 핵심 키워드 */
  keywords: string[];
  /** 관계별로 정리한 한 줄 관찰 */
  relationInsights: { relation: string; note: string }[];
}
