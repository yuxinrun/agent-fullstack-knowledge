import type { KnowledgeRelation } from "./types";

// 节点 id 规范：
//  domain:  d01..d15  (使用 slug 前缀 domain:<slug>，见 content index)
//  arch:    architecture slug
//  term:    glossary id
//  lab:     lab slug
//  tool:    tool slug
// 本文件补充跨类型显式关系，领域之间的关系由 domains.relatedDomainIds 自动生成。

export const relations: KnowledgeRelation[] = [
  { sourceId: "term:g-agent", targetId: "term:g-workflow", relationType: "related", description: "Agent 与 Workflow 是互补而非替代关系" },
  { sourceId: "term:g-agent", targetId: "term:g-multi-agent", relationType: "enables", description: "单 Agent 是 Multi-Agent 的基础" },
  { sourceId: "term:g-agent", targetId: "term:g-tool-calling", relationType: "related", description: "Tool Calling 是 Agent 行动的手段" },
  { sourceId: "term:g-mcp", targetId: "term:g-agent", relationType: "related", description: "MCP 为 Agent 提供标准化工具接入" },
  { sourceId: "term:g-rag", targetId: "term:g-knowledge-graph", relationType: "related", description: "RAG 与知识图谱互补（GraphRAG）" },
  { sourceId: "term:g-graphrag", targetId: "term:g-rag", relationType: "related", description: "GraphRAG 是 RAG 的图谱增强变体" },
  { sourceId: "term:g-agentic-workflow", targetId: "term:g-workflow", relationType: "related", description: "Agentic Workflow 在 Workflow 中嵌入 Agent" },
  { sourceId: "term:g-context-engineering", targetId: "term:g-memory", relationType: "related", description: "Context Engineering 依赖记忆检索" },
  { sourceId: "term:g-semantic-layer", targetId: "term:g-text-to-sql", relationType: "enables", description: "语义层支撑 Text-to-SQL 正确生成" },
  { sourceId: "term:g-agentops", targetId: "term:g-llmops", relationType: "related", description: "AgentOps 建立在 LLMOps 之上" },
  { sourceId: "term:g-guardrails", targetId: "term:g-prompt-injection", relationType: "related", description: "护栏用于防御 Prompt Injection" },
  { sourceId: "term:g-digital-twin", targetId: "term:g-agent", relationType: "related", description: "数字孪生为工业 Agent 提供仿真" },
  { sourceId: "term:g-supervisor", targetId: "term:g-multi-agent", relationType: "part-of", description: "Supervisor 是 Multi-Agent 的一种模式" },
  { sourceId: "term:g-react", targetId: "term:g-planning", relationType: "related", description: "ReAct 与 Planning 是两类推理策略" },
  { sourceId: "term:g-embedding", targetId: "term:g-vector-db", relationType: "enables", description: "Embedding 由向量库索引与检索" },
  { sourceId: "term:g-hybrid-search", targetId: "term:g-reranking", relationType: "related", description: "混合检索常配合重排" },
  { sourceId: "term:g-hitl", targetId: "term:g-agent", relationType: "related", description: "人工介入是 Agent 安全控制手段" },
  { sourceId: "term:g-knowledge-graph", targetId: "term:g-ontology", relationType: "part-of", description: "知识图谱以本体为骨架" },
  { sourceId: "arch:enterprise-agent-reference", targetId: "domain:agent-engineering", relationType: "part-of", description: "参考架构统领 Agent 工程" },
  { sourceId: "arch:multi-agent", targetId: "domain:multi-agent", relationType: "part-of", description: "多智能体架构属于该领域" },
  { sourceId: "arch:mcp", targetId: "domain:mcp", relationType: "part-of", description: "MCP 架构属于该领域" },
  { sourceId: "arch:rag", targetId: "domain:rag", relationType: "part-of", description: "RAG 架构属于该领域" },
  { sourceId: "arch:agentic-rag", targetId: "arch:rag", relationType: "related", description: "Agentic RAG 是 RAG 的演进" },
  { sourceId: "arch:graphrag", targetId: "arch:rag", relationType: "related", description: "GraphRAG 与 RAG 协同" },
  { sourceId: "arch:agent-platform", targetId: "domain:ai-platform", relationType: "part-of", description: "平台参考架构属于该领域" },
  { sourceId: "arch:ai-security", targetId: "domain:ai-security", relationType: "part-of", description: "安全架构属于该领域" },
  { sourceId: "arch:digital-twin-agent", targetId: "domain:digital-twin", relationType: "part-of", description: "数字孪生+Agent 架构属于该领域" },
];
