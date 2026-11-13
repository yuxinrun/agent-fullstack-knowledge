import type { LearningPath } from "./types";

export const learningPaths: LearningPath[] = [
  {
    id: "p1",
    slug: "agent-developer",
    title: "Agent 开发工程师",
    audience: "希望构建企业 Agent 应用的开发工程师",
    description:
      "从 Agent 基础到运行时、工具调用、记忆、RAG、MCP、工作流、评估与部署的完整成长路径。",
    estimatedHours: 40,
    steps: [
      {
        title: "Agent 基础",
        description: "理解 Agent 与 LLM 应用、Chatbot 的区别，掌握执行循环。",
        tutorialSlugs: ["agent-fundamentals", "react-pattern", "agent-execution-loop"],
        domainSlugs: ["agent-engineering"],
      },
      {
        title: "运行时与工具",
        description: "掌握 Agent Runtime、Tool Calling 与错误处理。",
        tutorialSlugs: ["agent-runtime", "tool-calling", "agent-error-handling"],
        domainSlugs: ["agent-engineering"],
      },
      {
        title: "记忆与上下文",
        description: "学习 Context Engineering 与记忆架构。",
        tutorialSlugs: ["context-engineering", "memory-architecture"],
        domainSlugs: ["agent-memory"],
      },
      {
        title: "RAG 与检索",
        description: "掌握企业 RAG 全链路。",
        tutorialSlugs: ["rag-fundamentals", "chunking-strategy", "hybrid-search"],
        domainSlugs: ["rag"],
      },
      {
        title: "MCP 工具生态",
        description: "用 MCP 接入企业系统。",
        tutorialSlugs: ["mcp-fundamentals", "mcp-server-dev"],
        domainSlugs: ["mcp"],
      },
      {
        title: "工作流与评估",
        description: "编排工作流并对 Agent 做评估与部署。",
        tutorialSlugs: ["workflow-vs-agent", "agent-evaluation", "deployment"],
        domainSlugs: ["agent-workflow", "agentops"],
      },
    ],
  },
  {
    id: "p2",
    slug: "ai-architect",
    title: "企业 AI 架构师",
    audience: "负责企业 AI 系统顶层设计的架构师",
    description: "从企业 AI 架构到 Agent、多智能体、数据底座、知识工程、语义层、平台与治理。",
    estimatedHours: 36,
    steps: [
      {
        title: "企业 AI 架构",
        description: "建立企业级 Agent 系统整体视图。",
        tutorialSlugs: ["enterprise-agent-architecture", "ai-platform-architecture"],
        domainSlugs: ["agent-engineering", "ai-platform"],
      },
      {
        title: "Agent 与多智能体",
        description: "设计单 Agent 与多 Agent 协作。",
        tutorialSlugs: ["agent-runtime", "supervisor-pattern"],
        domainSlugs: ["agent-engineering", "multi-agent"],
      },
      {
        title: "数据底座",
        description: "建设支撑 AI 的数据基础设施。",
        tutorialSlugs: ["ai-ready-data", "data-pipeline-cdc"],
        domainSlugs: ["ai-data-infrastructure"],
      },
      {
        title: "知识与语义层",
        description: "知识工程与语义层打通业务语义。",
        tutorialSlugs: ["ontology-taxonomy", "semantic-layer"],
        domainSlugs: ["knowledge-engineering", "semantic-layer"],
      },
      {
        title: "平台与安全治理",
        description: "统一平台与治理闭环。",
        tutorialSlugs: ["mcp-gateway", "ai-security-fundamentals"],
        domainSlugs: ["ai-platform", "ai-security"],
      },
    ],
  },
  {
    id: "p3",
    slug: "agent-platform-engineer",
    title: "Agent 平台工程师",
    audience: "建设企业 AI 平台的平台工程师",
    description: "从 Agent Runtime 到工作流编排、模型网关、MCP 网关、注册中心、AgentOps 与 K8s 部署。",
    estimatedHours: 32,
    steps: [
      {
        title: "运行时与编排",
        description: "构建 Runtime 与工作流引擎。",
        tutorialSlugs: ["agent-runtime", "workflow-vs-agent"],
        domainSlugs: ["agent-engineering", "agent-workflow"],
      },
      {
        title: "网关与注册中心",
        description: "模型网关、MCP 网关与各类注册中心。",
        tutorialSlugs: ["model-gateway", "mcp-gateway", "mcp-server-dev"],
        domainSlugs: ["ai-platform", "mcp"],
      },
      {
        title: "可观测与部署",
        description: "AgentOps、可观测与 Kubernetes 部署。",
        tutorialSlugs: ["agentops-overview", "agent-tracing", "ai-platform-architecture"],
        domainSlugs: ["agentops", "ai-platform"],
      },
    ],
  },
  {
    id: "p4",
    slug: "ai-solution-engineer",
    title: "企业 AI 解决方案工程师",
    audience: "面向业务交付 AI 方案的解决方案工程师",
    description: "从企业场景到业务流程、知识助手、IT 运维、财务、制造 Agent 与方案架构落地。",
    estimatedHours: 30,
    steps: [
      {
        title: "企业 AI 用例",
        description: "理解企业 AI 解决方案结构。",
        tutorialSlugs: ["itops-agent"],
        domainSlugs: ["enterprise-solutions"],
      },
      {
        title: "业务流程与助手",
        description: "业务流程建模与知识助手。",
        tutorialSlugs: ["automation-vs-agent", "knowledge-assistant"],
        domainSlugs: ["ai-automation", "enterprise-solutions"],
      },
      {
        title: "垂直方案",
        description: "IT 运维、财务、制造等落地方案。",
        tutorialSlugs: ["itops-agent", "conversational-analytics", "industrial-agent"],
        domainSlugs: ["enterprise-solutions"],
      },
      {
        title: "方案交付",
        description: "解决方案架构与企业部署。",
        tutorialSlugs: ["enterprise-agent-architecture", "deployment"],
        domainSlugs: ["enterprise-solutions", "ai-platform"],
      },
    ],
  },
];

export function getLearningPath(slug: string): LearningPath | undefined {
  return learningPaths.find((p) => p.slug === slug);
}
