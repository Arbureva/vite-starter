/** 占位页：新项目直接替换 */
export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex h-64 animate-fade-up items-center justify-center rounded-2xl border border-dashed border-line bg-surface text-sm text-subtle">
      {title} — 待实现
    </div>
  );
}
