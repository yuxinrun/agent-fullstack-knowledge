import type { Tutorial } from "../types";

export const ragAdvancedTutorials: Tutorial[] = [
  {
    id: "t-rag-a1",
    slug: "agentic-rag",
    domainId: "d06",
    title: "Agentic RAG：让检索由 Agent 驱动",
    englishTitle: "Agentic RAG",
    summary: "把“一次检索”升级为 Agent 主导的多步检索：查询改写、自查询、反思与补检索。",
    difficulty: "高级",
    estimatedMinutes: 32,
    prerequisites: ["企业 RAG 基础", "Agent 执行循环"],
    learningObjectives: ["理解 Agentic RAG 动机", "设计多步检索循环", "用反思提升召回"],
    sections: [
      {
        id: "why",
        heading: "一、为什么需要 Agentic RAG",
        blocks: [
          {
            type: "paragraph",
            text: "传统 RAG 把问题原样向量化后取 Top-K，面对复杂、多意图或需多源证据的问题往往一次检索不足。Agentic RAG 让 Agent 在检索环节做决策：先改写查询、再检索、评估相关性、必要时补检索或换策略。",
          },
        ],
      },
      {
        id: "flow",
        heading: "二、多步检索循环",
        blocks: [
          {
            type: "mermaid",
            title: "Agentic RAG",
            source: `flowchart TB
  Q["问题"] --> P["规划检索步骤"]
  P --> R1["检索 A"]
  R1 --> E{"足够?"}
  E -->|否| RW["改写/扩展查询"]
  RW --> R2["检索 B"]
  R2 --> E
  E -->|是| G["生成答案"]`,
            caption: "不够就改写、再检索、再评估。",
          },
        ],
      },
      {
        id: "tech",
        heading: "三、关键技术",
        blocks: [
          {
            type: "list",
            items: [
              "Query Rewriting：把口语化问题改写为检索友好表述。",
              "Self-Query：从问题中抽取结构化过滤条件（时间/类型）。",
              "Multi-Retrieval：跨知识库/图谱并行检索后融合。",
              "Reflection：对检索结果打分，不足则触发补检索。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "四、工程实践",
        blocks: [{ type: "list", items: ["限制检索步数防失控", "记录每次检索的理由", "对最终上下文做去重"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["检索可解释", "步数可控", "与重排协同"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["GraphRAG 进阶", "RAG 评估", "混合检索与重排"] }],
      },
    ],
    tags: ["RAG", "Agentic", "检索"],
    architectureIds: ["a08"],
    relatedTutorialIds: ["rag-fundamentals", "graphrag-advanced", "rag-evaluation"],
    references: [{ title: "LangChain: Agentic RAG" }],
    updatedAt: "2026-11-12",
    status: "published",
  },
  {
    id: "t-rag-a2",
    slug: "graphrag-advanced",
    domainId: "d06",
    title: "GraphRAG 进阶：社区摘要与全局检索",
    englishTitle: "Advanced GraphRAG",
    summary: "用社区检测、社区摘要与全局/局部检索回答系统性、总结性问题。",
    difficulty: "专家",
    estimatedMinutes: 34,
    prerequisites: ["知识图谱与 GraphRAG", "企业 RAG 基础"],
    learningObjectives: ["理解社区摘要", "区分全局/局部检索", "与向量检索互补"],
    sections: [
      {
        id: "community",
        heading: "一、社区摘要",
        blocks: [
          {
            type: "paragraph",
            text: "对知识图谱做社区检测（如 Leiden），为每个社区生成多粒度摘要（摘要树）。这样既能回答“某主题的整体情况”（全局检索），也能定位具体实体（局部检索）。",
          },
        ],
      },
      {
        id: "modes",
        heading: "二、全局 vs 局部",
        blocks: [
          {
            type: "table",
            headers: ["模式", "适用", "来源"],
            rows: [
              ["局部", "具体实体/关系", "子图 + 向量"],
              ["全局", "总结性/主题性", "社区摘要"],
              ["混合", "多数真实问题", "两者融合"],
            ],
          },
        ],
      },
      {
        id: "hybrid",
        heading: "三、与向量检索互补",
        blocks: [
          {
            type: "paragraph",
            text: "向量检索擅长语义匹配具体片段，GraphRAG 擅长结构性、多跳与总结。两者并行召回再融合，可兼顾“点到点”与“面到面”的问题。",
          },
        ],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["按问题类型路由", "摘要可裁剪控成本", "实体消歧前置"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["知识图谱与 GraphRAG", "Agentic RAG", "RAG 评估"] }],
      },
    ],
    tags: ["RAG", "GraphRAG", "图谱"],
    architectureIds: ["a08", "a09"],
    relatedTutorialIds: ["knowledge-graph", "agentic-rag", "rag-evaluation"],
    references: [{ title: "Microsoft: From Local to Global (GraphRAG)" }],
    updatedAt: "2026-11-12",
    status: "published",
  },
  {
    id: "t-rag-a3",
    slug: "rag-evaluation",
    domainId: "d06",
    title: "RAG 评估：指标与评测闭环",
    englishTitle: "RAG Evaluation",
    summary: "用忠实度、上下文相关性、答案相关性等指标建立可量化的 RAG 评测闭环。",
    difficulty: "高级",
    estimatedMinutes: 30,
    prerequisites: ["企业 RAG 基础", "Agent 评估"],
    learningObjectives: ["掌握核心指标", "设计评测集", "建立回归门禁"],
    sections: [
      {
        id: "metrics",
        heading: "一、核心指标",
        blocks: [
          {
            type: "table",
            headers: ["指标", "衡量", "失败含义"],
            rows: [
              ["Faithfulness 忠实度", "答案是否由上下文推出", "幻觉"],
              ["Context Relevancy", "检索片段是否相关", "检索不准"],
              ["Answer Relevancy", "答案是否切题", "生成偏差"],
              ["Context Recall", "是否漏检关键片段", "召回不足"],
            ],
          },
        ],
      },
      {
        id: "loop",
        heading: "二、评测闭环",
        blocks: [
          {
            type: "mermaid",
            title: "RAG 评测闭环",
            source: `flowchart LR
  SET["评测集"] --> RUN["运行管线"]
  RUN --> EVAL["指标计算"]
  EVAL --> REP["报告"]
  REP --> DEC{"退化?"}
  DEC -->|是| FIX["调参/改检索"]
  DEC -->|否| SHIP["发布"]`,
            caption: "指标驱动迭代。",
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["评测集覆盖边界样本", "用 LLM-as-judge 辅助打分", "接入 CI 防退化"] }],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["指标可量化", "评测即资产", "回归防退化"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Agent 评估", "Agentic RAG", "混合检索与重排"] }],
      },
    ],
    tags: ["RAG", "评估", "评测"],
    architectureIds: ["a08", "a13"],
    relatedTutorialIds: ["rag-fundamentals", "agent-evaluation", "agentic-rag"],
    references: [{ title: "RAGAS 评估框架" }],
    updatedAt: "2026-11-12",
    status: "published",
  },
];
