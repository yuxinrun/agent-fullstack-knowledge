import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Clock, GraduationCap, BookMarked, Target } from "lucide-react";
import {
  allTutorials,
  getTutorialBySlug,
  getTutorialsByDomain,
  getRelatedTutorials,
  domains,
  architectures,
  labs,
  caseStudies,
} from "@/content/tutorials";
import { BlockRenderer } from "@/components/ContentBlockRenderer";
import TutorialSidebar from "@/components/TutorialSidebar";
import { Breadcrumb, Badge, Tag } from "@/components/ui";
import { TutorialCard } from "@/components/cards";
import { formatDate, readingTime } from "@/lib/utils";

export function generateStaticParams() {
  return allTutorials.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = getTutorialBySlug(params.slug);
  if (!t) return { title: "教程未找到" };
  return {
    title: t.title,
    description: t.summary,
    openGraph: { title: t.title, description: t.summary, type: "article" },
  };
}

const difficultyColor: Record<string, string> = {
  入门: "#38D6B0",
  初级: "#5BC0EB",
  中级: "#7C8CFF",
  高级: "#F0B86E",
  专家: "#FC8181",
};

export default function TutorialPage({ params }: { params: { slug: string } }) {
  const tutorial = getTutorialBySlug(params.slug);
  if (!tutorial) notFound();

  const dom = domains.find((d) => d.id === tutorial.domainId);
  const related = getRelatedTutorials(tutorial);
  const domainTutorials = getTutorialsByDomain(dom?.slug ?? "");
  const idx = domainTutorials.findIndex((t) => t.id === tutorial.id);
  const prev = idx > 0 ? domainTutorials[idx - 1] : null;
  const next = idx >= 0 && idx < domainTutorials.length - 1 ? domainTutorials[idx + 1] : null;
  const relatedArch = tutorial.architectureIds
    .map((id) => architectures.find((a) => a.id === id))
    .filter(Boolean);
  const nextTutorials = (tutorial.nextTutorialSlugs ?? [])
    .map((s) => getTutorialBySlug(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const relatedLabs = (tutorial.relatedLabSlugs ?? [])
    .map((s) => labs.find((l) => l.slug === s))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const relatedCases = (tutorial.relatedCaseSlugs ?? [])
    .map((s) => caseStudies.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="container-page py-8">
      <Breadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "知识领域", href: "/domains" },
          { label: dom?.title ?? "领域", href: dom ? `/domains/${dom.slug}` : "/domains" },
          { label: tutorial.title },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[16rem_1fr_18rem]">
        <TutorialSidebar
          slug={tutorial.slug}
          sections={tutorial.sections.map((s) => ({ id: s.id, heading: s.heading }))}
        />

        <article className="min-w-0">
          {/* 头部 */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <Link href={dom ? `/domains/${dom.slug}` : "#"} className="hover:text-primary">
                {dom?.shortTitle}
              </Link>
              <span>·</span>
              <span style={{ color: difficultyColor[tutorial.difficulty] }}>{tutorial.difficulty}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> {readingTime(tutorial.estimatedMinutes)}
              </span>
              {tutorial.status === "in-progress" && (
                <Badge color="#F0B86E">纲要版（持续完善中）</Badge>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">{tutorial.title}</h1>
            <div className="mt-1 text-sm text-ink-muted">{tutorial.englishTitle}</div>
            <p className="mt-4 text-lg text-ink-secondary">{tutorial.summary}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tutorial.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>

          {/* 学习目标 & 前置 */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                <Target size={15} className="text-primary" /> 学习目标
              </div>
              <ul className="space-y-1 text-sm text-ink-secondary">
                {tutorial.learningObjectives.map((o, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">·</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line bg-surface/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                <GraduationCap size={15} className="text-accent" /> 前置知识
              </div>
              <ul className="space-y-1 text-sm text-ink-secondary">
                {tutorial.prerequisites.length ? (
                  tutorial.prerequisites.map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent">·</span>
                      {p}
                    </li>
                  ))
                ) : (
                  <li className="text-ink-muted">无特殊前置，可直接学习</li>
                )}
              </ul>
            </div>
          </div>

          {/* 正文 */}
          <div className="prose-content">
            {tutorial.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2>{s.heading}</h2>
                {s.blocks.map((b, i) => (
                  <BlockRenderer key={i} block={b} />
                ))}
              </section>
            ))}
          </div>

          {/* 参考资料 */}
          {tutorial.references.length > 0 && (
            <div className="mt-10 rounded-xl border border-line bg-surface/40 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-ink">参考资料</div>
                {tutorial.qualityLevel && (
                  <span className="rounded-pill border border-line px-2 py-0.5 text-[10px] text-ink-muted">
                    内容等级 {tutorial.qualityLevel}
                  </span>
                )}
              </div>
              <ul className="space-y-2 text-sm text-ink-secondary">
                {tutorial.references.map((r, i) => (
                  <li key={i}>
                    {r.url ? (
                      <a href={r.url} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                        {r.title}
                      </a>
                    ) : (
                      <span>{r.title}</span>
                    )}
                    {[
                      r.kind,
                      r.organization,
                      r.version ? `适用版本：${r.version}` : undefined,
                      r.purpose,
                      r.verifiedAt ? `核验：${r.verifiedAt}` : undefined,
                    ].filter(Boolean).length > 0 && (
                      <div className="mt-0.5 text-xs text-ink-muted">
                        {[
                          r.kind,
                          r.organization,
                          r.version ? `适用版本：${r.version}` : undefined,
                          r.purpose,
                          r.verifiedAt ? `核验：${r.verifiedAt}` : undefined,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-ink-muted">
                最后更新：{formatDate(tutorial.updatedAt)}
              </div>
            </div>
          )}

          {/* 知识关联：下一步学习 / 相关实验 / 相关企业案例 */}
          {(nextTutorials.length > 0 || relatedLabs.length > 0 || relatedCases.length > 0) && (
            <div className="mt-8 rounded-xl border border-line bg-surface/40 p-5">
              <div className="mb-3 text-sm font-semibold text-ink">知识关联</div>
              <div className="grid gap-4 sm:grid-cols-2">
                {nextTutorials.length > 0 && (
                  <div>
                    <div className="mb-2 text-xs text-ink-muted">下一步学习</div>
                    <div className="space-y-1">
                      {nextTutorials.map((t) => (
                        <Link key={t.id} href={`/tutorials/${t.slug}`} className="block text-sm text-primary hover:underline">
                          {t.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {relatedLabs.length > 0 && (
                  <div>
                    <div className="mb-2 text-xs text-ink-muted">相关交互实验</div>
                    <div className="space-y-1">
                      {relatedLabs.map((l) => (
                        <Link key={l.id} href={`/labs/${l.slug}`} className="block text-sm text-primary hover:underline">
                          {l.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {relatedCases.length > 0 && (
                  <div>
                    <div className="mb-2 text-xs text-ink-muted">相关企业案例</div>
                    <div className="space-y-1">
                      {relatedCases.map((c) => (
                        <Link key={c.id} href={`/case-studies/${c.slug}`} className="block text-sm text-primary hover:underline">
                          {c.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 上一篇 / 下一篇 */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link href={`/tutorials/${prev.slug}`} className="card card-hover p-4">
                <div className="flex items-center gap-1 text-xs text-ink-muted">
                  <ArrowLeft size={13} /> 上一篇
                </div>
                <div className="mt-1 font-medium text-ink hover:text-primary">{prev.title}</div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link href={`/tutorials/${next.slug}`} className="card card-hover p-4 text-right">
                <div className="flex items-center justify-end gap-1 text-xs text-ink-muted">
                  下一篇 <ArrowRight size={13} />
                </div>
                <div className="mt-1 font-medium text-ink hover:text-primary">{next.title}</div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </article>

        {/* 右侧辅助 */}
        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="sticky top-20 space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                <BookMarked size={14} /> 相关教程
              </div>
              <div className="space-y-2">
                {related.slice(0, 5).map((t) => (
                  <Link
                    key={t.id}
                    href={`/tutorials/${t.slug}`}
                    className="block rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-ink-secondary hover:border-primary/40 hover:text-primary"
                  >
                    {t.title}
                  </Link>
                ))}
              </div>
            </div>
            {relatedArch.length > 0 && (
              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  相关架构
                </div>
                <div className="space-y-2">
                  {relatedArch.map(
                    (a) =>
                      a && (
                        <Link
                          key={a.id}
                          href={`/architecture/${a.slug}`}
                          className="block rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-ink-secondary hover:border-primary/40 hover:text-primary"
                        >
                          {a.title}
                        </Link>
                      )
                  )}
                </div>
              </div>
            )}
            <Link
              href={dom ? `/domains/${dom.slug}` : "/domains"}
              className="block rounded-xl border border-line bg-surface/40 px-3 py-2 text-center text-sm text-primary hover:bg-primary/10"
            >
              返回 {dom?.shortTitle} 领域首页
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
