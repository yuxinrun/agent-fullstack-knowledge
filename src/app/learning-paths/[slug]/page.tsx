import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getLearningPath, getTutorialBySlug, domains } from "@/content/tutorials";
import { Breadcrumb, Badge } from "@/components/ui";

export function generateStaticParams() {
  return require("@/content/tutorials").learningPaths.map((p: any) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getLearningPath(params.slug);
  if (!p) return { title: "路径未找到" };
  return { title: p.title, description: p.description };
}

export default function LearningPathDetail({ params }: { params: { slug: string } }) {
  const path = getLearningPath(params.slug);
  if (!path) notFound();

  return (
    <div className="container-page py-10">
      <Breadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "学习路径", href: "/learning-paths" },
          { label: path.title },
        ]}
      />
      <div className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold md:text-4xl">{path.title}</h1>
        <p className="mt-3 text-lg text-ink-secondary">{path.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <span>面向：{path.audience}</span>
          <span>·</span>
          <span>{path.steps.length} 个阶段</span>
          <span>·</span>
          <span>约 {path.estimatedHours} 小时</span>
        </div>
      </div>

      <div className="mt-10 space-y-8">
        {path.steps.map((step, i) => (
          <div key={i} className="grid gap-4 md:grid-cols-[3rem_1fr]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-lg font-bold text-primary">
              {i + 1}
            </div>
            <div className="rounded-xl border border-line bg-surface/40 p-5">
              <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-secondary">{step.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {step.tutorialSlugs.map((slug) => {
                  const t = getTutorialBySlug(slug);
                  if (!t) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/tutorials/${slug}`}
                      className="flex items-center gap-1 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm text-ink-secondary hover:border-primary/40 hover:text-primary"
                    >
                      {t.title}
                      <ArrowUpRight size={13} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link
          href="/domains"
          className="text-sm text-primary hover:underline"
        >
          ← 返回知识领域
        </Link>
      </div>
    </div>
  );
}
