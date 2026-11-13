import type { Tutorial } from "../../types";

// ============================================================================
// 第一批 · 领域 01 企业级 Agent 工程 · L5 深度升级教程
// 覆盖式升级：slug / id / domainId 保持不变，URL 与列表顺序均不改变。
// 所有代码基于真实可核验 API：OpenAI Python SDK >= 1.0 的 Chat Completions
// function calling（tools / tool_choice / message.tool_calls / role:"tool"）。
// 核验日期见每篇 references.verifiedAt；动态版本请仍以官方文档为准。
// ============================================================================

export const deepAgentEngineering: Tutorial[] = [
  {
    id: "t-ae-03",
    slug: "agent-execution-loop",
    domainId: "d01",
    title: "Agent 执行循环：从输入到终局的全链路工程实现",
    englishTitle: "The Agent Execution Loop",
    summary:
      "拆解 Agent 执行循环的 12 个真实步骤：上下文构建、模型推理、工具选择、参数校验、权限闸门、工具执行、观察回灌、状态持久化与终止判定，并给出可运行的 TypeScript/Python 实现、企业级案例、生产工程与评估方法。",
    difficulty: "中级",
    estimatedMinutes: 75,
    prerequisites: ["LLM 基础", "Function Calling 概念", "TypeScript 或 Python 基础"],
    learningObjectives: [
      "说清 Agent 执行循环与普通 LLM 调用在状态、控制流和失败模型上的差异",
      "能画出并解释一次完整迭代中的控制流、数据流与状态流",
      "能独立实现一个带参数校验、权限闸门、超时重试与检查点的 Runtime",
      "能设计任务成功率、工具调用准确率、成本与延迟的评估方案",
      "能定位循环失控、重复调用、上下文膨胀等典型生产故障",
    ],
    sections: [
      {
        id: "overview",
        heading: "1. 技术概述 Overview",
        blocks: [
          {
            type: "paragraph",
            text: "Agent 执行循环（Agent Execution Loop）是一套由程序控制的迭代式决策过程：每一轮把「当前状态 + 可用工具描述 + 历史观察」组装成模型输入，由模型产出下一步动作（调用工具或给出最终答复），程序执行动作、把结果作为新的观察写回状态，再进入下一轮，直到满足终止条件。关键点是：模型不直接执行任何副作用，循环体（Runtime）才是控制流的所有者。",
          },
          {
            type: "paragraph",
            text: "它出现的原因是单次 LLM 调用只能基于参数化知识生成文本，无法读取实时数据、无法写入业务系统、也无法在多步任务中根据中间结果调整策略。把「推理」交给模型、把「执行与控制」交给确定性代码，是这一模式解决的核心问题。",
          },
          {
            type: "table",
            headers: ["维度", "LLM Application（单次调用）", "Agent（执行循环）"],
            rows: [
              ["控制流", "固定：输入 → 一次推理 → 输出", "动态：由模型逐轮决定下一步"],
              ["状态", "基本无状态，最多带会话历史", "显式状态机，需持久化与恢复"],
              ["副作用", "无，或由外部代码硬编码", "由工具调用产生，需校验与授权"],
              ["失败模型", "一次失败即失败", "可重试、降级、转人工、恢复检查点"],
              ["成本", "单次 token 可预估", "随迭代轮次放大，必须设预算上限"],
              ["可测试性", "输入→输出可直接断言", "需模拟环境、轨迹断言与回放"],
            ],
          },
          {
            type: "list",
            items: [
              "适用场景：需要实时数据、需要跨系统写操作、步骤数未知、需根据中间结果调整路径的任务（运维排障、报表查数、工单办理）。",
              "不适用场景：路径完全确定且强审计的流程（应优先用 Workflow）；纯文本改写、分类、摘要等一次推理即可完成的任务。",
              "与 Workflow 的区别：Workflow 的分支在代码里预先定义，Agent 的分支在运行时由模型产出；企业系统常见做法是「Workflow 为主干、Agent 为节点」。",
              "与 ReAct 的区别：ReAct 是一种提示与推理范式（Reasoning + Acting 交替），执行循环是承载它的运行时骨架；没有循环，ReAct 无法真正执行动作。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "一个常见误解",
            text: "「Agent = 会调工具的 LLM」是不完整的。执行循环还包含参数校验、权限判定、幂等控制、超时重试、状态持久化、预算约束与终止判定——这些都不属于模型能力，而是 Runtime 的职责。",
          },
        ],
      },
      {
        id: "fundamentals",
        heading: "2. 核心原理 Fundamentals",
        blocks: [
          {
            type: "paragraph",
            text: "循环的核心机制是「观察—决策—行动」闭环（sense–decide–act）。模型每轮接收的是截至目前为止的完整轨迹，产出的是一个结构化动作；Runtime 解析动作、校验、执行、把结果作为观察追加到轨迹，形成下一轮的输入。因此轨迹（trajectory）是最关键的数据结构，而不是单条 prompt。",
          },
          {
            type: "mermaid",
            title: "执行循环状态机",
            source: `stateDiagram-v2
  [*] --> Assemble: 用户输入
  Assemble --> Infer: 构建上下文
  Infer --> Validate: 模型产出 tool_call
  Infer --> Answer: 模型产出 final
  Validate --> Authorize: 参数校验通过
  Validate --> Assemble: 参数非法(回灌错误)
  Authorize --> Execute: 策略允许
  Authorize --> Assemble: 拒绝(回灌原因)
  Execute --> Observe: 结果/超时/异常
  Observe --> Budget: 更新状态
  Budget --> Assemble: 未超预算且未终止
  Budget --> Abort: 超预算/超轮次
  Answer --> [*]
  Abort --> [*]`,
            caption: "校验或授权失败不是异常终止，而是把错误作为观察回灌给模型，让它自我修正。",
          },
          {
            type: "table",
            headers: ["要素", "定义", "工程含义"],
            rows: [
              ["Trajectory 轨迹", "有序消息序列：system / user / assistant(tool_call) / tool", "必须可序列化、可回放、可裁剪"],
              ["Step 迭代", "一次模型推理 + 至多一批工具执行", "轮次上限是硬性成本与安全约束"],
              ["Observation 观察", "工具返回值或错误信息", "必须结构化、带来源、带耗时"],
              ["Stop condition 终止", "final / 轮次上限 / token 预算 / 超时 / 人工中止", "多个条件取最先满足者，避免死循环"],
              ["Budget 预算", "最大轮次、最大 token、最大费用、最大墙钟时间", "在 Runtime 层强制，不依赖模型自律"],
            ],
          },
          {
            type: "paragraph",
            text: "输入是「上下文对象」（会话、工具 Schema、历史观察、租户与权限上下文）；输出是「动作对象」（tool_call 列表或 final 文本）；关键状态包括当前轮次、累计 token、已调用工具及参数、幂等键、最近错误。系统边界必须明确：模型不可信，工具返回值也不可信（可能是间接提示注入的载体），只有 Runtime 的策略判定是可信根。",
          },
          {
            type: "list",
            items: [
              "局限一：错误会沿轨迹累积，早期错误观察可能把后续推理带偏，需要压缩与纠错策略。",
              "局限二：上下文窗口有限，长任务必须做轨迹裁剪或摘要，否则延迟与成本线性上升。",
              "局限三：模型不保证收敛，必须由 Runtime 强制轮次/预算上限。",
              "局限四：非确定性输出使回归测试必须基于轨迹断言而非字符串相等。",
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
            title: "Agent Runtime 分层架构",
            source: `flowchart TB
  U["用户 / API"] --> GW["API 网关 认证/限流"]
  GW --> RT["Runtime 循环控制器"]
  subgraph CORE["Agent Runtime"]
    RT --> CB["ContextBuilder 上下文构建"]
    RT --> MA["ModelAdapter 模型适配"]
    RT --> VAL["ParamValidator 参数校验"]
    RT --> POL["PolicyGate 权限/审批"]
    RT --> EX["ToolExecutor 工具执行"]
    RT --> ST[("StateStore 检查点")]
    RT --> OBS["Tracer 日志/追踪"]
    RT --> STOP["StopJudge 终止判定"]
  end
  MA --> LLM["LLM 网关"]
  EX --> MCP["MCP / 内部服务"]
  ST --> DB[("PostgreSQL / Redis")]
  OBS --> OTEL["可观测平台"]`,
            caption: "Runtime 是唯一控制流所有者；模型与工具都是被它调用的外部依赖。",
          },
          {
            type: "table",
            headers: ["组件", "职责", "输入", "输出", "外部依赖"],
            rows: [
              ["ContextBuilder", "组装 system/user、工具 Schema、裁剪历史观察", "会话、轨迹、租户", "messages + tools", "StateStore、Prompt Registry"],
              ["ModelAdapter", "统一不同厂商的推理接口、超时与重试", "messages + tools", "assistant message", "LLM 网关"],
              ["ParamValidator", "按 JSON Schema 校验工具参数", "tool_call.arguments", "合法参数或错误观察", "Tool Registry"],
              ["PolicyGate", "RBAC/ABAC 判定、敏感动作审批", "用户、工具、参数", "允许 / 拒绝 / 待审批", "策略引擎、审批流"],
              ["ToolExecutor", "幂等执行、超时、错误归一化", "合法参数", "结构化 Observation", "MCP / ITSM / 监控 API"],
              ["StateStore", "持久化检查点、轨迹、幂等键", "状态快照", "run_id + 版本", "PostgreSQL / Redis"],
              ["StopJudge", "判定 final / 超预算 / 超时", "轨迹与计数器", "continue / stop", "配置中心"],
              ["Tracer", "记录每步 span、token、成本", "全链路事件", "trace", "OpenTelemetry"],
            ],
          },
          {
            type: "list",
            items: [
              "控制流：Runtime → ModelAdapter → ParamValidator → PolicyGate → ToolExecutor → StateStore → StopJudge → 下一轮。",
              "数据流：用户输入与工具观察汇入轨迹，轨迹经裁剪后成为模型输入，工具结果以结构化 observation 回灌。",
              "状态流：每步结束后写入检查点（含消息快照、轮次、预算计数、工具幂等键），崩溃后可从上一个检查点续跑。",
              "外部依赖：LLM 网关、MCP Server、业务系统 API、数据库、策略引擎、审批与可观测平台；任一依赖故障都应可降级。",
              "异常处理：参数非法与权限拒绝回灌为观察；工具超时走重试/熔断；模型超时走退避重试；超预算转人工。",
              "扩展方式：工具通过注册表热插拔；模型经 Adapter 替换；子任务通过委派交给子 Agent；水平扩展靠无状态 Runtime + 外部 StateStore。",
            ],
          },
        ],
      },
      {
        id: "components",
        heading: "4. 核心组件 Components",
        blocks: [
          {
            type: "paragraph",
            text: "逐个说明组件「是什么、为什么需要、如何实现、常见问题」。这些组件共同保证：模型产出的任何动作，在被真正执行前都经过确定性代码的可信校验。",
          },
          {
            type: "table",
            headers: ["组件", "为什么需要", "实现方式", "常见问题"],
            rows: [
              ["ContextBuilder", "模型需要一致、可裁剪的输入视图", "模板 + TokenBudget + 观察摘要", "无裁剪导致长任务上下文溢出"],
              ["ModelAdapter", "屏蔽厂商差异、统一 tool_calls 结构", "适配器接口 + 超时/退避重试", "把厂商私有字段泄漏进业务逻辑"],
              ["ParamValidator", "模型生成的 JSON 常缺字段或类型错", "JSON Schema + strict 模式", "只校验存在性、不校验范围"],
              ["PolicyGate", "工具调用必须受最小权限约束", "RBAC/ABAC + 敏感动作审批", "把权限判断写进 prompt（不可信）"],
              ["ToolExecutor", "真实副作用必须幂等、可观测", "幂等键 + 超时 + 熔断 + 结果归一化", "重复扣款/重复建单"],
              ["StateStore", "长任务与故障恢复需要检查点", "PostgreSQL 快照 + Redis 热状态", "只存内存，进程重启即丢失"],
              ["StopJudge", "模型不保证自行收敛", "轮次/token/费用/墙钟四重上限", "只设轮次上限，单轮 token 失控"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "组件边界原则",
            text: "ParamValidator 与 PolicyGate 必须位于 ToolExecutor 之前且不可被模型绕过。任何「让模型自己判断权限」的设计都等同于无权限控制。",
          },
        ],
      },
      {
        id: "flow",
        heading: "5. 工作流程 Execution Flow",
        blocks: [
          {
            type: "mermaid",
            title: "单次任务时序",
            source: `sequenceDiagram
  participant U as 用户
  participant R as Runtime
  participant C as ContextBuilder
  participant M as ModelAdapter/LLM
  participant V as Validator+Policy
  participant E as ToolExecutor
  participant S as StateStore
  U->>R: 提交任务(创建 run_id)
  loop 每轮 step
    R->>S: 载入检查点
    R->>C: 构建上下文(裁剪/预算)
    C-->>R: messages + tools
    R->>M: 推理(超时/重试)
    M-->>R: tool_calls 或 final
    alt 有 tool_calls
      R->>V: 参数校验 + 权限判定
      V-->>R: 允许 / 拒绝原因
      R->>E: 幂等执行工具
      E-->>R: Observation
      R->>S: 写检查点
    else final
      R->>S: 写终态
      R-->>U: 最终响应
    end
  end`,
            caption: "每一步都可被 trace 记录，失败时从最近检查点恢复。",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "用户输入：网关完成认证与租户识别，生成 run_id，写入初始 user message。",
              "上下文构建：注入 system 指令、工具 Schema、会话记忆与检索到的知识片段，按 token 预算裁剪历史观察。",
              "模型调用：ModelAdapter 发起 Chat Completions 请求，带 tools 与 tool_choice=auto，设置超时与退避重试。",
              "工具选择：模型返回 message.tool_calls（含 id、function.name、function.arguments 的 JSON 字符串）。",
              "参数生成：Runtime 用 JSON.parse 解析 arguments，失败直接生成错误观察，不进入执行。",
              "参数校验：按该工具注册的 JSON Schema 校验类型、必填、枚举与取值范围。",
              "权限验证：PolicyGate 按用户角色、租户、资源属性判定；敏感工具进入人工审批挂起。",
              "工具执行：ToolExecutor 用幂等键调用后端（MCP / ITSM / 监控 API），记录耗时并归一化结果。",
              "结果观察：把结构化 observation 以 role=tool、tool_call_id 对应回灌到轨迹。",
              "状态更新：写检查点（消息快照、轮次、累计 token/费用、工具调用计数）。",
              "下一轮决策：StopJudge 检查是否 final / 超轮次 / 超预算 / 超时，否则回到第 2 步。",
              "最终响应：输出答案并附工具调用摘要与来源，落审计日志与 trace。",
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
              ["ReAct", "探索型、需要边看边想", "实现简单、可解释", "容易在观察噪声中打转，轮次难控"],
              ["Plan-and-Execute", "长链路、步骤可预先规划", "减少重复推理、成本可控", "计划僵硬，环境变化需重规划"],
              ["Router / 意图分发", "多能力平台入口", "低延迟、易治理", "路由错误会直接错到底"],
              ["Reflection / 自审", "生成质量优先", "可提升事实性", "额外 token 与延迟，可能自我强化错误"],
              ["Supervisor 委派", "任务可拆给专精 Agent", "职责清晰、可并行", "协调成本与消息协议复杂度上升"],
            ],
          },
          {
            type: "paragraph",
            text: "设计取舍的核心变量是「控制力 vs 灵活性」：把更多决策放进代码，可靠性与可审计性上升、灵活性下降；反之亦然。企业系统通常采用分层混合——确定性 Workflow 作主干，在需要理解与判断的节点嵌入 ReAct 循环。",
          },
          {
            type: "list",
            items: [
              "常见错误 1：不设轮次上限，导致无限循环与费用失控。",
              "常见错误 2：把工具返回值原样拼进 system 指令，形成间接提示注入通道。",
              "常见错误 3：把权限判断写进提示词，模型可被诱导忽略。",
              "常见错误 4：工具执行不做幂等，重试造成重复业务副作用。",
              "常见错误 5：用 final 文本的字符串相等做回归断言，忽略非确定性。",
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
              ["原生 SDK 自研循环", "需完全掌控控制流与审计", "稳定 / 需自建可观测与恢复", "高", "低", "企业核心系统首选"],
              ["LangGraph", "需要图式状态机与检查点", "活跃 / 需跟版本演进", "高", "中", "复杂多步、需可视化状态流"],
              ["OpenAI Agents SDK", "以工具与交接为核心的多 Agent", "官方维护 / 迭代较快", "中", "中高", "与 OpenAI 生态强绑定时"],
              ["Temporal / 工作流引擎", "长任务、需持久化与补偿", "成熟 / 运维成本较高", "高", "低", "把 Agent 作为工作流节点"],
              ["MCP 工具层", "工具标准化与跨 Host 复用", "规范已发布多版本 / 需跟版本", "高", "低", "工具接入优先于私有适配"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "版本核验提示",
            text: "上表为定性判断，不含性能数据或排名。框架与 SDK 版本演进较快，选型前须核对官方仓库当前 release 与 breaking changes；本次核验日期为 2026-11-13，未能逐项联网复核的版本已在本节标注为需进一步核验。",
          },
          {
            type: "list",
            items: [
              "性能考虑：主要瓶颈是模型推理延迟与工具 I/O，循环本身开销可忽略；应关注并行工具调用与缓存命中。",
              "维护成本：自研需自建轨迹回放、评估集与回归门禁，这部分成本常被低估。",
              "降低锁定：把模型调用、工具执行、状态存储都收敛到接口后面，替换成本才可控。",
            ],
          },
        ],
      },
      {
        id: "hands-on",
        heading: "8. Hands-on 实战：实现最小可用的 Agent Runtime",
        blocks: [
          {
            type: "paragraph",
            text: "实验目标：实现一个具备参数校验、权限闸门、幂等执行、超时重试、检查点与轮次预算的执行循环，并用 mock 模型与 mock 工具完成离线测试。以下代码为真实可运行实现，使用 OpenAI Python SDK 1.x 的 Chat Completions function calling 接口；离线测试不需要真实密钥。",
          },
          {
            type: "code",
            language: "text",
            filename: "项目目录结构",
            caption: "本实战的多文件项目布局",
            code: String.raw`agent-runtime/
├── requirements.txt
├── .env.example
├── tools.py          # 工具 Schema 与实现（教学模拟接口）
├── runtime.py        # 执行循环核心实现
├── main.py           # 入口：运行一次任务
└── test_runtime.py   # pytest 离线测试`,
          },
          {
            type: "code",
            language: "bash",
            filename: "requirements.txt / 安装与运行命令",
            caption: "环境：Python 3.11+；安装、配置、执行方式",
            code: String.raw`# requirements.txt
openai>=1.0,<3
jsonschema>=4.20
pytest>=8.0

# 安装
python -m venv .venv
. .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 配置（.env.example，复制为 .env 后填入；不要提交真实密钥）
# OPENAI_API_KEY=sk-REPLACE_ME
# OPENAI_MODEL=gpt-4o-mini
# OPENAI_BASE_URL=https://api.openai.com/v1   # 可选，兼容网关

# 离线测试（不需要密钥）
pytest -q test_runtime.py

# 真实运行（需要密钥）
python main.py "查询订单 A-1003 的库存"`,
          },
          {
            type: "code",
            language: "python",
            filename: "tools.py",
            caption: "工具注册表：JSON Schema 描述 + 模拟实现；真实项目替换为 MCP/ITSM 客户端",
            code: String.raw`"""工具注册表：Schema 与实现分离，便于替换为真实后端。

本文件的后端均为教学模拟实现，返回可预期的固定数据，不含真实业务系统。
"""
from typing import Any, Callable

TOOLS: list[dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "get_inventory",
            "description": "按 SKU 查询当前可用库存数量",
            "parameters": {
                "type": "object",
                "properties": {"sku": {"type": "string", "minLength": 1}},
                "required": ["sku"],
                "additionalProperties": False,
            },
            "strict": True,
        },
    }
]

JSON_SCHEMA: dict[str, Any] = TOOLS[0]["function"]["parameters"]


def get_inventory(sku: str) -> dict[str, Any]:
    """教学模拟：真实项目中此处应调用库存服务或 MCP Server。"""
    return {"sku": sku, "available": 3, "source": "mock-inventory-service"}`,
          },
          {
            type: "code",
            language: "typescript",
            filename: "runtime.ts",
            caption: "TypeScript 版核心循环（与 Python 版等价，便于前端/Node 团队对照）",
            runnable: false,
            code: String.raw`// 核心循环的类型定义与控制流骨架；真实项目接入 LLM SDK 后即可运行。
type Message =
  | { role: "system" | "user" | "assistant"; content: string }
  | { role: "tool"; tool_call_id: string; content: string };

type ToolCall = { id: string; name: string; arguments: string };
type StepResult = { kind: "tool_calls"; calls: ToolCall[] } | { kind: "final"; text: string };

interface ModelAdapter {
  infer(messages: Message[]): Promise<StepResult>;
}
interface ToolExecutor {
  validateAndRun(call: ToolCall, ctx: { tenant: string }): Promise<string>;
}

export async function runAgent(
  userInput: string,
  model: ModelAdapter,
  tools: ToolExecutor,
  ctx: { tenant: string; maxSteps?: number; maxTokens?: number }
): Promise<string> {
  const maxSteps = ctx.maxSteps ?? 8;
  const messages: Message[] = [
    { role: "system", content: "你是企业运维助手。仅使用已授权工具，信息不足时说明不确定。" },
    { role: "user", content: userInput },
  ];
  let spentTokens = 0;

  for (let step = 0; step < maxSteps; step++) {
    const result = await model.infer(messages); // 由 Adapter 负责超时与退避重试
    if (result.kind === "final") return result.text;

    for (const call of result.calls) {
      // 参数校验、权限判定、幂等执行均在确定性代码中完成
      const observation = await tools.validateAndRun(call, ctx);
      messages.push({ role: "assistant", content: JSON.stringify({ tool_calls: [call] }) });
      messages.push({ role: "tool", tool_call_id: call.id, content: observation });
    }
    spentTokens += 512; // 真实实现应取 usage.prompt_tokens + completion_tokens
    if (spentTokens > (ctx.maxTokens ?? 16000)) return "已达 token 预算上限，转人工处理。";
  }
  return "已达最大轮次，转人工处理。";
}`,
          },
          {
            type: "code",
            language: "python",
            filename: "runtime.py",
            caption: "核心实现：参数校验、权限闸门、幂等键、超时重试、检查点、预算与终止判定",
            code: String.raw`"""可运行的 Agent 执行循环（教学实现，真实可跑）。

依赖：openai>=1.0,<3、jsonschema>=4.20
环境变量：OPENAI_API_KEY、OPENAI_MODEL（可选）、OPENAI_BASE_URL（可选）
"""
from __future__ import annotations

import json
import os
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable

import jsonschema
from openai import OpenAI

from tools import TOOLS, JSON_SCHEMA, get_inventory


class ToolDenied(Exception):
    """权限闸门拒绝。"""


@dataclass
class RunState:
    run_id: str
    messages: list[dict[str, Any]] = field(default_factory=list)
    step: int = 0
    spent_tokens: int = 0
    seen_calls: dict[str, str] = field(default_factory=dict)  # 幂等键 -> observation

    def checkpoint(self) -> dict[str, Any]:
        return {
            "run_id": self.run_id,
            "messages": self.messages,
            "step": self.step,
            "spent_tokens": self.spent_tokens,
        }


TOOL_IMPL: dict[str, Callable[..., dict[str, Any]]] = {"get_inventory": get_inventory}
ALLOWED_ROLES: dict[str, set[str]] = {"get_inventory": {"operator", "admin"}}


def validate_arguments(raw: str) -> dict[str, Any]:
    """参数生成与校验：解析失败或 Schema 不通过，一律转为错误观察。"""
    args = json.loads(raw)  # 可能抛 JSONDecodeError
    jsonschema.validate(args, JSON_SCHEMA)  # 可能抛 ValidationError
    return args


def authorize(tool_name: str, role: str) -> None:
    """权限验证：最小权限，绝不交给模型判断。"""
    if role not in ALLOWED_ROLES.get(tool_name, set()):
        raise ToolDenied(f"角色 {role} 无权调用 {tool_name}")


def execute(call: Any, state: RunState, role: str) -> str:
    name = call.function.name
    if name not in TOOL_IMPL:
        return json.dumps({"error": "unknown_tool", "tool": name}, ensure_ascii=False)
    try:
        args = validate_arguments(call.function.arguments)
        authorize(name, role)
    except (json.JSONDecodeError, jsonschema.ValidationError) as e:
        return json.dumps({"error": "invalid_arguments", "detail": str(e)}, ensure_ascii=False)
    except ToolDenied as e:
        return json.dumps({"error": "denied", "detail": str(e)}, ensure_ascii=False)

    # 幂等：同一 run 内相同参数只真正执行一次
    idem_key = f"{name}:{json.dumps(args, sort_keys=True)}"
    if idem_key in state.seen_calls:
        return state.seen_calls[idem_key]

    try:
        result = TOOL_IMPL[name](**args)          # 教学模拟后端
        observation = json.dumps(result, ensure_ascii=False)
    except TimeoutError:
        observation = json.dumps({"error": "tool_timeout"}, ensure_ascii=False)
    except Exception as e:                      # 真实项目应分类处理并告警
        observation = json.dumps({"error": "tool_failed", "detail": type(e).__name__}, ensure_ascii=False)
    state.seen_calls[idem_key] = observation
    return observation


def infer(client: OpenAI, model_name: str, messages: list[dict[str, Any]]) -> Any:
    """模型调用：带超时与指数退避重试。"""
    last: Exception | None = None
    for attempt in range(3):
        try:
            return client.chat.completions.create(
                model=model_name,
                messages=messages,
                tools=TOOLS,
                tool_choice="auto",
                timeout=30.0,
            )
        except Exception as e:
            last = e
            time.sleep(0.5 * (2 ** attempt))
    raise RuntimeError("model inference failed after retries") from last


def run(user_input: str, client: OpenAI, model_name: str, role: str = "operator",
        max_steps: int = 8, max_tokens: int = 16000) -> tuple[str, RunState]:
    state = RunState(run_id=str(uuid.uuid4()))
    state.messages = [
        {"role": "system", "content": "你是企业运维助手。仅使用已授权工具；信息不足时明确说明。"},
        {"role": "user", "content": user_input},
    ]
    for _ in range(max_steps):
        resp = infer(client, model_name, state.messages)
        usage = getattr(resp, "usage", None)
        state.spent_tokens += int(getattr(usage, "total_tokens", 0) or 0)
        msg = resp.choices[0].message
        calls = getattr(msg, "tool_calls", None) or []

        if not calls:  # 终止条件：final
            return (msg.content or ""), state

        state.messages.append({
            "role": "assistant",
            "content": msg.content or "",
            "tool_calls": [
                {"id": c.id, "type": "function",
                 "function": {"name": c.function.name, "arguments": c.function.arguments}}
                for c in calls
            ],
        })
        for c in calls:
            obs = execute(c, state, role)
            state.messages.append({"role": "tool", "tool_call_id": c.id, "content": obs})

        state.step += 1
        _ = state.checkpoint()  # 真实项目在此写入 PostgreSQL/Redis
        if state.spent_tokens > max_tokens:
            return "已达 token 预算上限，转人工处理。", state
    return "已达最大轮次，转人工处理。", state


def make_client() -> OpenAI:
    kwargs: dict[str, Any] = {"api_key": os.environ["OPENAI_API_KEY"]}
    if os.environ.get("OPENAI_BASE_URL"):
        kwargs["base_url"] = os.environ["OPENAI_BASE_URL"]
    return OpenAI(**kwargs)`,
          },
          {
            type: "code",
            language: "python",
            filename: "main.py",
            caption: "入口：环境变量、执行方式与输入示例",
            code: String.raw`import os
import sys

from runtime import make_client, run


def main() -> None:
    question = sys.argv[1] if len(sys.argv) > 1 else "查询 SKU A-1003 的可用库存"
    client = make_client()
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    answer, state = run(question, client, model, role="operator")
    print("run_id:", state.run_id, "steps:", state.step, "tokens:", state.spent_tokens)
    print("answer:", answer)


if __name__ == "__main__":
    main()`,
          },
          {
            type: "code",
            language: "python",
            filename: "test_runtime.py",
            caption: "离线测试：参数校验、权限拒绝、幂等、预算终止；mock 模型不产生费用",
            code: String.raw`import json
import types

import pytest

import runtime


def fake_call(name="get_inventory", args='{"sku": "A-1003"}', cid="call_1"):
    return types.SimpleNamespace(
        id=cid,
        function=types.SimpleNamespace(name=name, arguments=args),
    )


def test_valid_arguments():
    assert runtime.validate_arguments('{"sku": "A-1003"}') == {"sku": "A-1003"}


def test_invalid_arguments_are_rejected():
    with pytest.raises(json.JSONDecodeError):
        runtime.validate_arguments("not-json")
    import jsonschema
    with pytest.raises(jsonschema.ValidationError):
        runtime.validate_arguments('{"sku": "A-1003", "unexpected": 1}')


def test_least_privilege():
    with pytest.raises(runtime.ToolDenied):
        runtime.authorize("get_inventory", "guest")


def test_idempotent_execution():
    state = runtime.RunState(run_id="test")
    a = runtime.execute(fake_call(), state, "operator")
    b = runtime.execute(fake_call(), state, "operator")
    assert a == b
    assert len(state.seen_calls) == 1


def test_denied_becomes_observation_not_exception():
    state = runtime.RunState(run_id="test")
    obs = runtime.execute(fake_call(), state, "guest")
    assert json.loads(obs)["error"] == "denied"


class FakeCompletions:
    def __init__(self, responses):
        self.responses = list(responses)

    def create(self, **kwargs):
        return self.responses.pop(0)


class FakeClient:
    def __init__(self, responses):
        self.chat = types.SimpleNamespace(completions=FakeCompletions(responses))


def response(*, tool_calls=None, content=None):
    msg = types.SimpleNamespace(content=content, tool_calls=tool_calls)
    return types.SimpleNamespace(choices=[types.SimpleNamespace(message=msg)], usage=None)


def test_final_stops_loop():
    client = FakeClient([response(content="库存充足")])
    answer, state = runtime.run("查库存", client, "fake-model")
    assert answer == "库存充足" and state.step == 0


def test_budget_guard():
    # 模型持续请求工具，验证轮次上限生效，不会无限循环
    cyclic = [response(tool_calls=[fake_call(cid=f"c{i}")]) for i in range(20)]
    client = FakeClient(cyclic)
    answer, state = runtime.run("查库存", client, "fake-model", max_steps=3)
    assert "最大轮次" in answer and state.step == 3`,
          },
          {
            type: "table",
            headers: ["项目", "内容"],
            rows: [
              ["输入示例", "python main.py \"查询订单 A-1003 的库存\""],
              ["输出示例", "run_id: ... steps: 1 tokens: ... / answer: SKU A-1003 当前可用库存 3（来源：教学模拟库存服务）"],
              ["结果解释", "模型先产出 tool_call → 校验与授权 → 执行 → 观察回灌 → 下一轮产出 final"],
              ["常见错误 1", "OPENAI_API_KEY 未设置：make_client 抛 KeyError，检查 .env"],
              ["常见错误 2", "模型名与账号权限不匹配：换用账号可用的模型或改 OPENAI_MODEL"],
              ["常见错误 3", "arguments 不是合法 JSON：validate_arguments 会回灌 invalid_arguments 观察"],
              ["常见错误 4", "strict 模式下 Schema 缺 required 或 additionalProperties：按官方约束补齐"],
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "哪些部分需要替换",
            text: "tools.py 的后端为教学模拟；生产环境需替换为真实 MCP/ITSM 客户端、把 _ = state.checkpoint() 换成数据库写入、把 Tracer 接入 OpenTelemetry，并为敏感工具接入人工审批。其余控制流可直接沿用。",
          },
        ],
      },
      {
        id: "case",
        heading: "9. 企业应用案例：IT Operations Agent（教学模拟案例）",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            title: "教学模拟案例声明",
            text: "本节为贯穿全站的项目 A 教学模拟案例，所有系统名称、指标与数据均为虚构，不代表任何真实客户或生产效果。",
          },
          {
            type: "paragraph",
            text: "业务背景：某企业 IT 运维中心每天接收大量告警与「查状态/查工单/查变更」类咨询。业务问题是工程师需在监控、CMDB、ITSM 之间来回切换，平均处置链路长且口径不一致。技术目标是把「状态查询类」任务交给 Agent 自动完成，把「写操作类」动作强制走审批。",
          },
          {
            type: "mermaid",
            title: "项目 A 系统设计与执行流程",
            source: `flowchart LR
  U["工程师 / 告警"] --> GW["API 网关 认证+租户"]
  GW --> RT["Runtime 执行循环"]
  RT --> RAG["知识检索 Runbook RAG"]
  RT --> MCP["MCP 工具层"]
  MCP --> MON["监控 API(只读)"]
  MCP --> CMDB["CMDB(只读)"]
  MCP --> ITSM["ITSM 工单(写)"]
  RT --> POL["PolicyGate"]
  POL --> HITL["人工审批(写操作)"]
  RT --> ST[("检查点/审计")]
  RT --> OBS["Tracing+评测"]`,
            caption: "只读工具自动执行，写操作必须经人工审批，全链路留痕。",
          },
          {
            type: "table",
            headers: ["环节", "工程细节"],
            rows: [
              ["数据来源", "监控指标、CMDB 配置项、ITSM 工单、Runbook 文档（均为教学模拟数据）"],
              ["组件选择", "自研 Runtime + MCP 工具层 + RAG 检索 + PostgreSQL 检查点 + 策略引擎"],
              ["执行流程", "告警文本 → 意图识别 → 只读工具并行查询 → Runbook 检索 → 生成处置建议 → 写操作转审批"],
              ["安全权限", "只读工具按租户隔离；ITSM 写操作需 RBAC + 人工审批；工具描述视为不可信"],
              ["异常处理", "监控超时降级为「数据不可用」；模型超时退避重试；超预算转人工并保留检查点"],
              ["部署方案", "Runtime 无状态多副本 + Redis 热状态 + PostgreSQL 检查点；工具层独立部署便于限流"],
              ["效果评估", "任务成功率、工具调用准确率、事实正确性、P95 延迟、单任务成本、越权拦截数"],
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
              "高可用：Runtime 无状态化，状态全部外置到 StateStore；任意副本挂掉可由 run_id 从检查点续跑。",
              "可扩展性：工具层与模型层分别限流；按租户分片；长任务转为异步任务 + 事件通知。",
              "并发与性能：同一轮内互不依赖的 tool_calls 并行执行；对高频只读查询加缓存；流式返回首字节以降低感知延迟。",
              "延迟与成本：设置轮次、token、费用、墙钟四重预算；对简单意图走 Router 直接单轮响应。",
              "超时与重试：模型与工具分别设置超时；仅对幂等读操作重试；写操作用幂等键而非盲目重试。",
              "幂等性：以 run_id + 工具名 + 规范化参数作为幂等键，避免重试造成重复建单、重复扣减。",
              "状态持久化：每步写检查点（消息快照、预算计数、幂等键），支持故障恢复与轨迹回放。",
              "故障恢复：区分可恢复错误（超时、限流）与不可恢复错误（权限、Schema 非法）；前者退避，后者回灌观察。",
              "日志/监控/追踪：每步一个 span，记录工具名、参数摘要、耗时、token、成本、错误码；敏感字段脱敏后再入日志。",
              "灰度发布与版本管理：Prompt、工具 Schema、模型版本各自版本化；按租户灰度，关键指标退化即回滚。",
            ],
          },
          {
            type: "table",
            headers: ["指标", "建议观测口径", "异常信号"],
            rows: [
              ["任务成功率", "人工或规则判定终态是否达成", "连续下滑说明 Prompt/模型/工具变更引入退化"],
              ["平均迭代轮次", "final 前的 step 数", "上升说明参数校验失败或观察噪声增多"],
              ["工具调用准确率", "正确工具 + 合法参数占比", "下降优先查 Schema 与工具描述"],
              ["P95 端到端延迟", "从提交到 final", "上升查模型/工具超时与串行执行"],
              ["单任务成本", "usage.total_tokens × 单价", "异常尖峰查循环失控"],
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
              "身份认证：网关完成用户/服务身份识别，run_id 绑定租户，工具调用携带可验证的调用方上下文。",
              "权限控制：RBAC 定角色基线，ABAC 叠加租户、资源、时间等属性；最小权限默认拒绝。",
              "数据保护：日志与轨迹中的 PII 脱敏；跨租户记忆与检查点严格隔离。",
              "输入验证：用户输入与工具返回值都视为不可信数据；参数按 JSON Schema 强校验。",
              "输出校验：最终答复经护栏扫描（敏感信息、违规动作描述）后再返回。",
              "工具权限：只读/写操作分级；写操作强制人工审批；工具描述按 MCP 规范视为不可信内容。",
              "敏感信息与审计：密钥仅存环境变量/KMS，不进代码与日志；每次 tool_call 记录调用方、参数摘要、结果与审批人。",
              "风险控制：预算上限、循环上限、熔断、应急开关（一键禁用全部写工具）。",
            ],
          },
          {
            type: "callout",
            variant: "danger",
            title: "间接提示注入",
            text: "工具返回的文档、网页、工单备注中可能藏有恶意指令。这些内容必须以 role:tool 的「数据」身份回灌，绝不能拼进 system 指令；权限判定与审批必须在确定性代码中完成。",
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
              ["循环正确性", "mock 模型 + 轨迹断言", "预设 tool_calls / final 序列", "轮次、消息顺序、final 文本"],
              ["参数安全", "非法 JSON、缺字段、越权角色", "边界/异常参数集", "拒绝率、是否产生副作用"],
              ["幂等与恢复", "重复调用 + 从检查点续跑", "同一 run_id 重放", "副作用次数 = 1"],
              ["任务成功率", "离线评测集 + 人工抽检", "覆盖典型与边界任务", "成功率 ≥ 设定阈值"],
              ["成本与延迟", "压测与线上采样", "不同长度轨迹", "P50/P95、单任务 token"],
              ["安全性", "红队用例（注入/越权/泄露）", "对抗样本集", "越界拦截率"],
            ],
          },
          {
            type: "paragraph",
            text: "回归测试的重点不是字符串相等，而是轨迹级断言：是否调用了正确工具、参数是否合法、是否在预算内终止、是否未发生越权副作用。test_runtime.py 已给出最小可运行的离线示例；把评测集接入 CI，Prompt/模型/工具 Schema 任一变更都触发回归，指标退化则阻断发布。",
          },
          {
            type: "code",
            language: "yaml",
            filename: "eval-gate.yaml",
            caption: "配置示例：CI 回归门禁阈值（数值为教学示例阈值，需按业务校准）",
            code: String.raw`suite: agent-execution-loop
dataset: eval/tasks.jsonl
metrics:
  task_success_rate:
    threshold: 0.85
  tool_call_accuracy:
    threshold: 0.95
  p95_latency_ms:
    threshold: 12000
  max_cost_per_task_usd:
    threshold: 0.15
  unauthorized_tool_calls:
    threshold: 0
on_regression: block_release
seed: 42
note: "阈值为教学模拟配置，非行业基准；上线前需按真实流量校准。"`,
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
              "把终止条件与预算放在 Runtime 硬编码，不依赖模型自律。",
              "参数校验、权限判定、幂等控制必须在工具执行之前，且不可被提示词绕过。",
              "失败信息作为观察回灌，让模型有机会自我修正，而不是直接抛异常终止整个任务。",
              "工具返回值结构化、带来源与耗时，避免把长文本原样塞回上下文。",
              "每步写检查点，轨迹可回放；日志脱敏后再落盘。",
              "以轨迹断言做回归测试，用 mock 模型覆盖边界与异常路径。",
              "工具描述写清「何时用、何时不用」，并做版本管理。",
              "写操作一律走审批；提供一键禁用写工具的应急开关。",
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
              ["循环不收敛、费用飙升", "未设轮次/预算、观察含糊", "看 trace 中 step 与 token 曲线", "加四重预算上限并强制转人工", "上线前压测最长轨迹"],
              ["同一工具反复调用", "参数校验失败被模型误读", "检查 invalid_arguments 观察内容", "把具体错误字段回灌并修正 Schema", "Schema 与实现同源生成"],
              ["重复建单/重复扣减", "重试缺少幂等键", "比对 run_id 与工具调用日志", "引入幂等键与唯一约束", "写工具强制幂等设计评审"],
              ["越权调用成功", "权限判断写在提示词里", "审计日志查 PolicyGate span 是否缺失", "把判定移到确定性代码", "红队用例纳入回归"],
              ["长任务延迟线性上升", "轨迹无裁剪，每轮带全历史", "观察 prompt_tokens 随 step 增长", "观察摘要化 + TokenBudget", "设定上下文预算告警"],
              ["重启后任务丢失", "状态只在内存", "检查检查点表是否有写入", "外置 StateStore 并按 run_id 恢复", "故障注入演练"],
              ["答案引用了工具里的指令", "间接提示注入", "回放轨迹中 role:tool 内容", "数据/指令隔离 + 输出护栏", "红队测试 + 工具描述不可信原则"],
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
              "相关教程：ReAct 内部工作机制、Tool Calling 完整执行链、Agent Runtime 与状态持久化、Workflow 与 Agent 的边界、Agent 评估与回归测试。",
              "相关架构：企业级 Agent 参考架构、AgentOps 可观测架构。",
              "相关实验：Agent 执行循环模拟器、ReAct 模拟器、MCP 工具调用实验。",
              "相关企业案例：IT Operations Agent（项目 A）。",
              "官方资料见下方参考资料，按「官方规范 / 官方产品文档 / 学术研究 / 本站工程建议」区分。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "资料核验说明",
            text: "以下官方 URL 与 API 形态已于 2026-11-13 联网核验（OpenAI Function Calling 指南、MCP 规范版本列表）。框架 release 号与部分论文链接未逐项复核，标注为「需进一步核验」；本站工程建议不属于行业标准。",
          },
        ],
      },
      {
        id: "engineering-notes",
        heading: "16. 工程实现补遗：组件交互时序、故障演练与上线验收",
        blocks: [
          {
            type: "paragraph",
            text: "终止条件不只由模型输出决定：max_steps、token 预算、连续工具失败数与幂等键共同构成终止集合。任一项触发都必须写入终态并停止循环，否则模型自报完成或持续重试会形成不可控循环。",
          },
          {
            type: "mermaid",
            title: "组件交互时序（含失败分支）",
            source: String.raw`sequenceDiagram
  participant C as 调用方
  participant R as Runtime
  participant P as 策略引擎
  participant T as 工具执行器
  participant S as Checkpoint
  C->>R: run(request, run_id)
  R->>S: 载入/创建检查点
  R->>P: 校验工具与参数
  alt 允许执行
    P->>T: call(tool, args, idempotency_key)
    T-->>R: observation(含耗时/错误码)
    R->>S: 提交步骤快照
  else 拒绝或超时
    P-->>R: deny(reason)
    R->>S: 记录终态与原因
  end
  R-->>C: RunResult(终态, trace, usage)`,
            caption: "消息顺序、超时分支与降级路径；箭头方向即控制流方向。",
          },
          {
            type: "table",
            headers: ["组件交互契约", "传递内容", "超时/失败语义"],
            rows: [
              ["Runtime → 策略引擎","结构化 Action 候选 + 会话上下文","纯函数裁决，异常一律 deny"],
              ["策略引擎 → 工具执行器","工具名 + 已校验参数 + 幂等键","超时返回 error，不重试未知状态"],
              ["工具执行器 → Checkpoint","observation 摘要 + 步骤序号","先落快照再推进下一步"],
            ],
          },
          {
            type: "table",
            headers: ["类别", "可执行操作", "通过标准"],
            rows: [
              ["故障注入","让工具连续抛 TimeoutError 3 次","达到连续失败阈值后终止，终态含原因"],
              ["故障注入","在步骤提交前杀掉进程再重启","从检查点恢复，已提交写步骤不重放"],
              ["上线验收","pytest -q test_runtime.py","全部用例通过，无真实密钥依赖"],
              ["上线验收","核对 trace 中 max_steps 与 usage 字段","每步有 run_id，token 累计不为负"],
            ],
          },
          {
            type: "paragraph",
            text: "落地替换点：把 mock 模型换成按官方 SDK 实现的适配器（凭据从环境变量读取），把模拟工具换成真实 ITSM/监控 API 并在执行器侧保留幂等表，把内存 Checkpoint 换成带唯一约束的关系表。模拟数据与真实接口边界已在 Hands-on 中标注；本节不新增任何虚构的产品 API。",
          },
        ],
      },
    ],
    tags: ["Agent Engineering", "Execution Loop", "Runtime", "Function Calling", "生产工程"],
    architectureIds: ["a01", "a13"],
    relatedTutorialIds: [
      "react-pattern",
      "tool-calling",
      "agent-runtime",
      "agent-state-management",
      "agent-error-handling",
      "workflow-vs-agent",
    ],
    nextTutorialSlugs: ["react-pattern", "agent-runtime"],
    relatedLabSlugs: ["agent-execution-loop", "react-simulator"],
    relatedCaseSlugs: ["it-operations-agent", "customer-service-copilot"],
    references: [
      {
        title: "Function Calling 指南（Chat Completions / Responses API）",
        url: "https://developers.openai.com/api/docs/guides/function-calling",
        organization: "OpenAI",
        kind: "官方产品文档",
        version: "在线文档，随版本更新；核验于 2026-11-13",
        purpose: "核验 tools / tool_choice / message.tool_calls / role:tool 的真实请求与响应结构",
        verifiedAt: "2026-11-13",
      },
      {
        title: "Model Context Protocol Specification",
        url: "https://modelcontextprotocol.io/specification/2026-07-28",
        organization: "Model Context Protocol",
        kind: "官方规范",
        version: "2026-07-28（latest）；历史版本 2025-11-25、2025-06-18",
        purpose: "核验工具层协议、能力协商与「工具描述不可信、调用需用户同意」的安全原则",
        verifiedAt: "2026-11-13",
      },
      {
        title: "Building Effective Agents",
        url: "https://www.anthropic.com/research/building-effective-agents",
        organization: "Anthropic",
        kind: "官方产品文档",
        purpose: "Workflows 与 Agents 的架构边界、何时不应使用 Agent",
        verifiedAt: "2026-11-13",
      },
      {
        title: "ReAct: Synergizing Reasoning and Acting in Language Models",
        url: "https://arxiv.org/abs/2210.03629",
        organization: "Yao et al.",
        kind: "学术研究",
        purpose: "推理与行动交替范式的原始论文；具体卷期信息需进一步核验",
        verifiedAt: "2026-11-13",
      },
      {
        title: "JSON Schema Specification",
        url: "https://json-schema.org/specification",
        organization: "JSON Schema",
        kind: "官方规范",
        purpose: "工具参数校验与 strict 模式的 Schema 约束依据",
        verifiedAt: "2026-11-13",
      },
    ],
    updatedAt: "2026-11-13",
    status: "published",
    qualityLevel: "L5",
  },
];
