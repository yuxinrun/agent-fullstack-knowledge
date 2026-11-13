import type { Tutorial } from "../types";

export const semanticLayerTutorials: Tutorial[] = [
  {
    id: "t-sl-01",
    slug: "semantic-layer",
    domainId: "d09",
    title: "企业语义层",
    englishTitle: "Enterprise Semantic Layer",
    summary: "用统一语义模型把物理数据映射为业务可理解指标，让 Agent 读懂业务。",
    difficulty: "高级",
    estimatedMinutes: 26,
    prerequisites: ["数据建模基础", "SQL"],
    learningObjectives: ["理解语义层价值", "设计指标与维度", "统一口径"],
    sections: [
      {
        id: "why",
        heading: "一、为什么需要语义层",
        blocks: [
          {
            type: "paragraph",
            text: "同一指标（如“活跃用户”）在不同报表中口径常不一致。语义层把指标定义、维度与计算逻辑集中管理，所有消费方（BI、Agent、API）共用同一份口径，避免“数出多门”。",
          },
        ],
      },
      {
        id: "model",
        heading: "二、语义模型",
        blocks: [
          {
            type: "list",
            items: [
              "指标（Metric）：带计算逻辑与聚合方式。",
              "维度（Dimension）：切分与下钻的视角。",
              "实体（Entity）：业务对象及其关系。",
              "治理：负责人、认证、版本。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["口径集中", "指标可认证", "消费统一"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["Text-to-SQL", "对话式分析", "AI-Ready 数据底座"] }],
      },
    ],
    tags: ["Semantic", "语义层", "Metrics"],
    architectureIds: ["a11"],
    relatedTutorialIds: ["text-to-sql", "conversational-analytics", "ai-ready-data"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-sl-02",
    slug: "text-to-sql",
    domainId: "d09",
    title: "Text-to-SQL 与查询校验",
    englishTitle: "Text-to-SQL",
    summary: "让自然语言转 SQL，并通过语义层校验与回退保障正确性与安全。",
    difficulty: "高级",
    estimatedMinutes: 30,
    prerequisites: ["企业语义层"],
    learningObjectives: ["生成可信 SQL", "设计校验回路", "控制数据访问"],
    sections: [
      {
        id: "flow",
        heading: "一、生成流程",
        blocks: [
          {
            type: "mermaid",
            title: "Text-to-SQL",
            source: `flowchart LR
  Q["自然语言"] --> GEN["生成 SQL"]
  GEN --> VAL["校验"]
  VAL -->|通过| RUN["执行"]
  VAL -->|失败| FIX["改写重试"]
  RUN --> EXP["解释结果"]`,
            caption: "生成-校验-执行-解释。",
          },
        ],
      },
      {
        id: "guard",
        heading: "二、安全与校验",
        blocks: [
          {
            type: "list",
            items: [
              "只读约束：禁止 DML/DDL。",
              "语义层校验：表/字段须经授权。",
              "行级权限：按租户/角色过滤。",
              "失败回退：无法生成时转人工。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["默认只读", "权限内置", "结果可解释"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["对话式分析", "企业语义层", "AI 安全基础"] }],
      },
    ],
    tags: ["Semantic", "Text-to-SQL", "BI"],
    architectureIds: ["a11"],
    relatedTutorialIds: ["semantic-layer", "conversational-analytics", "agent-guardrails"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-sl-03",
    slug: "conversational-analytics",
    domainId: "d09",
    title: "对话式数据分析 Agent",
    englishTitle: "Conversational Analytics",
    summary: "用自然语言完成“提问—查询—分析—解释”的 AI 数据分析师。",
    difficulty: "高级",
    estimatedMinutes: 28,
    prerequisites: ["Text-to-SQL", "企业语义层"],
    learningObjectives: ["设计分析闭环", "结合可视化", "给出业务解释"],
    sections: [
      {
        id: "loop",
        heading: "一、分析闭环",
        blocks: [
          {
            type: "paragraph",
            text: "用户用自然语言提问，Agent 理解意图、调用语义层生成查询、执行后做统计与归因，并以业务语言解释结论，必要时建议下一步分析。",
          },
        ],
      },
      {
        id: "practice",
        heading: "二、工程实践",
        blocks: [{ type: "list", items: ["多轮澄清模糊问题", "结果与图表结合", "给出不确定性提示"] }],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["意图先澄清", "解释重业务", "不确定即说明"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["Text-to-SQL", "企业语义层", "Agent 设计模式"] }],
      },
    ],
    tags: ["Semantic", "分析", "Copilot"],
    architectureIds: ["a11"],
    relatedTutorialIds: ["text-to-sql", "semantic-layer", "agent-design-patterns"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
