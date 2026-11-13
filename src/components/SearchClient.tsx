"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { SearchItem } from "@/content/tutorials";
import { cn } from "@/lib/utils";

const typeLabels: Record<SearchItem["type"], string> = {
  domain: "领域",
  tutorial: "教程",
  architecture: "架构",
  lab: "实验",
  tool: "工具",
  glossary: "术语",
  case: "案例",
  path: "路径",
};

const typeColor: Record<SearchItem["type"], string> = {
  domain: "#38D6B0",
  tutorial: "#7C8CFF",
  architecture: "#5BC0EB",
  lab: "#F0B86E",
  tool: "#C79BFF",
  glossary: "#9AE6B4",
  case: "#F6AD55",
  path: "#4FD1C5",
};

export default function SearchClient({ items }: { items: SearchItem[] }) {
  const [q, setQ] = useState("");
  const [types, setTypes] = useState<Set<string>>(new Set());

  const allTypes = useMemo(
    () => Array.from(new Set(items.map((i) => i.type))),
    [items]
  );

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((it) => {
      if (types.size > 0 && !types.has(it.type)) return false;
      if (!query) return true;
      const hay = [
        it.title,
        it.englishTitle ?? "",
        it.summary,
        ...(it.tags ?? []),
        ...(it.aliases ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [q, types, items]);

  function toggleType(t: string) {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  return (
    <div>
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="输入关键词，如 Agent、MCP、RAG、Text-to-SQL…"
          className="w-full rounded-xl border border-line bg-surface px-11 py-3 text-ink outline-none placeholder:text-ink-muted focus:border-primary/60"
          autoFocus
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            aria-label="清除"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {allTypes.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => toggleType(t)}
            className={cn(
              "rounded-pill border px-3 py-1 text-sm transition-colors",
              types.has(t)
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-line text-ink-muted hover:text-ink"
            )}
            style={types.has(t) ? { borderColor: typeColor[t as SearchItem["type"]], color: typeColor[t as SearchItem["type"]] } : undefined}
          >
            {typeLabels[t as SearchItem["type"]]}
          </button>
        ))}
      </div>

      <div className="mt-6 text-sm text-ink-muted">
        共 {results.length} 条结果
      </div>

      {results.length === 0 ? (
        <div className="card mt-4 p-10 text-center text-ink-muted">
          未找到匹配内容。试试更通用的关键词，或通过顶部导航浏览知识领域。
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((it) => (
            <Link
              key={it.id}
              href={it.url}
              className="card card-hover flex flex-col p-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="rounded-pill px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `${typeColor[it.type]}1f`,
                    color: typeColor[it.type],
                  }}
                >
                  {typeLabels[it.type]}
                </span>
              </div>
              <h3 className="mt-2 font-semibold text-ink">{it.title}</h3>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-secondary">
                {it.summary}
              </p>
              {it.tags && it.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {it.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-xs text-ink-muted">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
