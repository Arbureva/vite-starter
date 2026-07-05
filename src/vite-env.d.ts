/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** OpenAI 兼容接口的 Base URL，例如 https://api.openai.com/v1 */
  readonly VITE_AI_BASE_URL?: string;
  /** OpenAI 兼容接口的 API Key（仅用于本地联调，生产请走后端代理） */
  readonly VITE_AI_API_KEY?: string;
  /** 模型名，例如 gpt-4o-mini / deepseek-chat */
  readonly VITE_AI_MODEL?: string;
  /** 是否启用 MSW Mock，默认 true */
  readonly VITE_ENABLE_MOCK?: string;
  /** Web API 前置 URL，默认 /api/web-v1；接真实后端时按需覆盖 */
  readonly VITE_API_BASE_URL?: string;
  /** OSS 访问域名（不含 bucket），如 oss-cn-hangzhou.aliyuncs.com */
  readonly VITE_OSS_ENDPOINT?: string;
  /** 校顾产品公共私有资源所在 bucket（/common 前缀） */
  readonly VITE_OSS_COMMON_BUCKET?: string;
  /** 校区私有资源所在 bucket（/C-{id} 前缀） */
  readonly VITE_OSS_CAMPUS_BUCKET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
