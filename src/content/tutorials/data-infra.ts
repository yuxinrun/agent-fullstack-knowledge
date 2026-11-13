import type { Tutorial } from "../types";

export const dataInfraTutorials: Tutorial[] = [
  {
    id: "t-di-01",
    slug: "ai-ready-data",
    domainId: "d08",
    title: "AI-Ready 数据底座",
    englishTitle: "AI-Ready Data Foundations",
    summary: "建设支撑 RAG、Agent 与智能分析的统一、可治理数据底座。",
    difficulty: "中级",
    estimatedMinutes: 26,
    prerequisites: ["基础数据库概念"],
    learningObjectives: ["理解 AI 数据需求", "设计分层架构", "保障质量与治理"],
    sections: [
      {
        id: "needs",
        heading: "一、AI 对数据的要求",
        blocks: [
          {
            type: "list",
            items: [
              "可检索：向量/全文索引支撑 RAG。",
              "可关联：图与关系支撑推理。",
              "高质量：清洗、去重、合规。",
              "可治理：目录、血缘、权限。",
            ],
          },
        ],
      },
      {
        id: "layers",
        heading: "二、分层架构",
        blocks: [
          {
            type: "mermaid",
            title: "数据底座",
            source: `flowchart TB
  SRC["源系统"] --> ING["集成层 CDC/ETL"]
  ING --> LAKE["数据湖/仓"]
  LAKE --> FEAT["特征/向量/图"]
  FEAT --> AI["AI 消费"]
  LAKE --> CAT["数据目录/血缘"]
  CAT --> GOV["治理"]`,
            caption: "从集成到 AI 消费的链路。",
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["湖仓一体", "目录先行", "质量门禁"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["数据管道与 CDC", "向量图多模态存储", "企业 RAG"] }],
      },
    ],
    tags: ["Data", "底座", "Lakehouse"],
    architectureIds: ["a10"],
    relatedTutorialIds: ["data-pipeline-cdc", "vector-graph-store", "rag-fundamentals"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-di-02",
    slug: "data-pipeline-cdc",
    domainId: "d08",
    title: "数据管道与 CDC",
    englishTitle: "Data Pipeline & CDC",
    summary: "用 ETL/ELT 与变更数据捕获保持 AI 知识库与业务系统同步。",
    difficulty: "中级",
    estimatedMinutes: 24,
    prerequisites: ["AI-Ready 数据底座"],
    learningObjectives: ["区分 ETL/ELT", "理解 CDC", "设计增量同步"],
    sections: [
      {
        id: "etl",
        heading: "一、ETL vs ELT",
        blocks: [
          {
            type: "paragraph",
            text: "ETL 在入库前转换，ELT 先入仓再转换（更灵活，契合湖仓）。现代数据栈多采用 ELT，转换用 SQL/算子完成。",
          },
        ],
      },
      {
        id: "cdc",
        heading: "二、CDC 变更捕获",
        blocks: [
          {
            type: "list",
            items: [
              "基于日志（binlog/WAL）捕获增删改，低侵入。",
              "保证顺序与幂等，便于重放。",
              "触发 RAG 索引增量更新，避免全量重建。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["增量优先", "幂等写入", "失败可重放"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["向量图多模态存储", "AI-Ready 数据底座", "企业 RAG"] }],
      },
    ],
    tags: ["Data", "CDC", "Pipeline"],
    architectureIds: ["a10"],
    relatedTutorialIds: ["ai-ready-data", "vector-graph-store", "rag-fundamentals"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-di-03",
    slug: "vector-graph-store",
    domainId: "d08",
    title: "向量、图与多模态数据存储",
    englishTitle: "Vector/Graph/Multimodal Stores",
    summary: "为 AI 场景选择并设计向量库、图库与多模态/实时数据层。",
    difficulty: "中级",
    estimatedMinutes: 26,
    prerequisites: ["AI-Ready 数据底座"],
    learningObjectives: ["选存储类型", "设计索引", "组合多模态"],
    sections: [
      {
        id: "choose",
        heading: "一、存储选型",
        blocks: [
          {
            type: "table",
            headers: ["数据", "存储", "用途"],
            rows: [
              ["嵌入向量", "向量库", "语义检索"],
              ["实体关系", "图库", "推理遍历"],
              ["图片/音视频", "对象+元数据", "多模态 RAG"],
              ["实时流", "消息/时序", "事件驱动"],
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "二、最佳实践",
        blocks: [{ type: "list", items: ["按场景选引擎", "元数据过滤前置", "多模态统一索引"] }],
      },
      {
        id: "next",
        heading: "三、延伸阅读",
        blocks: [{ type: "list", items: ["企业 RAG", "GraphRAG", "AI-Ready 数据底座"] }],
      },
    ],
    tags: ["Data", "向量", "图"],
    architectureIds: ["a10"],
    relatedTutorialIds: ["ai-ready-data", "data-pipeline-cdc", "rag-fundamentals"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
