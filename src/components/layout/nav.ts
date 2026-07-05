import {
  Bot,
  LayoutDashboard,
  LineChart,
  Settings,
  Table2,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to?: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** 二级菜单：展开态内联展开，收起态悬浮弹出 */
  children?: NavItem[];
}

export const NAV: NavItem[] = [
  { to: '/', label: '总览', icon: LayoutDashboard, end: true },
  { to: '/chat', label: 'AI 助理', icon: Bot },
  {
    label: '数据分析',
    icon: LineChart,
    children: [
      { to: '/analysis/trend', label: '趋势分析', icon: LineChart },
      { to: '/analysis/table', label: '明细表', icon: Table2 },
    ],
  },
  { to: '/settings', label: '设置', icon: Settings },
];

/** 递归展平导航项，用于通过路径查找标题 */
function flattenNav(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => (item.children ? flattenNav(item.children) : [item]));
}

/** 根据当前路径获取页面标题 */
export function titleFor(pathname: string): string {
  const flat = flattenNav(NAV);
  const hit = flat.find((n) =>
    n.end ? n.to === pathname : n.to ? pathname.startsWith(n.to) && n.to !== '/' : false,
  );
  return hit?.label ?? '总览';
}
