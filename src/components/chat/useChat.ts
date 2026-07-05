import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChat, type ChatMessage } from '@/lib/ai';
import { copyNodeAsImage, copyText, downloadNodeAsImage } from '@/lib/share';

export interface Msg extends ChatMessage {
  id: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'idle' | 'busy' | 'done'>('idle');

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const bubbleRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 消息更新时自动滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // 输入框自适应高度
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  const flash = useCallback((key: string) => {
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1400);
  }, []);

  const onCopyText = useCallback(
    async (m: Msg) => {
      try {
        await copyText(m.content);
        flash(`t-${m.id}`);
      } catch {
        /* 剪贴板不可用时静默 */
      }
    },
    [flash],
  );

  const onCopyImage = useCallback(
    async (m: Msg) => {
      const node = bubbleRefs.current[m.id];
      if (!node) return;
      try {
        await copyNodeAsImage(node, scrollRef.current ?? undefined);
        flash(`i-${m.id}`);
      } catch {
        await downloadNodeAsImage(node, `chat-${m.id}.png`, scrollRef.current ?? undefined);
      }
    },
    [flash],
  );

  const onExportAll = useCallback(async () => {
    if (!contentRef.current) return;
    setExporting('busy');
    try {
      await copyNodeAsImage(contentRef.current, scrollRef.current ?? undefined);
      setExporting('done');
      setTimeout(() => setExporting('idle'), 1600);
    } catch {
      await downloadNodeAsImage(contentRef.current, 'chat.png', scrollRef.current ?? undefined);
      setExporting('idle');
    }
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;
      setInput('');

      const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content: trimmed };
      const replyId = crypto.randomUUID();
      setMessages((prev) => [...prev, userMsg, { id: replyId, role: 'assistant', content: '' }]);
      setStreaming(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      // 基于添加用户消息前的历史构建请求
      const history: ChatMessage[] = [...messages, userMsg].map(({ role, content }) => ({
        role,
        content,
      }));

      try {
        await streamChat(history, {
          signal: ctrl.signal,
          onToken: (delta) => {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === replyId ? { ...msg, content: msg.content + delta } : msg)),
            );
          },
          onReasoning: (delta) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === replyId ? { ...msg, reasoning: (msg.reasoning ?? '') + delta } : msg,
              ),
            );
          },
          onToolCall: (name) => {
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id !== replyId) return msg;
                const existing = msg.toolCalls ?? [];
                if (existing.some((t) => t.name === name)) return msg;
                return { ...msg, toolCalls: [...existing, { name }] };
              }),
            );
          },
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === replyId
                ? { ...msg, content: '抱歉，AI 接口暂时不可用。请检查网络或接口配置后重试。' }
                : msg,
            ),
          );
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming],
  );

  return {
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
  };
}
