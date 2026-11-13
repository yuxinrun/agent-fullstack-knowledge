import type { Tutorial } from "../types";

export const aiPlatformTutorials: Tutorial[] = [
  {
    id: "t-pl-01",
    slug: "ai-platform-architecture",
    domainId: "d12",
    title: "企业 AI 平台参考架构",
    englishTitle: "Enterprise AI Platform Architecture",
    summary: "统一支撑多团队构建 Agent 的平台组成：模型服务、注册中心、知识/记忆/工作流与多租户。",
    difficulty: "专家",
    estimatedMinutes: 32,
    prerequisites: ["Agent Runtime", "MCP 网关"],
    learningObjectives: ["理解平台组成", "设计注册中心", "实现多租户"],
    sections: [
      {
        id: "layers",
        heading: "一、平台分层",
        blocks: [
          {
            type: "mermaid",
            title: "AI 平台",
            source: `flowchart TB
  DEV["开发者门户"] --> GW["API 网关"]
  GW --> MDL["模型服务/网关"]
  GW --> AGT["Agent 运行时"]
  GW --> MCP["MCP 网关"]
  GW --> KNOW["知识/记忆/工作流"]
  GW --> OBS["可观测"]
  GW --> TEN["多租户/隔离"]`,
            caption: "统一入口下的能力平面。",
          },
        ],
      },
      {
        id: "components",
        heading: "二、核心组件",
        blocks: [
          {
            type: "list",
            items: [
              "注册中心：模型、Agent、工具、MCP、Prompt 的目录与版本。",
              "知识服务：RAG、记忆、图谱的共享能力。",
              "工作流引擎：确定性编排。",
              "可观测与治理：贯穿全平台。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["能力复用", "注册统一", "隔离可治理"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["模型网关与路由", "注册中心", "MCP 网关"] }],
      },
    ],
    tags: ["Platform", "平台", "架构"],
    architectureIds: ["a15"],
    relatedTutorialIds: ["model-gateway", "registry-center", "mcp-gateway"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-pl-02",
    slug: "model-gateway",
    domainId: "d12",
    title: "模型网关与路由",
    englishTitle: "Model Gateway & Routing",
    summary: "统一模型接入、路由、限流与成本治理的网关设计。",
    difficulty: "专家",
    estimatedMinutes: 26,
    prerequisites: ["企业 AI 平台架构"],
    learningObjectives: ["设计网关", "实现路由策略", "控制成本"],
    sections: [
      {
        id: "why",
        heading: "一、为什么需要网关",
        blocks: [
          {
            type: "paragraph",
            text: "直接让应用对接各家模型 API，会导致密钥分散、无法统一限流与成本归因、难以灰度切换。网关作为统一模型接入层，集中治理能力。",
          },
        ],
      },
      {
        id: "route",
        heading: "二、路由策略",
        blocks: [
          {
            type: "list",
            items: [
              "按任务类型路由到合适模型（强推理 vs 轻量）。",
              "按成本/时延做 fallback。",
              "按租户配额与限流。",
              "模型版本灰度与回滚。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["统一接入", "成本可归因", "路由可灰度"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["注册中心", "企业 AI 平台架构", "AgentOps 概览"] }],
      },
    ],
    tags: ["Platform", "网关", "模型"],
    architectureIds: ["a15"],
    relatedTutorialIds: ["ai-platform-architecture", "registry-center", "agentops-overview"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-pl-03",
    slug: "registry-center",
    domainId: "d12",
    title: "模型/Agent/工具/MCP 注册中心",
    englishTitle: "Registry Center",
    summary: "用统一注册中心管理可复用资产，支撑发现、版本与治理。",
    difficulty: "专家",
    estimatedMinutes: 24,
    prerequisites: ["企业 AI 平台架构"],
    learningObjectives: ["设计注册元模型", "支持版本与发现", "治理生命周期"],
    sections: [
      {
        id: "meta",
        heading: "一、注册元模型",
        blocks: [
          {
            type: "list",
            items: [
              "资产类型：模型、Agent、工具、MCP、Prompt。",
              "元数据：名称、版本、负责人、schema、权限。",
              "关系：依赖、属于、替代。",
            ],
          },
        ],
      },
      {
        id: "lifecycle",
        heading: "二、生命周期治理",
        blocks: [
          {
            type: "paragraph",
            text: "注册即纳入治理：版本化、上线/下线、弃用告警与依赖检查。变更触发评估与影响分析，避免“暗箱引用”。",
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["资产可发现", "变更可追溯", "依赖可分析"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["模型网关", "企业 AI 平台架构", "AgentOps 概览"] }],
      },
    ],
    tags: ["Platform", "注册", "Registry"],
    architectureIds: ["a15"],
    relatedTutorialIds: ["ai-platform-architecture", "model-gateway", "agentops-overview"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
