import { Bot, Brain, Check, ChevronDown, Copy, ImageDown, Send, Sparkles } from 'lucide-react';
import { AI_LIVE } from '@/lib/ai';
import { ASSISTANT } from '@/config';
import { cn } from '@/lib/utils';
import { MessageMarkdown } from '@/components/markdown/MessageMarkdown';
import { type Msg } from './useChat';
import { getToolDisplay } from './toolDisplay';
import type { RefObject } from 'react';

/** 根据当前时段返回不同的快捷提问 */
function getGreetingSuggestions(): readonly string[] {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return ASSISTANT.greetingSuggestions.morning;
  if (hour >= 12 && hour < 18) return ASSISTANT.greetingSuggestions.afternoon;
  return ASSISTANT.greetingSuggestions.evening;
}

/** 根据时段生成动态招呼语 */
function getHeroGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return '早上好，新的一天开始了';
  if (hour >= 12 && hour < 14) return '中午好';
  if (hour >= 14 && hour < 18) return '下午好，有什么可以帮你？';
  if (hour >= 18 && hour < 22) return '晚上好，辛苦了';
  return '夜深了，注意休息';
}

interface ChatCoreProps {
  messages: Msg[];
  input: string;
  setInput: (v: string) => void;
  streaming: boolean;
  copied: string | null;
  exporting: 'idle' | 'busy' | 'done';
  send: (text: string) => void;
  onCopyText: (m: Msg) => void;
  onCopyImage: (m: Msg) => void;
  onExportAll: () => void;
  scrollRef: RefObject<HTMLDivElement>;
  contentRef: RefObject<HTMLDivElement>;
  bubbleRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  taRef: RefObject<HTMLTextAreaElement>;
  /** 头部右侧额外的操作按钮 */
  headerExtra?: React.ReactNode;
  /** panel: 悬浮小窗 | page: 整页聊天 */
  variant?: 'panel' | 'page';
  className?: string;
}

export function ChatCore({
  messages,
  input,
  setInput,
  streaming,
  copied,
  exporting,
  send,
  onCopyText,
  onCopyImage,
  onExportAll,
  scrollRef,
  contentRef,
  bubbleRefs,
  taRef,
  headerExtra,
  variant = 'panel',
  className,
}: ChatCoreProps) {
  const isPage = variant === 'page';
  const isEmpty = messages.length === 0;
  const showHero = isPage && isEmpty;

  // ── 新对话欢迎页（页面变体） ──
  if (showHero) {
    return (
      <div className={cn('flex h-full flex-col items-center justify-center bg-surface px-4', className)}>
        {/* 欢迎区 */}
        <div className="mb-8 flex animate-fade-up flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-soft text-brand-ink">
            <Bot size={40} />
          </div>
          <p className="font-display text-4xl font-bold text-ink">{getHeroGreeting()}</p>
        </div>

        {/* 输入框 */}
        <div className="w-full max-w-2xl">
          <div
            onClick={() => taRef.current?.focus()}
            className="flex cursor-text items-end gap-2 rounded-2xl border border-line bg-surface px-4 py-3 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20"
          >
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder={`问问${ASSISTANT.name}关于数据的事…`}
              className="block max-h-[150px] min-h-[80px] w-full flex-1 resize-none border-0 bg-transparent py-1 text-sm leading-5 text-ink shadow-none outline-none ring-0 placeholder:text-subtle focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition disabled:opacity-40"
              aria-label="发送"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* 快捷提问 */}
        <div className="mt-5 flex max-w-xl flex-wrap justify-center gap-2">
          {getGreetingSuggestions().map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted shadow-sm transition hover:border-brand/40 hover:bg-brand/5 hover:text-brand"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-float',
        isPage && 'h-full rounded-none border-0 bg-bg shadow-none',
        className,
      )}
    >
      {/* 头部 */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
          <Bot size={20} />
        </div>
        <div className="leading-tight">
          <p className="flex items-center gap-1.5 font-display text-sm font-bold text-ink">
            {ASSISTANT.name}
            <Sparkles size={13} className="text-brand" />
          </p>
          <p className="text-2xs text-subtle">
            {AI_LIVE ? '已连接 AI 接口' : '演示模式（未配置 API Key）'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          <button
            onClick={onExportAll}
            disabled={exporting === 'busy'}
            className="rounded-md p-1.5 text-subtle hover:bg-surface-2 disabled:opacity-50"
            aria-label="导出整段对话为图片"
            title="导出整段对话为图片"
          >
            {exporting === 'done' ? <Check size={16} className="text-brand" /> : <ImageDown size={16} />}
          </button>
          {headerExtra}
        </div>
      </div>

      {/* 消息区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
        <div ref={contentRef} className="mx-auto w-full max-w-3xl space-y-3">
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            const isLast = i === messages.length - 1;
            const noContent = !m.content;
            const showCopy = !!m.content;
            return (
              <div
                key={m.id}
                className={cn('group flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}
              >
                {/* ── 工具调用提示（顶部） ── */}
                {!isUser && m.toolCalls && m.toolCalls.length > 0 && (
                  <div className="flex max-w-[82%] flex-wrap gap-1">
                    {m.toolCalls.map((tc) => {
                      const info = getToolDisplay(tc.name);
                      const Icon = info.icon;
                      return (
                        <span
                          key={tc.name}
                          className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-2xs"
                          style={{
                            borderColor: info.color,
                            color: info.color,
                            backgroundColor: `${info.color}0D`,
                          }}
                        >
                          <Icon size={10} />
                          {info.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* ── 深度思考（气泡上方，可折叠，内联展开） ── */}
                {!isUser && m.reasoning && (
                  <details className="group/reason my-1 w-full max-w-[82%]">
                    <summary className="flex cursor-pointer select-none items-center gap-1.5 text-2xs text-subtle transition marker:hidden hover:text-muted [&::-webkit-details-marker]:hidden">
                      <ChevronDown
                        size={12}
                        className="chevron shrink-0 transition-transform group-open/reason:rotate-180"
                      />
                      <Brain size={12} className="shrink-0 text-brand/70" />
                      <span className="shrink-0 whitespace-nowrap">深度思考</span>
                      <span className="truncate text-subtle/60 group-open/reason:hidden">
                        {m.reasoning.length > 60
                          ? `${m.reasoning.slice(0, 60).replace(/\n/g, ' ')}…`
                          : m.reasoning.replace(/\n/g, ' ')}
                      </span>
                    </summary>
                    <div className="mt-1.5 whitespace-pre-wrap pl-5 text-2xs leading-relaxed text-muted/80">
                      {m.reasoning}
                    </div>
                  </details>
                )}

                {/* ── 对话气泡 ── */}
                <div
                  ref={(el) => {
                    bubbleRefs.current[m.id] = el;
                  }}
                  className={cn(
                    'max-w-[82%] text-[13px] leading-relaxed',
                    isUser
                      ? 'whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-white'
                      : isPage
                        ? 'text-ink'
                        : 'rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-2.5 text-ink',
                  )}
                >
                  {m.content ? (
                    isUser ? (
                      m.content
                    ) : (
                      <MessageMarkdown content={m.content} />
                    )
                  ) : (
                    <TypingDots />
                  )}
                </div>

                {/* ── 流式生成中指示器（最后一条空内容消息） ── */}
                {!isUser && isLast && noContent && streaming && (
                  <div className="flex animate-pulse items-center gap-1.5 pl-1 text-2xs text-subtle">
                    <Sparkles size={11} className="text-brand/50" />
                    <span>正在生成…</span>
                  </div>
                )}

                {/* ── 复制按钮 ── */}
                {showCopy && (
                  <div
                    data-no-capture="true"
                    className={cn(
                      'flex gap-1 opacity-0 transition group-hover:opacity-100',
                      isUser ? 'pr-1' : 'pl-1',
                    )}
                  >
                    <ToolBtn
                      label="复制文字"
                      done={copied === `t-${m.id}`}
                      icon={<Copy size={12} />}
                      onClick={() => onCopyText(m)}
                    />
                    <ToolBtn
                      label="复制为图片"
                      done={copied === `i-${m.id}`}
                      icon={<ImageDown size={12} />}
                      onClick={() => onCopyImage(m)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 建议 chips（仅初始时） */}
      {isEmpty && (
        <div className="mx-auto flex w-full max-w-3xl flex-wrap gap-1.5 px-4 pb-2">
          {ASSISTANT.suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-line px-2.5 py-1 text-2xs text-muted transition hover:border-brand/40 hover:text-brand"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 输入区 */}
      <div className={cn(isPage ? 'p-3 pb-10' : 'border-t border-line p-3')}>
        <div
          onClick={() => taRef.current?.focus()}
          className={cn(
            'mx-auto flex w-full max-w-3xl cursor-text items-end gap-2 rounded-xl border border-line bg-bg px-3 py-2 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20',
            isPage && 'rounded-2xl',
          )}
        >
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={`问问${ASSISTANT.name}关于数据的事…`}
            className={cn(
              'block max-h-[150px] min-h-[80px] w-full flex-1 resize-none border-0 bg-transparent py-1 text-[13px] leading-5 text-ink shadow-none outline-none ring-0 placeholder:text-subtle focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0',
              isPage && 'min-h-10',
            )}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || streaming}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition disabled:opacity-40"
            aria-label="发送"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolBtn({
  label,
  icon,
  done,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs text-subtle transition hover:bg-surface-2 hover:text-muted"
    >
      {done ? <Check size={12} className="text-brand" /> : icon}
    </button>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-subtle"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
