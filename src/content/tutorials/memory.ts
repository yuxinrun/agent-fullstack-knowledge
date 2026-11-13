import type { Tutorial } from "../types";

export const memoryTutorials: Tutorial[] = [
  {
    id: "t-mem-01",
    slug: "memory-types",
    domainId: "d05",
    title: "Agent 记忆类型：短期/长期/语义/程序性",
    englishTitle: "Agent Memory Types",
    summary: "区分并设计短期、长期、情景、语义与程序性记忆，构建 Agent 的“记忆系统”。",
    difficulty: "中级",
    estimatedMinutes: 26,
    prerequisites: ["Agent 基础", "Context Engineering"],
    learningObjectives: ["区分五类记忆", "为每类选存储", "设计读写与衰减策略"],
    sections: [
      {
        id: "types",
        heading: "一、五类记忆",
        blocks: [
          {
            type: "table",
            headers: ["类型", "内容", "存储"],
            rows: [
              ["短期", "当前对话/步骤", "内存/Redis"],
              ["长期", "用户偏好/历史", "Postgres"],
              ["情景", "具体经历", "向量库"],
              ["语义", "提炼知识", "知识库"],
              ["程序性", "如何做事", "SOP/脚本"],
            ],
          },
        ],
      },
      {
        id: "design",
        heading: "二、存储选型",
        blocks: [
          {
            type: "paragraph",
            text: "短期记忆随会话存活，用高速 KV；情景记忆用向量库支持相似检索；语义与程序性记忆偏向结构化存储与知识库。关键是检索时按“近期性+相关性”综合排序。",
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["写入即标注时间戳与重要性", "检索结合向量与关键词", "低价值记忆定期衰减"] }],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["分类存储", "检索可组合", "衰减有策略"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Context Engineering", "记忆架构", "RAG 基础"] }],
      },
    ],
    tags: ["Memory", "记忆", "Context"],
    architectureIds: ["a07"],
    relatedTutorialIds: ["context-engineering", "memory-architecture", "rag-fundamentals"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-mem-02",
    slug: "context-engineering",
    domainId: "d05",
    title: "Context Engineering 上下文工程",
    englishTitle: "Context Engineering",
    summary: "系统化管理送入模型的上下文：选择、排序、压缩与隔离，而非简单加长提示。",
    difficulty: "中级",
    estimatedMinutes: 30,
    prerequisites: ["Agent 记忆类型"],
    learningObjectives: ["理解上下文工程的边界", "掌握选择/压缩策略", "避免上下文污染"],
    sections: [
      {
        id: "concept",
        heading: "一、为什么不是“写长 Prompt”",
        blocks: [
          {
            type: "callout",
            variant: "info",
            title: "关键认知",
            text: "上下文窗口有限且“中间遗忘”明显。Context Engineering 的目标是用最少的 token 注入最相关信息，而非堆砌。",
          },
        ],
      },
      {
        id: "strategy",
        heading: "二、核心策略",
        blocks: [
          {
            type: "list",
            items: [
              "选择：只取与当前任务相关的记忆/知识。",
              "排序：把最重要信息放在开头与结尾。",
              "压缩：对长对话/长文档做摘要后注入。",
              "隔离：不同子任务用独立上下文，避免互相污染。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["上下文预算化（按 token 配额）", "关键指令固定位置", "检索结果附来源便于溯源"] }],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["少即是多", "相关优先", "隔离防污染"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["记忆架构", "RAG 检索", "Agent 状态管理"] }],
      },
    ],
    tags: ["Context", "上下文", "Prompt"],
    architectureIds: ["a07"],
    relatedTutorialIds: ["memory-types", "memory-architecture", "rag-fundamentals"],
    references: [{ title: "Anthropic: Context Engineering for AI Agents" }],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-mem-03",
    slug: "memory-architecture",
    domainId: "d05",
    title: "Agent Memory 架构设计",
    englishTitle: "Agent Memory Architecture",
    summary: "把短期、长期、语义与程序性记忆组织为可演进的统一记忆架构。",
    difficulty: "高级",
    estimatedMinutes: 32,
    prerequisites: ["Agent 记忆类型", "Context Engineering"],
    learningObjectives: ["设计分层记忆", "实现检索与巩固", "支撑跨任务复用"],
    sections: [
      {
        id: "arch",
        heading: "一、分层架构",
        blocks: [
          {
            type: "mermaid",
            title: "记忆架构",
            source: `flowchart TB
  IN["经验/交互"] --> ING["写入层"]
  ING --> STM["短期记忆"]
  ING --> LTM["长期记忆"]
  LTM --> SEM["语义记忆"]
  LTM --> PROC["程序性记忆"]
  STM --> RET["检索层"]
  LTM --> RET
  RET --> CTX["上下文注入"]`,
            caption: "写入-存储-检索-注入的闭环。",
          },
        ],
      },
      {
        id: "consolidate",
        heading: "二、巩固与衰减",
        blocks: [
          {
            type: "list",
            items: [
              "巩固：把情景记忆提炼为语义/程序性记忆。",
              "衰减：低重要性、长期未访问的记忆降权。",
              "更新：用户偏好变化后覆盖而非追加。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["写入带元数据（时间/重要性/来源）", "检索综合近期与相似度", "提供记忆管理接口"] }],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["分层清晰", "巩固自动化", "检索可解释"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Context Engineering", "RAG 基础", "知识图谱"] }],
      },
    ],
    tags: ["Memory", "架构", "记忆"],
    architectureIds: ["a07"],
    relatedTutorialIds: ["memory-types", "context-engineering", "rag-fundamentals"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
