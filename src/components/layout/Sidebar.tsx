import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Moon, Sun, X } from 'lucide-react';
import { NAV, type NavItem } from './nav';
import { cn } from '@/lib/utils';
import { APP } from '@/config';
import { useTheme } from '@/theme/ThemeProvider';

/** 判断父级菜单是否处于激活态（任意子路由匹配） */
function isParentActive(item: NavItem, pathname: string): boolean {
  if (!item.children) return false;
  return item.children.some((child) => {
    if (!child.to) return false;
    if (child.end) return child.to === pathname;
    return child.to === '/' ? false : pathname.startsWith(child.to);
  });
}

/**
 * 展开时文字淡入动画：只在元素挂载时触发一次（CSS animation）。
 * 收起时文字直接消失（侧边栏同步缩窄，视觉上自然）。
 */
const FADE_IN = 'animate-fade-left whitespace-nowrap';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** 底部自定义区域（如用户信息 / 退出登录），接入自己的 auth 后填充 */
  footer?: ReactNode;
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapsed, footer }: SidebarProps) {
  const { theme, toggle } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-surface transition-all duration-300 ease-out lg:translate-x-0',
          collapsed ? 'w-[56px]' : 'w-[244px]',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* 品牌 */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-line',
            collapsed ? 'justify-center px-2' : 'gap-2.5 px-5',
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand font-display text-sm font-bold text-white">
            {APP.name.slice(0, 1)}
          </div>
          {!collapsed && (
            <div className={cn('leading-tight', FADE_IN)}>
              <p className="font-display text-[15px] font-bold text-ink">
                {APP.name}
                <span className="text-brand">{APP.nameAccent}</span>
                {APP.nameSuffix}
              </p>
              <p className="text-2xs text-subtle">{APP.tagline}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onClose}
              className="ml-auto rounded-md p-1.5 text-subtle hover:bg-surface-2 lg:hidden"
              aria-label="关闭菜单"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* 导航 */}
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          {NAV.map((item) => (
            <NavItemRenderer
              key={item.label}
              item={item}
              collapsed={collapsed}
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroup}
              onClose={onClose}
            />
          ))}
        </nav>

        {/* 底部：折叠切换 + 主题 + 自定义区域 */}
        <div className="border-t border-line p-2">
          {/* 折叠切换按钮 */}
          <button
            onClick={onToggleCollapsed}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2',
              collapsed && 'justify-center px-2',
            )}
            title={collapsed ? '展开菜单' : '收起菜单'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span className={FADE_IN}>收起菜单</span>}
          </button>

          {/* 主题切换 */}
          <button
            onClick={toggle}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2',
              collapsed && 'justify-center px-2',
            )}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && (
              <span className={FADE_IN}>{theme === 'dark' ? '亮色模式' : '暗色模式'}</span>
            )}
          </button>

          {/* 自定义底部区域（用户信息等） */}
          {footer}
        </div>
      </aside>
    </>
  );
}

/** 渲染单个导航项（支持展开/收起的二级菜单） */
function NavItemRenderer({
  item,
  collapsed,
  expandedGroups,
  onToggleGroup,
  onClose,
}: {
  item: NavItem;
  collapsed: boolean;
  expandedGroups: Set<string>;
  onToggleGroup: (label: string) => void;
  onClose: () => void;
}) {
  const { pathname } = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const parentActive = isParentActive(item, pathname);

  // ── 含子菜单的父项：展开模式 ──
  if (hasChildren && !collapsed) {
    const isExpanded = expandedGroups.has(item.label) || parentActive;
    return (
      <div>
        <button
          onClick={() => onToggleGroup(item.label)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2/60',
            parentActive ? 'bg-surface-2/60 text-ink' : 'text-muted hover:text-ink',
          )}
        >
          <item.icon
            size={18}
            className={cn('shrink-0', parentActive ? 'text-brand' : 'text-subtle')}
          />
          <span className="flex-1 whitespace-nowrap text-left">{item.label}</span>
          <ChevronDown
            size={14}
            className={cn('shrink-0 transition-transform', isExpanded && 'rotate-180')}
          />
        </button>
        {isExpanded && (
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-line pl-2">
            {item.children!.map((child) => (
              <NavLink
                key={child.to}
                to={child.to!}
                end={child.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-surface-2 text-ink'
                      : 'text-muted hover:bg-surface-2/60 hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-brand transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-0',
                      )}
                      aria-hidden
                    />
                    <child.icon
                      size={16}
                      className={cn('shrink-0', isActive ? 'text-brand' : 'text-subtle')}
                    />
                    <span className="whitespace-nowrap">{child.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── 含子菜单的父项：收起模式（图标 + 悬浮弹出菜单） ──
  if (hasChildren && collapsed) {
    return (
      <div className="group relative">
        <button
          className={cn(
            'flex w-full items-center justify-center rounded-lg py-2.5 transition-colors hover:bg-surface-2/60',
            parentActive ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink',
          )}
          title={item.label}
        >
          <item.icon
            size={18}
            className={cn('shrink-0', parentActive ? 'text-brand' : 'text-subtle')}
          />
        </button>
        {/* 悬浮弹出子菜单 */}
        <div className="pointer-events-none absolute left-full top-0 z-50 ml-2 min-w-[160px] rounded-lg border border-line bg-surface p-1.5 opacity-0 shadow-lg transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
          <p className="px-3 py-1.5 text-xs font-medium text-subtle">{item.label}</p>
          {item.children!.map((child) => (
            <NavLink
              key={child.to}
              to={child.to!}
              end={child.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface-2 text-ink'
                    : 'text-muted hover:bg-surface-2/60 hover:text-ink',
                )
              }
            >
              <child.icon size={15} className="shrink-0" />
              <span className="whitespace-nowrap">{child.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  // ── 无子菜单的独立项 ──
  return (
    <NavLink
      to={item.to!}
      end={item.end}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          collapsed && 'justify-center px-2',
          isActive ? 'bg-surface-2 text-ink' : 'text-muted hover:bg-surface-2/60 hover:text-ink',
        )
      }
      title={collapsed ? item.label : undefined}
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-brand transition-opacity',
              collapsed ? 'hidden' : isActive ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden
          />
          <item.icon size={18} className={cn('shrink-0', isActive ? 'text-brand' : 'text-subtle')} />
          {!collapsed && <span className={FADE_IN}>{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}
