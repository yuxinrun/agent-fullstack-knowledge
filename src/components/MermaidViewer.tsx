"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MermaidViewerProps {
  source: string;
  title?: string;
  caption?: string;
}

let mermaidPromise: Promise<any> | null = null;

async function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      const mermaid = m.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          background: "#0a0f1e",
          primaryColor: "#1d2940",
          primaryTextColor: "#f8fafc",
          primaryBorderColor: "#38d6b0",
          lineColor: "#7c8cff",
          secondaryColor: "#172033",
          tertiaryColor: "#172033",
          fontFamily: "Inter, sans-serif",
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

  useEffect(() => {
    let cancelled = false;
    getMermaid().then(async (mermaid) => {
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
  }, [source]);

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
