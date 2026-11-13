import type { Tutorial } from "../types";

export const multiAgentAdvancedTutorials: Tutorial[] = [
  {
    id: "t-ma-a1",
    slug: "a2a-communication",
    domainId: "d02",
    title: "Agent-to-Agent（A2A）通信协议",
    englishTitle: "Agent-to-Agent Communication",
    summary: "设计跨厂商、跨运行时的 Agent 互操作：消息信封、能力发现、任务委派与安全边界。",
    difficulty: "专家",
    estimatedMinutes: 36,
    prerequisites: ["Multi-Agent 通信", "MCP 基础与整体架构"],
    learningObjectives: ["理解 A2A 与 MCP 的区别", "设计消息信封与能力发现", "保障跨 Agent 安全"],
    sections: [
      {
        id: "a2a-vs-mcp",
        heading: "一、A2A 与 MCP 的区别",
        blocks: [
          {
            type: "callout",
            variant: "info",
            title: "关键区分",
            text: "MCP 解决“Agent 如何连接工具/数据”（Agent↔工具），A2A 解决“Agent 如何彼此协作”（Agent↔Agent）。二者互补：Agent 通过 MCP 用工具，通过 A2A 找同伴。",
          },
        ],
      },
      {
        id: "envelope",
        heading: "二、消息信封",
        blocks: [
          {
            type: "paragraph",
            text: "A2A 通信以结构化消息为载体：发送方、接收方、消息类型（task/response/stream）、任务 ID、载荷与状态。统一信封让不同厂商的 Agent 能互识、互信、互操作。",
          },
          {
            type: "mermaid",
            title: "A2A 任务流",
            source: `flowchart LR
  A["Agent A"] -->|"Task( envelope )"| B["Agent B"]
  B -->|"Accepted"| A
  B -->|"Streaming/Result"| A
  A -->|"Artifact"| B`,
            caption: "任务以信封封装，支持流式与产物回传。",
          },
        ],
      },
      {
        id: "discovery",
        heading: "三、能力发现",
        blocks: [
          {
            type: "list",
            items: [
              "Agent Card：以元数据声明自身能力、技能与鉴权方式。",
              "注册与查询：通过目录发现可协作的 Agent。",
              "协商：就格式、协议版本与权限达成一致。",
            ],
          },
        ],
      },
      {
        id: "security",
        heading: "四、安全边界",
        blocks: [{ type: "list", items: ["跨 Agent 调用需显式授权", "敏感任务仍需人审", "全量审计链路关联 taskId"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["信封标准化", "能力可发现", "调用可审计"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["Multi-Agent 通信", "MCP 网关", "Agent 护栏"] }],
      },
    ],
    tags: ["Multi-Agent", "A2A", "互操作"],
    architectureIds: ["a03", "a06"],
    relatedTutorialIds: ["multi-agent-communication", "mcp-fundamentals", "agent-guardrails"],
    references: [{ title: "Google: Agent2Agent (A2A) Protocol" }],
    updatedAt: "2026-11-12",
    status: "published",
  },
  {
    id: "t-ma-a2",
    slug: "debate-pattern",
    domainId: "d02",
    title: "Debate 辩论模式提升推理质量",
    englishTitle: "Debate Pattern",
    summary: "用多个 Agent 立场对抗、互审与综合，提升复杂推理与事实准确性。",
    difficulty: "高级",
    estimatedMinutes: 28,
    prerequisites: ["Supervisor 模式", "Reflection 模式"],
    learningObjectives: ["设计辩论流程", "实现互审与综合", "控制成本"],
    sections: [
      {
        id: "why",
        heading: "一、为什么辩论有效",
        blocks: [
          {
            type: "paragraph",
            text: "单一模型容易顺同一思路确认偏差。让多个 Agent 持不同立场论证、彼此质疑，能暴露漏洞、减少事实错误，最后由综合者给出更稳健结论。",
          },
        ],
      },
      {
        id: "flow",
        heading: "二、辩论流程",
        blocks: [
          {
            type: "mermaid",
            title: "Debate",
            source: `flowchart TB
  Q["问题"] --> P1["Agent 甲: 论点A"]
  Q --> P2["Agent 乙: 论点B"]
  P1 --> C["互相反驳"]
  P2 --> C
  C --> S["综合 Agent 裁定"]`,
            caption: "对抗后由综合者收敛。",
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["限定轮次控成本", "综合者不预设立场", "记录各方论据便于溯源"] }],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["角色清晰", "轮次有上限", "综合可解释"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Supervisor 模式", "Reflection 模式", "Agent 评估"] }],
      },
    ],
    tags: ["Multi-Agent", "Debate", "推理"],
    architectureIds: ["a03"],
    relatedTutorialIds: ["supervisor-pattern", "agent-design-patterns", "agent-evaluation"],
    references: [],
    updatedAt: "2026-11-12",
    status: "published",
  },
  {
    id: "t-ma-a3",
    slug: "multi-agent-evaluation",
    domainId: "d02",
    title: "多智能体协调评估与失败诊断",
    englishTitle: "Multi-Agent Evaluation",
    summary: "从任务成功率到协作效率，系统评估多智能体并定位协调失败根因。",
    difficulty: "专家",
    estimatedMinutes: 30,
    prerequisites: ["多智能体协作模拟器", "Agent 评估"],
    learningObjectives: ["设计多智能体指标", "定位协调失败", "迭代协作拓扑"],
    sections: [
      {
        id: "metrics",
        heading: "一、评估维度",
        blocks: [
          {
            type: "list",
            items: [
              "任务成功率：最终结果是否正确。",
              "协作效率：轮次、消息数与 token 成本。",
              "角色合规：各 Agent 是否越界。",
              "失败模式：死锁、循环、冲突未裁决。",
            ],
          },
        ],
      },
      {
        id: "diagnose",
        heading: "二、失败诊断",
        blocks: [
          {
            type: "paragraph",
            text: "用全链路 trace 回放：定位卡在哪个 Agent、消息是否丢失或歧义、Supervisor 是否错误委派。多数协调问题来自协议不清或角色重叠。",
          },
        ],
      },
      {
        id: "iter",
        heading: "三、迭代拓扑",
        blocks: [{ type: "list", items: ["角色重叠则拆分", "瓶颈则并行或加层", "高频失败路径加校验"] }],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["全链路 trace", "指标可对比", "拓扑可演进"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Agent 评估", "Multi-Agent 通信", "A2A 通信协议"] }],
      },
    ],
    tags: ["Multi-Agent", "评估", "协调"],
    architectureIds: ["a03", "a13"],
    relatedTutorialIds: ["supervisor-pattern", "agent-evaluation", "agent-tracing"],
    references: [],
    updatedAt: "2026-11-12",
    status: "published",
  },
];
