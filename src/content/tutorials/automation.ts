import type { Tutorial } from "../types";

export const automationTutorials: Tutorial[] = [
  {
    id: "t-au-01",
    slug: "automation-vs-agent",
    domainId: "d13",
    title: "自动化与 Agent 的边界",
    englishTitle: "Automation vs Agent",
    summary: "厘清 RPA、工作流与 Agent 自动化的适用边界与组合方式。",
    difficulty: "中级",
    estimatedMinutes: 22,
    prerequisites: ["Workflow 与 Agent 的边界"],
    learningObjectives: ["区分三类自动化", "识别组合信号", "设计混合方案"],
    sections: [
      {
        id: "diff",
        heading: "一、三类对比",
        blocks: [
          {
            type: "table",
            headers: ["方式", "擅长", "局限"],
            rows: [
              ["RPA", "规则化 UI 操作", "脆弱、难维护"],
              ["Workflow", "确定性流程", "不灵活"],
              ["Agent", "不确定决策", "可控性弱"],
            ],
          },
        ],
      },
      {
        id: "combo",
        heading: "二、组合方式",
        blocks: [
          {
            type: "paragraph",
            text: "用 RPA/Workflow 承载稳定动作，Agent 负责理解、分类与异常处理。例如报销流程用 Workflow 驱动，Agent 负责发票信息抽取与异常判断。",
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["稳定动作自动化", "不确定交给 Agent", "异常转人工"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["Workflow 与 Agent 的边界", "RPA 集成", "事件驱动自动化"] }],
      },
    ],
    tags: ["Automation", "RPA", "边界"],
    architectureIds: ["a16"],
    relatedTutorialIds: ["rpa-integration", "event-driven-automation", "workflow-vs-agent"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-au-02",
    slug: "rpa-integration",
    domainId: "d13",
    title: "Agent 与 RPA/系统集成的集成",
    englishTitle: "RPA & System Integration",
    summary: "把 Agent 的决策能力接入 RPA 与企业系统（ERP/CRM/ITSM）。",
    difficulty: "中级",
    estimatedMinutes: 26,
    prerequisites: ["自动化与 Agent 的边界", "MCP 基础"],
    learningObjectives: ["设计集成边界", "用 MCP 接 RPA", "处理权限与幂等"],
    sections: [
      {
        id: "boundary",
        heading: "一、集成边界",
        blocks: [
          {
            type: "paragraph",
            text: "Agent 负责“决定做什么”，RPA/系统 API 负责“真正执行”。通过 MCP 或网关把 RPA 机器人、ERP/CRM 接口暴露为工具，Agent 调用即可触发后端动作。",
          },
        ],
      },
      {
        id: "practice",
        heading: "二、工程实践",
        blocks: [
          { type: "list", items: ["写操作幂等化", "执行结果回传 Agent", "失败可重试/补偿"] },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["决策归 Agent", "执行归系统", "结果可回传"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["MCP 网关", "事件驱动自动化", "企业 AI 平台"] }],
      },
    ],
    tags: ["Automation", "RPA", "集成"],
    architectureIds: ["a16"],
    relatedTutorialIds: ["automation-vs-agent", "mcp-gateway", "event-driven-automation"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-au-03",
    slug: "event-driven-automation",
    domainId: "d13",
    title: "事件驱动与 API 自动化",
    englishTitle: "Event-Driven Automation",
    summary: "以事件触发 Agent/工作流，实现跨系统的实时自动化闭环。",
    difficulty: "中级",
    estimatedMinutes: 24,
    prerequisites: ["自动化与 Agent 的边界"],
    learningObjectives: ["设计事件管道", "触发 Agent 处理", "保证可靠性"],
    sections: [
      {
        id: "flow",
        heading: "一、事件闭环",
        blocks: [
          {
            type: "mermaid",
            title: "事件驱动",
            source: `flowchart LR
  E["业务事件"] --> BUS["事件总线"]
  BUS --> TRIG["触发器"]
  TRIG --> AG["Agent/Workflow"]
  AG --> ACT["执行动作"]
  ACT --> E2["新事件"]`,
            caption: "事件驱动端到端闭环。",
          },
        ],
      },
      {
        id: "best",
        heading: "二、最佳实践",
        blocks: [{ type: "list", items: ["幂等消费", "死信处理", "可重放"] }],
      },
      {
        id: "next",
        heading: "三、延伸阅读",
        blocks: [{ type: "list", items: ["RPA 集成", "Workflow 引擎", "企业 AI 平台"] }],
      },
    ],
    tags: ["Automation", "事件", "实时"],
    architectureIds: ["a16"],
    relatedTutorialIds: ["automation-vs-agent", "rpa-integration", "workflow-engine"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
