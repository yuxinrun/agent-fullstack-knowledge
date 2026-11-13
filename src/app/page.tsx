import Link from "next/link";
import { ArrowRight, BookOpen, Compass, FlaskConical, Wrench, Layers, ShieldCheck } from "lucide-react";
import {
  domains,
  getStats,
  learningPaths,
  architectures,
  labs,
  tools,
  caseStudies,
} from "@/content/tutorials";
import {
  DomainCard,
  LabCard,
  ToolCard,
  CaseCard,
  ArchitectureCard,
} from "@/components/cards";
import { Button, SectionHeading, StatPill } from "@/components/ui";
import HeroVisual from "@/components/home/HeroVisual";

export default function HomePage() {
  const stats = getStats();
  const featuredArch = architectures.slice(0, 6);
  const previewLabs = labs.slice(0, 5);
  const previewTools = tools.slice(0, 5);
  const previewCases = caseStudies.slice(0, 5);

  return (
    <div>
      {/* Hero */}
      <section className="glow-primary">
        <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-pill border border-line bg-surface/60 px-3 py-1 text-xs text-ink-secondary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              15 大知识领域 · 系统化企业 Agent 工程学习平台
            </div>
            <h1 className="text-4xl font-bold leading-tight text-balance md:text-6xl">
              系统掌握
              <span className="text-primary">企业级 Agent</span>
              全栈工程
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-secondary">
              从 Agent 架构、Multi-Agent、MCP、RAG 到 AgentOps、安全治理与企业级部署，
              在一个知识中心完成企业 AI 工程体系学习。
            </p>
            <p className="mt-2 max-w-xl text-sm text-ink-muted">
              面向企业 Agent 开发工程师、AI 架构师与平台工程师的系统化教程、架构解析、代码实践与企业落地指南。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/domains" size="lg">
                开始系统学习 <ArrowRight size={18} />
              </Button>
              <Button href="/domains" variant="outline" size="lg">
                浏览全部知识领域
              </Button>
            </div>
          </div>
          <div className="animate-fade-up">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-page -mt-4 md:-mt-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatPill value={stats.domainCount} label="知识领域" />
          <StatPill value={stats.tutorialCount} label="技术教程" />
          <StatPill value={stats.architectureCount} label="核心架构" />
          <StatPill value={stats.labCount} label="交互实验" />
        </div>
      </section>

      {/* 15 大知识领域 */}
      <section className="section container-page">
        <SectionHeading
          eyebrow="知识领域"
          title="15 大企业 AI 与 Agent 核心技术领域"
          description="每个领域拥有独立的领域首页、知识目录、详细教程、架构说明、实践内容与相关推荐。"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => (
            <DomainCard key={d.id} domain={d} />
          ))}
        </div>
      </section>

      {/* 学习路径 */}
      <section className="section container-page">
        <SectionHeading
          eyebrow="学习路径"
          title="四条主线，循序渐进"
          description="按角色与目标选择学习路径，每路径标注阶段、顺序与预计学习时间。"
        />
        <div className="grid gap-5 md:grid-cols-2">
          {learningPaths.map((p) => (
            <Link
              key={p.id}
              href={`/learning-paths/${p.slug}`}
              className="card card-hover flex flex-col p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <Compass size={20} />
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{p.title}</h3>
                  <div className="text-xs text-ink-muted">面向：{p.audience}</div>
                </div>
              </div>
              <p className="mt-3 flex-1 text-sm text-ink-secondary">{p.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
                <span>{p.steps.length} 个阶段</span>
                <span>约 {p.estimatedHours} 小时</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 精选架构 */}
      <section className="section container-page">
        <div className="flex items-end justify-between">
          <SectionHeading
            eyebrow="架构中心"
            title="精选企业 Agent 架构"
            description="从参考架构到安全、平台与数字孪生，点击进入完整架构解析。"
          />
          <Link href="/architecture" className="hidden text-sm text-primary hover:underline md:block">
            查看全部架构 →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredArch.map((a) => (
            <ArchitectureCard key={a.id} arch={a} />
          ))}
        </div>
      </section>

      {/* 交互实验室 */}
      <section className="section container-page">
        <SectionHeading
          eyebrow="交互实验室"
          title="动手实验，理解机制"
          description="模拟 Agent 执行循环、RAG 检索、MCP 调用、权限检查等真实交互。"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {previewLabs.map((l) => (
            <LabCard key={l.id} lab={l} />
          ))}
        </div>
        <div className="mt-6">
          <Button href="/labs" variant="outline">
            <FlaskConical size={16} /> 进入全部实验室
          </Button>
        </div>
      </section>

      {/* 工程工具箱 */}
      <section className="section container-page">
        <SectionHeading
          eyebrow="工程工具箱"
          title="选型与评估工具"
          description="架构选型、RAG 成本估算、安全与上线清单等实用工具。"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {previewTools.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
        <div className="mt-6">
          <Button href="/tools" variant="outline">
            <Wrench size={16} /> 打开工具箱
          </Button>
        </div>
      </section>

      {/* 精选企业案例 */}
      <section className="section container-page">
        <SectionHeading
          eyebrow="企业案例"
          title="贯穿多领域的学习案例"
          description="案例均标注类型（模拟教学 / 参考 / 公开），无客户授权不声称真实项目。"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {previewCases.map((c) => (
            <CaseCard key={c.id} item={c} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section container-page">
        <div className="card glow-primary flex flex-col items-center gap-4 p-10 text-center">
          <ShieldCheck size={32} className="text-primary" />
          <h2 className="text-2xl font-bold md:text-3xl">从一个领域开始，系统构建你的 Agent 工程能力</h2>
          <p className="max-w-xl text-ink-secondary">
            所有内容结构化、可检索、可关联。从 Agent 工程基础出发，逐步延伸到多智能体、MCP、RAG 与平台治理。
          </p>
          <Button href="/domains/agent-engineering" size="lg">
            <BookOpen size={18} /> 进入 Agent 工程领域
          </Button>
        </div>
      </section>
    </div>
  );
}
