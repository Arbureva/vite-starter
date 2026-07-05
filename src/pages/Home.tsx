import { CHART_VARS, chartColor } from '@/lib/utils';

/** 首页兼作设计 token 速查：新项目开工前先看一眼这里 */
export function Home() {
  return (
    <div className="space-y-6">
      {/* 语义色 */}
      <section className="animate-fade-up rounded-2xl border border-line bg-surface p-5 shadow-card">
        <h2 className="mb-1 font-display text-sm font-bold text-ink">语义色</h2>
        <p className="mb-4 text-2xs text-subtle">
          全部读取 CSS 变量（R G B 三元组），配合 <code className="rounded bg-surface-2 px-1 text-brand">rgb(var(--x) / &lt;alpha-value&gt;)</code>，明暗模式自动切换
        </p>
        <div className="flex flex-wrap gap-3">
          {(
            [
              ['bg-bg', 'bg'],
              ['bg-surface', 'surface'],
              ['bg-surface-2', 'surface-2'],
              ['bg-brand', 'brand'],
              ['bg-brand-soft', 'brand-soft'],
              ['bg-ink', 'ink'],
              ['bg-muted', 'muted'],
              ['bg-subtle', 'subtle'],
            ] as const
          ).map(([cls, name]) => (
            <div key={name} className="flex items-center gap-2">
              <span className={`h-8 w-8 rounded-lg border border-line ${cls}`} />
              <span className="text-xs text-muted">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 图表色板 */}
      <section className="animate-fade-up rounded-2xl border border-line bg-surface p-5 shadow-card">
        <h2 className="mb-1 font-display text-sm font-bold text-ink">图表色板</h2>
        <p className="mb-4 text-2xs text-subtle">
          <code className="rounded bg-surface-2 px-1 text-brand">chartColor(i)</code> 取用，跟随明暗模式
        </p>
        <div className="flex gap-2">
          {CHART_VARS.map((_, i) => (
            <div
              key={i}
              className="h-16 flex-1 rounded-lg"
              style={{ backgroundColor: chartColor(i) }}
              title={`chartColor(${i})`}
            />
          ))}
        </div>
      </section>

      {/* 数字排版 */}
      <section className="animate-fade-up rounded-2xl border border-line bg-surface p-5 shadow-card">
        <h2 className="mb-1 font-display text-sm font-bold text-ink">数字排版</h2>
        <p className="mb-4 text-2xs text-subtle">
          <code className="rounded bg-surface-2 px-1 text-brand">.tabular</code> 等宽数字对齐 — 数据看板的命根子
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['本月收入', '¥128,400'],
            ['活跃用户', '3,847'],
            ['转化率', '12.6%'],
            ['环比', '+8.2%'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-surface-2/60 p-4">
              <p className="text-2xs text-subtle">{label}</p>
              <p className="tabular mt-1 font-display text-2xl font-bold text-ink">{value}</p>
            </div>
          ))}
        </div>
        <div className="bamboo-divider mt-5" />
        <p className="mt-3 text-2xs text-subtle">
          ↑ .bamboo-divider 分隔线 · 右下角是全局 AI 浮窗，左侧导航含二级菜单示例
        </p>
      </section>
    </div>
  );
}
