"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="切换深浅色主题"
      title="切换深色 / 护眼米白主题"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-secondary hover:text-ink"
    >
      {/* 图标显隐由 globals.css 按 data-theme 控制，避免 hydration 不匹配 */}
      <Sun size={17} className="theme-icon-sun" />
      <Moon size={17} className="theme-icon-moon" />
    </button>
  );
}
