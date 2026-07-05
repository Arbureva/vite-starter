import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ASSISTANT } from '@/config';
import { useChat } from './useChat';
import { ChatCore } from './ChatCore';

/**
 * 全局 AI 浮动窗口：
 * - 右下角浮动按钮，点击展开聊天面板
 * - 面板支持小窗 ↔ 居中全屏切换
 * - 在独立聊天页（/chat）自动隐藏，避免功能重复
 */
export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const chat = useChat();
  const { pathname } = useLocation();

  // 在独立的聊天页面不显示悬浮按钮
  if (pathname === '/chat') return null;

  return (
    <>
      {/* 浮窗按钮 */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-float ring-1 ring-line transition-transform hover:scale-105 active:scale-95',
          open ? 'bg-surface' : 'bg-brand',
        )}
        aria-label={`打开${ASSISTANT.name}`}
      >
        {open ? <X size={22} className="text-muted" /> : <Bot size={26} className="text-white" />}
        {!open && (
          <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-bg bg-brand" />
        )}
      </button>

      {/* 聊天面板 */}
      {open && (
        <>
          {fullscreen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setFullscreen(false)}
            />
          )}

          <ChatCore
            {...chat}
            className={cn(
              'fixed z-50 animate-pop-in',
              fullscreen
                ? 'inset-0 m-auto h-[min(720px,88vh)] w-[min(880px,92vw)]'
                : 'bottom-28 right-8 h-[min(560px,calc(100vh-8rem))] w-[min(380px,calc(100vw-2.5rem))]',
            )}
            headerExtra={
              <>
                <button
                  onClick={() => setFullscreen((f) => !f)}
                  className="rounded-md p-1.5 text-subtle hover:bg-surface-2"
                  aria-label={fullscreen ? '退出全屏' : '全屏'}
                >
                  {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setFullscreen(false);
                  }}
                  className="rounded-md p-1.5 text-subtle hover:bg-surface-2"
                  aria-label="收起"
                >
                  <X size={17} />
                </button>
              </>
            }
          />
        </>
      )}
    </>
  );
}
