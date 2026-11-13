import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { architectures, getArchitecture, getDomain, domains } from "@/content/tutorials";
import MermaidViewer from "@/components/MermaidViewer";
import { Breadcrumb, Badge, SectionHeading } from "@/components/ui";

export function generateStaticParams() {
  return architectures.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArchitecture(params.slug);
  if (!a) return { title: "架构未找到" };
  return { title: a.title, description: a.summary };
}

export default function ArchitectureDetailPage({ params }: { params: { slug: string } }) {
  const arch = getArchitecture(params.slug);
  if (!arch) notFound();

  const relatedDomains = arch.relatedDomains
    .map((id) => domains.find((d) => d.id === id))
    .filter(Boolean);
  const relatedTuts = arch.relatedTutorialSlugs
    .map((s) => allTutorialLookup(s))
    .filter(Boolean);

  return (
    <div className="container-page py-10">
      <Breadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "架构中心", href: "/architecture" },
          { label: arch.title },
        ]}
      />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold md:text-4xl">{arch.title}</h1>
          <p className="mt-3 text-lg text-ink-secondary">{arch.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge color="#7C8CFF">适用场景</Badge>
            <span className="text-sm text-ink-muted">{arch.scenario}</span>
          </div>

          <div className="mt-8">
            <SectionHeading eyebrow="架构图" title="系统架构" />
            <MermaidViewer source={arch.diagramSource} title={arch.title} />
          </div>

          {/* 组件说明 */}
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold">组件说明</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {arch.components.map((c, i) => (
                <div key={i} className="rounded-xl border border-line bg-surface/40 p-4">
                  <div className="font-semibold text-ink">{c.name}</div>
                  <div className="mt-1 text-sm text-ink-secondary">{c.role}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 数据流 & 调用流程 */}
          <section className="mt-10 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold">数据流</h2>
              <ol className="space-y-2">
                {arch.dataFlow.map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink-secondary">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs text-primary">
                      {i + 1}
                    </span>
                    {f}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-bold">调用流程</h2>
              <ul className="space-y-2">
                {arch.callFlow.map((f, i) => (
                  <li key={i} className="rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-ink-secondary">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 技术选型 */}
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold">技术选型</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {arch.techOptions.map((t, i) => (
                <div key={i} className="rounded-xl border border-line bg-surface/40 p-4">
                  <div className="mb-2 text-sm font-semibold text-ink">{t.category}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.options.map((o) => (
                      <span key={o} className="rounded-pill border border-line bg-surface-2 px-2 py-0.5 text-xs text-ink-muted">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 部署 / 安全 / 扩展 */}
          <section className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface/40 p-5">
              <h3 className="mb-2 font-semibold text-primary">部署方式</h3>
              <p className="text-sm text-ink-secondary">{arch.deployment}</p>
            </div>
            <div className="rounded-xl border border-line bg-surface/40 p-5">
              <h3 className="mb-2 font-semibold text-primary">安全考虑</h3>
              <p className="text-sm text-ink-secondary">{arch.security}</p>
            </div>
            <div className="rounded-xl border border-line bg-surface/40 p-5">
              <h3 className="mb-2 font-semibold text-primary">扩展方式</h3>
              <p className="text-sm text-ink-secondary">{arch.extensibility}</p>
            </div>
          </section>

          {/* 设计取舍 */}
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-bold">设计取舍</h2>
            <ul className="space-y-2">
              {arch.designConsiderations.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink-secondary">
                  <span className="text-primary">·</span>
                  {d}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* 侧栏 */}
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

// 本地查找
import { getTutorialBySlug } from "@/content/tutorials";
function allTutorialLookup(slug: string) {
  return getTutorialBySlug(slug);
}
