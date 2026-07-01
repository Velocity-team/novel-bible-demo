import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { excelPreviewRows, excelRelationRows } from "../data/mockData";
import {
  simulateManuscriptAnalysis,
  type AnalysisResult,
} from "../utils/aiSim";
import type { BlockType } from "../types";
import { Icon } from "../components/Icon";
import NewWriting from "./NewWriting";

const TABS = [
  { key: "file", label: "파일 올리기" },
  { key: "text", label: "글 붙여넣기" },
  { key: "excel", label: "설정표 올리기" },
] as const;

const LOADING_STEPS = [
  "원고를 읽는 중",
  "인물·장소·사건을 찾는 중",
  "기존 설정과 어긋나는 곳을 검사하는 중",
];

const CANDIDATE_META: Record<string, { label: string; icon: string }> = {
  character: { label: "새로 찾은 인물", icon: "character" },
  location: { label: "새로 찾은 장소", icon: "location" },
  event: { label: "새로 찾은 사건", icon: "event" },
  rule: { label: "새로 찾은 규칙", icon: "rule" },
  relation: { label: "새로 찾은 관계", icon: "relations" },
  conflict: { label: "어긋날 수 있는 부분", icon: "conflicts" },
};

export default function ManuscriptImport() {
  const { state, navigate, addBlock, addRelation, addMemorySource, page } = useApp();
  // 원고·설정 불러오기 안에 '새 회차 쓰기'를 탭으로 합쳤다.
  const [mode, setMode] = useState<"import" | "writing">(page === "writing" ? "writing" : "import");
  useEffect(() => {
    setMode(page === "writing" ? "writing" : "import");
  }, [page]);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("file");
  const [episode, setEpisode] = useState("101화");
  const [text, setText] = useState("");
  const [loadingStep, setLoadingStep] = useState<number | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [addedToBlocks, setAddedToBlocks] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [excelFile, setExcelFile] = useState<string | null>(null);
  const [excelImported, setExcelImported] = useState(false);
  const timeouts = useRef<number[]>([]);

  const runAnalysis = (sourceTitle: string) => {
    setResult(null);
    setAddedToBlocks(false);
    setLoadingStep(0);
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [
      window.setTimeout(() => setLoadingStep(1), 600),
      window.setTimeout(() => setLoadingStep(2), 1200),
      window.setTimeout(() => {
        setLoadingStep(null);
        setResult(simulateManuscriptAnalysis(text || sourceTitle));
      }, 1800),
    ];
  };

  const addToWorldBlocks = () => {
    if (!result || addedToBlocks) return;
    const existing = new Set(state.blocks.map((b) => b.name));
    const nameToId = new Map(state.blocks.map((b) => [b.name, b.id]));

    const candidates: { name: string; type: BlockType; description: string }[] = [
      { name: "진서율", type: "character", description: "지하 경매장의 정보상. 회색지대에서 도현에게 정보를 파는 조력자." },
      { name: "재의 갱도", type: "location", description: "각성석을 캐는 광산. 균열교가 노리는 곳." },
      { name: "재의 갱도 쟁탈전", type: "event", description: "각성석 광산을 두고 백호와 균열교가 충돌하는 사건." },
      { name: "코어 회수 법칙", type: "rule", description: "게이트 최심부의 코어를 부수면 게이트가 닫힌다. 코어는 각성석의 원료." },
    ];
    for (const c of candidates) {
      if (existing.has(c.name)) continue;
      const nb = addBlock({
        name: c.name,
        type: c.type,
        description: c.description,
        firstAppearance: episode,
        attributes: {},
        tags: ["원고에서 찾음"],
        aiStatus: "Needs Review",
        sourceEvidence: text
          ? [`${episode}: “${text.slice(0, 60)}…”`]
          : [`${episode} 원고에서 찾아냄`],
        canonNotes: "",
      });
      nameToId.set(nb.name, nb.id);
    }
    const srcId = nameToId.get("진서율");
    const tgtId = nameToId.get("이서준〈강도현〉");
    if (srcId && tgtId) {
      const dup = state.relations.some(
        (r) => r.sourceId === srcId && r.targetId === tgtId && r.type === "조력자"
      );
      if (!dup) addRelation({ sourceId: srcId, targetId: tgtId, type: "조력자", origin: "analysis", episode });
    }
    addMemorySource({
      title: `${episode} 원고`,
      sourceType: "manuscript",
      learnedItems: result.candidates.length + result.detectedBlockNames.length,
      status: "synced",
    });
    setAddedToBlocks(true);
  };

  const importExcel = () => {
    if (excelImported) return;
    const nameToId = new Map(state.blocks.map((b) => [b.name, b.id]));
    for (const row of excelPreviewRows) {
      if (nameToId.has(row.name)) continue;
      const attributes: Record<string, string> = {};
      row.attribute
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((pair) => {
          const [k, ...rest] = pair.split("=");
          if (k && rest.length) attributes[k.trim()] = rest.join("=").trim();
        });
      const nb = addBlock({
        name: row.name,
        type: row.type as BlockType,
        description: row.description,
        firstAppearance: row.episode,
        attributes,
        tags: row.tags.split(",").map((t) => t.trim()).filter(Boolean),
        aiStatus: "Imported from Excel",
        sourceEvidence: [`${row.episode} 설정표에서 가져옴`],
        canonNotes: "",
      });
      nameToId.set(nb.name, nb.id);
    }
    for (const r of excelRelationRows) {
      const s = nameToId.get(r.source);
      const t = nameToId.get(r.target);
      if (!s || !t) continue;
      const dup = state.relations.some(
        (x) => x.sourceId === s && x.targetId === t && x.type === r.type
      );
      if (!dup) addRelation({ sourceId: s, targetId: t, type: r.type, origin: "excel" });
    }
    addMemorySource({
      title: "설정 정리표 (엑셀)",
      sourceType: "excel",
      learnedItems: excelPreviewRows.length + excelRelationRows.length,
      status: "synced",
    });
    setExcelImported(true);
  };

  return (
    <div className="fade-up space-y-5">
      {/* 불러오기 / 새 회차 쓰기 전환 */}
      <div className="flex gap-1 rounded-sm border border-line bg-paper-2 p-1.5">
        {([
          ["import", "원고·설정 불러오기"],
          ["writing", "새 회차 쓰기"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setMode(k)}
            className={`flex-1 rounded-sm px-3 py-2 text-sm font-semibold transition ${
              mode === k ? "bg-paper text-ink" : "text-ink-soft hover:text-ink-mid"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "writing" && <NewWriting />}

      {mode === "import" && (
      <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-ink">원고·설정 불러오기</h2>
        <p className="text-base text-ink-soft">
          새로 쓴 원고를 올리면 인물·장소·사건·규칙이 자동으로 설정 카드로 저장됩니다.
        </p>
      </div>

      {/* 탭 */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`chip cursor-pointer px-4 py-2.5 text-base transition ${
              tab === t.key
                ? "border-ink bg-ink text-paper"
                : "hover:bg-paper-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ① 파일 드래그앤드롭 */}
      {tab === "file" && (
        <section className="card space-y-3 p-6">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              setFileName(f ? f.name : "74화 재의 갱도.txt");
            }}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed px-6 py-12 text-center transition ${
              dragOver ? "border-ink bg-paper-2" : "border-line bg-paper-2 hover:border-ink-mid"
            }`}
          >
            <Icon name="upload" size={32} className="mb-2 text-ink-faint" />
            <span className="text-lg font-semibold text-ink-mid">
              원고 파일을 여기로 끌어다 놓거나 클릭하세요
            </span>
            <span className="mt-1 text-base text-ink-soft">
              .txt / .docx / .pdf — 파일은 이 브라우저 안에서만 처리됩니다.
            </span>
            <input
              type="file"
              accept=".txt,.docx,.pdf"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
          {fileName && (
            <div className="fade-up flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line bg-paper-2 px-4 py-3">
              <div className="text-base text-ink-mid">
                <b>{fileName}</b> — 학습 준비 완료
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="input w-28"
                  value={episode}
                  onChange={(e) => setEpisode(e.target.value)}
                  placeholder="회차"
                />
                <button
                  className="btn-primary"
                  onClick={() => runAnalysis(fileName)}
                  disabled={loadingStep !== null}
                >
                  학습하기
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ② 텍스트 */}
      {tab === "text" && (
        <section className="card space-y-3 p-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="sm:w-44">
              <label className="label">몇 화인가요?</label>
              <input
                className="input"
                value={episode}
                onChange={(e) => setEpisode(e.target.value)}
                placeholder="예: 7화"
              />
            </div>
            <div className="flex-1">
              <label className="label">원고 내용</label>
              <textarea
                className="input min-h-40"
                placeholder="원고나 설정 글을 붙여넣으세요. 예: 도현은 아직 열리지도 않은 게이트의 위치를 정확히 짚었다. 전생의 기억이었다…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => runAnalysis(`${episode} 원고`)}
            disabled={loadingStep !== null}
          >
            학습하기
          </button>
        </section>
      )}

      {/* ③ 설정표(엑셀) */}
      {tab === "excel" && (
        <section className="card space-y-4 p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-line bg-paper-2 px-6 py-10 text-center transition hover:border-ink-mid">
            <Icon name="table" size={32} className="mb-2 text-ink-faint" />
            <span className="text-lg font-semibold text-ink-mid">
              설정 정리표(.xlsx / .csv)를 끌어다 놓거나 클릭하세요
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                setExcelFile(e.target.files?.[0]?.name ?? null);
                setExcelImported(false);
              }}
            />
          </label>

          {excelFile && (
            <div className="fade-up space-y-4">
              <div className="text-base text-ink-mid">
                <b>{excelFile}</b> — 미리보기 (설정 카드 {excelPreviewRows.length}장, 관계{" "}
                {excelRelationRows.length}개)
              </div>
              <div className="overflow-x-auto rounded-sm border border-line">
                <table className="w-full min-w-[640px] text-left text-base">
                  <thead className="bg-paper-2 text-sm font-bold text-ink-soft">
                    <tr>
                      {["종류", "이름", "설명", "회차", "속성", "태그"].map((h) => (
                        <th key={h} className="px-3 py-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {excelPreviewRows.map((r) => (
                      <tr key={r.name} className="text-ink-mid">
                        <td className="px-3 py-2">
                          <span className="chip bg-paper-2">{r.type}</span>
                        </td>
                        <td className="px-3 py-2 font-semibold text-ink">{r.name}</td>
                        <td className="max-w-56 px-3 py-2 text-ink-soft">{r.description}</td>
                        <td className="px-3 py-2">{r.episode}</td>
                        <td className="px-3 py-2 text-ink-soft">{r.attribute}</td>
                        <td className="px-3 py-2 text-ink-soft">{r.tags}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <div className="label">함께 들어올 관계</div>
                <div className="flex flex-wrap gap-1.5">
                  {excelRelationRows.map((r, i) => (
                    <span key={i} className="chip bg-paper-2">
                      {r.source} / {r.type} / {r.target}
                    </span>
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={importExcel} disabled={excelImported}>
                {excelImported ? "✓ 가져오기 완료 (설정 사전에 추가됨)" : "설정표 가져오기"}
              </button>
              {excelImported && (
                <p className="text-base text-ink-mid">
                  가져온 카드에는 “설정표에서 가져옴” 표시가 붙습니다.{" "}
                  <button className="underline" onClick={() => navigate("blocks")}>
                    설정 사전에서 확인 →
                  </button>
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* 학습 진행 */}
      {loadingStep !== null && (
        <section className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="pulse-dot h-2.5 w-2.5 rounded-full bg-ink-soft"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-ink-soft">{LOADING_STEPS[loadingStep]}…</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-paper-2">
            <div
              className="h-full rounded-full bg-ink transition-all duration-500"
              style={{ width: `${((loadingStep + 1) / 3) * 100}%` }}
            />
          </div>
        </section>
      )}

      {/* 학습 결과 */}
      {result && (
        <section className="fade-up space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xl font-bold text-ink">학습 결과</h3>
            <button className="btn-primary" onClick={addToWorldBlocks} disabled={addedToBlocks}>
              {addedToBlocks ? "✓ 설정 사전에 저장됨" : "+ 설정 사전에 저장하기"}
            </button>
          </div>

          {result.detectedBlockNames.length > 0 && (
            <div className="card p-5">
              <div className="label">이미 저장된 설정에서 알아본 것들</div>
              <div className="flex flex-wrap gap-1.5">
                {result.detectedBlockNames.map((n) => (
                  <span key={n} className="chip border border-line bg-paper-2 text-ink-mid">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {result.candidates.map((c, i) => (
              <div
                key={i}
                className={`card p-5 ${c.kind === "conflict" ? "border-signal" : ""}`}
              >
                <div className="mb-1 flex items-center gap-2 text-sm font-bold text-ink-soft">
                  <Icon name={CANDIDATE_META[c.kind].icon} size={14} className="shrink-0" />
                  {CANDIDATE_META[c.kind].label}
                </div>
                <div className="text-lg font-semibold text-ink">{c.label}</div>
                <p className="mt-1 text-base text-ink-soft">{c.detail}</p>
                <blockquote className="mt-2 rounded-sm bg-paper-2 px-3 py-2 font-serif text-sm italic text-ink-mid">
                  {c.evidence}
                </blockquote>
              </div>
            ))}
          </div>

          {addedToBlocks && (
            <p className="text-base text-ink-mid">
              찾아낸 설정이 카드와 관계로 저장되었고, AI 학습 기록에도 남았습니다.{" "}
              <button className="underline" onClick={() => navigate("memory")}>
                AI 학습 현황 보기 →
              </button>
            </p>
          )}
        </section>
      )}
      </div>
      )}
    </div>
  );
}
