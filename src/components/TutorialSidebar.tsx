"use client";

import { useEffect, useState } from "react";
import { Check, Bookmark, List, X } from "lucide-react";
import { useProgress } from "./ProgressProvider";
import { cn } from "@/lib/utils";

interface SectionLink {
  id: string;
  heading: string;
}

export default function TutorialSidebar({
  slug,
  sections,
}: {
  slug: string;
  sections: SectionLink[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [progress, setProgress] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const { isComplete, isFavorite, toggleComplete, toggleFavorite } = useProgress();

  const done = isComplete(slug);
  const fav = isFavorite(slug);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((scrolled / max) * 100)) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  const nav = (
    <nav className="space-y-1 text-sm">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={() => setDrawer(false)}
          className={cn(
            "block rounded-lg px-3 py-1.5 transition-colors",
            active === s.id
              ? "bg-primary/10 text-primary"
              : "text-ink-muted hover:text-ink"
          )}
        >
          {s.heading}
        </a>
      ))}
    </nav>
  );

  return (
    <>
      {/* 桌面端侧栏 */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            <List size={14} /> 本章目录
          </div>
          {nav}
          <div className="mt-6 space-y-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => toggleComplete(slug)}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                done
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-line text-ink-secondary hover:border-primary/40"
              )}
            >
              <Check size={16} /> {done ? "已完成" : "标记完成"}
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(slug)}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                fav
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-line text-ink-secondary hover:border-accent/40"
              )}
            >
              <Bookmark size={16} /> {fav ? "已收藏" : "收藏"}
            </button>
          </div>
        </div>
      </aside>

      {/* 移动端：进度 + 抽屉 */}
      <div className="lg:hidden">
        <div className="fixed inset-x-0 top-16 z-30 border-b border-line bg-bg/90 px-4 py-2 backdrop-blur">
          <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="flex items-center gap-1 text-ink-secondary"
            >
              <List size={14} /> 目录
            </button>
            <span>阅读进度 {progress}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-pill bg-surface-2">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {drawer && (
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setDrawer(false)}>
            <div
              className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-bg p-4 pt-16"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="absolute right-3 top-4 text-ink-muted"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
              <div className="mb-3 text-xs font-semibold uppercase text-ink-muted">本章目录</div>
              {nav}
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleComplete(slug);
                  }}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm",
                    done ? "border-primary/50 bg-primary/10 text-primary" : "border-line text-ink-secondary"
                  )}
                >
                  <Check size={16} /> {done ? "已完成" : "标记完成"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleFavorite(slug);
                  }}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm",
                    fav ? "border-accent/50 bg-accent/10 text-accent" : "border-line text-ink-secondary"
                  )}
                >
                  <Bookmark size={16} /> {fav ? "已收藏" : "收藏"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
