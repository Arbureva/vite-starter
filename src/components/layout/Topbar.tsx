import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { titleFor } from './nav';

/**
 * 顶栏：页面标题跟随路由，右侧留 actions slot。
 * 原项目里的时间范围选择器 / 刷新按钮是业务组件，按需自行接回。
 */
export function Topbar({ onMenu, actions }: { onMenu: () => void; actions?: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-muted hover:bg-surface-2 lg:hidden"
        aria-label="打开菜单"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0">
        <h1 className="font-display text-lg font-bold leading-none text-ink">
          {titleFor(pathname)}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-2.5">{actions}</div>
    </header>
  );
}
