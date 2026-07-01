import {
  User, MapPin, Zap, Users, ScrollText, Package,
  MessageSquare, LayoutDashboard, Map, FolderOpen, Upload, Sparkles, Clapperboard,
  AlertTriangle, Settings, Info, Network, PenLine,
  Search, Plus, Minus, X, Save, Pencil, Trash2, ArrowRight, ChevronRight, ChevronDown, Check, Eye,
  FileText, Table2, RefreshCw, Download, Shield, Lightbulb, BookOpen, Radio,
  Rocket, Building2, CreditCard, Plug, Sprout, Briefcase, Layers, Menu, HelpCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * 무채색 미니멀 라인아이콘. currentColor 스트로크라 잉크색을 그대로 상속한다.
 * 이모지(풀컬러·장식) 대신 기능 아이콘에만 절제해 쓴다.
 */
const MAP: Record<string, LucideIcon> = {
  // 블록 6종 (BLOCK_TYPE_META.icon 키와 일치)
  character: User, location: MapPin, event: Zap, organization: Users, rule: ScrollText, item: Package,
  // 내비 / 기능
  ask: MessageSquare, dashboard: LayoutDashboard, atlas: Map, blocks: FolderOpen,
  import: Upload, memory: Sparkles, plotroom: Clapperboard, conflicts: AlertTriangle,
  settings: Settings, about: Info, relations: Network, writing: PenLine, network: Network,
  // 액션
  search: Search, add: Plus, minus: Minus, close: X, save: Save, edit: Pencil, delete: Trash2,
  "arrow-right": ArrowRight, "chevron-right": ChevronRight, "chevron-down": ChevronDown,
  check: Check, eye: Eye, doc: FileText, "file-text": FileText, table: Table2,
  refresh: RefreshCw, download: Download, "map-pin": MapPin, menu: Menu,
  // 상태 / 기타
  alert: AlertTriangle, warning: AlertTriangle, info: Info, idea: Lightbulb,
  shield: Shield, brain: Sparkles, sparkles: Sparkles, book: BookOpen, radio: Radio,
  chat: MessageSquare, map: Map, folder: FolderOpen, upload: Upload, users: Users, "pen-line": PenLine,
  // 마케팅(About/Landing)
  rocket: Rocket, building: Building2, card: CreditCard, plug: Plug, sprout: Sprout,
  briefcase: Briefcase, layers: Layers, film: Clapperboard, lightbulb: Lightbulb,
};

export function Icon({
  name,
  size = 16,
  className,
  strokeWidth = 1.75,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const C = MAP[name] ?? HelpCircle;
  return <C size={size} strokeWidth={strokeWidth} className={className} aria-hidden />;
}
