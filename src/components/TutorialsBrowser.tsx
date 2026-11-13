"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Domain } from "@/content/types";
import { Tag } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface TutorialListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: string;
  estimatedMinutes: number;
  tags: string[];
  status?: string;
  domainId: string;
}

const difficultyColor: Record<string, string> = {
  入门: "#38D6B0",
  初级: "#5BC0EB",
  中级: "#7C8CFF",
  高级: "#F0B86E",
  专家: "#FC8181",
};

export function TutorialsBrowser({
  tutorials,
  domains,
}: {
  tutorials: TutorialListItem[];
  domains: Domain[];
}) {
  const params = useSearchParams();
  const active = params.get("domain");
  const activeDomain = active ? domains.find((d) => d.slug === active) : undefined;
  const list = active
    ? tutorials.filter(
        (t) => domains.find((d) => d.id === t.domainId)?.slug === active
      )
    : tutorials;

  return (
    <>
      {/* 领域筛选 */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/tutorials"
          className={cn(
            "rounded-pill border px-3 py-1.5 text-sm transition-colors",
            !active
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-line text-ink-muted hover:text-ink"
          )}
        >
          全部（{tutorials.length}）
        </Link>
        {domains.map((d) => {
          const count = tutorials.filter((t) => t.domainId === d.id).length;
          const isActive = active === d.slug;
          return (
            <Link
              key={d.id}
              href={`/tutorials?domain=${d.slug}`}
              className={cn(
                "rounded-pill border px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-line text-ink-muted hover:text-ink"
              )}
              style={isActive ? { borderColor: `${d.color}88`, color: d.color } : undefined}
            >
              {d.shortTitle}（{count}）
            </Link>
          );
        })}
      </div>

      {list.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => {
            const domain = domains.find((d) => d.id === t.domainId);
            return (
              <Link
                key={t.id}
                href={`/tutorials/${t.slug}`}
                className="card card-hover group flex flex-col p-4"
              >
                <div className="flex items-center gap-2">
                  {domain && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: domain.color }}
                    />
                  )}
                  <span className="text-xs text-ink-muted">{domain?.shortTitle ?? ""}</span>
                  {t.status === "in-progress" && (
                    <span className="rounded-pill bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300">
                      纲要版
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-semibold text-ink group-hover:text-primary">
                  {t.title}
                </h3>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-secondary">
                  {t.summary}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-ink-muted">
                  <span style={{ color: difficultyColor[t.difficulty] ?? "#7C8CFF" }}>
                    {t.difficulty}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {t.estimatedMinutes} 分钟
                  </span>
                  {t.tags.slice(0, 2).map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card p-8 text-center text-ink-muted">
          {activeDomain ? `${activeDomain.title} 的教程正在建设中。` : "暂无教程。"}
        </div>
      )}
    </>
  );
}
