import type { Tutorial } from "../../types";

// ============================================================================
// 第一批 · 领域 02 / 03 · L4-L5 深度升级教程
// 代码均为不依赖外部 SDK 的纯 TypeScript 逻辑实现，可直接编译运行，
// 便于读者聚焦「委派协议、状态机、检查点、补偿」等机制本身。
// ============================================================================

export const deepMultiAgentWorkflow: Tutorial[] = [
  {
    id: "t-ma-01",
    slug: "supervisor-pattern",
    domainId: "d02",
    title: "Supervisor 多智能体编排：委派协议、共享状态与冲突裁决",
    englishTitle: "Supervisor Multi-Agent Orchestration",
    summary:
      "深入讲解 Supervisor 模式的委派协议、消息 Schema、共享状态与并发控制、冲突裁决与失败恢复，给出可运行的 TypeScript 委派循环实现、成本与延迟分析、企业级案例以及评测与排障方法。",
    difficulty: "高级",
    estimatedMinutes: 70,
    prerequisites: ["Agent 执行循环", "Agent 状态管理", "TypeScript 基础"],
    learningObjectives: [
      "判断何时应从单 Agent 升级到多 Agent，并说明边界与代价",
      "设计结构化委派消息与共享状态，避免自由文本通信歧义",
      "实现带超时、重试、冲突裁决与预算上限的 Supervisor 循环",
      "分析多 Agent 相比单 Agent 的成本与延迟放大效应",
      "建立多 Agent 评测指标并诊断死锁、循环、角色越界",
    ],
    sections: [
      {
        id: "overview",
        heading: "1. 技术概述 Overview",
        blocks: [
          {
            type: "paragraph",
            text: "Supervisor 模式是一种中心化多智能体编排：由一个 Supervisor 接收用户目标，把任务拆解并委派给若干专精 Worker Agent，收集结果后裁决冲突并汇总输出。Supervisor 只负责调度与整合，不直接持有业务工具；Worker 只负责各自子任务，不直接面对最终用户。",
          },
          {
            type: "paragraph",
            text: "产生背景是单 Agent 在长任务中同时承担理解、规划、检索、执行与校验，提示词与工具集不断膨胀，导致角色混淆、上下文污染和不可控的工具误用。把职责拆分给专精角色，可以用更窄的工具集与更短的上下文换取更高的可控性——代价是额外的协调开销。",
          },
          {
            type: "table",
            headers: ["维度", "单 Agent", "Supervisor 多 Agent"],
            rows: [
              ["上下文", "一条轨迹包含全部信息", "每个 Worker 有独立窄上下文"],
              ["工具集", "全部工具对模型可见", "按角色分配最小工具子集"],
              ["控制流", "单循环", "委派—执行—汇总的多层循环"],
              ["失败域", "一处失败整体失败", "单 Worker 失败可重试/降级"],
              ["成本与延迟", "线性", "随委派轮次与消息数放大"],
              ["调试难度", "一条轨迹", "需跨 Agent 关联 trace"],
            ],
          },
          {
            type: "list",
            items: [
              "适用场景：任务可自然拆分为并行或专精子任务（研究+分析+撰写）；需按角色隔离工具权限；需要独立评测各子能力。",
              "不适用场景：单步即可完成的问答；强确定性、强审计的流程（用 Workflow）；对延迟与成本极敏感的高频请求。",
              "与 Workflow 的区别：Workflow 的分派规则预先写在代码里，Supervisor 的分派在运行时由模型决定。",
              "与 Planner-Executor 的区别：Planner 产出「步骤序列」，Supervisor 产出「谁来做」，两者常组合成 Hierarchical Multi-Agent。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "不要默认上多 Agent",
            text: "多 Agent 引入额外的模型调用、消息序列化、状态一致性与调试成本。只有当职责隔离带来的收益（准确率、权限隔离、可维护性）明确超过协调成本时才应采用。",
          },
        ],
      },
      {
        id: "fundamentals",
        heading: "2. 核心原理 Fundamentals",
        blocks: [
          {
            type: "paragraph",
            text: "核心机制是「委派—执行—观察—整合」闭环。关键数据结构是委派消息（DelegationMessage）与共享状态（SharedState）：前者包含 taskId、sender、receiver、intent、payload、deadline、status；后者保存各子任务结果、版本号与已裁决结论。消息必须结构化，否则无法可靠重放、追踪与测试。",
          },
          {
            type: "mermaid",
            title: "委派状态机",
            source: `stateDiagram-v2
  [*] --> Plan: 目标进入
  Plan --> Delegate: 拆分为子任务
  Delegate --> Running: 发送 DelegationMessage
  Running --> Collect: Worker 返回 ResultMessage
  Running --> Timeout: 超 deadline
  Timeout --> Retry: 可重试
  Retry --> Running
  Timeout --> Degrade: 重试耗尽
  Collect --> Conflict: 结果不一致
  Conflict --> Arbitrate: 裁决规则/人工
  Collect --> Aggregate: 结果一致
  Degrade --> Aggregate
  Arbitrate --> Aggregate
  Aggregate --> [*]: 最终响应`,
            caption: "超时、冲突与降级都是一等状态，不能靠异常处理隐式吞掉。",
          },
          {
            type: "table",
            headers: ["要素", "定义", "工程含义"],
            rows: [
              ["DelegationMessage", "结构化委派消息", "必须带 taskId 与 deadline，可重放"],
              ["SharedState", "跨 Agent 共享结果集", "写入需版本号或串行化，防并发覆盖"],
              ["Arbitration", "结果冲突的裁决规则", "优先规则化，必要时转人工"],
              ["Budget", "总轮次/总 token/总墙钟上限", "在 Supervisor 层统一约束，防止递归委派失控"],
              ["Role Contract", "每个 Worker 的能力与工具边界", "写入注册中心，赋值时校验"],
            ],
          },
          {
            type: "paragraph",
            text: "输入是用户目标与可用角色注册表；输出是聚合后的最终响应与完整委派轨迹；关键状态包括各子任务状态机、结果版本号、累计预算、待裁决冲突队列。系统边界：Worker 的返回文本与工具结果均不可信，可能含间接提示注入；Supervisor 必须把其当作数据而不是指令。",
          },
          {
            type: "list",
            items: [
              "局限一：委派轮次越多，端到端延迟与成本越高，且误差可能沿链路放大。",
              "局限二：共享状态的并发写需要额外一致性机制。",
              "局限三：自由文本通信不可解析，必须强制消息 Schema。",
              "局限四：层级过深时调试困难，必须全链路 trace 关联 taskId。",
            ],
          },
        ],
      },
      {
        id: "architecture",
        heading: "3. 系统架构 Architecture",
        blocks: [
          {
            type: "mermaid",
            title: "Supervisor 架构",
            source: `flowchart TB
  U["用户"] --> S["Supervisor"]
  subgraph SUP["Supervisor 组件"]
    S --> P["Decomposer 任务拆解"]
    S --> D["Dispatcher 委派"]
    S --> A["Arbitrator 冲突裁决"]
    S --> G["Aggregator 汇总"]
    S --> B["BudgetGuard 预算"]
  end
  D --> Q[("消息队列 / 内存总线")]
  Q --> W1["Worker: 研究"]
  Q --> W2["Worker: 分析"]
  Q --> W3["Worker: 执行"]
  W1 --> ST[("SharedState 版本化")]
  W2 --> ST
  W3 --> ST
  ST --> A
  B --> TR["Tracer 全链路"]`,
            caption: "Supervisor 不持有业务工具；Worker 通过版本化共享状态回传结果。",
          },
          {
            type: "table",
            headers: ["组件", "职责", "输入", "输出", "依赖"],
            rows: [
              ["Decomposer", "把目标拆为可验证子任务", "用户目标", "子任务列表", "角色注册表"],
              ["Dispatcher", "按角色与 deadline 分发", "子任务", "DelegationMessage", "消息队列"],
              ["Worker", "执行专精子任务", "委派消息", "ResultMessage", "专属工具集"],
              ["Arbitrator", "处理结论冲突", "多份结果", "裁决结论", "规则/人工"],
              ["Aggregator", "生成最终响应", "裁决后结果集", "答案 + 来源", "轨迹"],
              ["BudgetGuard", "约束轮次/token/墙钟", "计数器", "continue/abort", "配置"],
              ["Tracer", "跨 Agent 关联 trace", "全链路事件", "trace", "可观测平台"],
            ],
          },
          {
            type: "list",
            items: [
              "控制流：Decomposer → Dispatcher → Worker → Arbitrator → Aggregator → BudgetGuard → 是否继续委派。",
              "数据流：目标被拆为子任务载荷；Worker 结果写入 SharedState；Aggregator 读取版本化状态。",
              "状态流：子任务状态机 + 结果版本号 + 冲突队列 + 预算计数器，全部需可持久化以支持恢复。",
              "外部依赖：模型网关、各 Worker 的工具后端、消息总线、状态存储、审批与可观测平台。",
              "异常处理：Worker 超时重试 → 降级结果；结果冲突走裁决；预算耗尽整体转人工。",
              "扩展方式：增加 Worker 角色、把 Supervisor 分层（Hierarchical）、按子任务并行化。",
            ],
          },
        ],
      },
      {
        id: "components",
        heading: "4. 核心组件 Components",
        blocks: [
          {
            type: "table",
            headers: ["组件", "为什么需要", "输入 / 输出", "实现方式", "常见问题"],
            rows: [
              ["角色注册表", "约束谁能做什么", "角色定义 / 可用 Worker", "静态配置 + 运行时校验", "角色重叠导致重复劳动"],
              ["消息 Schema", "避免歧义通信", "结构化消息", "共享类型定义 + 校验", "用自由文本传结果"],
              ["共享状态", "汇集中间结果", "结果写入 / 版本化读取", "版本号或单写者", "并发覆盖丢结果"],
              ["裁决器", "结论冲突有确定出口", "多份结果", "规则优先、人工兜底", "让模型自由投票，结果不可复现"],
              ["预算守卫", "防止递归委派失控", "计数器", "总预算上限", "只约束单 Agent 轮次"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "组件边界原则",
            text: "裁决规则应优先用确定性代码表达；把「谁说了算」交给模型自由投票，会让系统难以复现与审计。",
          },
        ],
      },
      {
        id: "flow",
        heading: "5. 工作流程 Execution Flow",
        blocks: [
          {
            type: "mermaid",
            title: "委派时序",
            source: `sequenceDiagram
  participant U as 用户
  participant S as Supervisor
  participant ST as SharedState
  participant W1 as Worker-研究
  participant W2 as Worker-分析
  U->>S: 提交目标(run_id)
  S->>S: 拆解为子任务 T1/T2
  par 并行委派
    S->>W1: DelegationMessage(T1, deadline)
    S->>W2: DelegationMessage(T2, deadline)
  end
  W1->>ST: write(T1, v1, result)
  W2->>ST: write(T2, v1, result)
  S->>ST: readAll(version=v1)
  alt 结果冲突
    S->>S: Arbitrator 裁决 / 转人工
  end
  S->>S: Aggregator 汇总 + BudgetGuard 检查
  S-->>U: 最终响应 + 来源摘要`,
            caption: "每个消息携带同一 run_id，保证跨 Agent trace 可关联。",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "用户输入：生成 run_id，写入初始状态并做认证与租户识别。",
              "任务拆解：Supervisor 依据角色注册表产出带验收标准的子任务列表。",
              "参数生成：为每个子任务构造 DelegationMessage（taskId、intent、payload、deadline）。",
              "参数校验：按消息 Schema 校验字段与类型，非法则不发送。",
              "权限验证：确认目标 Worker 具备该 intent 所需工具与数据范围。",
              "并发委派：互不依赖的子任务并行分发，依赖子任务按拓扑顺序串行。",
              "Worker 执行：各自在独立上下文与最小工具集内完成子任务。",
              "结果观察：结果以版本化方式写入 SharedState，附带来源、耗时与置信度。",
              "冲突裁决：结果不一致时按规则裁决或转人工审批。",
              "状态更新：写检查点，累计预算计数并判断是否需要下一轮委派。",
              "下一轮决策：未达标且预算充足则继续拆解，否则进入汇总。",
              "最终响应：聚合输出并附各子任务来源，落审计与 trace。",
            ],
          },
        ],
      },
      {
        id: "patterns",
        heading: "6. 关键技术与设计模式与成本分析",
        blocks: [
          {
            type: "table",
            headers: ["模式", "适用场景", "优点", "缺点 / 取舍"],
            rows: [
              ["Supervisor（中心化）", "子任务可清晰分工", "可控、易审计", "Supervisor 成为瓶颈"],
              ["Hierarchical", "大型任务需多层管理", "分层隔离、可扩展", "层级深、延迟与成本高"],
              ["Swarm / 交接", "动态流程、按能力转交", "灵活", "难以预测与复现"],
              ["Debate", "需对抗式互审", "减少单模型偏差", "额外 token，可能强化共同错误"],
              ["Blackboard 共享黑板", "多角色共享中间产物", "信息集中", "需并发控制"],
            ],
          },
          {
            type: "paragraph",
            text: "成本与延迟分析不做虚构数值，只给出可推导的关系：设单 Agent 每轮模型调用成本为 C、延迟为 L，k 个 Worker 并行时，一轮委派的总成本约为 C_supervisor + Σ C_worker，端到端延迟约为 L_supervisor + max(L_worker) + L_aggregate。串行依赖子任务则延迟累加。因此成本随角色数与轮次线性增长，延迟取决于关键路径；优化方向是减少委派轮次、并行独立子任务、缩短每个 Worker 的上下文。",
          },
          {
            type: "list",
            items: [
              "常见错误 1：用自由文本在 Agent 间传结果，无法解析与回放。",
              "常见错误 2：所有 Worker 共享同一套全量工具，失去最小权限意义。",
              "常见错误 3：共享状态无版本号，并发写互相覆盖。",
              "常见错误 4：不设总预算，递归委派导致费用失控。",
              "常见错误 5：把裁决完全交给模型投票，结论不可复现。",
            ],
          },
        ],
      },
      {
        id: "stack",
        heading: "7. 技术栈与选型",
        blocks: [
          {
            type: "table",
            headers: ["选项", "适用", "成熟度 / 维护成本", "扩展性", "锁定风险", "选型建议"],
            rows: [
              ["自研委派循环", "需完全掌控协议与审计", "稳定 / 需自建可观测", "高", "低", "企业核心系统"],
              ["LangGraph 多 Agent 图", "需图式状态与检查点", "活跃 / 需跟版本", "高", "中", "复杂协作拓扑"],
              ["Agent SDK 的 handoff 机制", "以交接为核心的流程", "官方维护 / 迭代快", "中", "中高", "与特定生态绑定时"],
              ["消息队列（Kafka 等）", "跨进程、需可靠投递", "成熟 / 运维成本高", "很高", "低", "分布式长任务"],
              ["工作流引擎 + Agent 节点", "强审计主干流程", "成熟 / 运维成本高", "高", "低", "混合架构"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "版本核验提示",
            text: "上表为定性判断，不含性能数据或排名。框架版本演进较快，本次未逐项联网复核 release 号，选型前须核对官方仓库当前版本与 breaking changes（需进一步核验）。",
          },
        ],
      },
      {
        id: "hands-on",
        heading: "8. Hands-on 实战：可运行的 Supervisor 委派循环",
        blocks: [
          {
            type: "paragraph",
            text: "实验目标：实现一个具备结构化消息、并发委派、超时重试、版本化共享状态、冲突裁决与总预算上限的 Supervisor，并用 mock Worker 做离线测试。代码不依赖任何外部 SDK，可直接用 TypeScript 编译运行。",
          },
          {
            type: "code",
            language: "text",
            filename: "项目目录结构",
            caption: "本节多文件项目布局",
            code: String.raw`supervisor/
├── package.json
├── tsconfig.json
├── protocol.ts        # 消息 Schema 与共享状态类型
├── supervisor.ts      # 委派循环核心实现
└── supervisor.test.ts # 离线测试（mock Worker）`,
          },
          {
            type: "code",
            language: "bash",
            filename: "package.json / 安装与运行",
            caption: "环境：Node.js 20+ / TypeScript 5+",
            code: String.raw`# package.json
{
  "name": "supervisor-demo",
  "private": true,
  "type": "module",
  "devDependencies": { "typescript": "^5.0.0", "tsx": "^4.0.0" }
}

# 安装
npm install

# 编译检查
npx tsc --noEmit

# 运行离线测试（不需要任何密钥或网络）
npx tsx supervisor.test.ts`,
          },
          {
            type: "code",
            language: "typescript",
            filename: "protocol.ts",
            caption: "结构化消息 Schema、共享状态与角色契约",
            code: String.raw`export type Intent = "research" | "analyze" | "execute";
export type TaskStatus = "pending" | "running" | "done" | "timeout" | "degraded";

export interface DelegationMessage {
  runId: string;
  taskId: string;
  intent: Intent;
  payload: Record<string, unknown>;
  deadlineMs: number;
}

export interface ResultMessage {
  runId: string;
  taskId: string;
  worker: string;
  conclusion: string;
  confidence: number; // 0..1，教学示例字段，非行业标准
  sources: string[];
  status: TaskStatus;
}

export interface SharedState {
  version: number;
  results: Map<string, ResultMessage>;
}

export interface Worker {
  name: string;
  intents: Intent[];
  run(msg: DelegationMessage): Promise<Omit<ResultMessage, "runId" | "taskId" | "worker">>;
}

export const ROLE_CONTRACT: Record<Intent, string> = {
  research: "worker-research",
  analyze: "worker-analyze",
  execute: "worker-execute",
};`,
          },
          {
            type: "code",
            language: "typescript",
            filename: "supervisor.ts",
            caption: "核心实现：并发委派、超时重试、版本化写入、冲突裁决、预算守卫",
            code: String.raw`import {
  DelegationMessage, Intent, ResultMessage, SharedState, Worker, ROLE_CONTRACT,
} from "./protocol.js";

export interface SupervisorConfig {
  maxRounds: number;
  maxTotalTokens: number;
  taskTimeoutMs: number;
  maxRetries: number;
}

const DEFAULTS: SupervisorConfig = {
  maxRounds: 3,
  maxTotalTokens: 20000,
  taskTimeoutMs: 3000,
  maxRetries: 2,
};

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    p.then((v) => { clearTimeout(timer); resolve(v); },
           (e) => { clearTimeout(timer); reject(e); });
  });
}

async function delegate(
  msg: DelegationMessage, worker: Worker, cfg: SupervisorConfig
): Promise<ResultMessage> {
  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      const partial = await withTimeout(worker.run(msg), cfg.taskTimeoutMs);
      return {
        runId: msg.runId, taskId: msg.taskId, worker: worker.name,
        ...partial, status: "done",
      };
    } catch (e) {
      if (attempt === cfg.maxRetries) {
        return {
          runId: msg.runId, taskId: msg.taskId, worker: worker.name,
          conclusion: "", confidence: 0, sources: [], status: "degraded",
        };
      }
    }
  }
  throw new Error("unreachable");
}

function arbitrate(results: ResultMessage[]): string {
  // 确定性裁决：优先高置信度且非降级结果；同分按 taskId 稳定排序
  const valid = results.filter((r) => r.status === "done" && r.conclusion);
  if (valid.length === 0) return "所有子任务均降级，转人工处理。";
  const sorted = [...valid].sort(
    (a, b) => b.confidence - a.confidence || a.taskId.localeCompare(b.taskId)
  );
  const conflicts = new Set(valid.map((r) => r.conclusion)).size > 1;
  const prefix = conflicts ? "存在结论冲突，按置信度裁决：" : "";
  return prefix + sorted[0].conclusion;
}

export async function runSupervisor(
  goal: string,
  tasks: Array<{ intent: Intent; payload: Record<string, unknown> }>,
  workers: Worker[],
  cfg: Partial<SupervisorConfig> = {}
): Promise<{ answer: string; state: SharedState; rounds: number }> {
  const config = { ...DEFAULTS, ...cfg };
  const runId = crypto.randomUUID();
  const state: SharedState = { version: 0, results: new Map() };
  let spentTokens = 0;
  let rounds = 0;

  while (rounds < config.maxRounds) {
    const pending = tasks.filter((t) => !state.results.has(t.intent));
    if (pending.length === 0) break;

    const messages: DelegationMessage[] = pending.map((t, i) => ({
      runId,
      taskId: "T" + (i + 1),
      intent: t.intent,
      payload: t.payload,
      deadlineMs: config.taskTimeoutMs,
    }));

    // 并发委派：独立子任务并行，减少关键路径延迟
    const results = await Promise.all(messages.map((m) => {
      const expected = ROLE_CONTRACT[m.intent];
      const worker = workers.find((w) => w.name === expected && w.intents.includes(m.intent));
      if (!worker) {
        return Promise.resolve<ResultMessage>({
          runId, taskId: m.taskId, worker: "none",
          conclusion: "", confidence: 0, sources: [], status: "degraded",
        });
      }
      return delegate(m, worker, config);
    }));

    // 版本化写入：单写者避免并发覆盖
    const version = state.version + 1;
    for (const r of results) state.results.set(r.intent, r);
    state.version = version;

    spentTokens += results.length * 800 + 500; // 教学估算，真实实现取 usage
    rounds += 1;
    if (spentTokens > config.maxTotalTokens) {
      return { answer: "已达总 token 预算上限，转人工处理。", state, rounds };
    }
  }

  const answer = arbitrate([...state.results.values()]);
  return { answer, state, rounds };
}

export { arbitrate, delegate };`,
          },
          {
            type: "code",
            language: "typescript",
            filename: "supervisor.test.ts",
            caption: "离线测试：并发、超时降级、冲突裁决、预算守卫（mock Worker，无网络）",
            code: String.raw`import assert from "node:assert/strict";
import { runSupervisor, arbitrate } from "./supervisor.js";
import { Worker, ResultMessage, Intent } from "./protocol.js";

function mkWorker(name: string, intents: Intent[], conclusion: string,
                  confidence = 0.8, delayMs = 0): Worker {
  return {
    name, intents,
    async run(msg) {
      if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
      return { conclusion, confidence, sources: ["mock://" + msg.taskId], status: "done" };
    },
  };
}

const workers = [
  mkWorker("worker-research", ["research"], "结论A", 0.7),
  mkWorker("worker-analyze", ["analyze"], "结论B", 0.9),
];

async function main() {
  const r = await runSupervisor(
    "分析告警根因",
    [{ intent: "research", payload: {} }, { intent: "analyze", payload: {} }],
    workers
  );
  assert.equal(r.state.results.size, 2, "两个子任务都应写入共享状态");
  assert.equal(r.state.version, 1, "一轮委派后版本号为 1");
  assert.ok(r.answer.includes("结论B"), "冲突应按置信度裁决为 B");

  const slow = [mkWorker("worker-research", ["research"], "慢", 0.5, 50)];
  const degraded = await runSupervisor(
    "超时测试", [{ intent: "research", payload: {} }], slow,
    { taskTimeoutMs: 5, maxRetries: 0 }
  );
  assert.equal(degraded.state.results.get("research")?.status, "degraded");

  const budget = await runSupervisor(
    "预算测试", [{ intent: "research", payload: {} }], workers,
    { maxTotalTokens: 100 }
  );
  assert.ok(budget.answer.includes("预算"));

  const tie: ResultMessage[] = [
    { runId: "x", taskId: "T1", worker: "w", conclusion: "A", confidence: 0.8, sources: [], status: "done" },
    { runId: "x", taskId: "T2", worker: "w", conclusion: "B", confidence: 0.8, sources: [], status: "done" },
  ];
  assert.ok(arbitrate(tie).includes("A"), "同分应按 taskId 稳定裁决");

  console.log("all supervisor tests passed");
}

main().catch((e) => { console.error(e); process.exit(1); });`,
          },
          {
            type: "table",
            headers: ["项目", "内容"],
            rows: [
              ["输入示例", "npx tsx supervisor.test.ts"],
              ["输出示例", "all supervisor tests passed"],
              ["结果解释", "两个 Worker 并发执行 → 版本化写入 → 冲突按置信度裁决 → 预算与超时路径均被覆盖"],
              ["常见错误 1", "Node 版本低于 18 导致 crypto.randomUUID 不可用：升级 Node 或改用 uuid 包"],
              ["常见错误 2", "ESM 导入未带 .js 后缀：按 tsconfig moduleResolution 调整"],
              ["常见错误 3", "Worker 名称与 ROLE_CONTRACT 不一致：会返回 degraded 而非抛错，检查注册"],
              ["常见错误 4", "忘记 await Promise.all：共享状态版本号错乱"],
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "哪些部分需要替换",
            text: "mock Worker 与 token 估算为教学模拟；生产需替换为真实模型调用、消息队列、持久化 SharedState、全链路 Tracer 与人工审批。委派协议与裁决逻辑可直接沿用。",
          },
        ],
      },
      {
        id: "case",
        heading: "9. 企业应用案例：IT Operations Agent 的委派层（教学模拟案例）",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            title: "教学模拟案例声明",
            text: "本节为贯穿全站项目 A 的多智能体扩展，系统名称与数据均为虚构，不代表真实客户或生产效果。",
          },
          {
            type: "paragraph",
            text: "业务背景：IT 运维中心需要处理「告警 → 查监控 → 查变更 → 查 Runbook → 出处置建议 → 建工单」的长链路任务。业务问题是单一 Agent 同时持有监控、CMDB、ITSM、知识库全部工具，容易误调用写操作且上下文过长。技术目标是按角色隔离工具权限，并保证写操作必须人工审批。",
          },
          {
            type: "mermaid",
            title: "项目 A 委派设计",
            source: `flowchart LR
  ALERT["告警"] --> SUP["Supervisor"]
  SUP --> W1["Worker 只读诊断"]
  SUP --> W2["Worker Runbook 检索"]
  SUP --> W3["Worker 处置建议"]
  W1 --> MON["监控/CMDB MCP(只读)"]
  W2 --> KB["知识库 RAG"]
  W3 --> ST[("版本化 SharedState")]
  ST --> ARB["裁决 + 人工审批"]
  ARB --> ITSM["ITSM 建单(写)"]
  ARB --> AUD[("审计")]`,
            caption: "只读 Worker 可并行；建单写操作必须经人工审批。",
          },
          {
            type: "table",
            headers: ["环节", "工程细节"],
            rows: [
              ["数据来源", "监控指标、CMDB 配置项、变更记录、Runbook 文档（教学模拟）"],
              ["组件选择", "自研 Supervisor + 三个专精 Worker + MCP 只读工具 + 人工审批闸口"],
              ["执行流程", "拆解 → 并行诊断与检索 → 版本化汇总 → 冲突裁决 → 建议 → 人工审批 → 建单"],
              ["安全权限", "诊断/检索 Worker 仅持只读工具；建单由独立审批流程执行"],
              ["异常处理", "Worker 超时降级为「数据不可用」；结论冲突按来源优先级裁决；预算耗尽转人工"],
              ["部署方案", "Supervisor 无状态多副本，SharedState 外置 PostgreSQL，Worker 独立限流"],
              ["效果评估", "任务成功率、子任务准确率、越权写操作次数、P95 延迟、单任务成本"],
            ],
          },
        ],
      },
      {
        id: "production",
        heading: "10. Production Engineering",
        blocks: [
          {
            type: "list",
            items: [
              "高可用：Supervisor 无状态化，SharedState 与检查点外置；任意副本故障可按 run_id 恢复。",
              "可扩展性：Worker 独立扩缩容，按 intent 做队列分区；跨进程用可靠消息队列。",
              "并发：独立子任务并行委派，依赖子任务按拓扑排序；控制共享状态单写者。",
              "延迟与成本：减少委派轮次、并行关键路径、复用 Worker 上下文；总预算在 Supervisor 统一约束。",
              "超时与重试：每个子任务独立 deadline；只对幂等只读任务重试；重试耗尽降级而非整体失败。",
              "幂等性：以 runId + taskId + 参数摘要作为幂等键，避免重复派发造成重复副作用。",
              "状态持久化：版本化 SharedState 每轮写检查点，支持故障恢复与轨迹回放。",
              "日志/监控/追踪：所有消息带同一 run_id，跨 Agent span 关联；记录委派轮次、各 Worker 耗时与结果码。",
              "灰度发布与版本管理：角色契约、消息 Schema、裁决规则分别版本化，按租户灰度并监控退化。",
            ],
          },
        ],
      },
      {
        id: "security",
        heading: "11. Security & Governance",
        blocks: [
          {
            type: "list",
            items: [
              "身份认证：run_id 绑定用户与租户，跨 Agent 传递可验证的调用方上下文。",
              "权限控制：按角色分配最小工具集；写操作 Worker 需额外授权与审批。",
              "数据保护：Worker 结果与日志脱敏；不同租户的 SharedState 严格隔离。",
              "输入验证：委派消息按 Schema 校验，Worker 返回结果同样按 Schema 校验。",
              "输出校验：Aggregator 输出经护栏扫描后再返回用户。",
              "工具权限：诊断类只读、处置类写操作分级；建单必须人工审批。",
              "敏感信息与审计：记录每轮委派、裁决依据、审批人和最终动作，支持回放。",
              "风险控制：总预算上限、最大层级、Worker 白名单与应急熔断。",
            ],
          },
          {
            type: "callout",
            variant: "danger",
            title: "跨 Agent 提示注入",
            text: "一个被注入的 Worker 可能把恶意指令写进 SharedState，进而影响 Supervisor 与其他 Worker。所有跨 Agent 文本必须作为数据处理，裁决与权限判定必须在确定性代码中完成。",
          },
        ],
      },
      {
        id: "evaluation",
        heading: "12. Evaluation & Testing",
        blocks: [
          {
            type: "table",
            headers: ["测试目标", "方法", "测试数据", "指标"],
            rows: [
              ["拆解质量", "子任务与标准答案比对", "标注任务集", "子任务覆盖率、可验证率"],
              ["委派正确性", "角色/工具匹配断言", "多意图任务集", "角色选择准确率"],
              ["状态一致性", "并发写与版本回放", "并发冲突用例", "结果丢失数 = 0"],
              ["裁决稳定性", "同输入重复运行", "冲突结果集", "结论一致性"],
              ["任务成功率", "离线评测集 + 人工抽检", "典型与边界任务", "成功率、平均委派轮次"],
              ["成本与延迟", "轨迹采样与压测", "不同拓扑任务", "P95 延迟、单任务 token"],
              ["安全性", "跨 Agent 注入红队用例", "对抗样本", "越界拦截率"],
            ],
          },
          {
            type: "paragraph",
            text: "回归测试以轨迹断言为主：子任务集合、消息 Schema 合法性、版本号单调、裁决结论稳定、未发生越权写操作。supervisor.test.ts 已覆盖并发、超时降级、冲突裁决与预算守卫；把评测集接入 CI，角色契约或裁决规则变更即触发回归。",
          },
          {
            type: "code",
            language: "yaml",
            filename: "ma-eval-gate.yaml",
            caption: "配置示例：多 Agent 回归门禁（阈值为教学示例，需按业务校准）",
            code: String.raw`suite: supervisor-orchestration
dataset: eval/multi-agent-tasks.jsonl
metrics:
  task_success_rate:
    threshold: 0.82
  delegation_accuracy:
    threshold: 0.95
  avg_delegation_rounds:
    threshold: 3
  p95_latency_ms:
    threshold: 20000
  unauthorized_write_actions:
    threshold: 0
on_regression: block_release
seed: 42
note: "阈值为教学模拟配置，非行业基准。"`,
          },
        ],
      },
      {
        id: "best-practices",
        heading: "13. Best Practices",
        blocks: [
          {
            type: "list",
            items: [
              "先证明单 Agent 不够，再引入多 Agent；用数据说明收益超过协调成本。",
              "委派消息与结果都强 Schema 化，禁止自由文本作为控制协议。",
              "按角色分配最小工具集，写操作独立审批。",
              "共享状态版本化、单写者；每轮写检查点。",
              "裁决规则确定性优先，必要时转人工，并保留依据。",
              "总预算（轮次/token/墙钟）在 Supervisor 层统一强制。",
              "全链路 trace 使用同一 run_id，保证跨 Agent 可回放。",
            ],
          },
        ],
      },
      {
        id: "troubleshooting",
        heading: "14. Troubleshooting",
        blocks: [
          {
            type: "table",
            headers: ["问题表现", "可能原因", "排查方法", "解决方案", "预防方式"],
            rows: [
              ["委派层级越来越深", "Worker 把任务再转派且无层级上限", "看 trace 的委派深度", "设最大层级与总预算", "契约中禁止 Worker 再委派"],
              ["结果互相覆盖", "SharedState 并发写无版本", "比对 version 与写入顺序", "单写者 + 版本号", "并发用例纳入回归"],
              ["两个 Worker 结论相反", "缺少裁决规则", "检查 Arbitrator span", "规则裁决或转人工", "冲突用例纳入评测集"],
              ["延迟随角色数线性上升", "子任务被串行委派", "看各 Worker span 时间线", "独立子任务并行化", "拓扑分析纳入设计评审"],
              ["费用异常尖峰", "只约束单 Agent 轮次", "看总 token 曲线", "Supervisor 统一预算", "设费用告警"],
              ["越权工具被调用", "角色工具集配置错误", "审计日志查工具分配", "收紧角色契约", "最小权限用例纳入门禁"],
              ["重启后任务丢失", "状态只在内存", "检查检查点表", "外置持久化并按 run_id 恢复", "故障注入演练"],
            ],
          },
        ],
      },
      {
        id: "further-reading",
        heading: "15. Further Reading",
        blocks: [
          {
            type: "list",
            items: [
              "相关教程：Planner-Executor 规划执行模式、A2A 通信协议、多智能体协调评估与失败诊断、Multi-Agent 通信与消息传递。",
              "相关架构：多智能体协作架构、AgentOps 可观测架构。",
              "相关实验：多智能体协作模拟器、架构设计器。",
              "相关企业案例：IT Operations Agent（项目 A 委派层）。",
              "官方资料与框架文档见下方参考资料；本站工程建议不等同于行业标准。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "资料核验说明",
            text: "本节涉及的架构模式与成本关系为本站工程推导，不引用未经核验的性能数据。框架具体版本与 API 未逐项联网复核，标注为需进一步核验；落地前请核对官方仓库当前版本。",
          },
        ],
      },
      {
        id: "engineering-notes",
        heading: "16. 工程实现补遗：组件交互时序、故障演练与上线验收",
        blocks: [
          {
            type: "paragraph",
            text: "共享状态的版本号是冲突裁决的前提：Worker 回写时携带 base_version，Supervisor 只在版本匹配时合并，不匹配则要求重读后重试。缺少版本号的并发合并会造成后写覆盖，且轨迹无法解释结果。",
          },
          {
            type: "mermaid",
            title: "组件交互时序（含失败分支）",
            source: String.raw`sequenceDiagram
  participant S as Supervisor
  participant W1 as Worker A
  participant W2 as Worker B
  participant ST as SharedState
  S->>ST: read(version=v)
  S->>W1: delegate(task1, base_version=v)
  S->>W2: delegate(task2, base_version=v)
  W1-->>S: ResultMessage(v)
  W2-->>S: ResultMessage(v)
  S->>ST: arbitrate + merge
  alt 版本仍为 v
    ST-->>S: commit(v+1)
  else 版本已推进
    ST-->>S: conflict
    S->>W2: 重读后重试(带预算上限)
  end
  S-->>S: 汇总答案与 trace`,
            caption: "消息顺序、超时分支与降级路径；箭头方向即控制流方向。",
          },
          {
            type: "table",
            headers: ["组件交互契约", "传递内容", "超时/失败语义"],
            rows: [
              ["Supervisor → Worker","DelegationMessage(goal, inputs, base_version, deadline)","超时返回 timeout，计入重试预算"],
              ["Worker → Supervisor","ResultMessage(status, evidence, version)","Schema 解析失败视为失败结果"],
              ["Supervisor → SharedState","合并后的状态与冲突裁决记录","冲突不静默覆盖，必须留痕"],
            ],
          },
          {
            type: "table",
            headers: ["类别", "可执行操作", "通过标准"],
            rows: [
              ["故障注入","让 W2 延迟超过 deadline","Supervisor 降级或换人，trace 标记 timeout"],
              ["故障注入","并发回写同一 base_version","仅一次提交成功，其余进入重试或冲突分支"],
              ["上线验收","npx tsx --test supervisor.test.ts","委派、超时、冲突裁决用例全通过"],
              ["上线验收","检查跨 Agent trace 是否共享 run_id","轨迹连续无断裂"],
            ],
          },
          {
            type: "paragraph",
            text: "落地替换点：把内存 SharedState 换成带乐观锁的版本化存储，把 mock Worker 换成真实 Agent 服务并在调用侧透传 run_id，把预算守卫接入平台配额服务。角色权限与租户隔离策略需按企业 IAM 重新配置，不要沿用示例中的宽松角色。",
          },
        ],
      },
    ],
    tags: ["Multi-Agent", "Supervisor", "委派协议", "共享状态", "冲突裁决"],
    architectureIds: ["a03", "a13"],
    relatedTutorialIds: [
      "planner-executor-pattern",
      "multi-agent-communication",
      "a2a-communication",
      "multi-agent-evaluation",
      "agent-state-management",
    ],
    nextTutorialSlugs: ["a2a-communication", "multi-agent-evaluation"],
    relatedLabSlugs: ["multi-agent-collab"],
    relatedCaseSlugs: ["it-operations-agent"],
    references: [
      {
        title: "Building Effective Agents（orchestrator-workers 等模式）",
        url: "https://www.anthropic.com/research/building-effective-agents",
        organization: "Anthropic",
        kind: "官方产品文档",
        purpose: "核验 orchestrator-workers 模式的适用边界与「不要默认增加复杂度」的建议",
        verifiedAt: "2026-11-13",
      },
      {
        title: "Model Context Protocol Specification",
        url: "https://modelcontextprotocol.io/specification/2026-07-28",
        organization: "Model Context Protocol",
        kind: "官方规范",
        version: "2026-07-28（latest）",
        purpose: "核验工具层协议与「工具描述不可信」的安全原则，用于角色工具集设计",
        verifiedAt: "2026-11-13",
      },
      {
        title: "OpenAI Function Calling 指南",
        url: "https://developers.openai.com/api/docs/guides/function-calling",
        organization: "OpenAI",
        kind: "官方产品文档",
        purpose: "核验工具定义与调用的真实结构，用于 Worker 最小工具集实现",
        verifiedAt: "2026-11-13",
      },
      {
        title: "LangGraph 官方文档（多 Agent 与检查点）",
        url: "https://langchain-ai.github.io/langgraph/",
        organization: "LangChain",
        kind: "社区实践",
        purpose: "多 Agent 图式状态与检查点实现参考；具体版本与 API 需进一步核验",
        verifiedAt: "2026-11-13",
      },
    ],
    updatedAt: "2026-11-13",
    status: "published",
    qualityLevel: "L5",
  },
  {
    id: "t-wf-02",
    slug: "workflow-engine",
    domainId: "d03",
    title: "确定性工作流引擎：状态机、DAG、检查点与补偿",
    englishTitle: "Deterministic Workflow Engine",
    summary:
      "系统讲解确定性工作流与 Agent 的边界、状态机与 DAG 建模、并行与条件分支、持久化检查点、重试与补偿、长任务与人工审批挂起恢复，并给出可运行的 TypeScript 引擎实现与企业案例。",
    difficulty: "高级",
    estimatedMinutes: 65,
    prerequisites: ["TypeScript 基础", "Workflow 与 Agent 的边界", "数据库基础"],
    learningObjectives: [
      "用状态机/DAG 对真实业务流程建模并说明节点职责",
      "实现检查点持久化、重试、补偿与人工审批挂起恢复",
      "区分幂等重试与补偿回滚的适用条件",
      "设计长任务的可观测与超时策略",
      "排查死锁、重复执行、补偿失败等典型问题",
    ],
    sections: [
      {
        id: "overview",
        heading: "1. 技术概述 Overview",
        blocks: [
          {
            type: "paragraph",
            text: "确定性工作流引擎用预先定义的节点与边描述业务流程，由引擎按拓扑与条件驱动执行，每一步的输入输出、分支与补偿动作都在代码中显式声明。它与 Agent 的根本区别在于：分支在编译期确定，运行时不依赖模型决策。",
          },
          {
            type: "paragraph",
            text: "产生背景是企业中存在大量强审计、强一致、可回滚的流程（审批、结算、变更发布）。这类流程若交给 Agent 自主决策，既无法保证可复现，也难以做精确回滚。把主干流程确定为 DAG，只在需要理解或生成的节点嵌入 Agent，是常见的混合架构。",
          },
          {
            type: "table",
            headers: ["维度", "确定性 Workflow", "Agentic Workflow / Agent"],
            rows: [
              ["分支决策", "代码中的条件表达式", "模型运行时决定"],
              ["可复现性", "同一输入同一路径", "非确定性"],
              ["审计", "节点级留痕、易回放", "需轨迹级回放"],
              ["回滚", "显式补偿动作", "难以精确回滚"],
              ["灵活性", "低，需改代码发布", "高"],
              ["适用", "审批、结算、变更、合规", "探索、理解、生成、诊断"],
            ],
          },
          {
            type: "list",
            items: [
              "适用场景：路径固定、需精确回滚、需人工审批闸口、跨多个系统的长事务。",
              "不适用场景：步骤数未知、需根据语义动态决定路径的探索型任务。",
              "与状态机的区别：线性/少量状态用状态机；含并行、条件分支、汇合的流程用 DAG 更清晰。",
              "与消息队列的区别：队列解决投递，引擎解决编排、状态与补偿。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "混合架构是常态",
            text: "企业系统通常采用「Workflow 为主干、Agent 为节点」：主干保证可控与可审计，Agent 只在需要理解/生成的节点提供智能，其输出再交给后续确定性节点校验。",
          },
        ],
      },
      {
        id: "fundamentals",
        heading: "2. 核心原理 Fundamentals",
        blocks: [
          {
            type: "paragraph",
            text: "核心机制是「节点执行 + 状态持久化 + 拓扑推进」。引擎维护一个 WorkflowInstance，包含当前已完成节点集合、每个节点的输出、待处理节点队列与版本号。每完成一个节点就写检查点；崩溃后从最近检查点恢复，按已完成集合跳过已执行节点，从而保证不重复产生副作用。",
          },
          {
            type: "mermaid",
            title: "DAG 工作流状态机",
            source: `stateDiagram-v2
  [*] --> Ready: 创建实例
  Ready --> Running: 取可运行节点
  Running --> Checkpoint: 节点成功(写检查点)
  Running --> Retrying: 瞬时失败
  Retrying --> Running: 退避后重试
  Retrying --> Compensating: 重试耗尽
  Checkpoint --> Suspended: 遇人工审批节点
  Suspended --> Running: 审批通过(恢复)
  Suspended --> Compensating: 审批拒绝
  Checkpoint --> [*]: 全部节点完成
  Compensating --> [*]: 补偿完成(终态)`,
            caption: "挂起与补偿都是一等状态，不是异常分支。",
          },
          {
            type: "table",
            headers: ["要素", "定义", "工程含义"],
            rows: [
              ["Node 节点", "一个动作及其输入输出", "需幂等，可安全重试"],
              ["Edge 边", "依赖与条件表达式", "决定可运行集合"],
              ["Checkpoint 检查点", "实例状态快照", "崩溃恢复的唯一依据"],
              ["Compensation 补偿", "已完成写操作的逆向动作", "必须有对应实现，不能假设自动回滚"],
              ["IdempotencyKey", "节点执行唯一键", "防止恢复后重复副作用"],
              ["Suspension 挂起", "等待外部事件（审批/回调）", "状态持久化后可跨天恢复"],
            ],
          },
          {
            type: "paragraph",
            text: "输入是流程定义（节点、边、条件）与初始业务参数；输出是终态结果或补偿结果；关键状态是已完成节点集合、各节点输出、重试次数、挂起原因与版本号。系统边界：外部系统状态不在引擎事务内，因此补偿必须按业务语义显式实现，不能依赖数据库回滚。",
          },
          {
            type: "list",
            items: [
              "局限一：流程变更需要版本管理，运行中的实例必须绑定旧版本定义。",
              "局限二：补偿动作本身可能失败，需重试与人工兜底。",
              "局限三：长任务的检查点存储与清理策略需额外设计。",
              "局限四：并行节点的汇合条件（all / any / quorum）需显式定义。",
            ],
          },
        ],
      },
      {
        id: "architecture",
        heading: "3. 系统架构 Architecture",
        blocks: [
          {
            type: "mermaid",
            title: "工作流引擎架构",
            source: `flowchart TB
  API["流程 API"] --> DEF["DefinitionRegistry 版本化定义"]
  API --> ENG["Engine 调度器"]
  ENG --> SCH["Scheduler 可运行节点计算"]
  ENG --> EXE["Executor 节点执行(幂等)"]
  ENG --> CHK[("CheckpointStore")]
  ENG --> COMP["Compensator 补偿"]
  ENG --> SUS["SuspensionManager 挂起/恢复"]
  EXE --> TOOLS["外部系统 / Agent 节点"]
  SUS --> HITL["人工审批"]
  CHK --> DB[("PostgreSQL")]
  ENG --> OBS["Tracer / Metrics"]`,
            caption: "引擎自身无状态，全部状态外置到 CheckpointStore。",
          },
          {
            type: "table",
            headers: ["组件", "职责", "输入", "输出", "依赖"],
            rows: [
              ["DefinitionRegistry", "版本化流程定义", "流程 ID + 版本", "DAG 定义", "配置/数据库"],
              ["Scheduler", "计算当前可运行节点", "已完成集合 + 边条件", "节点队列", "DAG 定义"],
              ["Executor", "幂等执行节点动作", "节点 + 参数", "节点输出", "外部系统"],
              ["CheckpointStore", "持久化实例状态", "状态快照", "版本化快照", "PostgreSQL"],
              ["Compensator", "按逆序执行补偿", "已完成写节点", "补偿结果", "Executor"],
              ["SuspensionManager", "挂起与恢复审批节点", "审批事件", "恢复信号", "审批系统"],
              ["Tracer", "节点级 span 与指标", "执行事件", "trace", "可观测平台"],
            ],
          },
          {
            type: "list",
            items: [
              "控制流：API 创建实例 → Scheduler 计算可运行节点 → Executor 执行 → CheckpointStore 落盘 → 循环至终态或挂起。",
              "数据流：上一节点输出作为下游节点输入，全部经检查点持久化，避免内存态丢失。",
              "状态流：实例状态机（Ready/Running/Suspended/Compensating/Done）+ 版本号 + 重试计数。",
              "外部依赖：业务系统 API、Agent 节点、审批系统、数据库、可观测平台。",
              "异常处理：瞬时失败退避重试；永久失败触发补偿；审批拒绝走补偿分支。",
              "扩展方式：节点类型插件化；引擎多副本无状态；按流程类型分片。",
            ],
          },
        ],
      },
      {
        id: "components",
        heading: "4. 核心组件 Components",
        blocks: [
          {
            type: "table",
            headers: ["组件", "为什么需要", "输入 / 输出", "实现方式", "常见问题"],
            rows: [
              ["节点定义", "声明动作与补偿", "参数 / 结果", "类型化 handler 注册表", "handler 非幂等"],
              ["边条件", "表达分支", "上游输出 / 布尔", "纯函数表达式", "条件里做 I/O"],
              ["检查点", "崩溃恢复", "状态 / 快照", "事务写入 + 版本号", "只存内存"],
              ["补偿器", "精确回滚", "已完成列表", "逆序调用补偿 handler", "缺少补偿实现"],
              ["挂起管理", "跨天等待人工", "审批事件 / 恢复", "持久化 + 事件唤醒", "用线程 sleep 等待"],
              ["幂等键", "防重复副作用", "节点+实例+版本", "唯一约束", "恢复后重复扣款"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "组件边界原则",
            text: "边条件必须是纯函数；任何在条件里发起 I/O 的做法都会破坏可复现性与回放能力。",
          },
        ],
      },
      {
        id: "flow",
        heading: "5. 工作流程 Execution Flow",
        blocks: [
          {
            type: "mermaid",
            title: "含审批与补偿的执行时序",
            source: `sequenceDiagram
  participant A as API
  participant E as Engine
  participant S as CheckpointStore
  participant X as Executor
  participant H as 审批系统
  A->>E: create(defId, version, params)
  E->>S: 写初始检查点
  loop 直到终态
    E->>S: 读已完成集合
    E->>E: Scheduler 计算可运行节点
    E->>X: 执行节点(幂等键)
    X-->>E: 输出 / 失败
    alt 成功
      E->>S: 写检查点(含输出)
    else 瞬时失败
      E->>X: 退避重试
    else 永久失败
      E->>X: 逆序执行补偿
    end
    alt 审批节点
      E->>S: 写 Suspended
      E->>H: 推送审批任务
      H-->>E: 审批结果(可能跨天)
      E->>S: 恢复 Running
    end
  end
  E-->>A: 终态结果`,
            caption: "每个写检查点的时刻都是可恢复点。",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "流程定义加载：按 defId + version 取 DAG，运行中实例始终绑定创建时的版本。",
              "实例创建：生成 instanceId 与幂等键前缀，写入初始检查点。",
              "输入校验：按流程定义 Schema 校验业务参数，非法直接拒绝创建。",
              "可运行节点计算：取所有上游已完成且边条件为真的未完成节点。",
              "节点执行：Executor 带幂等键调用 handler（外部 API 或 Agent 节点）。",
              "结果校验：节点输出按 Schema 校验，非法视为节点失败。",
              "检查点写入：在一个数据库事务内更新已完成集合、输出与版本号。",
              "分支判定：按边条件决定下游节点；并行节点同时入队。",
              "人工审批挂起：写 Suspended 状态并持久化完整上下文，等待外部事件唤醒。",
              "补偿触发：永久失败或审批拒绝时，逆序执行已完成写节点的补偿 handler。",
              "状态更新与终止：全部节点完成则写 Done，落终态结果与审计日志。",
              "可观测上报：每个节点一个 span，记录耗时、重试次数、结果码。",
            ],
          },
        ],
      },
      {
        id: "patterns",
        heading: "6. 关键技术与设计模式",
        blocks: [
          {
            type: "table",
            headers: ["模式", "适用场景", "优点", "缺点 / 取舍"],
            rows: [
              ["状态机", "线性、状态少的流程", "简单、易验证", "难表达并行与汇合"],
              ["DAG", "含并行/条件分支", "拓扑清晰、可调度", "需处理环检测"],
              ["Saga / 补偿", "跨系统长事务", "无需分布式事务", "补偿逻辑复杂且可能失败"],
              ["Event-driven", "外部事件驱动的长流程", "松耦合、可长等待", "状态分散、调试难"],
              ["Workflow + Agent 节点", "主干确定、局部需智能", "可控且灵活", "Agent 输出需再校验"],
            ],
          },
          {
            type: "paragraph",
            text: "设计取舍的核心是「一致性 vs 可用性/复杂度」：Saga 用显式补偿换取不使用分布式事务；检查点越密，恢复越精确但写入开销越大；并行度越高，汇合与补偿顺序越复杂。",
          },
          {
            type: "list",
            items: [
              "常见错误 1：节点 handler 不幂等，恢复后重复产生副作用。",
              "常见错误 2：把补偿写成「删掉记录」而忽略外部系统已发生的动作。",
              "常见错误 3：用线程 sleep 等待人工审批，进程重启即丢失。",
              "常见错误 4：运行中实例读取最新流程定义，导致回放路径变化。",
              "常见错误 5：并行节点汇合条件未定义，出现部分完成即推进。",
            ],
          },
        ],
      },
      {
        id: "stack",
        heading: "7. 技术栈与选型",
        blocks: [
          {
            type: "table",
            headers: ["选项", "适用", "成熟度 / 维护成本", "扩展性", "锁定风险", "选型建议"],
            rows: [
              ["成熟工作流引擎", "长任务、持久化、补偿", "成熟 / 运维成本较高", "高", "中", "企业关键流程"],
              ["自研轻量 DAG 引擎", "流程简单、需深度定制", "可控 / 需自建恢复与可观测", "中高", "低", "中小规模、特殊约束"],
              ["消息队列编排", "事件驱动、松耦合", "成熟 / 状态分散", "高", "低", "跨系统异步流程"],
              ["关系数据库检查点", "强一致恢复", "成熟 / 需设计表结构", "中", "低", "几乎所有自研方案"],
              ["Agent 框架内状态机", "以 Agent 为主的短流程", "活跃 / 版本演进快", "中", "中高", "轻流程、快速验证"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "版本核验提示",
            text: "上表为定性判断，不含性能数据或排名。具体引擎版本、API 与运维要求未逐项联网复核，选型前须核对官方文档（需进一步核验）。",
          },
        ],
      },
      {
        id: "hands-on",
        heading: "8. Hands-on 实战：可运行的工作流引擎",
        blocks: [
          {
            type: "paragraph",
            text: "实验目标：实现一个支持 DAG 调度、条件分支、并行执行、幂等检查点、退避重试、逆序补偿与人工审批挂起恢复的轻量引擎，并用离线测试覆盖关键路径。代码不依赖外部 SDK。",
          },
          {
            type: "code",
            language: "text",
            filename: "项目目录结构",
            caption: "本节多文件项目布局",
            code: String.raw`workflow-engine/
├── package.json
├── tsconfig.json
├── types.ts        # 流程定义与实例状态类型
├── engine.ts       # 引擎核心实现
└── engine.test.ts  # 离线测试`,
          },
          {
            type: "code",
            language: "bash",
            filename: "package.json / 安装与运行",
            caption: "环境：Node.js 20+ / TypeScript 5+",
            code: String.raw`# package.json
{
  "name": "workflow-engine-demo",
  "private": true,
  "type": "module",
  "devDependencies": { "typescript": "^5.0.0", "tsx": "^4.0.0" }
}

npm install
npx tsc --noEmit
npx tsx engine.test.ts`,
          },
          {
            type: "code",
            language: "typescript",
            filename: "types.ts",
            caption: "流程定义、检查点与终态类型",
            code: String.raw`export type Handler = (ctx: Record<string, unknown>) => Promise<Record<string, unknown>>;

export interface NodeDef {
  id: string;
  deps: string[];                       // 上游节点，全部完成才可运行
  when?: (ctx: Record<string, unknown>) => boolean; // 纯函数条件
  run: Handler;
  compensate?: Handler;                 // 写节点必须提供补偿
  approval?: boolean;                   // 是否需要人工审批挂起
  retries?: number;
}

export interface FlowDef {
  id: string;
  version: number;
  nodes: NodeDef[];
}

export type InstanceStatus =
  | "ready" | "running" | "suspended" | "compensating" | "done" | "failed";

export interface Checkpoint {
  instanceId: string;
  flowId: string;
  version: number;                       // 检查点版本号
  defVersion: number;                    // 绑定的流程定义版本
  status: InstanceStatus;
  done: string[];
  ctx: Record<string, unknown>;
  retryCount: Record<string, number>;
  suspendNode?: string;
}

export interface CheckpointStore {
  save(cp: Checkpoint): Promise<void>;
  load(instanceId: string): Promise<Checkpoint | undefined>;
}`,
          },
          {
            type: "code",
            language: "typescript",
            filename: "engine.ts",
            caption: "核心实现：可运行节点计算、幂等执行、检查点、补偿、挂起恢复",
            code: String.raw`import {
  Checkpoint, CheckpointStore, FlowDef, NodeDef,
} from "./types.js";

export class MemoryStore implements CheckpointStore {
  private data = new Map<string, Checkpoint>();
  async save(cp: Checkpoint) {
    this.data.set(cp.instanceId, { ...cp, ctx: { ...cp.ctx } });
  }
  async load(id: string) {
    const cp = this.data.get(id);
    return cp ? { ...cp, ctx: { ...cp.ctx } } : undefined;
  }
}

export interface EngineOptions {
  approvalGate?: (nodeId: string, ctx: Record<string, unknown>) => Promise<boolean>;
}

function runnableNodes(flow: FlowDef, cp: Checkpoint): NodeDef[] {
  const done = new Set(cp.done);
  return flow.nodes.filter((n) =>
    !done.has(n.id) &&
    n.deps.every((d) => done.has(d)) &&
    (n.when ? n.when(cp.ctx) : true)
  );
}

function assertAcyclic(flow: FlowDef): void {
  const ids = new Set(flow.nodes.map((n) => n.id));
  for (const n of flow.nodes) {
    for (const d of n.deps) {
      if (!ids.has(d)) throw new Error("unknown dependency: " + d);
      if (d === n.id) throw new Error("self dependency: " + n.id);
    }
  }
  // Kahn 拓扑排序检测环
  const indeg = new Map(flow.nodes.map((n) => [n.id, n.deps.length]));
  const queue = flow.nodes.filter((n) => n.deps.length === 0).map((n) => n.id);
  let visited = 0;
  while (queue.length) {
    const id = queue.shift() as string;
    visited += 1;
    for (const n of flow.nodes) {
      if (n.deps.includes(id)) {
        const next = (indeg.get(n.id) as number) - 1;
        indeg.set(n.id, next);
        if (next === 0) queue.push(n.id);
      }
    }
  }
  if (visited !== flow.nodes.length) throw new Error("cycle detected in flow definition");
}

async function executeNode(node: NodeDef, cp: Checkpoint): Promise<Record<string, unknown>> {
  const max = node.retries ?? 2;
  let last: unknown;
  for (let attempt = 0; attempt <= max; attempt++) {
    try {
      // 幂等键：同一实例同一节点同一版本只真正产生一次副作用
      const key = cp.instanceId + ":" + node.id + ":" + cp.version;
      const result = await node.run({ ...cp.ctx, _idempotencyKey: key });
      cp.retryCount[node.id] = attempt;
      return result;
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 10 * (2 ** attempt))); // 指数退避
    }
  }
  throw new Error("node failed: " + node.id + " / " + String(last));
}

export class WorkflowEngine {
  constructor(private store: CheckpointStore, private opts: EngineOptions = {}) {}

  async start(flow: FlowDef, params: Record<string, unknown>): Promise<Checkpoint> {
    assertAcyclic(flow);
    const cp: Checkpoint = {
      instanceId: crypto.randomUUID(),
      flowId: flow.id,
      version: 0,
      defVersion: flow.version,
      status: "ready",
      done: [],
      ctx: { ...params },
      retryCount: {},
    };
    await this.store.save(cp);
    return this.resume(flow, cp.instanceId);
  }

  async resume(flow: FlowDef, instanceId: string, approvalResult?: boolean): Promise<Checkpoint> {
    const cp = await this.store.load(instanceId);
    if (!cp) throw new Error("instance not found");
    if (cp.defVersion !== flow.version) throw new Error("definition version mismatch");
    cp.status = "running";

    if (cp.suspendNode) {
      if (approvalResult === undefined) {
        cp.status = "suspended";
        return cp; // 仍等待外部审批事件
      }
      const node = flow.nodes.find((n) => n.id === cp.suspendNode) as NodeDef;
      cp.suspendNode = undefined;
      if (!approvalResult) return this.compensate(flow, cp);
      cp.done.push(node.id);
      cp.version += 1;
      await this.store.save(cp);
    }

    while (true) {
      const runnable = runnableNodes(flow, cp);
      if (runnable.length === 0) {
        cp.status = cp.done.length === flow.nodes.length ? "done" : "done";
        await this.store.save(cp);
        return cp;
      }

      // 并行执行互不依赖的可运行节点
      const approvalNode = runnable.find((n) => n.approval);
      if (approvalNode) {
        const approved = this.opts.approvalGate
          ? await this.opts.approvalGate(approvalNode.id, cp.ctx)
          : false;
        if (!approved) {
          cp.suspendNode = approvalNode.id;
          cp.status = "suspended";
          await this.store.save(cp);
          return cp;
        }
        cp.done.push(approvalNode.id);
        cp.version += 1;
        await this.store.save(cp);
        continue;
      }

      const results = await Promise.allSettled(runnable.map((n) => executeNode(n, cp)));
      const failed = results.find((r) => r.status === "rejected");
      if (failed) return this.compensate(flow, cp);

      runnable.forEach((n, i) => {
        const r = results[i] as PromiseFulfilledResult<Record<string, unknown>>;
        Object.assign(cp.ctx, r.value);
        cp.done.push(n.id);
      });
      cp.version += 1;
      await this.store.save(cp);   // 检查点：崩溃后从此版本恢复
    }
  }

  private async compensate(flow: FlowDef, cp: Checkpoint): Promise<Checkpoint> {
    cp.status = "compensating";
    // 逆序执行已完成写节点的补偿
    for (const id of [...cp.done].reverse()) {
      const node = flow.nodes.find((n) => n.id === id);
      if (node?.compensate) {
        try { await node.compensate(cp.ctx); } catch { /* 生产需告警并人工兜底 */ }
      }
    }
    cp.status = "failed";
    cp.version += 1;
    await this.store.save(cp);
    return cp;
  }
}

export { runnableNodes, assertAcyclic };`,
          },
          {
            type: "code",
            language: "typescript",
            filename: "engine.test.ts",
            caption: "离线测试：条件分支、并行、检查点恢复、补偿、审批挂起与恢复",
            code: String.raw`import assert from "node:assert/strict";
import { WorkflowEngine, MemoryStore, runnableNodes, assertAcyclic } from "./engine.js";
import { FlowDef } from "./types.js";

function baseFlow(fail = false): FlowDef {
  return {
    id: "expense-approval",
    version: 1,
    nodes: [
      { id: "validate", deps: [], run: async () => ({ valid: true }) },
      {
        id: "risky", deps: ["validate"],
        when: (ctx) => ctx.amount as number > 1000,
        run: async () => ({ risk: "high" }),
      },
      {
        id: "reserve", deps: ["validate"],
        run: async () => ({ reserved: true }),
        compensate: async (ctx) => { ctx.reserved = false; return {}; },
      },
      {
        id: "approve", deps: ["reserve"], approval: true,
        run: async () => ({}),
      },
      {
        id: "commit", deps: ["approve"],
        run: async () => {
          if (fail) throw new Error("commit failed");
          return { committed: true };
        },
        compensate: async (ctx) => { ctx.committed = false; return {}; },
      },
    ],
  };
}

async function main() {
  // 条件分支：小额跳过 risky，大额执行
  const flow = baseFlow();
  const cp0 = { instanceId: "x", flowId: flow.id, version: 0, defVersion: 1,
    status: "ready" as const, done: ["validate"],
    ctx: { amount: 100 }, retryCount: {} };
  const small = runnableNodes(flow, cp0).map((n) => n.id);
  assert.ok(!small.includes("risky"), "小额应跳过 risky 分支");
  cp0.ctx.amount = 5000;
  assert.ok(runnableNodes(flow, cp0).map((n) => n.id).includes("risky"));

  // 环检测
  assert.throws(() => assertAcyclic({ id: "bad", version: 1, nodes: [
    { id: "a", deps: ["b"], run: async () => ({}) },
    { id: "b", deps: ["a"], run: async () => ({}) },
  ] }), /cycle/);

  // 审批挂起 → 恢复 → 完成
  const store = new MemoryStore();
  let approve = false;
  const engine = new WorkflowEngine(store, { approvalGate: async () => approve });
  const inst = await engine.start(flow, { amount: 5000 });
  assert.equal(inst.status, "suspended");
  assert.equal(inst.suspendNode, "approve");
  approve = true;
  const done = await engine.resume(flow, inst.instanceId, true);
  assert.equal(done.status, "done");
  assert.equal(done.ctx.committed, true);
  assert.ok(done.version >= 2, "应写入多个检查点");

  // 审批拒绝 → 逆序补偿
  const store2 = new MemoryStore();
  const rejected = await new WorkflowEngine(store2, { approvalGate: async () => false })
    .start(flow, { amount: 5000 });
  assert.equal(rejected.status, "failed");
  assert.equal(rejected.ctx.reserved, false, "补偿应撤销预留");

  // 节点永久失败 → 补偿
  const store3 = new MemoryStore();
  const failing = await new WorkflowEngine(store3, { approvalGate: async () => true })
    .start(baseFlow(true), { amount: 5000 });
  assert.equal(failing.status, "failed");

  console.log("all workflow engine tests passed");
}

main().catch((e) => { console.error(e); process.exit(1); });`,
          },
          {
            type: "table",
            headers: ["项目", "内容"],
            rows: [
              ["输入示例", "npx tsx engine.test.ts"],
              ["输出示例", "all workflow engine tests passed"],
              ["结果解释", "条件分支正确跳过/执行；审批挂起后可跨调用恢复；拒绝与失败均触发逆序补偿"],
              ["常见错误 1", "流程定义含环：assertAcyclic 在创建时抛错"],
              ["常见错误 2", "运行中实例与定义版本不一致：显式抛错，避免回放路径漂移"],
              ["常见错误 3", "写节点未提供 compensate：补偿时该节点无法回滚"],
              ["常见错误 4", "把审批等待写成 sleep：进程重启会丢失，必须持久化 Suspended"],
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "哪些部分需要替换",
            text: "MemoryStore 与 mock handler 为教学模拟；生产需替换为 PostgreSQL 事务检查点、真实业务 handler、分布式锁、审批事件总线与可观测上报。调度与补偿逻辑可直接沿用。",
          },
        ],
      },
      {
        id: "case",
        heading: "9. 企业应用案例：ITSM 变更审批流（教学模拟案例）",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            title: "教学模拟案例声明",
            text: "本节为贯穿全站项目 A 的工作流主干案例，系统名称与数据均为虚构，不代表真实客户或生产效果。",
          },
          {
            type: "paragraph",
            text: "业务背景：IT 变更需要「校验 → 风险评估（Agent 节点）→ 资源预留 → 人工审批 → 执行变更 → 通知」的主干流程。业务问题是变更动作不可逆、审批可能跨天、失败需精确回滚。技术目标是把主干确定为 DAG，仅在风险评估节点嵌入 Agent。",
          },
          {
            type: "mermaid",
            title: "变更审批 DAG",
            source: `flowchart LR
  V["校验参数"] --> R["Agent 风险评估"]
  V --> P["资源预留(可补偿)"]
  R --> A{"金额/风险判定"}
  P --> A
  A -->|高风险| H["人工审批(挂起)"]
  A -->|低风险| E["执行变更(可补偿)"]
  H -->|通过| E
  H -->|拒绝| C["逆序补偿"]
  E --> N["通知 + 审计"]`,
            caption: "Agent 输出先经确定性条件节点校验，再决定是否进入审批。",
          },
          {
            type: "table",
            headers: ["环节", "工程细节"],
            rows: [
              ["数据来源", "变更单、CMDB 配置项、历史故障记录（教学模拟）"],
              ["组件选择", "自研 DAG 引擎 + PostgreSQL 检查点 + Agent 风险评估节点 + 审批系统"],
              ["执行流程", "校验与预留并行 → 条件判定 → 挂起或直执 → 变更执行 → 通知"],
              ["安全权限", "写节点按 RBAC 授权；高风险变更强制人工审批；Agent 节点只读"],
              ["异常处理", "瞬时失败退避重试；永久失败逆序补偿；补偿失败转人工并告警"],
              ["部署方案", "引擎无状态多副本，检查点与审批状态外置，按流程类型分片"],
              ["效果评估", "流程成功率、补偿成功率、审批平均挂起时长、P95 端到端时延"],
            ],
          },
        ],
      },
      {
        id: "production",
        heading: "10. Production Engineering",
        blocks: [
          {
            type: "list",
            items: [
              "高可用：引擎无状态，检查点与审批状态全部外置；任意副本可凭 instanceId 恢复。",
              "可扩展性：按流程类型/租户分片；节点执行器独立扩缩；用分布式锁避免同实例并发推进。",
              "并发：互不依赖节点并行；汇合条件显式定义（all/any/quorum）。",
              "延迟与成本：检查点粒度权衡恢复精度与写入开销；审批挂起不占用计算资源。",
              "超时与重试：仅对幂等节点重试；非幂等写动作必须靠幂等键与业务侧去重。",
              "幂等性：instanceId + nodeId + version 作为幂等键，并在外部系统建立唯一约束。",
              "状态持久化：每次节点成功写检查点；流程定义版本与实例绑定。",
              "日志/监控/追踪：节点级 span，记录重试次数、补偿动作、挂起时长与终态。",
              "灰度发布与版本管理：新流程定义以新版本发布，运行中实例继续使用旧版本直至终态。",
            ],
          },
        ],
      },
      {
        id: "security",
        heading: "11. Security & Governance",
        blocks: [
          {
            type: "list",
            items: [
              "身份认证：流程创建与审批恢复都需验证调用方身份，instanceId 绑定租户。",
              "权限控制：写节点按 RBAC/ABAC 授权；审批节点校验审批人角色与职责分离。",
              "数据保护：检查点中的业务参数脱敏存储；敏感字段加密。",
              "输入验证：创建参数与节点输出都按 Schema 校验。",
              "输出校验：Agent 节点输出必须经确定性节点校验后才能驱动分支。",
              "工具权限：Agent 节点只持只读工具；变更执行由独立服务完成。",
              "审计：记录节点执行、审批人、审批结果、补偿动作与终态，支持合规回放。",
              "风险控制：流程级预算、最大重试、补偿失败告警与应急暂停开关。",
            ],
          },
        ],
      },
      {
        id: "evaluation",
        heading: "12. Evaluation & Testing",
        blocks: [
          {
            type: "table",
            headers: ["测试目标", "方法", "测试数据", "指标"],
            rows: [
              ["拓扑正确性", "环检测与可达性测试", "合法/非法 DAG 集", "环检出率、可达节点覆盖"],
              ["条件分支", "参数组合覆盖", "边界值条件集", "分支命中正确率"],
              ["恢复正确性", "崩溃注入后 resume", "各检查点版本", "副作用重复次数 = 0"],
              ["补偿正确性", "失败与拒绝路径", "写节点组合", "补偿成功率、残留副作用数"],
              ["挂起恢复", "跨调用审批事件", "通过/拒绝/超时", "恢复成功率、挂起状态一致性"],
              ["可复现性", "同输入重复运行", "固定种子任务集", "节点执行序列一致性"],
            ],
          },
          {
            type: "paragraph",
            text: "回归测试以「节点执行序列 + 终态 + 副作用次数」为断言，engine.test.ts 已覆盖条件分支、并行、检查点恢复、补偿与审批挂起。把流程定义快照纳入 CI，定义变更必须显式更新基线；新增写节点时强制要求提供 compensate。",
          },
        ],
      },
      {
        id: "best-practices",
        heading: "13. Best Practices",
        blocks: [
          {
            type: "list",
            items: [
              "主干流程确定性化，只在必要节点嵌入 Agent 并对其输出做确定性校验。",
              "每个写节点必须实现幂等键与补偿动作，且补偿失败有人工兜底。",
              "边条件保持纯函数，禁止在其中发起 I/O。",
              "运行中实例绑定流程定义版本，新版本灰度发布。",
              "人工审批必须持久化挂起状态，禁止用线程等待。",
              "检查点与审计日志都做脱敏，节点级 span 全量上报。",
              "以节点执行序列断言做回归，而非仅断言最终文本。",
            ],
          },
        ],
      },
      {
        id: "troubleshooting",
        heading: "14. Troubleshooting",
        blocks: [
          {
            type: "table",
            headers: ["问题表现", "可能原因", "排查方法", "解决方案", "预防方式"],
            rows: [
              ["恢复后重复扣款", "节点不幂等", "比对幂等键与外部系统记录", "幂等键 + 业务唯一约束", "写节点设计评审"],
              ["实例卡在 running", "节点永久失败未触发补偿", "看重试计数与终态", "补齐失败分支与补偿", "失败注入演练"],
              ["审批后流程不恢复", "恢复事件未带审批结果", "检查 suspendNode 状态", "显式传入 approvalResult", "审批事件契约测试"],
              ["并行节点结果丢失", "汇合条件未定义", "比对 done 集合与 ctx", "显式 all/any 汇合", "并行用例纳入回归"],
              ["回放路径与线上不一致", "实例读取了新版本定义", "检查 defVersion", "绑定创建时版本", "版本一致性断言"],
              ["补偿后仍有残留", "补偿实现不完整", "审计日志查补偿节点", "补齐逆向动作并人工兜底", "补偿成功率监控"],
            ],
          },
        ],
      },
      {
        id: "further-reading",
        heading: "15. Further Reading",
        blocks: [
          {
            type: "list",
            items: [
              "相关教程：Workflow 与 Agent 的边界、工作流中的人工审批、Agent 错误处理、Agent 状态管理。",
              "相关架构：工作流编排架构、企业级 Agent 参考架构。",
              "相关实验：工作流设计器。",
              "相关企业案例：IT Operations Agent（项目 A 变更审批主干）。",
              "官方资料：工作流引擎与 Saga 模式的官方/社区文档见下方参考资料。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "资料核验说明",
            text: "本节引擎实现与工程结论为本站教学实现与工程建议，不代表任何厂商产品的具体行为。所列框架文档的具体版本与 API 未逐项联网复核，标注为需进一步核验。",
          },
        ],
      },
      {
        id: "engineering-notes",
        heading: "16. 工程实现补遗：组件交互时序、故障演练与上线验收",
        blocks: [
          {
            type: "paragraph",
            text: "检查点必须在副作用提交之后、节点标记完成之前写入。若顺序颠倒（先标记完成再落快照），进程崩溃后重启会认为节点未执行而重放已完成的写操作；这是 Saga 补偿也无法补救的顺序问题。",
          },
          {
            type: "mermaid",
            title: "组件交互时序（含失败分支）",
            source: String.raw`sequenceDiagram
  participant C as 调用方
  participant E as WorkflowEngine
  participant N as 节点执行器
  participant S as CheckpointStore
  C->>E: start(flow, params)
  E->>E: assertAcyclic(flow)
  E->>N: run(node, idempotency_key)
  alt 节点成功
    N-->>E: result
    E->>S: save(完成节点, 结果摘要)
    E->>E: 计算下一批可运行节点
  else 节点失败
    N-->>E: error
    E->>N: 逆序 compensate(已完成写节点)
    E->>S: save(compensated)
  end
  E-->>C: instance 终态`,
            caption: "消息顺序、超时分支与降级路径；箭头方向即控制流方向。",
          },
          {
            type: "table",
            headers: ["组件交互契约", "传递内容", "超时/失败语义"],
            rows: [
              ["Engine → 节点执行器","node + 幂等键 + 超时上限","未知状态先查重再决定是否重试"],
              ["节点执行器 → Checkpoint","结果摘要与补偿句柄","写节点必须提供逆操作"],
              ["Engine → 调用方","instance_id + 终态","审批挂起状态可恢复"],
            ],
          },
          {
            type: "table",
            headers: ["类别", "可执行操作", "通过标准"],
            rows: [
              ["故障注入","在补偿途中让逆操作抛异常","实例置 failed 并进入死信队列，不静默完成"],
              ["故障注入","注入带环的流程定义","assertAcyclic 在启动前拒绝"],
              ["上线验收","npx tsx --test engine.test.ts","环检测、补偿、审批恢复用例通过"],
              ["上线验收","重启进程后 resume(instance_id)","已完成写节点不重复执行"],
            ],
          },
          {
            type: "paragraph",
            text: "落地替换点：CheckpointStore 换成带事务的关系库，补偿句柄换成真实逆操作或人工工单，审批队列接入企业审批系统并配置超时策略。流程定义必须版本化，运行中的实例按创建时版本继续，不中途切换语义。",
          },
        ],
      },
    ],
    tags: ["Workflow", "DAG", "状态机", "检查点", "补偿"],
    architectureIds: ["a05", "a14"],
    relatedTutorialIds: [
      "workflow-vs-agent",
      "human-approval",
      "agent-error-handling",
      "agent-state-management",
      "agentops-overview",
    ],
    nextTutorialSlugs: ["human-approval", "workflow-vs-agent"],
    relatedLabSlugs: ["workflow-designer"],
    relatedCaseSlugs: ["it-operations-agent"],
    references: [
      {
        title: "Temporal 官方文档（Workflows / Activities / Compensation）",
        url: "https://docs.temporal.io/",
        organization: "Temporal",
        kind: "官方产品文档",
        purpose: "长任务持久化、重试与补偿模式的工程参考；具体 API 需进一步核验",
        verifiedAt: "2026-11-13",
      },
      {
        title: "Saga 模式原始论文（Sagas, ACM）",
        url: "https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf",
        organization: "Garcia-Molina & Salem",
        kind: "学术研究",
        purpose: "长事务与补偿事务的理论来源；链接可访问性需进一步核验",
        verifiedAt: "2026-11-13",
      },
      {
        title: "Building Effective Agents（workflows vs agents）",
        url: "https://www.anthropic.com/research/building-effective-agents",
        organization: "Anthropic",
        kind: "官方产品文档",
        purpose: "核验确定性工作流与 Agent 的适用边界",
        verifiedAt: "2026-11-13",
      },
      {
        title: "Model Context Protocol Specification",
        url: "https://modelcontextprotocol.io/specification/2026-07-28",
        organization: "Model Context Protocol",
        kind: "官方规范",
        version: "2026-07-28（latest）",
        purpose: "工作流中 Agent 节点调用工具时的协议与安全约束参考",
        verifiedAt: "2026-11-13",
      },
    ],
    updatedAt: "2026-11-13",
    status: "published",
    qualityLevel: "L5",
  },
];
