# Dashboard Starter

轻量级数据看板启动模板，从 julin-dashboard 抽离而来。新项目 `cp -r` 一份直接开工。

```bash
npm i          # 或 pnpm i
npm run dev
```

## 抽离了什么

**主题系统**
- `src/index.css` — 色板以 `R G B` 三元组 CSS 变量存储（`:root` / `.dark` 两套），含图表色 `--c-1..8`、竹节分隔线、等宽数字、滚动条、focus-visible、reduced-motion
- `tailwind.config.js` — 语义色全部走 `rgb(var(--x) / <alpha-value>)`，明暗切换零成本
- `src/theme/ThemeProvider.tsx` — light/dark 切换 + localStorage 持久化 + `theme-color` meta 同步
- `index.html` 内联脚本 — 首帧前应用主题，避免暗色闪白

**可折叠 Sidebar**（`src/components/layout/Sidebar.tsx`）
- 三态：展开 244px / 收起 56px / 移动端抽屉 + 遮罩
- 二级菜单：展开态内联展开（含激活竖条指示），收起态 hover 悬浮弹出
- 折叠切换 + 主题切换内置于底部，折叠状态持久化（AppShell 内）
- 底部 `footer` slot 留给用户信息 / 退出登录

**AI 助理**（浮窗 + 整页共用一套 `ChatCore`）
- `FloatingChat` — 右下角浮动按钮，小窗 ↔ 居中全屏，`/chat` 页自动隐藏
- `pages/Chat.tsx` — 整页变体，空态时段问候 + 快捷提问
- `lib/ai.ts` — OpenAI 兼容 SSE 流式解析：正文 / `reasoning_content` 深度思考 / `tool_calls`；未配置 Key 时回落内置演示流
- 深度思考可折叠区、工具标签三色分类（MCP/Skill/CLI，`toolDisplay.ts`）
- GFM Markdown + 代码高亮 + Mermaid（动态加载，不占首包）
- 单条消息复制文字 / 复制为图片，整段对话导出图片（`lib/share.ts`）

## 新项目从哪改起

1. `src/config.ts` — 品牌名、助理人设、建议 chips、主题存储 key（**同步改 `index.html` 内联脚本里的 key**）
2. `src/components/layout/nav.ts` — 导航结构
3. `src/index.css` — 换品牌色只需改 `--brand` / `--brand-soft` / `--brand-ink` 三组变量（亮暗各一套）
4. `.env` — AI 接口地址与 Key（生产环境请走后端代理）
5. `src/pages/Placeholder.tsx` — 替换为真实页面

## 原项目中未抽离的部分

auth（登录守卫 / 用户态）、react-query 数据层、MSW mock、recharts 图表组件、时间范围筛选器（Topbar 留了 `actions` slot 接回）、OSS 图片组件。需要时从 julin-dashboard 拷。
