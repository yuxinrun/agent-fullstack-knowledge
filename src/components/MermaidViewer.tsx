"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "./ThemeProvider";

interface MermaidViewerProps {
  source: string;
  title?: string;
  caption?: string;
}

let mermaidPromise: Promise<any> | null = null;
let cachedTheme: Theme | null = null;

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

async function getMermaid(theme: Theme) {
  const isLight = theme === "light";
  if (!mermaidPromise || cachedTheme !== theme) {
    cachedTheme = theme;
    mermaidPromise = import("mermaid").then((m) => {
      const mermaid = m.default;
      mermaid.initialize({
        startOnLoad: false,
        // "base" 主题在浅色下不强制深底，配合 CSS 变量更接近护眼米白
        theme: isLight ? "base" : "dark",
        themeVariables: {
          background: readVar("--color-code-bg", isLight ? "#f9f4e8" : "#0a0f1e"),
          primaryColor: readVar("--color-surface-2", isLight ? "#f1eadb" : "#1d2940"),
          primaryTextColor: readVar("--color-text", isLight ? "#2c2a25" : "#f8fafc"),
          primaryBorderColor: readVar("--color-primary", isLight ? "#0f8a6d" : "#38d6b0"),
          lineColor: readVar("--color-text-muted", isLight ? "#7d776a" : "#7c8cff"),
          secondaryColor: readVar("--color-surface", isLight ? "#fffdf7" : "#172033"),
          tertiaryColor: readVar("--color-bg", isLight ? "#f5f1e8" : "#172033"),
          fontFamily: "Inter, sans-serif",
          actorBkg: readVar("--color-surface-2", isLight ? "#f1eadb" : "#1d2940"),
          actorTextColor: readVar("--color-text", isLight ? "#2c2a25" : "#f8fafc"),
          actorBorder: readVar("--color-primary", isLight ? "#0f8a6d" : "#38d6b0"),
          signalColor: readVar("--color-text", isLight ? "#2c2a25" : "#f8fafc"),
          signalTextColor: readVar("--color-text", isLight ? "#2c2a25" : "#f8fafc"),
          noteBkgColor: readVar("--color-bg-secondary", isLight ? "#efe9dc" : "#111827"),
          noteTextColor: readVar("--color-text", isLight ? "#2c2a25" : "#f8fafc"),
        },
        flowchart: { curve: "basis", htmlLabels: true, useMaxWidth: true },
        sequence: { useMaxWidth: true },
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

export default function MermaidViewer({ source, title, caption }: MermaidViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    getMermaid(theme).then(async (mermaid) => {
      try {
        const id = `mmd-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, source);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError("图表渲染失败：" + (e as Error).message);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [source, theme]);

  return (
    <div className={cn("my-5", full && "fixed inset-3 z-[60] overflow-auto rounded-xl border border-line bg-bg p-4")}>
      {title && <div className="mb-2 text-sm font-semibold text-ink-secondary">{title}</div>}
      <div className="mermaid-host relative">
        <div ref={ref} />
        {error && <pre className="whitespace-pre-wrap p-3 text-sm text-red-300">{error}</pre>}
        <button
          type="button"
          onClick={() => setFull((f) => !f)}
          className="absolute right-2 top-2 rounded-md bg-surface-2/80 px-2 py-1 text-xs text-ink-secondary hover:text-ink"
          aria-label={full ? "退出放大" : "放大查看"}
        >
          {full ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
      {!full && (
        <button
          type="button"
          onClick={() => setFull(true)}
          className="mt-2 flex items-center gap-1 text-xs text-ink-muted hover:text-primary"
        >
          <Maximize2 size={12} /> 放大查看
        </button>
      )}
      {caption && <div className="mt-1 text-xs text-ink-muted">{caption}</div>}
    </div>
  );
}
