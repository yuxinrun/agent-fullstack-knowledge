import type { Tutorial } from "../types";

export const agentWorkflowTutorials: Tutorial[] = [
  {
    id: "t-wf-01",
    slug: "workflow-vs-agent",
    domainId: "d03",
    title: "Workflow 与 Agent 的边界",
    englishTitle: "Workflow vs Agent",
    summary: "讲清何时用确定性 Workflow、何时用 Agent、何时两者结合，避免误用。",
    difficulty: "中级",
    estimatedMinutes: 25,
    prerequisites: ["Agent 基础", "Workflow 基础"],
    learningObjectives: ["区分 Workflow 与 Agent 的适用场景", "识别混合架构信号", "做出合理选型"],
    sections: [
      {
        id: "concept",
        heading: "一、核心区别",
        blocks: [
          {
            type: "paragraph",
            text: "Workflow 是预先定义好的确定性流程（状态机/DAG），每一步的输入输出可控、可审计；Agent 则在运行中自主决策下一步。企业系统的稳定性往往来自 Workflow，灵活性来自 Agent。",
          },
        ],
      },
      {
        id: "table",
        heading: "二、选型对照",
        blocks: [
          {
            type: "table",
            headers: ["信号", "选 Workflow", "选 Agent"],
            rows: [
              ["路径是否固定", "是", "否"],
              ["是否需要强审计", "是", "弱"],
              ["是否需自主判断", "否", "是"],
              ["失败是否需精确回滚", "是", "难保证"],
            ],
          },
        ],
      },
      {
        id: "hybrid",
        heading: "三、混合架构",
        blocks: [
          {
            type: "paragraph",
            text: "最常见的是“Workflow 为主干，Agent 为节点”：主流程用确定性编排保证可控，在需要理解、生成或决策的节点嵌入 Agent，并把 Agent 的输出再交给后续确定步骤校验。",
          },
          {
            type: "mermaid",
            title: "Workflow 嵌入 Agent",
            source: `flowchart LR
  A["开始"] --> B["校验(确定性)"]
  B --> C["Agent 决策"]
  C --> D["执行(确定性)"]
  D --> E["人工审批"]
  E --> F["结束"]`,
            caption: "以 Workflow 为骨架，关键节点用 Agent。",
          },
        ],
      },
      {
        id: "practice",
        heading: "四、工程实践",
        blocks: [{ type: "list", items: ["默认从 Workflow 起步", "仅在不确定处引入 Agent", "Agent 输出需可校验"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["可控优先", "混合落地", "节点可观测"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["Workflow 引擎", "Human 审批", "Agent 设计模式"] }],
      },
    ],
    tags: ["Workflow", "Agent", "选型"],
    architectureIds: ["a05"],
    relatedTutorialIds: ["workflow-engine", "agent-human-in-the-loop", "agent-design-patterns"],
    references: [{ title: "Anthropic: Agents vs workflows" }],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-wf-02",
    slug: "workflow-engine",
    domainId: "d03",
    title: "Workflow 引擎：状态机与 DAG",
    englishTitle: "Workflow Engine",
    summary: "设计支持检查点、重试、补偿与人工审批的健壮工作流引擎。",
    difficulty: "高级",
    estimatedMinutes: 34,
    prerequisites: ["Workflow 与 Agent 的边界"],
    learningObjectives: ["用状态机/DAG 建模流程", "实现检查点与重试", "设计补偿与人工审批"],
    sections: [
      {
        id: "model",
        heading: "一、流程建模",
        blocks: [
          {
            type: "paragraph",
            text: "简单线性流程用状态机即可；含并行、条件分支、汇合的流程用 DAG（有向无环图）更合适。节点表示动作，边表示流转条件。引擎按拓扑顺序驱动执行。",
          },
        ],
      },
      {
        id: "resilience",
        heading: "二、容错机制",
        blocks: [
          {
            type: "list",
            items: [
              "检查点：每完成一个节点持久化状态，崩溃可续跑。",
              "重试：瞬时失败按策略重试，超限转人工或补偿。",
              "补偿：已完成的写操作需有逆向操作以支持回滚。",
            ],
          },
        ],
      },
      {
        id: "code",
        heading: "三、最小状态机（TypeScript）",
        blocks: [
          {
            type: "code",
            language: "typescript",
            filename: "workflow.ts",
            runnable: false,
            code: `type State = "start" | "check" | "decide" | "done" | "failed";
const transitions: Record<State, State[]> = {
  start: ["check"],
  check: ["decide", "failed"],
  decide: ["done"],
  done: [],
  failed: [],
};
function can(next: State, from: State) { return transitions[from].includes(next); }`,
          },
        ],
      },
      {
        id: "practice",
        heading: "四、工程实践",
        blocks: [{ type: "list", items: ["状态持久化到 DB", "长任务异步化", "审批节点挂起可恢复"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["建模即文档", "补偿可回滚", "审批可恢复"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["Human 审批", "Agent 错误处理", "AgentOps 追踪"] }],
      },
    ],
    tags: ["Workflow", "DAG", "引擎"],
    architectureIds: ["a05"],
    relatedTutorialIds: ["workflow-vs-agent", "agent-human-in-the-loop", "agent-error-handling"],
    references: [{ title: "Temporal 文档", url: "https://docs.temporal.io" }],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-wf-03",
    slug: "human-approval",
    domainId: "d03",
    title: "工作流中的人工审批",
    englishTitle: "Human Approval in Workflow",
    summary: "在工作流中设计可挂起、可恢复、可审计的人工审批闸口。",
    difficulty: "中级",
    estimatedMinutes: 22,
    prerequisites: ["Workflow 引擎", "Agent 人工介入"],
    learningObjectives: ["设计审批节点", "实现挂起-恢复", "保证审计可追溯"],
    sections: [
      {
        id: "design",
        heading: "一、审批节点设计",
        blocks: [
          {
            type: "paragraph",
            text: "审批节点是一个特殊的工作流节点：进入时挂起流程并持久化上下文，向审批人推送任务；审批人通过后携带决策恢复执行，拒绝则走失败/补偿分支。",
          },
        ],
      },
      {
        id: "flow",
        heading: "二、状态流转",
        blocks: [
          {
            type: "mermaid",
            title: "审批挂起-恢复",
            source: `flowchart LR
  A["前置节点"] --> P{"需审批?"}
  P -->|是| H["挂起待审"]
  H -->|通过| C["继续"]
  H -->|拒绝| F["补偿/终止"]
  P -->|否| C`,
            caption: "审批期间流程持久化挂起。",
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["审批上下文完整持久化", "超时自动升级", "记录审批人与结果"] }],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["最小必要介入", "可恢复", "可审计"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Agent 人工介入", "Workflow 引擎", "AI 安全治理"] }],
      },
    ],
    tags: ["Workflow", "审批", "HITL"],
    architectureIds: ["a05", "a14"],
    relatedTutorialIds: ["workflow-vs-agent", "agent-human-in-the-loop"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
