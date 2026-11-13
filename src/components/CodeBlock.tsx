"use client";

import { useState } from "react";
import { highlight } from "@/lib/codeHighlight";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  caption?: string;
  runnable?: boolean;
}

export default function CodeBlock({ code, language, filename, caption, runnable }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const html = highlight(code, language);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-block">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          {filename ? (
            <span className="text-ink-secondary">{filename}</span>
          ) : (
            <span className="uppercase tracking-wide">{language}</span>
          )}
          {runnable && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-primary">可运行</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-md px-2 py-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
            aria-label={collapsed ? "展开代码" : "折叠代码"}
          >
            {collapsed ? "展开" : "折叠"}
          </button>
          <button
            type="button"
            onClick={copy}
            className="rounded-md px-2 py-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
            aria-label="复制代码"
          >
            {copied ? "已复制" : "复制"}
          </button>
        </div>
      </div>
      {!collapsed && (
        <pre className={cn("!my-0")}>
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      )}
      {caption && (
        <div className="border-t border-line px-3 py-2 text-xs text-ink-muted">{caption}</div>
      )}
    </div>
  );
}
