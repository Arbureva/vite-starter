import { memo, useEffect, useId, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
// 任选一个 highlight.js 主题；深色面板可换成 'highlight.js/styles/github-dark.css'
import 'highlight.js/styles/github.css';

// mermaid 体积较大，按需动态加载：不出现 mermaid 代码块就不进首包
let mermaidPromise: Promise<typeof import('mermaid')['default']> | null = null;
function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose', // 允许图表内 click / html，AI 输出可信时使用
        fontFamily: 'inherit',
      });
      return m.default;
    });
  }
  return mermaidPromise;
}

/** 单个 mermaid 图表块：异步渲染成 SVG，失败时回退为代码原文 */
function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const id = 'mmd-' + useId().replace(/[^a-zA-Z0-9]/g, '');

  useEffect(() => {
    let alive = true;
    loadMermaid()
      .then((mermaid) => mermaid.render(id, code.trim()))
      .then((r) => {
        if (!alive) return;
        setSvg(r.svg);
        setErr(null);
      })
      .catch((e) => alive && setErr(e?.message ?? '图表渲染失败'));
    return () => {
      alive = false;
    };
  }, [code, id]);

  if (err) {
    return (
      <pre className="my-2 overflow-x-auto rounded-lg bg-surface-2 p-3 text-2xs text-muted">
        {code}
      </pre>
    );
  }
  return (
    <div
      className="my-3 flex justify-center overflow-x-auto rounded-lg bg-bg p-3 [&_svg]:h-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const components: Components = {
  p: (p) => <p className="my-2" {...p} />,
  a: (p) => (
    <a className="text-brand underline underline-offset-2" target="_blank" rel="noreferrer" {...p} />
  ),
  ul: (p) => <ul className="my-2 list-disc space-y-1 pl-5" {...p} />,
  ol: (p) => <ol className="my-2 list-decimal space-y-1 pl-5" {...p} />,
  li: (p) => <li className="marker:text-subtle" {...p} />,
  h1: (p) => <h1 className="mb-2 mt-3 text-base font-bold text-ink" {...p} />,
  h2: (p) => <h2 className="mb-2 mt-3 text-sm font-bold text-ink" {...p} />,
  h3: (p) => <h3 className="mb-1 mt-2 text-sm font-semibold text-ink" {...p} />,
  blockquote: (p) => (
    <blockquote className="my-2 border-l-2 border-line pl-3 text-muted" {...p} />
  ),
  hr: () => <hr className="my-3 border-line" />,
  table: (p) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs" {...p} />
    </div>
  ),
  th: (p) => (
    <th className="border border-line bg-surface-2 px-2 py-1 text-left font-semibold" {...p} />
  ),
  td: (p) => <td className="border border-line px-2 py-1 align-top" {...p} />,
  pre: (p) => (
    <pre
      className="my-2 overflow-x-auto rounded-lg bg-surface-2 p-3 text-xs [&_code]:bg-transparent [&_code]:p-0"
      {...p}
    />
  ),
  code({ node, className, children, ...rest }) {
    const lang = /language-(\w+)/.exec(className || '')?.[1];

    if (lang === 'mermaid') {
      // ignoreMissing 下 mermaid 块不会被高亮分词，可直接取原文
      const raw = (node?.children?.[0] as { value?: string } | undefined)?.value ?? String(children);
      return <MermaidBlock code={raw} />;
    }

    const text = String(children);
    const isInline = !className && !text.includes('\n');
    if (isInline) {
      return (
        <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[12px] text-brand" {...rest}>
          {children}
        </code>
      );
    }
    return (
      <code className={cn(className, 'hljs')} {...rest}>
        {children}
      </code>
    );
  },
};

export const MessageMarkdown = memo(function MessageMarkdown({ content }: { content: string }) {
  return (
    <div className="break-words text-[13px] leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeHighlight, { ignoreMissing: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
