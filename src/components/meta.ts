import type { AIStatus, BlockType } from "../types";

// Bauhaus: 종류는 '색'이 아니라 아이콘·라벨로 구분한다. 칩은 무채 헤어라인으로 통일.
// 그래프 노드만 잉크 램프의 명도 차로 약한 위계를 준다(색상 아님, 흑백에서도 유지).
export const BLOCK_TYPE_META: Record<
  BlockType,
  { label: string; icon: string; color: string; chip: string; node: string }
> = {
  character: {
    label: "인물",
    icon: "character",
    color: "#1d1d1f",
    chip: "border border-line bg-paper-2 text-ink-mid",
    node: "#1d1d1f",
  },
  location: {
    label: "장소",
    icon: "location",
    color: "#424245",
    chip: "border border-line bg-paper-2 text-ink-mid",
    node: "#424245",
  },
  event: {
    label: "사건",
    icon: "event",
    color: "#6e6e73",
    chip: "border border-line bg-paper-2 text-ink-mid",
    node: "#6e6e73",
  },
  organization: {
    label: "무리",
    icon: "organization",
    color: "#424245",
    chip: "border border-line bg-paper-2 text-ink-mid",
    node: "#515156",
  },
  rule: {
    label: "규칙",
    icon: "rule",
    color: "#6e6e73",
    chip: "border border-line bg-paper-2 text-ink-mid",
    node: "#7c7c82",
  },
  item: {
    label: "물건",
    icon: "item",
    color: "#86868b",
    chip: "border border-line bg-paper-2 text-ink-mid",
    node: "#86868b",
  },
};

// AI 상태: 대부분 중립. '오류 위험'만 단일 신호색으로.
export const AI_STATUS_META: Record<
  AIStatus,
  { label: string; chip: string; icon: string }
> = {
  Learned: { label: "원고에서 학습함", chip: "border border-line bg-paper-2 text-ink-mid", icon: "sparkles" },
  "Manually Added": { label: "직접 입력함", chip: "border border-line bg-paper-2 text-ink-mid", icon: "edit" },
  "Imported from Excel": { label: "설정표에서 가져옴", chip: "border border-line bg-paper-2 text-ink-mid", icon: "table" },
  "Needs Review": { label: "확인 필요", chip: "border border-line bg-paper text-ink-soft", icon: "eye" },
  "Conflict Risk": { label: "오류 위험", chip: "border border-signal bg-signal-bg text-signal", icon: "alert" },
};

// 심각도: 색이 아니라 무게로도 구분. 심각(=진짜 충돌)만 신호색.
export const SEVERITY_META = {
  high: { label: "심각", chip: "border border-signal bg-signal-bg text-signal" },
  medium: { label: "보통", chip: "border border-line bg-paper-2 text-ink-mid" },
  low: { label: "가벼움", chip: "border border-line bg-paper text-ink-soft" },
} as const;
