import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCaseStudy, domains, getTutorialBySlug } from "@/content/tutorials";
import MermaidViewer from "@/components/MermaidViewer";
import { Breadcrumb, Badge } from "@/components/ui";

export function generateStaticParams() {
  return require("@/content/tutorials").caseStudies.map((c: any) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getCaseStudy(params.slug);
  if (!c) return { title: "案例未找到" };
  return { title: c.title, description: c.summary };
}

export default function CaseStudyDetail({ params }: { params: { slug: string } }) {
  const item = getCaseStudy(params.slug);
  if (!item) notFound();

  const relatedDomains = item.relatedDomains
    .map((id) => domains.find((d) => d.id === id))
    .filter(Boolean);
  const relatedTuts = item.relatedTutorialSlugs
    .map((s) => getTutorialBySlug(s))
    .filter(Boolean);

  return (
    <div className="container-page py-10">
      <Breadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "企业案例", href: "/case-studies" },
          { label: item.title },
        ]}
      />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="#7C8CFF">{item.industry}</Badge>
            <Badge color="#F0B86E">{item.caseType}</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">{item.title}</h1>
          <p className="mt-3 text-lg text-ink-secondary">{item.summary}</p>

          <section className="mt-8">
            <h2 className="mb-3 text-2xl font-bold">业务问题</h2>
            <ul className="space-y-2">
              {item.businessProblem.map((b, i) => (
                <li key={i} className="flex gap-2 text-ink-secondary">
                  <span className="text-primary">·</span>
                  {b}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-2xl font-bold">解决方案</h2>
            <ul className="space-y-2">
              {item.solution.map((s, i) => (
                <li key={i} className="flex gap-2 text-ink-secondary">
                  <span className="text-primary">·</span>
                  {s}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-2xl font-bold">架构示意</h2>
            <MermaidViewer source={item.architecture} title={item.title} />
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-2xl font-bold">技术栈</h2>
            <div className="flex flex-wrap gap-2">
              {item.technologyStack.map((t) => (
                <span key={t} className="rounded-pill border border-line bg-surface-2 px-3 py-1 text-sm text-ink-muted">
                  {t}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-2xl font-bold">实施步骤</h2>
            <ol className="space-y-2">
              {item.implementationSteps.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-ink-secondary">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs text-primary">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-2xl font-bold">效果评估</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {item.evaluation.map((e, i) => (
                <div key={i} className="rounded-xl border border-line bg-surface/40 p-4">
                  <div className="text-sm font-semibold text-ink">{e.metric}</div>
                  <div className="mt-1 text-sm text-ink-muted">{e.result}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              注：{item.references.join("；")}
            </p>
          </section>
        </div>

        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="sticky top-20 space-y-6">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                相关领域
              </div>
              <div className="space-y-2">
                {relatedDomains.map(
                  (d) =>
                    d && (
                      <Link
                        key={d.id}
                        href={`/domains/${d.slug}`}
                        className="flex items-center gap-2 rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-ink-secondary hover:border-primary/40 hover:text-primary"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                        {d.shortTitle}
                      </Link>
                    )
                )}
              </div>
            </div>
            {relatedTuts.length > 0 && (
              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  相关教程
                </div>
                <div className="space-y-2">
                  {relatedTuts.map(
                    (t) =>
                      t && (
                        <Link
                          key={t.id}
                          href={`/tutorials/${t.slug}`}
                          className="block rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-ink-secondary hover:border-primary/40 hover:text-primary"
                        >
                          {t.title}
                        </Link>
                      )
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
