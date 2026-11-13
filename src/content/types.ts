// ============================================================================
// 内容数据模型 —— 全站结构化数据契约
// 所有教程、领域、架构、实验、工具、术语均以强类型数据管理，UI 与之分离。
// ============================================================================

export type Difficulty = "入门" | "初级" | "中级" | "高级" | "专家";

export type ContentStatus = "published" | "in-progress" | "outline";

export type CaseType =
  | "真实案例"
  | "公开案例"
  | "参考案例"
  | "模拟教学案例";

export type RelationType =
  | "depends-on"
  | "related"
  | "enables"
  | "part-of";

// ---------------------------------------------------------------------------
// 领域 Domain
// ---------------------------------------------------------------------------
export interface Domain {
  id: string;
  slug: string;
  index: number;
  title: string;
  englishTitle: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  tags: string[];
  difficulty: Difficulty;
  learningObjectives: string[];
  prerequisites: string[];
  modules: string[];
  relatedDomainIds: string[];
  order: number;
}

// ---------------------------------------------------------------------------
// 教程 Tutorial
// ---------------------------------------------------------------------------
export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | {
      type: "callout";
      variant: "info" | "warning" | "tip" | "danger";
      title?: string;
      text: string;
    }
  | {
      type: "code";
      language: string;
      filename?: string;
      code: string;
      caption?: string;
      runnable?: boolean;
    }
  | { type: "mermaid"; title?: string; source: string; caption?: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface TutorialSection {
  id: string; // anchor
  heading: string;
  blocks: ContentBlock[];
}

// 参考资料类型：用于区分可信来源层级，避免把工程建议描述为行业标准
export type ReferenceKind =
  | "官方规范"
  | "官方产品文档"
  | "学术研究"
  | "社区实践"
  | "本站工程建议";

export interface TutorialReference {
  title: string;
  url?: string;
  organization?: string; // 发布组织或作者
  version?: string; // 适用版本 / 发布日期
  purpose?: string; // 参考用途
  verifiedAt?: string; // 最后核验日期 YYYY-MM-DD
  kind?: ReferenceKind;
}

export interface Tutorial {
  id: string;
  slug: string;
  domainId: string;
  title: string;
  englishTitle: string;
  summary: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  prerequisites: string[];
  learningObjectives: string[];
  sections: TutorialSection[];
  tags: string[];
  architectureIds: string[];
  relatedTutorialIds: string[]; // 值为 tutorial.slug
  references: TutorialReference[];
  updatedAt: string; // YYYY-MM-DD
  status: ContentStatus;
  featured?: boolean;
  // V2.0 知识关联（全部可选，向后兼容旧数据）
  nextTutorialSlugs?: string[]; // 下一步学习
  relatedLabSlugs?: string[]; // 相关交互实验
  relatedCaseSlugs?: string[]; // 相关企业案例
  qualityLevel?: "L0" | "L1" | "L2" | "L3" | "L4" | "L5"; // 审计质量等级
}

// ---------------------------------------------------------------------------
// 架构 Architecture
// ---------------------------------------------------------------------------
export interface ArchitectureComponent {
  name: string;
  role: string;
}

export interface Architecture {
  id: string;
  slug: string;
  title: string;
  summary: string;
  scenario: string;
  diagramSource: string; // mermaid
  components: ArchitectureComponent[];
  dataFlow: string[];
  callFlow: string[];
  techOptions: { category: string; options: string[] }[];
  deployment: string;
  security: string;
  extensibility: string;
  designConsiderations: string[];
  relatedDomains: string[];
  relatedTutorialSlugs: string[];
}

// ---------------------------------------------------------------------------
// 实验室 Lab
// ---------------------------------------------------------------------------
export interface Lab {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  learningObjectives: string[];
  relatedTutorialSlugs: string[];
  component: string; // registry key
  status: "published";
}

// ---------------------------------------------------------------------------
// 工具 Tool
// ---------------------------------------------------------------------------
export interface Tool {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  component: string; // registry key
  relatedTutorialSlugs: string[];
}

// ---------------------------------------------------------------------------
// 术语 Glossary
// ---------------------------------------------------------------------------
export interface GlossaryTerm {
  id: string;
  term: string;
  englishTerm: string;
  category: string;
  definition: string;
  howItWorks?: string;
  uses: string[];
  relatedTerms: string[];
  relatedTutorialSlugs: string[];
  distinguishes?: string; // 易混淆概念辨析
}

// ---------------------------------------------------------------------------
// 案例 Case Study
// ---------------------------------------------------------------------------
export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  industry: string;
  summary: string;
  businessProblem: string[];
  solution: string[];
  architecture: string; // mermaid
  technologyStack: string[];
  implementationSteps: string[];
  evaluation: { metric: string; result: string }[];
  caseType: CaseType;
  relatedDomains: string[];
  relatedTutorialSlugs: string[];
  references: string[];
}

// ---------------------------------------------------------------------------
// 知识关系 Knowledge Relation
// ---------------------------------------------------------------------------
export interface KnowledgeRelation {
  sourceId: string;
  targetId: string;
  relationType: RelationType;
  description: string;
}

// ---------------------------------------------------------------------------
// 学习路径 Learning Path
// ---------------------------------------------------------------------------
export interface LearningStep {
  title: string;
  description: string;
  tutorialSlugs: string[];
  domainSlugs: string[];
}

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  audience: string;
  description: string;
  estimatedHours: number;
  steps: LearningStep[];
}

// ---------------------------------------------------------------------------
// 搜索项 Search Index Item
// ---------------------------------------------------------------------------
export interface SearchItem {
  id: string;
  title: string;
  englishTitle?: string;
  summary: string;
  type:
    | "domain"
    | "tutorial"
    | "architecture"
    | "lab"
    | "tool"
    | "glossary"
    | "case"
    | "path";
  url: string;
  tags: string[];
  domainId?: string;
  aliases?: string[];
}
