import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <p className="font-display text-5xl font-bold text-ink">404</p>
      <p className="text-sm text-muted">页面不存在</p>
      <Link to="/" className="text-sm text-brand underline underline-offset-2">
        返回首页
      </Link>
    </div>
  );
}
