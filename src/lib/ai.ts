// OpenAI 兼容的流式聊天客户端。
// - 配置了 VITE_AI_BASE_URL + VITE_AI_API_KEY：直连真实接口（/chat/completions, stream）
// - 未配置：回落到内置的本地演示流，开箱即用
//
// ⚠️ 安全提示：浏览器直连会暴露 API Key，仅适合本地联调。
//    生产环境请在后端做一层代理，前端只调用自己的 /api/ai/chat。

import { ASSISTANT } from '@/config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  /** DeepSeek / Claude 等模型的深度思考 / 推理过程 */
  reasoning?: string;
  /** 模型在回复过程中调用的工具列表 */
  toolCalls?: Array<{ name: string; args?: string }>;
}

const BASE_URL = import.meta.env.VITE_AI_BASE_URL?.replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_AI_API_KEY;
const MODEL = import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini';

export const AI_LIVE = Boolean(BASE_URL && API_KEY);

interface StreamHandlers {
  onToken: (delta: string) => void;
  /** 深度思考 token 回调（deepseek-reasoner 等） */
  onReasoning?: (delta: string) => void;
  /** 工具调用回调（模型即将调用某个工具） */
  onToolCall?: (name: string) => void;
  signal?: AbortSignal;
}

/** 发起一次流式对话，逐 token 回调。返回完整文本。 */
export async function streamChat(messages: ChatMessage[], h: StreamHandlers): Promise<string> {
  if (!AI_LIVE) return demoStream(messages, h);

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    signal: h.signal,
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages: [{ role: 'system', content: ASSISTANT.systemPrompt }, ...messages],
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`AI 接口返回 ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // 解析 SSE：以 \n\n 分隔的事件块，每行以 "data: " 开头
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      for (const line of part.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') return full;
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta;

          // 正文 token
          const content: string = delta?.content ?? '';
          if (content) {
            full += content;
            h.onToken(content);
          }

          // 深度思考 token
          const reasoning: string = delta?.reasoning_content ?? '';
          if (reasoning && h.onReasoning) {
            h.onReasoning(reasoning);
          }

          // 工具调用
          const toolCalls = delta?.tool_calls;
          if (toolCalls && h.onToolCall) {
            for (const tc of toolCalls) {
              if (tc.function?.name) h.onToolCall(tc.function.name);
            }
          }
        } catch {
          /* 忽略不完整分片 */
        }
      }
    }
  }
  return full;
}

// ── 本地演示流：未配置 API Key 时的兜底，方便验收 UI ──────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function demoStream(messages: ChatMessage[], h: StreamHandlers): Promise<string> {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  // 演示深度思考折叠区
  if (h.onReasoning) {
    for (const chunk of `用户问了「${lastUser.slice(0, 24)}」，这是演示模式，我会展示流式回复、深度思考折叠与工具标签的渲染效果。`.match(/.{1,6}/g) ?? []) {
      if (h.signal?.aborted) throw new DOMException('aborted', 'AbortError');
      h.onReasoning(chunk);
      await sleep(30);
    }
  }

  // 演示工具调用标签
  h.onToolCall?.('demo_query');

  const reply =
    `当前处于**演示模式**（未配置 \`VITE_AI_BASE_URL\` / \`VITE_AI_API_KEY\`）。\n\n` +
    `你刚才说：「${lastUser}」\n\n` +
    `接入真实接口后，这里会流式渲染模型回复，支持：\n\n` +
    `- GFM Markdown / 表格 / 代码高亮\n` +
    `- \`reasoning_content\` 深度思考折叠\n` +
    `- 工具调用标签（MCP / Skill / CLI 三色）\n` +
    `- Mermaid 图表：\n\n` +
    '```mermaid\ngraph LR\n  A[提问] --> B{AI}\n  B --> C[流式回复]\n  B --> D[工具调用]\n```';

  let full = '';
  for (const chunk of reply.match(/.{1,4}/gs) ?? []) {
    if (h.signal?.aborted) throw new DOMException('aborted', 'AbortError');
    full += chunk;
    h.onToken(chunk);
    await sleep(18);
  }
  return full;
}
