import Link from "next/link";
import { ArrowUpRight, Clock, Layers, FlaskConical, Wrench } from "lucide-react";
import type { Domain, Tutorial, Architecture, Lab, Tool, CaseStudy } from "@/content/tutorials";
import { getTutorialsByDomain } from "@/content/tutorials";
import { Badge, Tag } from "./ui";
import { cn } from "@/lib/utils";

const difficultyColor: Record<string, string> = {
  入门: "#38D6B0",
  初级: "#5BC0EB",
  中级: "#7C8CFF",
  高级: "#F0B86E",
  专家: "#FC8181",
};

export function DomainCard({ domain }: { domain: Domain }) {
  const count = getTutorialsByDomain(domain.slug).length;
  return (
    <Link
      href={`/domains/${domain.slug}`}
      className="card card-hover group flex flex-col p-5"
    >
      <div className="flex items-start justify-between">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold"
          style={{ backgroundColor: `${domain.color}1f`, color: domain.color }}
        >
          {domain.index.toString().padStart(2, "0")}
        </span>
        <ArrowUpRight
          size={18}
          className="text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{domain.title}</h3>
      <div className="text-xs text-ink-muted">{domain.englishTitle}</div>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink-secondary">
        {domain.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {domain.tags.slice(0, 3).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-muted">
        <span className="flex items-center gap-1">
          <Layers size={13} /> {count} 篇教程
        </span>
        <span style={{ color: difficultyColor[domain.difficulty] }}>
          {domain.difficulty}
        </span>
      </div>
    </Link>
  );
}

export function TutorialCard({
  tutorial,
  domain,
}: {
  tutorial: Tutorial;
  domain?: Domain;
}) {
  return (
    <Link href={`/tutorials/${tutorial.slug}`} className="card card-hover group flex flex-col p-4">
      <div className="flex items-center gap-2">
        {domain && (
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: domain.color }}
          />
        )}
        <span className="text-xs text-ink-muted">{domain?.shortTitle ?? ""}</span>
        {tutorial.status === "in-progress" && (
          <span className="rounded-pill bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300">
            纲要版
          </span>
        )}
      </div>
      <h3 className="mt-2 font-semibold text-ink group-hover:text-primary">
        {tutorial.title}
      </h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-secondary">
        {tutorial.summary}
      </p>
      <div className="mt-3 flex items-center gap-3 text-xs text-ink-muted">
        <span style={{ color: difficultyColor[tutorial.difficulty] }}>
          {tutorial.difficulty}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} /> {tutorial.estimatedMinutes} 分钟
        </span>
        {tutorial.tags.slice(0, 2).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
    </Link>
  );
}

export function ArchitectureCard({ arch }: { arch: Architecture }) {
  return (
    <Link href={`/architecture/${arch.slug}`} className="card card-hover group flex flex-col p-5">
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <Layers size={13} /> 架构
      </div>
      <h3 className="mt-2 text-lg font-semibold text-ink group-hover:text-primary">
        {arch.title}
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink-secondary">{arch.summary}</p>
      <div className="mt-3 border-t border-line pt-3 text-xs text-ink-muted">
        {arch.scenario}
      </div>
    </Link>
  );
}

export function LabCard({ lab }: { lab: Lab }) {
  return (
    <Link href={`/labs/${lab.slug}`} className="card card-hover flex flex-col p-5">
      <div className="flex items-center gap-2 text-ink-muted">
        <FlaskConical size={16} className="text-accent" />
        <span className="text-xs">{lab.category}</span>
      </div>
      <h3 className="mt-2 font-semibold text-ink">{lab.title}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-secondary">{lab.description}</p>
      <div className="mt-3 text-xs text-ink-muted">{lab.difficulty}</div>
    </Link>
  );
}

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={`/tools/${tool.slug}`} className="card card-hover flex flex-col p-5">
      <div className="flex items-center gap-2 text-ink-muted">
        <Wrench size={16} className="text-primary" />
        <span className="text-xs">{tool.category}</span>
      </div>
      <h3 className="mt-2 font-semibold text-ink">{tool.title}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-secondary">{tool.description}</p>
    </Link>
  );
}

export function CaseCard({ item }: { item: CaseStudy }) {
  return (
    <Link href={`/case-studies/${item.slug}`} className="card card-hover flex flex-col p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-muted">{item.industry}</span>
        <Badge color="#F0B86E">{item.caseType}</Badge>
      </div>
      <h3 className="mt-2 font-semibold text-ink">{item.title}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-secondary">{item.summary}</p>
    </Link>
  );
}
