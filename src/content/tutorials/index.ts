import type {
  Tutorial,
  Domain,
  Architecture,
  Lab,
  Tool,
  GlossaryTerm,
  CaseStudy,
  LearningPath,
  SearchItem,
} from "../types";
import { domains, getDomain } from "../domains";
import { architectures, getArchitecture } from "../architectures";
import { labs, getLab } from "../labs";
import { tools, getTool } from "../tools";
import { glossary } from "../glossary";
import { caseStudies, getCaseStudy } from "../caseStudies";
import { learningPaths, getLearningPath } from "../learningPaths";
import { relations } from "../relations";
import { agentEngineeringTutorials } from "./agent-engineering";
import { multiAgentTutorials } from "./multi-agent";
import { agentWorkflowTutorials } from "./agent-workflow";
import { mcpTutorials } from "./mcp";
import { memoryTutorials } from "./memory";
import { ragTutorials } from "./rag";
import { agentOpsTutorials } from "./agentops";
import { aiSecurityTutorials } from "./ai-security";
import { knowledgeEngineeringTutorials } from "./knowledge-engineering";
import { dataInfraTutorials } from "./data-infra";
import { semanticLayerTutorials } from "./semantic-layer";
import { aiPlatformTutorials } from "./ai-platform";
import { automationTutorials } from "./automation";
import { digitalTwinTutorials } from "./digital-twin";
import { solutionsTutorials } from "./solutions";
import { ragAdvancedTutorials } from "./rag-advanced";
import { multiAgentAdvancedTutorials } from "./multi-agent-advanced";
import { securityAdvancedTutorials } from "./security-advanced";
import { upgradedTutorials, applyUpgrades } from "./upgrades";

// 教程数据统一汇总入口（后续领域在此追加）
const baseTutorials: Tutorial[] = [
  ...agentEngineeringTutorials,
  ...multiAgentTutorials,
  ...agentWorkflowTutorials,
  ...mcpTutorials,
  ...memoryTutorials,
  ...ragTutorials,
  ...agentOpsTutorials,
  ...aiSecurityTutorials,
  ...knowledgeEngineeringTutorials,
  ...dataInfraTutorials,
  ...semanticLayerTutorials,
  ...aiPlatformTutorials,
  ...automationTutorials,
  ...digitalTwinTutorials,
  ...solutionsTutorials,
  ...ragAdvancedTutorials,
  ...multiAgentAdvancedTutorials,
  ...securityAdvancedTutorials,
];

// V2.0：按 slug 覆盖为深度升级版，保留原有顺序、URL 与全部基础资产
export const allTutorials: Tutorial[] = applyUpgrades(baseTutorials, upgradedTutorials);

export function getAllTutorials(): Tutorial[] {
  return allTutorials;
}

export function getTutorialBySlug(slug: string): Tutorial | undefined {
  return allTutorials.find((t) => t.slug === slug);
}

export function getTutorialsByDomain(domainSlug: string): Tutorial[] {
  const d = getDomain(domainSlug);
  if (!d) return [];
  return allTutorials.filter((t) => t.domainId === d.id);
}

export function getTutorialById(id: string): Tutorial | undefined {
  return allTutorials.find((t) => t.id === id);
}

export function getRelatedTutorials(t: Tutorial, limit = 6): Tutorial[] {
  const byIds = t.relatedTutorialIds
    .map((id) => getTutorialBySlug(id))
    .filter((x): x is Tutorial => Boolean(x));
  const fromDomain = allTutorials.filter(
    (x) => x.domainId === t.domainId && x.id !== t.id
  );
  const merged = [...byIds];
  for (const x of fromDomain) if (!merged.includes(x)) merged.push(x);
  return merged.slice(0, limit);
}

// 按领域统计（用于首页动态数据）
export function getStats() {
  const tutorialCount = allTutorials.length;
  const archCount = architectures.length;
  const labCount = labs.length;
  const architectureDiagramCount = architectures.length;
  const domainCount = domains.length;
  return {
    domainCount,
    tutorialCount,
    architectureCount: archCount,
    labCount,
    architectureDiagramCount,
  };
}

// ---------------------------------------------------------------------------
// 搜索索引
// ---------------------------------------------------------------------------
export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];
  for (const d of domains) {
    items.push({
      id: d.id,
      title: d.title,
      englishTitle: d.englishTitle,
      summary: d.description,
      type: "domain",
      url: `/domains/${d.slug}`,
      tags: d.tags,
      aliases: [d.shortTitle, d.englishTitle],
    });
  }
  for (const t of allTutorials) {
    items.push({
      id: t.id,
      title: t.title,
      englishTitle: t.englishTitle,
      summary: t.summary,
      type: "tutorial",
      url: `/tutorials/${t.slug}`,
      tags: t.tags,
      domainId: t.domainId,
      aliases: [t.englishTitle],
    });
  }
  for (const a of architectures) {
    items.push({
      id: a.id,
      title: a.title,
      summary: a.summary,
      type: "architecture",
      url: `/architecture/${a.slug}`,
      tags: [a.scenario],
    });
  }
  for (const l of labs) {
    items.push({
      id: l.id,
      title: l.title,
      summary: l.description,
      type: "lab",
      url: `/labs/${l.slug}`,
      tags: [l.category],
    });
  }
  for (const tl of tools) {
    items.push({
      id: tl.id,
      title: tl.title,
      summary: tl.description,
      type: "tool",
      url: `/tools/${tl.slug}`,
      tags: [tl.category],
    });
  }
  for (const g of glossary) {
    items.push({
      id: g.id,
      title: g.term,
      englishTitle: g.englishTerm,
      summary: g.definition,
      type: "glossary",
      url: `/glossary#${g.id}`,
      tags: [g.category],
      aliases: [g.englishTerm],
    });
  }
  for (const c of caseStudies) {
    items.push({
      id: c.id,
      title: c.title,
      summary: c.summary,
      type: "case",
      url: `/case-studies/${c.slug}`,
      tags: [c.industry],
    });
  }
  for (const p of learningPaths) {
    items.push({
      id: p.id,
      title: p.title,
      summary: p.description,
      type: "path",
      url: `/learning-paths/${p.slug}`,
      tags: [p.audience],
    });
  }
  return items;
}

// ---------------------------------------------------------------------------
// 知识关系图谱
// ---------------------------------------------------------------------------
export interface GraphNode {
  id: string;
  label: string;
  type: "domain" | "architecture" | "term" | "lab" | "tool";
  domainSlug?: string;
  detail?: string;
  relatedTutorialSlugs?: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export function buildGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const d of domains) {
    nodes.push({
      id: `domain:${d.slug}`,
      label: d.shortTitle,
      type: "domain",
      domainSlug: d.slug,
      detail: d.description,
    });
  }
  for (const a of architectures) {
    const dom = domains.find((x) => a.relatedDomains.includes(x.id));
    nodes.push({
      id: `arch:${a.slug}`,
      label: a.title,
      type: "architecture",
      domainSlug: dom?.slug,
      detail: a.summary,
      relatedTutorialSlugs: a.relatedTutorialSlugs,
    });
  }
  for (const g of glossary) {
    nodes.push({
      id: `term:${g.id}`,
      label: g.term,
      type: "term",
      detail: g.definition,
      relatedTutorialSlugs: g.relatedTutorialSlugs,
    });
  }
  for (const l of labs) {
    nodes.push({
      id: `lab:${l.slug}`,
      label: l.title,
      type: "lab",
      detail: l.description,
      relatedTutorialSlugs: l.relatedTutorialSlugs,
    });
  }
  for (const t of tools) {
    nodes.push({
      id: `tool:${t.slug}`,
      label: t.title,
      type: "tool",
      detail: t.description,
      relatedTutorialSlugs: t.relatedTutorialSlugs,
    });
  }

  // 领域间关系（来自 domains.relatedDomainIds）
  for (const d of domains) {
    for (const relId of d.relatedDomainIds) {
      const target = getDomainById(relId);
      if (target) {
        edges.push({
          source: `domain:${d.slug}`,
          target: `domain:${target.slug}`,
          relation: "related",
        });
      }
    }
  }
  // 架构属于领域
  for (const a of architectures) {
    for (const domId of a.relatedDomains) {
      const dom = getDomainById(domId);
      if (dom) {
        edges.push({
          source: `arch:${a.slug}`,
          target: `domain:${dom.slug}`,
          relation: "part-of",
        });
      }
    }
  }
  // 显式关系
  for (const r of relations) {
    edges.push({ source: r.sourceId, target: r.targetId, relation: r.relationType });
  }

  return { nodes, edges };
}

function getDomainById(id: string): Domain | undefined {
  return domains.find((d) => d.id === id);
}

// 重新导出便于页面使用
export {
  domains,
  getDomain,
  architectures,
  getArchitecture,
  labs,
  getLab,
  tools,
  getTool,
  glossary,
  caseStudies,
  getCaseStudy,
  learningPaths,
  getLearningPath,
};

export type {
  Tutorial,
  Domain,
  Architecture,
  Lab,
  Tool,
  GlossaryTerm,
  CaseStudy,
  LearningPath,
  SearchItem,
};
