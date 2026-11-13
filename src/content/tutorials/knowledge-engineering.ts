import type { Tutorial } from "../types";

export const knowledgeEngineeringTutorials: Tutorial[] = [
  {
    id: "t-ke-01",
    slug: "ontology-taxonomy",
    domainId: "d07",
    title: "Ontology 与 Taxonomy：本体与分类法",
    englishTitle: "Ontology & Taxonomy",
    summary: "区分分类法、本体与知识图谱，并设计企业本体模型。",
    difficulty: "高级",
    estimatedMinutes: 26,
    prerequisites: ["企业 RAG 基础"],
    learningObjectives: ["区分三者", "设计本体类与关系", "落地治理"],
    sections: [
      {
        id: "diff",
        heading: "一、三者的区别",
        blocks: [
          {
            type: "table",
            headers: ["概念", "关注", "例子"],
            rows: [
              ["Taxonomy", "层级分类", "部门树"],
              ["Ontology", "类/属性/关系", "产品本体"],
              ["知识图谱", "实体与关系实例", "客户-订单图"],
            ],
          },
        ],
      },
      {
        id: "design",
        heading: "二、本体设计",
        blocks: [
          {
            type: "list",
            items: [
              "定义核心类（Concept）与子类层级。",
              "定义属性（Data/Object Property）与约束。",
              "定义类之间的关系（part-of、depends-on）。",
              "用受控词表统一术语，避免同义歧义。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["自顶向下+自底向上结合", "最小完备", "可演进"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["知识图谱与 GraphRAG", "知识抽取", "企业语义层"] }],
      },
    ],
    tags: ["Knowledge", "Ontology", "本体"],
    architectureIds: ["a09"],
    relatedTutorialIds: ["knowledge-graph", "knowledge-extraction", "semantic-layer"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-ke-02",
    slug: "knowledge-graph",
    domainId: "d07",
    title: "知识图谱与 GraphRAG",
    englishTitle: "Knowledge Graph & GraphRAG",
    summary: "用实体-关系图谱增强 RAG 的推理与多跳检索能力。",
    difficulty: "高级",
    estimatedMinutes: 30,
    prerequisites: ["Ontology 与 Taxonomy", "企业 RAG 基础"],
    learningObjectives: ["理解 GraphRAG 价值", "构建实体关系检索", "与向量检索结合"],
    sections: [
      {
        id: "why",
        heading: "一、为什么用图",
        blocks: [
          {
            type: "paragraph",
            text: "纯向量检索擅长语义相似，但难以回答“A 与 B 之间的关系链”这类多跳问题。知识图谱把实体与关系结构化，支持沿关系遍历，显著提升复杂推理检索。",
          },
        ],
      },
      {
        id: "flow",
        heading: "二、GraphRAG 流程",
        blocks: [
          {
            type: "mermaid",
            title: "GraphRAG",
            source: `flowchart LR
  DOC["文档"] --> EX["实体/关系抽取"]
  EX --> G[("知识图谱")]
  Q["问题"] --> QE["实体识别"]
  QE --> TRAV["图遍历"]
  TRAV --> SUB["子图上下文"]
  SUB --> LLM["生成"]`,
            caption: "从图遍历获取结构化上下文。",
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["向量+图混合", "抽取质量优先", "子图裁剪控成本"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["知识抽取", "Ontology 与 Taxonomy", "混合检索"] }],
      },
    ],
    tags: ["Knowledge", "GraphRAG", "图谱"],
    architectureIds: ["a09"],
    relatedTutorialIds: ["ontology-taxonomy", "knowledge-extraction", "rag-fundamentals"],
    references: [{ title: "Microsoft: GraphRAG" }],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-ke-03",
    slug: "knowledge-extraction",
    domainId: "d07",
    title: "知识抽取与实体消歧",
    englishTitle: "Knowledge Extraction",
    summary: "从非结构化文档中抽取实体、关系与属性，并做消歧与链接。",
    difficulty: "高级",
    estimatedMinutes: 28,
    prerequisites: ["知识图谱与 GraphRAG"],
    learningObjectives: ["设计抽取提示", "处理实体消歧", "链接到本体"],
    sections: [
      {
        id: "steps",
        heading: "一、抽取流程",
        blocks: [
          {
            type: "list",
            items: [
              "实体识别：人名、组织、产品、地点等。",
              "关系抽取：实体间的谓语关系。",
              "属性抽取：时间、金额等字段。",
              "消歧与链接：归一化到统一 ID 与本体。",
            ],
          },
        ],
      },
      {
        id: "disambig",
        heading: "二、消歧策略",
        blocks: [
          {
            type: "paragraph",
            text: "同一字符串可能指代不同实体（如“苹果”）。结合上下文与共现、用候选实体投票或向量相似度做消歧，再链接到知识库既有节点，避免重复建边。",
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["抽取可复核", "链接归一", "增量更新"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["Ontology 与 Taxonomy", "知识图谱", "企业知识工程"] }],
      },
    ],
    tags: ["Knowledge", "抽取", "NER"],
    architectureIds: ["a09"],
    relatedTutorialIds: ["knowledge-graph", "ontology-taxonomy", "rag-fundamentals"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
