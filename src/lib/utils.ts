import { clsx, type ClassValue } from 'clsx';

/** className 合并 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** 图表色板（读取 CSS 变量，自动跟随明暗模式） */
export const CHART_VARS = ['--c-1', '--c-2', '--c-3', '--c-4', '--c-5', '--c-6', '--c-7', '--c-8'] as const;

export function chartColor(i: number): string {
  return `rgb(var(${CHART_VARS[i % CHART_VARS.length]}))`;
}
