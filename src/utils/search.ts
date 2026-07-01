import type { AppState, Conflict, Relation, WorldBlock } from "../types";
import { josa, relationSentence } from "./korean";

export interface SearchResult {
  kind: "block" | "relation" | "conflict";
  id: string;
  title: string;
  snippet: string;
  score: number;
  block?: WorldBlock;
  relation?: Relation;
  conflict?: Conflict;
}

export function blockName(state: AppState, id: string): string {
  return state.blocks.find((b) => b.id === id)?.name ?? "?";
}

export function relationLabel(state: AppState, r: Relation): string {
  const source = blockName(state, r.sourceId);
  const target = r.targetId ? blockName(state, r.targetId) : r.targetLabel ?? "?";
  return `${source} / ${r.type} / ${target}`;
}

export function relationNatural(state: AppState, r: Relation): string {
  const source = blockName(state, r.sourceId);
  const target = r.targetId ? blockName(state, r.targetId) : r.targetLabel ?? "?";
  if (r.kind === "event") {
    return `${source}${josa(source, "과", "와")} ${target}${josa(target, "은", "는")} '${r.type}'(${r.episode ?? "회차 미상"}) 사건으로 얽혀 있다.`;
  }
  return relationSentence(source, r.type, target);
}

function scoreText(haystack: string, terms: string[]): number {
  let score = 0;
  const lower = haystack.toLowerCase();
  for (const t of terms) {
    if (!t) continue;
    if (lower.includes(t.toLowerCase())) score += 10;
  }
  return score;
}

/** 사전 정의된 키워드 → 우선 노출할 항목 id 매핑 (AI 의미검색 시뮬레이션) */
const CURATED: { keyword: string; blockIds: string[]; relationIds: string[]; conflictIds: string[] }[] = [
  {
    keyword: "강도현",
    blockIds: ["c1", "r3", "o2"],
    relationIds: ["rel1", "rel2", "rel39"],
    conflictIds: ["cf1"],
  },
  {
    keyword: "도현",
    blockIds: ["c1", "r3", "o2"],
    relationIds: ["rel1", "rel39"],
    conflictIds: ["cf1"],
  },
  {
    keyword: "윤가람",
    blockIds: ["c2", "o3", "l5"],
    relationIds: ["rel21", "rel25"],
    conflictIds: [],
  },
  {
    keyword: "하은채",
    blockIds: ["c6", "l1", "l2"],
    relationIds: ["ev2", "ev3"],
    conflictIds: ["cf2"],
  },
  {
    keyword: "게이트",
    blockIds: ["l1", "l6", "r1"],
    relationIds: ["rel32", "rel27"],
    conflictIds: ["cf5"],
  },
  {
    keyword: "각성",
    blockIds: ["c1", "r2", "i1"],
    relationIds: ["rel39"],
    conflictIds: ["cf1"],
  },
  {
    keyword: "회귀",
    blockIds: ["r3", "c5", "e1"],
    relationIds: ["rel40", "rel26"],
    conflictIds: ["cf9"],
  },
];

export function semanticSearch(state: AppState, query: string): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const terms = q.split(/\s+/).filter((t) => t.length >= 1);
  const results = new Map<string, SearchResult>();

  const push = (r: SearchResult) => {
    const key = `${r.kind}:${r.id}`;
    const prev = results.get(key);
    if (!prev || prev.score < r.score) results.set(key, r);
  };

  // 1) 사전 정의 매핑 (관련도 보너스)
  for (const cur of CURATED) {
    if (!q.includes(cur.keyword)) continue;
    cur.blockIds.forEach((id, i) => {
      const b = state.blocks.find((x) => x.id === id);
      if (b)
        push({ kind: "block", id, title: b.name, snippet: b.description, score: 100 - i, block: b });
    });
    cur.relationIds.forEach((id, i) => {
      const r = state.relations.find((x) => x.id === id);
      if (r)
        push({
          kind: "relation",
          id,
          title: relationLabel(state, r),
          snippet: relationNatural(state, r),
          score: 90 - i,
          relation: r,
        });
    });
    cur.conflictIds.forEach((id, i) => {
      const c = state.conflicts.find((x) => x.id === id);
      if (c)
        push({ kind: "conflict", id, title: c.title, snippet: c.description, score: 85 - i, conflict: c });
    });
  }

  // 2) 일반 키워드 매칭
  for (const b of state.blocks) {
    const s =
      scoreText(b.name, terms) * 3 +
      scoreText(b.description, terms) +
      scoreText(b.tags.join(" "), terms) * 2 +
      scoreText(Object.values(b.attributes).join(" "), terms);
    if (s > 0)
      push({ kind: "block", id: b.id, title: b.name, snippet: b.description, score: s, block: b });
  }
  for (const r of state.relations) {
    const label = relationLabel(state, r);
    const s = scoreText(label, terms) * 2;
    if (s > 0)
      push({
        kind: "relation",
        id: r.id,
        title: label,
        snippet: relationNatural(state, r),
        score: s,
        relation: r,
      });
  }
  for (const c of state.conflicts) {
    const s =
      scoreText(c.title, terms) * 2 +
      scoreText(c.description, terms) +
      scoreText(c.evidenceA + " " + c.evidenceB, terms);
    if (s > 0)
      push({ kind: "conflict", id: c.id, title: c.title, snippet: c.description, score: s, conflict: c });
  }

  return [...results.values()].sort((a, b) => b.score - a.score);
}
