import { toBlob } from 'html-to-image';

interface ShotOpts {
  bgFrom?: HTMLElement; // 从哪个节点取背景色
  padding?: number;     // 四周边距(px)
}

/**
 * 对真实节点截图。不克隆 DOM:
 * - 临时给节点加 padding + 背景,补上边距
 * - 用 scrollWidth/scrollHeight 显式指定尺寸,避免被滚动容器裁剪
 * - 截完无论成败都还原 inline 样式
 */
async function snapshot(node: HTMLElement, { bgFrom, padding = 24 }: ShotOpts = {}): Promise<Blob> {
  const bg = bgFrom ? getComputedStyle(bgFrom).backgroundColor || '#ffffff' : '#ffffff';

  // 记录并临时覆盖关键样式
  const prev = {
    padding: node.style.padding,
    background: node.style.background,
    borderRadius: node.style.borderRadius,
    boxSizing: node.style.boxSizing,
  };
  node.style.boxSizing = 'content-box';
  node.style.padding = `${padding}px`;
  node.style.background = bg;
  node.style.borderRadius = '12px';

  try {
    const blob = await toBlob(node, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: bg,
      width: node.scrollWidth + padding * 2,
      height: node.scrollHeight + padding * 2,
      filter: (el) => !(el instanceof HTMLElement && el.dataset.noCapture === 'true'),
    });
    if (!blob) throw new Error('图片生成失败');
    return blob;
  } finally {
    node.style.padding = prev.padding;
    node.style.background = prev.background;
    node.style.borderRadius = prev.borderRadius;
    node.style.boxSizing = prev.boxSizing;
  }
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export async function copyNodeAsImage(node: HTMLElement, bgFrom?: HTMLElement, padding = 24) {
  const blob = await snapshot(node, { bgFrom, padding });
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

export async function downloadNodeAsImage(
  node: HTMLElement,
  filename = 'chat.png',
  bgFrom?: HTMLElement,
  padding = 24,
) {
  const blob = await snapshot(node, { bgFrom, padding });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}