import type { Tutorial } from "../types";

export const multiAgentTutorials: Tutorial[] = [
  {
    id: "t-ma-01",
    slug: "supervisor-pattern",
    domainId: "d02",
    title: "Supervisor 多智能体编排模式",
    englishTitle: "Supervisor Pattern",
    summary: "由一个中心 Supervisor 负责任务拆解、 Agent 委派与结果汇总的多智能体协作模式。",
    difficulty: "高级",
    estimatedMinutes: 32,
    prerequisites: ["Agent 执行循环", "Agent 基础"],
    learningObjectives: [
      "理解 Supervisor 的职责与边界",
      "设计任务拆解与委派机制",
      "处理结果汇总与冲突",
    ],
    sections: [
      {
        id: "concept",
        heading: "一、什么是 Supervisor 模式",
        blocks: [
          {
            type: "paragraph",
            text: "Supervisor 模式由一枚“管理者” Agent 统一接收用户目标，将其拆解为子任务，委派给若干专精的 Worker Agent，最后汇总各 Worker 的结果。Supervisor 不直接执行业务动作，而是负责调度、监督与整合，类似项目经理。",
          },
        ],
      },
      {
        id: "flow",
        heading: "二、协作流程",
        blocks: [
          {
            type: "mermaid",
            title: "Supervisor 编排",
            source: `flowchart TB
  U["用户目标"] --> S["Supervisor"]
  S --> W1["Worker: 研究"]
  S --> W2["Worker: 分析"]
  S --> W3["Worker: 执行"]
  W1 --> S
  W2 --> S
  W3 --> S
  S --> R["汇总结果"]`,
            caption: "Supervisor 拆解任务并汇总 Worker 产出。",
          },
        ],
      },
      {
        id: "design",
        heading: "三、关键设计点",
        blocks: [
          {
            type: "list",
            items: [
              "职责分离：Supervisor 只调度，不持有业务工具。",
              "委派协议：明确子任务的输入、输出与完成信号。",
              "汇总策略：定义结果如何合并、冲突如何裁决。",
              "失败处理：某个 Worker 失败时如何重试或降级。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "四、工程实践",
        blocks: [
          {
            type: "list",
            items: [
              "为每个 Worker 设定清晰的系统提示与工具边界。",
              "Supervisor 通过结构化消息而非自由文本与 Worker 通信。",
              "为委派设置超时与最大重试，避免单点阻塞。",
            ],
          },
        ],
      },
      {
        id: "faq",
        heading: "五、常见问题",
        blocks: [
          {
            type: "list",
            items: [
              "Q：Supervisor 会成为瓶颈吗？A：当 Worker 可并行时，瓶颈主要在汇总；可通过分层 Supervisor 缓解。",
              "Q：何时不用 Supervisor？A：任务单一、无需分工时，单 Agent 更简单可控。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "六、最佳实践",
        blocks: [
          { type: "list", items: ["Worker 专精化", "通信结构化", "失败可降级", "汇总有策略"] },
        ],
      },
      {
        id: "next",
        heading: "七、延伸阅读",
        blocks: [
          { type: "list", items: ["Planner-Executor 模式", "Multi-Agent 通信", "企业级 Agent 参考架构"] },
        ],
      },
    ],
    tags: ["Multi-Agent", "Supervisor", "编排"],
    architectureIds: ["a03"],
    relatedTutorialIds: ["planner-executor-pattern", "multi-agent-communication", "enterprise-agent-architecture"],
    references: [{ title: "Anthropic: Building Effective Agents（orchestrator-workers）" }],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-ma-02",
    slug: "planner-executor-pattern",
    domainId: "d02",
    title: "Planner-Executor 规划执行模式",
    englishTitle: "Planner-Executor Pattern",
    summary: "由 Planner 制定计划、Executor 逐步执行并反馈，适用于长链路、可逆性低的复杂任务。",
    difficulty: "高级",
    estimatedMinutes: 30,
    prerequisites: ["Planning & Reasoning", "Supervisor 模式"],
    learningObjectives: ["区分规划与执行", "设计可检查的计划", "实现执行回传与重规划"],
    sections: [
      {
        id: "concept",
        heading: "一、模式结构",
        blocks: [
          {
            type: "paragraph",
            text: "Planner-Executor 将“想”与“做”解耦：Planner 负责把目标分解为有序、可验证的步骤；Executor 负责逐步执行并回传观察。当执行偏离或失败时，可触发重规划，而不是从零重试。",
          },
        ],
      },
      {
        id: "flow",
        heading: "二、执行流程",
        blocks: [
          {
            type: "mermaid",
            title: "Planner-Executor",
            source: `flowchart LR
  G["目标"] --> P["Planner 制定计划"]
  P --> E["Executor 执行步骤"]
  E --> O["观察结果"]
  O -->|"达标"| DONE["完成"]
  O -->|"偏离"| P`,
            caption: "未达标时回到 Planner 重规划。",
          },
        ],
      },
      {
        id: "plan",
        heading: "三、计划设计",
        blocks: [
          {
            type: "list",
            items: [
              "步骤可验证：每步有清晰的完成判据。",
              "依赖显式：标明步骤间的先后与数据依赖。",
              "可回退：记录检查点，失败后回到稳定步骤。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "四、工程实践",
        blocks: [
          { type: "list", items: ["计划以 JSON/结构化形式表达", "Executor 每步结束上报状态", "为不可逆动作插入确认"] },
        ],
      },
      {
        id: "faq",
        heading: "五、常见问题",
        blocks: [
          { type: "list", items: ["Q：Planner 与 Supervisor 区别？A：Planner 关注“步骤序列”，Supervisor 关注“谁来做”。二者常组合使用。"] },
        ],
      },
      {
        id: "best",
        heading: "六、最佳实践",
        blocks: [{ type: "list", items: ["计划可验证", "偏离即重规划", "关键动作确认"] }],
      },
      {
        id: "next",
        heading: "七、延伸阅读",
        blocks: [{ type: "list", items: ["Supervisor 模式", "Reflection 模式", "Agent 状态管理"] }],
      },
    ],
    tags: ["Multi-Agent", "Planner", "规划"],
    architectureIds: ["a03"],
    relatedTutorialIds: ["supervisor-pattern", "planning-reasoning", "agent-error-handling"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-ma-03",
    slug: "multi-agent-communication",
    domainId: "d02",
    title: "Multi-Agent 通信与消息传递",
    englishTitle: "Multi-Agent Communication",
    summary: "Agent 间的消息格式、共享状态、任务委派与冲突解决的工程实现。",
    difficulty: "高级",
    estimatedMinutes: 28,
    prerequisites: ["Supervisor 模式", "Agent 状态管理"],
    learningObjectives: ["设计 Agent 间消息协议", "实现共享状态与黑板", "处理冲突与一致性"],
    sections: [
      {
        id: "concept",
        heading: "一、为什么需要通信协议",
        blocks: [
          {
            type: "paragraph",
            text: "多个 Agent 协作时，若各自用自由文本沟通，极易产生歧义与不可解析的结果。统一的消息协议（ sender / receiver / intent / payload / status ）能把协作变得可观测、可重放、可调试。",
          },
        ],
      },
      {
        id: "model",
        heading: "二、共享状态 vs 消息传递",
        blocks: [
          {
            type: "table",
            headers: ["方式", "优点", "缺点"],
            rows: [
              ["消息传递", "解耦、可追溯", "需设计协议"],
              ["共享黑板", "易共享中间结果", "需并发控制"],
              ["中央状态", "一致性强", "可能成为瓶颈"],
            ],
          },
        ],
      },
      {
        id: "conflict",
        heading: "三、冲突与一致性",
        blocks: [
          {
            type: "list",
            items: [
              "用唯一任务 ID 标识协作上下文，避免串台。",
              "对共享写操作加锁或串行化。",
              "定义裁决规则：当 Worker 结论冲突时由 Supervisor 决定。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "四、工程实践",
        blocks: [{ type: "list", items: ["消息结构化", "写入带版本号", "全链路 trace 关联 taskId"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["协议先行", "状态可观测", "冲突有裁决"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["Supervisor 模式", "Workflow 状态机", "Agent 状态管理"] }],
      },
    ],
    tags: ["Multi-Agent", "通信", "消息"],
    architectureIds: ["a03"],
    relatedTutorialIds: ["supervisor-pattern", "agent-state-management", "workflow-engine"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
