import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { FloatingChat } from '@/components/chat/FloatingChat';
import { cn } from '@/lib/utils';

const COLLAPSE_KEY = 'sidebar-collapsed';

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === '1',
  );
  const { pathname } = useLocation();
  const isChat = pathname === '/chat';

  const toggleCollapsed = () => {
    setSidebarCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
      return !c;
    });
  };

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleCollapsed}
      />

      <div
        className={cn(
          'transition-all duration-200',
          sidebarCollapsed ? 'lg:pl-[56px]' : 'lg:pl-[244px]',
        )}
      >
        {!isChat && <Topbar onMenu={() => setNavOpen(true)} />}
        <main
          className={cn(
            isChat
              ? 'h-screen overflow-hidden'
              : 'mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:py-8',
          )}
        >
          <Outlet />
        </main>
      </div>

      <FloatingChat />
    </div>
  );
}
