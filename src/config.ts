// ──────────────────────────────────────────────────────────────
// 应用配置：新项目从这里开始改。
// 品牌名 / 助理人设 / 快捷提问都集中在此，业务代码不散落魔法字符串。
// ──────────────────────────────────────────────────────────────

export const APP = {
  /** 品牌名（Sidebar 顶部） */
  name: 'Starter',
  /** 品牌名中的点缀字符（渲染为 brand 色） */
  nameAccent: '·',
  nameSuffix: 'Dash',
  /** 品牌副标题 */
  tagline: '数据看板模板',
  /** localStorage 主题键，多项目共存时避免互相覆盖 */
  themeStorageKey: 'starter-theme',
  /** <meta name="theme-color">：亮 / 暗 */
  themeColor: { light: '#2da94a', dark: '#0e1210' },
} as const;

export const ASSISTANT = {
  /** 助理名称（聊天头部 / 浮窗） */
  name: '小助手',
  /** 系统提示词 */
  systemPrompt:
    '你是一位数据看板里的 AI 助理。说话简洁、温和、专业，' +
    '擅长用通俗的话解读数据，并给出可执行的下一步建议。',
  /** 聊天面板底部的建议 chips */
  suggestions: ['最近的数据趋势如何？', '有什么异常需要关注？', '帮我总结一下本周情况'],
  /** 整页欢迎态的快捷提问（按时段） */
  greetingSuggestions: {
    morning: ['今天有什么安排？', '昨天的数据怎么样？', '本周目标进度如何？'],
    afternoon: ['下午的待办有哪些？', '最近的趋势如何？', '有什么需要关注的？'],
    evening: ['今天数据汇总一下？', '明天的安排？', '本周有什么异常？'],
  },
} as const;
