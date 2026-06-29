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
  "흥부",
  "놀부",
  "제비",
  "박씨",
  "밥주걱",
  "강남",
  "초가집",
  "기와집",
  "박 타기",
  "도깨비",
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
      label: "도깨비",
      detail: "놀부의 박에서 나오는 것으로 보이는 새 인물",
      evidence: evidenceFromText(text, "도깨비"),
    },
    {
      kind: "location",
      label: "놀부네 박밭",
      detail: "놀부가 박씨를 심으려고 만든 새 장소",
      evidence: evidenceFromText(text, "박밭"),
    },
    {
      kind: "event",
      label: "놀부의 박 타기",
      detail: "놀부가 욕심으로 받은 박을 타는 새 사건",
      evidence: evidenceFromText(text, "박"),
    },
    {
      kind: "rule",
      label: "일부러 다치게 한 제비의 박씨에서는 재앙이 나온다",
      detail: "새 세계관 규칙 후보 (욕심의 대가를 구체화)",
      evidence: evidenceFromText(text, "재앙"),
    },
    {
      kind: "relation",
      label: "도깨비 / 응징 / 놀부",
      detail: "새 관계 후보",
      evidence: evidenceFromText(text, "놀부"),
    },
    {
      kind: "conflict",
      label: "은혜 갚기 규칙과 어긋날 가능성",
      detail:
        "‘은혜 갚기 규칙’에 따르면 제비는 진심 어린 선행에만 보답합니다. 놀부에게 박씨를 주는 장면은 이 규칙과 어긋나지 않는지 확인하세요.",
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

  if (text.includes("제비") && text.includes("왼쪽 다리")) {
    warnings.push({
      severity: "high",
      title: "제비 다리 방향이 다릅니다",
      message:
        "저장된 설정에서 제비가 다친 다리는 오른쪽입니다. ‘왼쪽 다리’를 ‘오른쪽 다리’로 고치거나 설정 카드를 수정하세요.",
    });
  }
  if ((text.includes("여름") || text.includes("뙤약볕")) && text.includes("박을 탔")) {
    warnings.push({
      severity: "high",
      title: "박 타기 규칙에 어긋납니다",
      message:
        "박은 가을에 다 익은 뒤에만 탈 수 있습니다. 계절을 가을로 바꾸거나, 덜 익은 박에서 아무것도 나오지 않는 장면으로 고치세요.",
    });
  }
  if (text.includes("아홉 남매") || (text.includes("자식") && text.includes("아홉"))) {
    warnings.push({
      severity: "medium",
      title: "자식 수가 설정과 다릅니다",
      message:
        "저장된 설정에서 흥부네 자식은 열두 명입니다. 숫자를 열두 명으로 고치거나 ‘아이들’처럼 숫자 없이 표현하세요.",
    });
  }
  if (text.includes("놀부") && (text.includes("착한") || text.includes("선뜻 나눠"))) {
    warnings.push({
      severity: "medium",
      title: "놀부 성격이 설정과 다릅니다",
      message:
        "놀부의 성격은 ‘욕심 많음’으로 저장되어 있습니다. 개과천선 장면이라면 그 계기를 먼저 보여 주세요.",
    });
  }
  if (text.includes("흥부") && text.includes("복수")) {
    warnings.push({
      severity: "high",
      title: "금지 설정에 걸립니다",
      message:
        "‘흥부가 놀부에게 직접 복수하는 전개 금지’가 작품 설정에 등록되어 있습니다. 전개를 다시 확인하세요.",
    });
  }

  const checkpoints: string[] = [];
  if (text.includes("박")) checkpoints.push("박이 나오는 장면은 계절(가을 여부)을 함께 적어 주세요.");
  if (text.includes("제비")) checkpoints.push("제비가 다친 다리는 ‘오른쪽’이 기준입니다.");
  if (text.includes("놀부")) checkpoints.push("놀부의 벌은 마지막 회차 전까지 미루기로 되어 있습니다.");
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

  if (q.includes("흥부") && q.includes("놀부")) {
    return {
      text: "흥부와 놀부는 형제입니다. 형 놀부는 부모님의 유산을 독차지하고 흥부네를 내쫓았기 때문에 두 사람은 사이가 나쁩니다. 흥부네 가족은 초가집에서, 놀부네 가족은 기와집에서 삽니다.",
      blockIds: ["c1", "c2", "o1", "o2"],
      relationIds: ["rel1", "rel17", "rel6", "rel7"],
      conflictIds: [],
    };
  }
  if (q.includes("제비") && (q.includes("다리") || q.includes("다쳤"))) {
    return {
      text: "제비는 3화에서 구렁이에게서 떨어져 오른쪽 다리가 부러졌고, 흥부가 치료해 주었습니다. 다만 5화에 ‘왼쪽 다리’라는 표현이 있어 지금 설정 오류로 표시되어 있습니다. 오른쪽으로 통일하는 것을 추천합니다.",
      blockIds: ["c5", "e3"],
      relationIds: ["rel8"],
      conflictIds: ["cf2"],
    };
  }
  if (q.includes("박") && (q.includes("언제") || q.includes("조건") || q.includes("규칙"))) {
    return {
      text: "박은 가을에 다 익은 뒤에만 탈 수 있습니다. 덜 익은 박에서는 아무것도 나오지 않습니다. 다만 4화에 한여름에 박을 타는 장면이 있어 규칙 위반으로 감지된 상태입니다.",
      blockIds: ["r2", "i1", "e5"],
      relationIds: ["rel15"],
      conflictIds: ["cf3"],
    };
  }
  if (q.includes("박씨")) {
    return {
      text: "박씨는 제비가 은혜를 갚으려고 흥부에게 물어다 준 씨앗입니다(4화). 심으면 신비한 박이 열리고, 가을에 다 익은 박을 타자 금은보화가 나왔습니다(5화). 은혜 갚기 규칙에 따라 진심 어린 선행에만 보답이 따릅니다.",
      blockIds: ["i1", "e4", "e5", "r1"],
      relationIds: ["rel12", "rel18", "rel19"],
      conflictIds: [],
    };
  }
  if (q.includes("자식") || q.includes("아이")) {
    return {
      text: "흥부네 자식은 열두 명이 기준 설정입니다. 다만 4화에 ‘아홉 남매’라는 표현이 있어 숫자 충돌이 감지되어 있습니다. 숫자가 중요하지 않은 장면에서는 ‘아이들’로 표현하는 것을 추천합니다.",
      blockIds: ["c1", "o1"],
      relationIds: ["rel2"],
      conflictIds: ["cf1"],
    };
  }
  if (q.includes("떡밥") || q.includes("복선")) {
    return {
      text: "아직 회수되지 않은 떡밥은 두 가지입니다. ① 놀부의 박 — 놀부가 일부러 제비 다리를 부러뜨려 받게 될 박에서 무엇이 나올지 아직 보여주지 않았습니다. ② 욕심의 대가 규칙 — ‘꾸민 선행에는 재앙이 따른다’는 규칙이 아직 실제 사건으로 등장하지 않았습니다. 다음 회차에서 두 떡밥을 함께 회수하는 것을 추천합니다.",
      blockIds: ["c2", "r3", "e4"],
      relationIds: ["rel16"],
      conflictIds: [],
    };
  }
  if (q.includes("오류") || q.includes("충돌")) {
    return {
      text: "지금 가장 위험한 설정 오류는 두 가지입니다. ① 흥부네 자식 수(열두 명 ↔ 아홉 명), ② 제비가 다친 다리 방향(오른쪽 ↔ 왼쪽). 그 외에 한여름 박 타기(규칙 위반)와 2화의 기와집 표현(사건 순서 오류)도 확인이 필요합니다.",
      blockIds: ["c1", "c5", "r2"],
      relationIds: [],
      conflictIds: ["cf1", "cf2", "cf3", "cf4"],
    };
  }
  if (q.includes("7화") || q.includes("다음") || q.includes("새 에피소드")) {
    return {
      text: "지금 저장된 설정 기준으로는 ‘놀부의 박 타기’ 에피소드가 적합합니다. 샘이 난 놀부가 일부러 제비 다리를 부러뜨려 박씨를 받고, 욕심의 대가 규칙에 따라 박에서 재앙이 나오는 이야기입니다. 미회수 떡밥 두 개를 한 번에 회수할 수 있습니다.",
      blockIds: ["c2", "r3", "e4", "e5"],
      relationIds: ["rel16", "rel19"],
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
    text: "질문과 이어지는 저장 기록을 찾지 못했습니다. 인물 이름(흥부, 놀부, 제비)이나 설정 키워드(박씨, 밥주걱, 강남)를 넣어 다시 물어봐 주세요.",
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
        ? `자식 수, 제비 다리 방향 등 미해결 설정 오류 ${open.length}건이 남아 있습니다. 오류를 해결하면 설정이 더 단단해집니다.`
        : "미해결 설정 오류가 없습니다. 설정이 잘 지켜지고 있습니다.",
    foreshadowNote:
      "‘놀부의 박’과 ‘욕심의 대가 규칙’이 아직 회수되지 않은 떡밥입니다. 새 에피소드에서 회수해 보세요.",
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
