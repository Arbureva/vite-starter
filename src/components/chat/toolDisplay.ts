import { BookOpen, Terminal, Puzzle, type LucideIcon } from 'lucide-react';

export type ToolKind = 'skill' | 'cli' | 'mcp';

export interface ToolDisplayInfo {
  label: string;
  kind: ToolKind;
  color: string;
  icon: LucideIcon;
}

/** 工具种类 → 默认颜色 + 图标 */
export const KIND_STYLE: Record<ToolKind, { color: string; icon: LucideIcon }> = {
  skill: { color: '#7C5CFC', icon: BookOpen },
  cli: { color: '#2BB673', icon: Terminal },
  mcp: { color: '#3B82F6', icon: Puzzle },
};

/**
 * 工具名称 → 中文标签 + 种类的映射表。
 * 新项目在这里登记自己的 MCP 工具 / Skills / CLI 名称即可。
 */
const TOOL_DISPLAY_MAP: Record<string, { label: string; kind: ToolKind }> = {
  demo_query: { label: '演示查询', kind: 'mcp' },
  current_time: { label: '当前时间', kind: 'cli' },
};

/** 根据工具名称获取显示信息（标签、种类颜色、图标） */
export function getToolDisplay(name: string): ToolDisplayInfo {
  const entry = TOOL_DISPLAY_MAP[name];
  if (entry) {
    return { ...entry, ...KIND_STYLE[entry.kind] };
  }
  // 未映射的工具：尝试从命名推断种类
  const inferredKind = inferKind(name);
  return { label: name, kind: inferredKind, ...KIND_STYLE[inferredKind] };
}

/** 从工具名推断种类（fallback） */
function inferKind(name: string): ToolKind {
  if (name.includes('_guide') || name.includes('_basics') || name.includes('manual')) return 'skill';
  if (name.includes('mcp') || name.includes('_')) return 'mcp';
  return 'cli';
}
