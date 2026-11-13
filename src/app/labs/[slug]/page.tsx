import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { labs, getLab, getTutorialBySlug } from "@/content/tutorials";
import LabRenderer from "@/components/labs/LabRenderer";
import { Breadcrumb, Button } from "@/components/ui";

export function generateStaticParams() {
  return labs.map((l) => ({ slug: l.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const l = getLab(params.slug);
  if (!l) return { title: "实验未找到" };
  return { title: l.title, description: l.description };
}

export default function LabDetail({ params }: { params: { slug: string } }) {
  const lab = getLab(params.slug);
  if (!lab) notFound();
  const relatedTuts = lab.relatedTutorialSlugs.map((s) => getTutorialBySlug(s)).filter(Boolean);

  return (
    <div className="container-page py-10">
      <Breadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "实验室", href: "/labs" },
          { label: lab.title },
        ]}
      />
      <div className="mt-6 max-w-3xl">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="rounded-pill bg-accent/15 px-2 py-0.5 text-accent">{lab.category}</span>
          <span>{lab.difficulty}</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{lab.title}</h1>
        <p className="mt-3 text-lg text-ink-secondary">{lab.description}</p>
        {lab.learningObjectives.length > 0 && (
          <div className="mt-4 rounded-xl border border-line bg-surface/50 p-4">
            <div className="mb-2 text-sm font-semibold text-ink">学习目标</div>
            <ul className="space-y-1 text-sm text-ink-secondary">
              {lab.learningObjectives.map((o, i) => (
                <li key={i} className="flex gap-2"><span className="text-primary">·</span>{o}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-8">
        <LabRenderer component={lab.component} />
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
        <Button href="/labs" variant="outline">← 返回实验室</Button>
      </div>
    </div>
  );
}
