import type { Tutorial } from "../types";

export const agentOpsTutorials: Tutorial[] = [
  {
    id: "t-ops-01",
    slug: "agentops-overview",
    domainId: "d10",
    title: "AgentOps 概览：Agent 全生命周期运维",
    englishTitle: "AgentOps Overview",
    summary: "建立涵盖 Prompt/模型管理、追踪、评估与持续改进的企业 Agent 运维视图。",
    difficulty: "高级",
    estimatedMinutes: 26,
    prerequisites: ["Agent Runtime", "Agent 基础"],
    learningObjectives: ["建立运维全景", "区分 LLMOps 与 AgentOps", "落地持续改进闭环"],
    sections: [
      {
        id: "concept",
        heading: "一、LLMOps vs AgentOps",
        blocks: [
          {
            type: "paragraph",
            text: "LLMOps 关注模型与 Prompt 的版本、评测与上线；AgentOps 在此基础上增加执行轨迹、工具调用、多步状态与成本的端到端可观测，因为 Agent 的失败往往发生在“循环内部”。",
          },
        ],
      },
      {
        id: "scope",
        heading: "二、运维范围",
        blocks: [
          {
            type: "list",
            items: [
              "资产：Prompt、模型、工具、MCP 的版本管理。",
              "运行：追踪、日志、指标、成本与延迟。",
              "质量：评估、回归测试与 A/B。",
              "迭代：基于数据持续改进。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["为每个 Agent 定义 SLA（延迟/成本/质量）", "配置与代码分离版本化", "评估纳入 CI"] }],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["可观测优先", "评估驱动", "闭环迭代"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Agent 追踪", "Agent 评估", "Token 成本计算"] }],
      },
    ],
    tags: ["AgentOps", "运维", "可观测"],
    architectureIds: ["a13"],
    relatedTutorialIds: ["agent-tracing", "agent-evaluation", "token-cost-calculator"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-ops-02",
    slug: "agent-tracing",
    domainId: "d10",
    title: "Agent 追踪与可观测性",
    englishTitle: "Agent Tracing & Observability",
    summary: "用分布式追踪记录每一步推理、工具调用与观察，支撑调试与归因。",
    difficulty: "高级",
    estimatedMinutes: 28,
    prerequisites: ["AgentOps 概览"],
    learningObjectives: ["设计 trace 模型", "关联 LLM 与工具调用", "从 trace 定位失败"],
    sections: [
      {
        id: "model",
        heading: "一、Trace 模型",
        blocks: [
          {
            type: "paragraph",
            text: "一次 Agent 运行对应一条 trace，内含多个 span：LLM 推理、工具调用、护栏校验等。每个 span 携带输入、输出、耗时、token 与状态，并以 run_id 串联。",
          },
        ],
      },
      {
        id: "flow",
        heading: "二、采集流程",
        blocks: [
          {
            type: "mermaid",
            title: "追踪采集",
            source: `flowchart LR
  RT["Runtime"] --> SP["生成 span"]
  SP --> OBS["可观测平台"]
  OBS --> DASH["看板"]
  OBS --> ALERT["告警"]
  OBS --> QUERY["根因查询"]`,
            caption: "运行时埋点，平台聚合。",
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["每步带 run_id 与 step 序号", "记录 token 与成本", "失败 span 自动标记"] }],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["全链路埋点", "可回放", "失败可归因"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Agent 评估", "AgentOps 概览", "Agent 错误处理"] }],
      },
    ],
    tags: ["AgentOps", "追踪", "Tracing"],
    architectureIds: ["a13"],
    relatedTutorialIds: ["agentops-overview", "agent-evaluation", "agent-error-handling"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-ops-03",
    slug: "agent-evaluation",
    domainId: "d10",
    title: "Agent 评估与回归测试",
    englishTitle: "Agent Evaluation",
    summary: "用离线评测集与在线指标持续衡量 Agent 的质量与稳定性。",
    difficulty: "高级",
    estimatedMinutes: 30,
    prerequisites: ["AgentOps 概览", "Agent 追踪"],
    learningObjectives: ["设计评测集", "定义质量指标", "接入回归门禁"],
    sections: [
      {
        id: "offline",
        heading: "一、离线评测",
        blocks: [
          {
            type: "list",
            items: [
              "任务集：覆盖典型与边界场景的输入-期望。",
              "指标：任务成功率、步骤效率、工具调用正确性。",
              "评审：对开放性输出引入 LLM-as-judge 或人工。",
            ],
          },
        ],
      },
      {
        id: "online",
        heading: "二、在线指标",
        blocks: [
          {
            type: "table",
            headers: ["维度", "指标"],
            rows: [
              ["质量", "用户满意度、人工介入率"],
              ["成本", "单任务 token、费用"],
              ["稳定", "失败率、重试率"],
              ["时延", "P50/P95 响应"],
            ],
          },
        ],
      },
      {
        id: "gate",
        heading: "三、回归门禁",
        blocks: [
          {
            type: "paragraph",
            text: "把评测集接入 CI：每次 Prompt/模型变更都跑回归，关键指标退化则阻断发布。配合 A/B 在线上小流量验证。",
          },
        ],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["评测即资产", "门禁防退化", "在线对照"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["AgentOps 概览", "Agent 追踪", "生产就绪清单"] }],
      },
    ],
    tags: ["AgentOps", "评估", "回归"],
    architectureIds: ["a13"],
    relatedTutorialIds: ["agentops-overview", "agent-tracing", "agent-deployment"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
