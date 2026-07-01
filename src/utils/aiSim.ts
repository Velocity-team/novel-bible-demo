import type { AppState, WorldBlock } from "../types";
import { relationNatural } from "./search";

/* ─────────────────────────────────────────────────────────
 * 1. 원고 분석 시뮬레이션
 * ──────────────────────────────────────────────────────── */

export interface AnalysisCandidate {
  kind: "character" | "location" | "event" | "rule" | "relation" | "conflict";
  label: string;
  detail: string;
  evidence: string;
}

export interface AnalysisResult {
  detectedBlockNames: string[];
  candidates: AnalysisCandidate[];
}

const KNOWN_KEYWORDS = [
  "강도현",
  "이서준",
  "윤가람",
  "하은채",
  "채린",
  "에르그",
  "게이트",
  "각성",
  "회귀",
  "빙의",
  "각성석",
  "균열교",
];

/** 입력 텍스트에서 키워드가 포함된 첫 문장을 근거처럼 잘라낸다. */
function evidenceFromText(text: string, keyword?: string): string {
  const sentences = text
    .split(/(?<=[.!?다”"])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (keyword) {
    const hit = sentences.find((s) => s.includes(keyword));
    if (hit) return `원고 중: “${hit.slice(0, 80)}”`;
  }
  if (sentences.length > 0) return `원고 중: “${sentences[0].slice(0, 80)}”`;
  return "올린 원고에서 찾아냄";
}

export function simulateManuscriptAnalysis(text: string): AnalysisResult {
  const detected = KNOWN_KEYWORDS.filter((k) => text.includes(k));
  const candidates: AnalysisCandidate[] = [
    {
      kind: "character",
      label: "진서율",
      detail: "지하 경매장의 정보상으로 보이는 새 인물",
      evidence: evidenceFromText(text, "정보상"),
    },
    {
      kind: "location",
      label: "재의 갱도",
      detail: "각성석을 캐는 광산. 새 장소 후보",
      evidence: evidenceFromText(text, "갱도"),
    },
    {
      kind: "event",
      label: "재의 갱도 쟁탈전",
      detail: "각성석 광산을 두고 벌어지는 새 사건",
      evidence: evidenceFromText(text, "각성석"),
    },
    {
      kind: "rule",
      label: "게이트 코어를 부수면 게이트가 닫힌다",
      detail: "새 세계관 규칙 후보 (코어 회수)",
      evidence: evidenceFromText(text, "코어"),
    },
    {
      kind: "relation",
      label: "진서율 / 조력자 / 이서준〈강도현〉",
      detail: "새 관계 후보",
      evidence: evidenceFromText(text, "정보"),
    },
    {
      kind: "conflict",
      label: "각성 등급 불변 규칙과 어긋날 가능성",
      detail:
        "‘각성 등급 불변’ 규칙에 따르면 재각성 없이 등급이 바뀌면 안 됩니다. 주인공의 등급 표기가 회차마다 일관된지 확인하세요.",
      evidence: evidenceFromText(text),
    },
  ];
  return { detectedBlockNames: detected, candidates };
}

/* ─────────────────────────────────────────────────────────
 * 2. 설정 지킴이 (글쓰기 중 실시간 설정 오류 감지)
 * ──────────────────────────────────────────────────────── */

export interface GuardWarning {
  severity: "high" | "medium";
  title: string;
  message: string;
}

export interface GuardResult {
  characters: string[];
  locations: string[];
  events: string[];
  rules: string[];
  warnings: GuardWarning[];
  checkpoints: string[];
}

export function simulateCanonGuard(text: string, state: AppState): GuardResult {
  const found = (type: WorldBlock["type"]) =>
    state.blocks.filter((b) => b.type === type && text.includes(b.name)).map((b) => b.name);

  const warnings: GuardWarning[] = [];

  if (text.includes("하은채") && (text.includes("살아") || text.includes("생존") || text.includes("부산"))) {
    warnings.push({
      severity: "high",
      title: "죽은 인물이 다시 등장합니다",
      message:
        "하은채는 47화 상암 게이트에서 전사한 것으로 저장돼 있습니다. 88화 회귀 분기로 살린 것이 의도라면 배치 변경을 먼저 보여 주고, 아니라면 등장을 수정하세요.",
    });
  }
  if (text.includes("C급") && (text.includes("이서준") || text.includes("도현"))) {
    warnings.push({
      severity: "high",
      title: "각성 등급이 설정과 다릅니다",
      message:
        "주인공의 표면 등급은 ‘E급(위장)’입니다. 재각성 사건 없이 C급으로 오르면 ‘각성 등급 불변’ 규칙에 어긋납니다.",
    });
  }
  if (text.includes("누나") && text.includes("이수아")) {
    warnings.push({
      severity: "medium",
      title: "가족 관계가 설정과 다릅니다",
      message: "이수아는 이서준의 여동생입니다. ‘누나’를 ‘여동생’으로 고치세요.",
    });
  }
  if (text.includes("윤가람") && (text.includes("처음") || text.includes("초면"))) {
    warnings.push({
      severity: "medium",
      title: "윤가람과의 관계에 주의하세요",
      message:
        "윤가람은 전생(회차)엔 도현의 동료였습니다. 현생 초면으로 그리되, 설명 못 할 기시감은 남겨 두는 것이 설정과 맞습니다.",
    });
  }
  if ((text.includes("정체") || text.includes("강도현")) && (text.includes("밝힌") || text.includes("폭로") || text.includes("털어놓"))) {
    warnings.push({
      severity: "high",
      title: "금지 설정에 걸립니다",
      message:
        "‘도현의 정체(강도현·회귀·빙의)를 아군에게 함부로 밝히지 않는다’가 작품 설정에 등록되어 있습니다. 전개를 다시 확인하세요.",
    });
  }

  const checkpoints: string[] = [];
  if (text.includes("게이트")) checkpoints.push("게이트가 나오는 장면은 등급과 제한시간(브레이크 여부)을 함께 적어 주세요.");
  if (text.includes("하은채")) checkpoints.push("하은채의 생사는 회차별로 다릅니다 — 47화 전사, 88화 분기 이후 생존.");
  if (text.includes("등급") || text.includes("각성")) checkpoints.push("주인공의 표면 등급은 ‘E급(위장)’이 기준입니다.");
  if (checkpoints.length === 0 && text.trim())
    checkpoints.push("새 회차를 쓰기 전, 설정 오류 검사에서 미해결 항목을 먼저 확인하세요.");

  return {
    characters: found("character"),
    locations: found("location"),
    events: found("event"),
    rules: state.blocks
      .filter((b) => b.type === "rule" && (text.includes(b.name) || b.tags.some((t) => text.includes(t))))
      .map((b) => b.name),
    warnings,
    checkpoints,
  };
}

/* ─────────────────────────────────────────────────────────
 * 3. AI에게 물어보기 (질문 → 사전 정의 답변)
 * ──────────────────────────────────────────────────────── */

export interface LoreAnswer {
  text: string;
  blockIds: string[];
  relationIds: string[];
  conflictIds: string[];
}

export function simulateLoreAnswer(question: string, state: AppState): LoreAnswer {
  const q = question;

  if (q.includes("강도현") || q.includes("이서준") || q.includes("주인공")) {
    return {
      text: "주인공은 몸은 이서준, 의식은 전생 S급 헌터 강도현입니다(빙의+회귀, 3회차). 종말급 게이트 흑일에서 죽은 뒤 10년 전 이서준의 몸에서 눈을 떴고, 전생 지식으로 재앙을 앞질러 막으려 합니다. 표면 등급은 E급으로 위장하고 있습니다.",
      blockIds: ["c1", "r3", "r4"],
      relationIds: ["rel1", "rel39"],
      conflictIds: ["cf1"],
    };
  }
  if (q.includes("하은채")) {
    return {
      text: "하은채는 상암 공략대의 신입(D급)입니다. 47화 상암 게이트에서 전사하지만, 88화 도현의 선택으로 세계선이 바뀌며 89화 부산에서 살아 등장합니다. 지금 ‘죽은 인물이 살아서 등장’ 설정 오류로 표시돼 있으니, 89화 앞에 배치 변경을 연결해 주세요.",
      blockIds: ["c6", "l1", "l2"],
      relationIds: ["ev2", "ev3"],
      conflictIds: ["cf2"],
    };
  }
  if (q.includes("등급") || q.includes("E급") || q.includes("C급") || q.includes("각성")) {
    return {
      text: "각성 등급은 한 번 정해지면 바뀌지 않습니다(각성 등급 불변). 주인공의 표면 등급은 E급(위장)인데, 12화 E급과 58화 C급 표기가 어긋나 지금 설정 오류로 감지돼 있습니다. 위장이 들통난 설정이라면 재측정 사건을 명시하세요.",
      blockIds: ["c1", "r2"],
      relationIds: ["rel39"],
      conflictIds: ["cf1"],
    };
  }
  if (q.includes("윤가람")) {
    return {
      text: "윤가람은 청랑 길드 마스터(S급)이자 현생의 라이벌입니다. 전생(1·2회차)엔 도현의 동료였으나 이번 생엔 아직 남남이며, 설명 못 할 기시감만 느낍니다. 66화 대립을 거쳐 97화에 전생 기억을 되찾고 공조합니다.",
      blockIds: ["c2", "o3"],
      relationIds: ["rel21", "rel25"],
      conflictIds: [],
    };
  }
  if (q.includes("회귀") || q.includes("빙의") || q.includes("에르그") || q.includes("회차")) {
    return {
      text: "강도현은 죽으면 10년 전 이서준의 몸으로 회귀하며 기억을 유지합니다(회귀 법칙). 착지점이 타인의 몸이라 ‘빙의’이며, 회차가 반복될수록 세계선이 미세하게 달라집니다(회차 간섭). 회귀를 부여하는 존재가 시스템 인격 ‘에르그’입니다.",
      blockIds: ["r3", "r6", "c5"],
      relationIds: ["rel1", "rel40"],
      conflictIds: ["cf9"],
    };
  }
  if (q.includes("떡밥") || q.includes("복선")) {
    return {
      text: "아직 회수되지 않은 떡밥은 세 가지입니다. ① 에르그가 왜 회차를 반복시키는가, ② 윤가람이 느끼는 기시감(전생 동료)의 정체, ③ 균열교 교주 ‘흑관’의 정체와 그가 회귀를 아는지 여부. 후반부(97~100화)에서 함께 회수하는 것을 추천합니다.",
      blockIds: ["c5", "c2", "c12"],
      relationIds: ["rel26"],
      conflictIds: [],
    };
  }
  if (q.includes("오류") || q.includes("충돌")) {
    return {
      text: "지금 가장 위험한 설정 오류는 두 가지입니다. ① 주인공 각성 등급(12화 E급 ↔ 58화 C급), ② 죽은 하은채가 89화에 살아서 등장. 그 외에 창설 전 백호 길드 언급(18화)과 소꿉친구 채린을 초면처럼 소개한 장면(34화)도 확인이 필요합니다. 반대로 ‘주인공이 미래를 앎’은 회귀 설정이라 의도된 것으로 표시돼 있습니다.",
      blockIds: ["c1", "c6", "o2"],
      relationIds: [],
      conflictIds: ["cf1", "cf2", "cf3", "cf4"],
    };
  }
  if (q.includes("다음") || q.includes("새 에피소드") || q.includes("이어")) {
    return {
      text: "지금 저장된 설정 기준으로는 ‘회귀 분기의 대가’ 방향이 적합합니다. 88화에서 하은채를 살린 선택이 부른 예측 불가한 미래(부산 이후)를 다루면, 회차 간섭 규칙과 에르그 복선을 함께 살릴 수 있습니다.",
      blockIds: ["e12", "e13", "r6"],
      relationIds: ["rel46"],
      conflictIds: [],
    };
  }

  // 폴백: 키워드 매칭으로 관련 카드를 찾아 요약
  const hitBlocks = state.blocks.filter(
    (b) => q.includes(b.name) || b.tags.some((t) => q.includes(t))
  );
  if (hitBlocks.length > 0) {
    const main = hitBlocks[0];
    const rels = state.relations.filter(
      (r) => r.sourceId === main.id || r.targetId === main.id
    );
    const relText = rels
      .slice(0, 3)
      .map((r) => relationNatural(state, r))
      .join(" ");
    return {
      text: `${main.name}에 대해 저장된 내용입니다. ${main.description} ${relText}`.trim(),
      blockIds: hitBlocks.slice(0, 4).map((b) => b.id),
      relationIds: rels.slice(0, 4).map((r) => r.id),
      conflictIds: state.conflicts
        .filter((c) => c.relatedBlockIds.includes(main.id) && c.status === "open")
        .map((c) => c.id),
    };
  }

  return {
    text: "질문과 이어지는 저장 기록을 찾지 못했습니다. 인물 이름(강도현/이서준, 윤가람, 하은채)이나 설정 키워드(게이트, 각성 등급, 회귀, 빙의)를 넣어 다시 물어봐 주세요.",
    blockIds: [],
    relationIds: [],
    conflictIds: [],
  };
}

/* ─────────────────────────────────────────────────────────
 * 5. 집필 점검 지표 (설정 일관성 · 떡밥 회수율)
 * ──────────────────────────────────────────────────────── */

export interface ConsistencyReport {
  /** 설정 일관성: 저장된 설정끼리 어긋나지 않는 정도 */
  canonConsistency: number;
  /** 떡밥 회수율: 깔아 둔 복선을 이야기에서 회수한 비율 */
  foreshadowingRecovery: number;
  canonNote: string;
  foreshadowNote: string;
}

export function simulateConsistency(state: AppState): ConsistencyReport {
  const open = state.conflicts.filter((c) => c.status === "open");
  const resolved = state.conflicts.filter((c) => c.status === "resolved");
  const highOpen = open.filter((c) => c.severity === "high").length;

  const canon = Math.max(40, Math.min(98, 74 + resolved.length * 6 - highOpen * 2));
  const foreshadow = Math.min(95, 58 + state.scenarios.length * 6 + resolved.length * 3);

  return {
    canonConsistency: canon,
    foreshadowingRecovery: foreshadow,
    canonNote:
      open.length > 0
        ? `주인공 각성 등급, 하은채 생사 등 미해결 설정 오류 ${open.length}건이 남아 있습니다. 오류를 해결하면 설정이 더 단단해집니다.`
        : "미해결 설정 오류가 없습니다. 설정이 잘 지켜지고 있습니다.",
    foreshadowNote:
      "‘에르그의 정체’와 ‘윤가람의 전생 기억’이 아직 회수되지 않은 떡밥입니다. 새 에피소드에서 회수해 보세요.",
  };
}

/* ─────────────────────────────────────────────────────────
 * 6. AI 기억 요약 (설정 카드별)
 * ──────────────────────────────────────────────────────── */

export function aiRecall(blockId: string, state: AppState): string {
  const b = state.blocks.find((x) => x.id === blockId);
  if (!b) return "이 설정 카드에 대해 저장된 내용이 없습니다.";
  const rels = state.relations.filter((r) => r.sourceId === b.id || r.targetId === b.id);
  const relTexts = rels.slice(0, 4).map((r) => relationNatural(state, r));
  const conflicts = state.conflicts.filter(
    (c) => c.relatedBlockIds.includes(b.id) && c.status === "open"
  );
  const attr = Object.entries(b.attributes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  const parts = [
    `${b.name}${attr ? ` (${attr})` : ""} — ${b.description}`,
    relTexts.join(" "),
    conflicts.length > 0
      ? `지금 ${conflicts.map((c) => `'${c.title}'`).join(", ")} 오류가 발견되어 확인이 필요합니다.`
      : "지금 발견된 설정 오류는 없습니다.",
  ];
  return parts.filter(Boolean).join(" ");
}
