import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Target, BookOpen, FlaskConical, Layers, Network } from "lucide-react";
import {
  domains,
  getDomain,
  getTutorialsByDomain,
  architectures,
  labs,
  caseStudies,
  learningPaths,
} from "@/content/tutorials";
import { DomainCard, TutorialCard, ArchitectureCard, LabCard, CaseCard } from "@/components/cards";
import { Breadcrumb, Badge, Tag, SectionHeading } from "@/components/ui";

export function generateStaticParams() {
  return domains.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const d = getDomain(params.slug);
  if (!d) return { title: "领域未找到" };
  return { title: d.title, description: d.description };
}

export default function DomainPage({ params }: { params: { slug: string } }) {
  const domain = getDomain(params.slug);
  if (!domain) notFound();

  const tutorials = getTutorialsByDomain(domain.slug);
  const domainTutSlugs = tutorials.map((t) => t.slug);
  const relatedArch = architectures.filter((a) => a.relatedDomains.includes(domain.id));
  const relatedLabs = labs.filter((l) => l.relatedTutorialSlugs.some((s) => domainTutSlugs.includes(s)));
  const relatedCases = caseStudies.filter((c) => c.relatedDomains.includes(domain.id));
  const relatedDomains = domains.filter((d) => domain.relatedDomainIds.includes(d.id));
  const relatedPaths = learningPaths.filter((p) =>
    p.steps.some((s) => s.domainSlugs.includes(domain.slug))
  );
  const difficultyColor: Record<string, string> = {
    入门: "#38D6B0",
    初级: "#5BC0EB",
    中级: "#7C8CFF",
    高级: "#F0B86E",
    专家: "#FC8181",
  };

  return (
    <div>
      {/* Hero */}
      <section className="glow-primary">
        <div className="container-page py-12">
          <Breadcrumb
            items={[
              { label: "首页", href: "/" },
              { label: "知识领域", href: "/domains" },
              { label: domain.title },
            ]}
          />
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold"
                  style={{ backgroundColor: `${domain.color}1f`, color: domain.color }}
                >
                  {domain.index.toString().padStart(2, "0")}
                </span>
                <div>
                  <h1 className="text-3xl font-bold md:text-4xl">{domain.title}</h1>
                  <div className="text-sm text-ink-muted">{domain.englishTitle}</div>
                </div>
              </div>
              <p className="mt-4 text-lg text-ink-secondary">{domain.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {domain.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-ink-muted">
                <span className="text-ink-secondary">难度</span>
                <span style={{ color: difficultyColor[domain.difficulty] }}>{domain.difficulty}</span>
              </div>
              <div className="text-ink-muted">
                教程 <span className="text-primary">{tutorials.length}</span> 篇
              </div>
            </div>
          </div>

          {/* 学习目标 */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-line bg-surface/50 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                <Target size={16} className="text-primary" /> 学习目标
              </div>
              <ul className="space-y-1.5 text-sm text-ink-secondary">
                {domain.learningObjectives.map((o, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">·</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line bg-surface/50 p-5">
              <div className="mb-3 text-sm font-semibold text-ink">前置知识</div>
              <ul className="space-y-1.5 text-sm text-ink-secondary">
                {domain.prerequisites.map((p, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-accent">·</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 知识地图 / 技术模块 */}
      <section className="section container-page">
        <SectionHeading eyebrow="知识地图" title="核心技术模块" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {domain.modules.map((m, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-line bg-surface/40 px-4 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span className="text-sm text-ink-secondary">{m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 教程目录 */}
      <section className="section container-page">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="教程目录" title={`${domain.title} · 详细教程`} />
          <Link href={`/tutorials?domain=${domain.slug}`} className="hidden text-sm text-primary hover:underline md:block">
            查看全部教程 →
          </Link>
        </div>
        {tutorials.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((t) => (
              <TutorialCard key={t.id} tutorial={t} domain={domain} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-ink-muted">
            该领域教程正在持续建设中，敬请期待。
          </div>
        )}
      </section>

      {/* 关键架构 */}
      {relatedArch.length > 0 && (
        <section className="section container-page">
          <SectionHeading eyebrow="架构中心" title="关键架构" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArch.map((a) => (
              <ArchitectureCard key={a.id} arch={a} />
            ))}
          </div>
        </section>
      )}

      {/* 交互实验 */}
      {relatedLabs.length > 0 && (
        <section className="section container-page">
          <SectionHeading eyebrow="交互实验室" title="相关实验" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedLabs.map((l) => (
              <LabCard key={l.id} lab={l} />
            ))}
          </div>
        </section>
      )}

      {/* 企业案例 */}
      {relatedCases.length > 0 && (
        <section className="section container-page">
          <SectionHeading eyebrow="企业案例" title="相关企业案例" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCases.map((c) => (
              <CaseCard key={c.id} item={c} />
            ))}
          </div>
        </section>
      )}

      {/* 相关知识领域 */}
      {relatedDomains.length > 0 && (
        <section className="section container-page">
          <SectionHeading eyebrow="知识网络" title="相关技术领域" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedDomains.map((d) => (
              <DomainCard key={d.id} domain={d} />
            ))}
          </div>
        </section>
      )}

      {/* 学习路径 */}
      {relatedPaths.length > 0 && (
        <section className="section container-page">
          <SectionHeading eyebrow="学习路径" title="推荐学习路径" />
          <div className="grid gap-5 md:grid-cols-2">
            {relatedPaths.map((p) => (
              <Link key={p.id} href={`/learning-paths/${p.slug}`} className="card card-hover p-6">
                <div className="flex items-center gap-2 text-accent">
                  <Network size={18} /> {p.title}
                </div>
                <p className="mt-2 text-sm text-ink-secondary">{p.description}</p>
                <div className="mt-3 text-xs text-ink-muted">约 {p.estimatedHours} 小时</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
