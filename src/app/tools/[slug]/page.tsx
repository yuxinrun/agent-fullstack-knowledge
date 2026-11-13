import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { tools, getTool, getTutorialBySlug } from "@/content/tutorials";
import ToolRenderer from "@/components/tools/ToolRenderer";
import { Breadcrumb, Button } from "@/components/ui";

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = getTool(params.slug);
  if (!t) return { title: "工具未找到" };
  return { title: t.title, description: t.description };
}

export default function ToolDetail({ params }: { params: { slug: string } }) {
  const tool = getTool(params.slug);
  if (!tool) notFound();
  const relatedTuts = tool.relatedTutorialSlugs.map((s) => getTutorialBySlug(s)).filter(Boolean);

  return (
    <div className="container-page py-10">
      <Breadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "工具箱", href: "/tools" },
          { label: tool.title },
        ]}
      />
      <div className="mt-6 max-w-3xl">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="rounded-pill bg-primary/15 px-2 py-0.5 text-primary">{tool.category}</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{tool.title}</h1>
        <p className="mt-3 text-lg text-ink-secondary">{tool.description}</p>
      </div>

      <div className="mt-8">
        <ToolRenderer component={tool.component} />
      </div>

      {relatedTuts.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-muted">关联教程</div>
          <div className="flex flex-wrap gap-2">
            {relatedTuts.map((t) => t && (
              <Link key={t.id} href={`/tutorials/${t.slug}`} className="rounded-lg border border-line bg-surface/40 px-3 py-1.5 text-sm text-ink-secondary hover:border-primary/40 hover:text-primary">{t.title}</Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <Button href="/tools" variant="outline">← 返回工具箱</Button>
      </div>
    </div>
  );
}
