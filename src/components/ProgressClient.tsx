"use client";

import Link from "next/link";
import { useProgress } from "./ProgressProvider";
import { getTutorialBySlug } from "@/content/tutorials";
import { Button, EmptyState } from "./ui";

export default function ProgressClient() {
  const { state, completedCount, favoriteCount } = useProgress();
  const completed = state.completed.map((s) => getTutorialBySlug(s)).filter(Boolean);
  const favorites = state.favorites.map((s) => getTutorialBySlug(s)).filter(Boolean);
  const recent = state.recentlyViewed
    .map((r) => getTutorialBySlug(r.slug))
    .filter(Boolean);

  function reset() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("eak:progress:v1");
      window.location.reload();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card p-5">
        <div className="text-3xl font-bold text-primary">{completedCount}</div>
        <div className="text-sm text-ink-muted">已完成教程</div>
      </div>
      <div className="card p-5">
        <div className="text-3xl font-bold text-accent">{favoriteCount}</div>
        <div className="text-sm text-ink-muted">已收藏教程</div>
      </div>
      <div className="card p-5">
        <div className="text-3xl font-bold text-ink">{recent.length}</div>
        <div className="text-sm text-ink-muted">最近浏览</div>
      </div>

      {completed.length > 0 && (
        <div className="card p-5 lg:col-span-3">
          <h3 className="mb-3 font-semibold text-ink">已完成</h3>
          <div className="flex flex-wrap gap-2">
            {completed.map((t) => (
              <Link
                key={t!.id}
                href={`/tutorials/${t!.slug}`}
                className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm text-primary hover:bg-primary/20"
              >
                {t!.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="card p-5 lg:col-span-3">
          <h3 className="mb-3 font-semibold text-ink">收藏</h3>
          <div className="flex flex-wrap gap-2">
            {favorites.map((t) => (
              <Link
                key={t!.id}
                href={`/tutorials/${t!.slug}`}
                className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm text-accent hover:bg-accent/20"
              >
                {t!.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div className="card p-5 lg:col-span-3">
          <h3 className="mb-3 font-semibold text-ink">最近浏览</h3>
          <div className="flex flex-wrap gap-2">
            {recent.map((t) => (
              <Link
                key={t!.id}
                href={`/tutorials/${t!.slug}`}
                className="rounded-lg border border-line bg-surface/40 px-3 py-1.5 text-sm text-ink-secondary hover:border-primary/40 hover:text-primary"
              >
                {t!.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {completedCount === 0 && favoriteCount === 0 && recent.length === 0 && (
        <div className="lg:col-span-3">
          <EmptyState
            title="还没有学习记录"
            description="在教程页面点击“标记完成”或“收藏”即可在这里查看进度。数据保存在你的浏览器本地。"
          />
        </div>
      )}

      {(completedCount > 0 || favoriteCount > 0) && (
        <div className="lg:col-span-3">
          <Button variant="ghost" onClick={reset}>
            清空本地学习记录
          </Button>
        </div>
      )}
    </div>
  );
}
