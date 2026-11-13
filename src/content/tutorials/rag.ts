import type { Tutorial } from "../types";

export const ragTutorials: Tutorial[] = [
  {
    id: "t-rag-01",
    slug: "rag-fundamentals",
    domainId: "d06",
    title: "企业 RAG 基础与端到端链路",
    englishTitle: "RAG Fundamentals",
    summary: "从文档摄取到答案生成，打通企业 RAG 的完整链路与关键组件。",
    difficulty: "中级",
    estimatedMinutes: 30,
    prerequisites: ["基础 LLM 概念", "Embedding 初步"],
    learningObjectives: ["理解 RAG 原理", "掌握端到端链路", "识别质量瓶颈"],
    sections: [
      {
        id: "concept",
        heading: "一、RAG 是什么",
        blocks: [
          {
            type: "paragraph",
            text: "RAG（检索增强生成）在生成前先从知识库检索相关片段，并将其作为上下文注入提示，从而让 LLM 基于企业私有知识作答，缓解幻觉与知识陈旧。",
          },
        ],
      },
      {
        id: "pipeline",
        heading: "二、端到端链路",
        blocks: [
          {
            type: "mermaid",
            title: "RAG 链路",
            source: `flowchart LR
  DOC["文档"] --> CHK["切片 Chunk"]
  CHK --> EMB["向量化"]
  EMB --> VDB[("向量库")]
  Q["用户问题"] --> QE["问题向量"]
  QE --> RET["检索 Top-K"]
  RET --> CTX["构建上下文"]
  CTX --> LLM["生成答案"]`,
            caption: "离线与在线两阶段。",
          },
        ],
      },
      {
        id: "bottleneck",
        heading: "三、质量瓶颈",
        blocks: [
          {
            type: "list",
            items: [
              "切片粒度不当：过粗丢精度，过细丢上下文。",
              "检索不准：Embedding 与查询语义偏差。",
              "缺乏重排：Top-K 含噪声。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "四、工程实践",
        blocks: [{ type: "list", items: ["元数据过滤结合向量检索", "检索结果可溯源到原文", "评测驱动迭代"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["先评测后优化", "检索可解释", "切片按语义"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["切片策略", "混合检索与重排", "Agentic RAG"] }],
      },
    ],
    tags: ["RAG", "检索", "Embedding"],
    architectureIds: ["a08"],
    relatedTutorialIds: ["chunking-strategy", "hybrid-search", "agentic-rag"],
    references: [{ title: "Lewis et al., RAG: Knowledge-Intensive NLP" }],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-rag-02",
    slug: "chunking-strategy",
    domainId: "d06",
    title: "Chunking 切片策略",
    englishTitle: "Chunking Strategy",
    summary: "按固定窗口、语义、结构等策略切片，平衡召回精度与上下文完整性。",
    difficulty: "中级",
    estimatedMinutes: 24,
    prerequisites: ["企业 RAG 基础"],
    learningObjectives: ["比较切片策略", "结合元数据", "避免上下文割裂"],
    sections: [
      {
        id: "strategies",
        heading: "一、常见策略",
        blocks: [
          {
            type: "table",
            headers: ["策略", "优点", "缺点"],
            rows: [
              ["固定窗口", "简单", "易切断语义"],
              ["递归/结构", "按段落/标题", "依赖格式"],
              ["语义切片", "语义完整", "计算开销大"],
              ["小块检索+父块返回", "精度与上下文兼得", "实现复杂"],
            ],
          },
        ],
      },
      {
        id: "meta",
        heading: "二、元数据与重叠",
        blocks: [
          {
            type: "list",
            items: [
              "为 chunk 附加来源、章节、时间等元数据便于过滤。",
              "相邻 chunk 设置少量重叠，减少边界信息丢失。",
              "表格/代码用结构感知切片，避免破坏结构。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["小块检索、父块生成", "元数据先行", "按文档类型选策略"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["混合检索与重排", "RAG 评估", "GraphRAG"] }],
      },
    ],
    tags: ["RAG", "切片", "Chunking"],
    architectureIds: ["a08"],
    relatedTutorialIds: ["rag-fundamentals", "hybrid-search", "knowledge-extraction"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-rag-03",
    slug: "hybrid-search",
    domainId: "d06",
    title: "混合检索与重排 Reranking",
    englishTitle: "Hybrid Search & Reranking",
    summary: "稠密+稀疏检索互补，再用 Reranker 提升 Top-K 相关性。",
    difficulty: "中级",
    estimatedMinutes: 28,
    prerequisites: ["企业 RAG 基础", "切片策略"],
    learningObjectives: ["理解稠密/稀疏检索", "实现混合打分", "接入 Reranker"],
    sections: [
      {
        id: "concept",
        heading: "一、稠密与稀疏",
        blocks: [
          {
            type: "paragraph",
            text: "稠密检索（向量）擅长语义匹配但可能漏掉关键词；稀疏检索（BM25）擅长精确词匹配。混合检索把两者分数归一化融合，兼顾“意思对”和“词对”。",
          },
        ],
      },
      {
        id: "flow",
        heading: "二、检索-重排流程",
        blocks: [
          {
            type: "mermaid",
            title: "混合检索+重排",
            source: `flowchart LR
  Q["查询"] --> D["稠密检索"]
  Q --> S["稀疏检索"]
  D --> F["融合 Fusion"]
  S --> F
  F --> R["Reranker 重排"]
  R --> K["Top-K"]`,
            caption: "先广召回，再精排。",
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["RRF 等融合策略", "Reranker 用交叉编码模型", "Top-K 后做元数据过滤"] }],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["召回从宽", "排序从严", "可量化评估"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["RAG 评估", "GraphRAG", "Agentic RAG"] }],
      },
    ],
    tags: ["RAG", "检索", "Rerank"],
    architectureIds: ["a08"],
    relatedTutorialIds: ["rag-fundamentals", "chunking-strategy", "rag-fundamentals"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
