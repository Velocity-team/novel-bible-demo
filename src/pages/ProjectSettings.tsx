import { useState } from "react";
import { useApp } from "../context/AppContext";
import { downloadJSON } from "../utils/storage";
import { Icon } from "../components/Icon";

function ListEditor({
  title,
  items,
  onChange,
  placeholder,
}: {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setInput("");
  };
  return (
    <section className="card p-6">
      <h3 className="mb-3 text-lg font-bold text-ink">{title}</h3>
      <ul className="mb-3 space-y-1.5">
        {items.map((r) => (
          <li
            key={r}
            className="group flex items-center justify-between gap-2 rounded-sm bg-paper-2 px-3 py-2 text-base text-ink-mid"
          >
            <span>{r}</span>
            <button
              className="text-ink-faint opacity-0 transition hover:text-signal group-hover:opacity-100"
              onClick={() => onChange(items.filter((x) => x !== r))}
              title="삭제"
            >
              <Icon name="close" size={14} />
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-base text-ink-faint">아직 등록한 내용이 없습니다.</li>
        )}
      </ul>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="btn-ghost" onClick={add}>
          추가
        </button>
      </div>
    </section>
  );
}

export default function ProjectSettings() {
  const { state, updateProject, resetAll, openBlockDetail } = useApp();
  const { project } = state;
  const [savedFlash, setSavedFlash] = useState(false);
  const [form, setForm] = useState({
    title: project.title,
    genre: project.genre,
    logline: project.logline,
    summary: project.summary,
  });

  const save = () => {
    updateProject(form);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const characters = state.blocks.filter((b) => b.type === "character");
  const rules = state.blocks.filter((b) => b.type === "rule");

  return (
    <div className="fade-up space-y-5">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-ink">작품 설정</h2>
        <p className="mt-1 text-base text-ink-soft">작품의 기본 정보와 꼭 지켜야 할 규칙을 관리합니다.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 기본 정보 */}
        <section className="card space-y-3 p-6">
          <h3 className="text-lg font-bold text-ink">작품 정보</h3>
          <div>
            <label className="label">작품 제목</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">장르</label>
            <input
              className="input"
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
            />
          </div>
          <div>
            <label className="label">
              한 줄 소개 <span className="font-normal text-ink-faint">(선택)</span>
            </label>
            <textarea
              className="input min-h-16"
              value={form.logline}
              onChange={(e) => setForm({ ...form, logline: e.target.value })}
            />
          </div>
          <div>
            <label className="label">
              줄거리 요약 <span className="font-normal text-ink-faint">(선택)</span>
            </label>
            <textarea
              className="input min-h-24"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </div>
          <button className="btn-primary" onClick={save}>
            {savedFlash ? "저장됐어요!" : "작품 정보 저장"}
          </button>
        </section>

        {/* 주요 인물 + 핵심 규칙 */}
        <div className="space-y-4">
          <section className="card p-6">
            <h3 className="mb-3 text-lg font-bold text-ink">주요 인물</h3>
            <ul className="space-y-1.5">
              {characters.map((c) => (
                <li
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 rounded-sm bg-paper-2 px-3 py-2.5 transition hover:bg-paper-200"
                  onClick={() => openBlockDetail(c.id)}
                >
                  <span className="text-base font-semibold text-ink">{c.name}</span>
                  <span className="flex-1 truncate text-sm text-ink-soft">
                    {c.description}
                  </span>
                  {c.attributes["성격"] && <span className="chip">{c.attributes["성격"]}</span>}
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-6">
            <h3 className="mb-3 text-lg font-bold text-ink">세계관 규칙</h3>
            <ul className="space-y-1.5">
              {rules.map((r) => (
                <li
                  key={r.id}
                  className="cursor-pointer rounded-sm bg-paper-2 px-3 py-2.5 text-base text-ink-mid transition hover:bg-paper-200"
                  onClick={() => openBlockDetail(r.id)}
                >
                  <b className="text-ink">{r.name}</b> — {r.description}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* 회차별 줄거리 */}
      <section className="card p-6">
        <h3 className="mb-3 text-lg font-bold text-ink">
          회차별 줄거리 ({project.episodes.length}회차)
        </h3>
        <ol className="space-y-1.5">
          {project.episodes.map((ep) => (
            <li key={ep.id} className="flex gap-3 rounded-sm bg-paper-2 px-3 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-paper font-mono text-sm font-bold text-ink-mid">
                {ep.number}
              </span>
              <div>
                <div className="text-base font-semibold text-ink">{ep.title}</div>
                <p className="text-sm leading-relaxed text-ink-soft">{ep.summary}</p>
              </div>
              {ep.wordCount > 0 && (
                <span className="ml-auto shrink-0 self-center font-mono text-sm text-ink-faint">
                  {ep.wordCount.toLocaleString()}자
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* 규칙/제약 관리 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ListEditor
          title="꼭 지킬 세계관 규칙"
          items={project.canonRules}
          onChange={(canonRules) => updateProject({ canonRules })}
          placeholder="예: 강도현은 죽으면 10년 전 이서준의 몸으로 회귀한다"
        />
        <ListEditor
          title="AI에게 거는 조건"
          items={project.generationConstraints}
          onChange={(generationConstraints) => updateProject({ generationConstraints })}
          placeholder="예: 도현의 정체는 후반부 전까지 아군에게 밝히지 않기"
        />
        <ListEditor
          title="금지하는 전개"
          items={project.forbiddenSettings}
          onChange={(forbiddenSettings) => updateProject({ forbiddenSettings })}
          placeholder="예: 재각성 없이 각성 등급이 바뀌는 전개 금지"
        />
      </div>

      {/* 작가 메모 */}
      <section className="card p-6">
        <h3 className="mb-3 text-lg font-bold text-ink">
          작가 메모 ({state.notes.length})
        </h3>
        <div className="grid gap-2 md:grid-cols-3">
          {state.notes.map((n) => (
            <div key={n.id} className="rounded-sm border border-line bg-paper-2 p-4">
              <div className="mb-1 text-base font-bold text-ink">{n.title}</div>
              <p className="text-sm leading-relaxed text-ink-soft">{n.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 내려받기 / 초기화 */}
      <section className="card p-6">
        <h3 className="mb-3 text-lg font-bold text-ink">내려받기 / 처음부터 다시 시작</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-ghost"
            onClick={() => downloadJSON("노벨바이블-설정카드.json", state.blocks)}
          >
            설정 카드 내려받기
          </button>
          <button
            className="btn-ghost"
            onClick={() => downloadJSON("노벨바이블-관계.json", state.relations)}
          >
            관계 내려받기
          </button>
          <button
            className="btn-ghost"
            onClick={() => downloadJSON("노벨바이블-설정오류.json", state.conflicts)}
          >
            설정 오류 내려받기
          </button>
          <button
            className="btn-primary"
            onClick={() => downloadJSON("노벨바이블-작품전체.json", state)}
          >
            작품 전체 내려받기
          </button>
          <button
            className="btn-danger ml-auto"
            onClick={() => {
              if (
                confirm(
                  "모든 데이터를 지우고 처음 시작 화면(원고 올리기)으로 돌아갈까요?"
                )
              ) {
                resetAll();
              }
            }}
          >
            처음부터 다시 시작
          </button>
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          내려받기는 지금 저장된 내용을 JSON 파일로 저장합니다. ‘처음부터 다시 시작’을
          누르면 모든 기록이 지워지고 첫 시작 화면으로 돌아갑니다.
        </p>
      </section>
    </div>
  );
}
