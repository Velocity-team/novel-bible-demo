import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  ChatMessage,
  Conflict,
  Draft,
  Episode,
  MemorySource,
  PageKey,
  Project,
  ProjectNote,
  Relation,
  Scenario,
  WorldBlock,
} from "../types";
import { buildLearnedState } from "../data/mockData";
import { loadState, resetState, saveState, uid } from "../utils/storage";
import { trackEvent } from "../utils/metrics";

export interface NavOptions {
  blockId?: string;
  graphFocusId?: string;
  graphMode?: string;
  query?: string;
  /** 캐릭터 회의실에서 처음 열 탭 (persona | meeting | guardrail | recommend) */
  plotTab?: string;
}

interface AppContextValue {
  state: AppState;
  page: PageKey;
  navOptions: NavOptions;
  navigate: (page: PageKey, options?: NavOptions) => void;
  detailBlockId: string | null;
  openBlockDetail: (id: string | null) => void;

  completeOnboarding: (info: { title: string; genre: string; logline: string }) => void;
  updateProject: (patch: Partial<Project>) => void;
  addBlock: (b: Omit<WorldBlock, "id" | "createdAt" | "updatedAt">) => WorldBlock;
  updateBlock: (id: string, patch: Partial<WorldBlock>) => void;
  deleteBlock: (id: string) => void;
  addRelation: (r: Omit<Relation, "id" | "createdAt">) => Relation;
  deleteRelation: (id: string) => void;
  setConflictStatus: (id: string, status: Conflict["status"]) => void;
  saveDraft: (d: Omit<Draft, "id" | "updatedAt"> & { id?: string }) => Draft;
  deleteDraft: (id: string) => void;
  addScenario: (s: Omit<Scenario, "id" | "createdAt">) => Scenario;
  addNote: (n: Omit<ProjectNote, "id" | "createdAt">) => void;
  addEpisode: (e: Omit<Episode, "id">) => void;
  addMemorySource: (m: Omit<MemorySource, "id" | "updatedAt">) => void;
  rebuildMemory: () => void;
  addChat: (m: Omit<ChatMessage, "id" | "createdAt">) => void;
  clearChat: () => void;
  toggleSuggestion: (s: string) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
  seed,
  persist = true,
  track = true,
}: {
  children: ReactNode;
  /** 주어지면 localStorage 대신 이 상태로 시작한다(랜딩 데모용 격리 상태). */
  seed?: AppState;
  /** false면 상태 변경을 localStorage에 저장하지 않는다. */
  persist?: boolean;
  /** false면 기능 이동을 지표로 기록하지 않는다(랜딩 데모 모달용). */
  track?: boolean;
}) {
  const [state, setState] = useState<AppState>(() => seed ?? loadState());
  const [page, setPage] = useState<PageKey>("dashboard");
  const [navOptions, setNavOptions] = useState<NavOptions>({});
  const [detailBlockId, setDetailBlockId] = useState<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (persist) saveState(state);
  }, [state, persist]);

  const navigate = useCallback(
    (p: PageKey, options?: NavOptions) => {
      if (track) trackEvent("app_feature", p);
      setPage(p);
      setNavOptions(options ?? {});
      if (options?.blockId) setDetailBlockId(options.blockId);
      window.scrollTo(0, 0);
    },
    [track]
  );

  const openBlockDetail = useCallback((id: string | null) => setDetailBlockId(id), []);

  const now = () => new Date().toISOString();

  /** 온보딩 학습 완료: 목데이터로 채우고 입력한 작품 정보를 덮어쓴다. */
  const completeOnboarding = useCallback(
    (info: { title: string; genre: string; logline: string }) => {
      const learned = buildLearnedState();
      setState({
        onboarded: true,
        ...learned,
        project: {
          ...learned.project,
          title: info.title || learned.project.title,
          genre: info.genre || learned.project.genre,
          logline: info.logline || learned.project.logline,
        },
      });
      setPage("dashboard");
      window.scrollTo(0, 0);
    },
    []
  );

  const updateProject = useCallback((patch: Partial<Project>) => {
    setState((s) => ({ ...s, project: { ...s.project, ...patch } }));
  }, []);

  const addBlock = useCallback(
    (b: Omit<WorldBlock, "id" | "createdAt" | "updatedAt">): WorldBlock => {
      const nb: WorldBlock = { ...b, id: uid("blk"), createdAt: now(), updatedAt: now() };
      setState((s) => ({ ...s, blocks: [...s.blocks, nb] }));
      return nb;
    },
    []
  );

  const updateBlock = useCallback((id: string, patch: Partial<WorldBlock>) => {
    setState((s) => ({
      ...s,
      blocks: s.blocks.map((b) =>
        b.id === id ? { ...b, ...patch, updatedAt: now() } : b
      ),
    }));
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      blocks: s.blocks.filter((b) => b.id !== id),
      relations: s.relations.filter((r) => r.sourceId !== id && r.targetId !== id),
    }));
    setDetailBlockId((cur) => (cur === id ? null : cur));
  }, []);

  const addRelation = useCallback((r: Omit<Relation, "id" | "createdAt">): Relation => {
    const nr: Relation = { ...r, id: uid("rel"), createdAt: now() };
    setState((s) => ({ ...s, relations: [...s.relations, nr] }));
    return nr;
  }, []);

  const deleteRelation = useCallback((id: string) => {
    setState((s) => ({ ...s, relations: s.relations.filter((r) => r.id !== id) }));
  }, []);

  const setConflictStatus = useCallback((id: string, status: Conflict["status"]) => {
    setState((s) => ({
      ...s,
      conflicts: s.conflicts.map((c) => (c.id === id ? { ...c, status } : c)),
    }));
  }, []);

  const saveDraft = useCallback(
    (d: Omit<Draft, "id" | "updatedAt"> & { id?: string }): Draft => {
      const id = d.id ?? uid("draft");
      const nd: Draft = { ...d, id, updatedAt: now() };
      setState((s) => {
        const exists = s.drafts.some((x) => x.id === id);
        return {
          ...s,
          drafts: exists
            ? s.drafts.map((x) => (x.id === id ? nd : x))
            : [...s.drafts, nd],
        };
      });
      return nd;
    },
    []
  );

  const deleteDraft = useCallback((id: string) => {
    setState((s) => ({ ...s, drafts: s.drafts.filter((d) => d.id !== id) }));
  }, []);

  const addScenario = useCallback((sc: Omit<Scenario, "id" | "createdAt">): Scenario => {
    const ns: Scenario = { ...sc, id: uid("scn"), createdAt: now() };
    setState((s) => ({ ...s, scenarios: [...s.scenarios, ns] }));
    return ns;
  }, []);

  const addNote = useCallback((n: Omit<ProjectNote, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      notes: [...s.notes, { ...n, id: uid("note"), createdAt: now() }],
    }));
  }, []);

  const addEpisode = useCallback((e: Omit<Episode, "id">) => {
    setState((s) => ({
      ...s,
      project: {
        ...s.project,
        episodes: [...s.project.episodes, { ...e, id: uid("ep") }],
      },
    }));
  }, []);

  const addMemorySource = useCallback((m: Omit<MemorySource, "id" | "updatedAt">) => {
    setState((s) => ({
      ...s,
      memorySources: [
        ...s.memorySources,
        { ...m, id: uid("ms"), updatedAt: now() },
      ],
    }));
  }, []);

  const rebuildMemory = useCallback(() => {
    setState((s) => ({
      ...s,
      canonScore: Math.min(99, s.canonScore + 2),
      lastTrainedAt: now(),
      memorySources: s.memorySources.map((m) =>
        m.status === "needs_review" ? { ...m, status: "synced" } : m
      ),
    }));
  }, []);

  const addChat = useCallback((m: Omit<ChatMessage, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      chatHistory: [...s.chatHistory, { ...m, id: uid("msg"), createdAt: now() }],
    }));
  }, []);

  const clearChat = useCallback(() => {
    setState((s) => ({ ...s, chatHistory: [] }));
  }, []);

  const toggleSuggestion = useCallback((sug: string) => {
    setState((s) => ({
      ...s,
      checkedSuggestions: s.checkedSuggestions.includes(sug)
        ? s.checkedSuggestions.filter((x) => x !== sug)
        : [...s.checkedSuggestions, sug],
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(resetState());
    setDetailBlockId(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        page,
        navOptions,
        navigate,
        detailBlockId,
        openBlockDetail,
        completeOnboarding,
        updateProject,
        addBlock,
        updateBlock,
        deleteBlock,
        addRelation,
        deleteRelation,
        setConflictStatus,
        saveDraft,
        deleteDraft,
        addScenario,
        addNote,
        addEpisode,
        addMemorySource,
        rebuildMemory,
        addChat,
        clearChat,
        toggleSuggestion,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
