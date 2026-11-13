import type { Tutorial } from "../types";

export const agentEngineeringTutorials: Tutorial[] = [
  {
    id: "t-ae-01",
    slug: "agent-fundamentals",
    domainId: "d01",
    title: "Agent 基础：从 LLM 应用到自主智能体",
    englishTitle: "Agent Fundamentals",
    summary:
      "理解 Agent 与传统 LLM 应用、Chatbot 的本质区别，建立企业级 Agent 的心智模型。",
    difficulty: "初级",
    estimatedMinutes: 25,
    prerequisites: ["了解 LLM 与 Prompt 基础"],
    learningObjectives: [
      "区分 Agent、LLM 应用与 Chatbot",
      "理解 Agent 的自主行动能力来源",
      "认识 Agent 的核心组成要素",
    ],
    sections: [
      {
        id: "what",
        heading: "一、什么是 Agent",
        blocks: [
          {
            type: "paragraph",
            text: "Agent 是一种能够感知环境、进行推理、调用工具并采取行动以达成目标的自主系统。围绕 LLM 构建的企业级 Agent，最大的特征是：它不再只是“生成文本”，而是能通过工具改变外部世界（查询数据库、调用 API、创建工单）。",
          },
          {
            type: "callout",
            variant: "info",
            title: "关键区别",
            text: "Chatbot 主要完成对话；LLM 应用通常是“一问一答 + 固定后处理”；Agent 则是“感知—推理—行动—观察”的持续循环，行动会反馈回循环影响后续决策。",
          },
        ],
      },
      {
        id: "diff",
        heading: "二、Agent 与 LLM 应用、Chatbot 的区别",
        blocks: [
          {
            type: "table",
            headers: ["维度", "Chatbot", "LLM 应用", "Agent"],
            rows: [
              ["行动能力", "无", "通常无", "可调用工具改变外部状态"],
              ["流程控制", "单轮/多轮对话", "固定管线", "动态执行循环"],
              ["状态", "无/对话历史", "无状态", "显式状态与记忆"],
              ["工具", "无", "少量硬编码", "可扩展工具集"],
              ["终止条件", "用户结束", "流程结束", "自主判断完成"],
            ],
          },
        ],
      },
      {
        id: "components",
        heading: "三、Agent 的核心组成要素",
        blocks: [
          {
            type: "list",
            items: [
              "模型（LLM）：负责推理与决策，可分为规划模型、行动模型与反思模型。",
              "工具（Tools）：外部能力封装，如查询、计算、调用业务系统。",
              "记忆（Memory）：短期对话与长期知识，支撑连续性。",
              "运行时（Runtime）：驱动执行循环、管理状态与错误处理。",
              "护栏（Guardrails）：约束输入、行为与输出，保障安全。",
            ],
          },
        ],
      },
      {
        id: "loop",
        heading: "四、最简执行循环",
        blocks: [
          {
            type: "mermaid",
            title: "最简 Agent 循环",
            source: `flowchart LR
  U["用户输入"] --> R["推理 Reasoning"]
  R --> A["行动 Action"]
  A --> O["观察 Observation"]
  O --> R
  O --> F["完成 Final Answer"]`,
            caption: "Agent 在推理与行动之间迭代，直到任务完成。",
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
              "Q：接入工具的模型就叫 Agent 吗？A：具备“循环决策 + 工具反馈”才算 Agent，单次函数调用只是 LLM 应用。",
              "Q：Agent 一定比普通应用好吗？A：不是。确定性流程更稳定可控，Agent 适合不确定、需灵活决策的任务。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "六、最佳实践",
        blocks: [
          {
            type: "list",
            items: [
              "能用确定性流程解决的，优先用流程，仅在关键节点引入 Agent。",
              "为 Agent 设定清晰的“目标”与“停止条件”，避免无限循环。",
              "从第一天起就记录每一步推理轨迹，便于调试与评估。",
            ],
          },
        ],
      },
      {
        id: "next",
        heading: "七、延伸阅读",
        blocks: [
          { type: "list", items: ["ReAct Pattern", "Agent 执行循环", "Agent Runtime 架构", "企业级 Agent 参考架构"] },
        ],
      },
    ],
    tags: ["Agent", "基础", "LLM"],
    architectureIds: ["a01", "a02", "a04"],
    relatedTutorialIds: ["react-pattern", "agent-execution-loop", "agent-runtime"],
    references: [
      { title: "Anthropic: Building Effective Agents" },
      { title: "OpenAI: A practical guide to building agents" },
    ],
    updatedAt: "2026-11-10",
    status: "published",
    featured: true,
  },
  {
    id: "t-ae-02",
    slug: "react-pattern",
    domainId: "d01",
    title: "ReAct Pattern：推理与行动的协同",
    englishTitle: "ReAct Pattern",
    summary: "深入 ReAct 范式：Thought、Action、Observation 如何交替推动任务完成。",
    difficulty: "初级",
    estimatedMinutes: 30,
    prerequisites: ["Agent 基础"],
    learningObjectives: ["理解 ReAct 的结构", "掌握 Thought/Action/Observation 的协作", "能实现一个最小 ReAct 循环"],
    sections: [
      {
        id: "concept",
        heading: "一、ReAct 是什么",
        blocks: [
          {
            type: "paragraph",
            text: "ReAct（Reason + Act）是一种让 LLM 交替生成“推理轨迹（Thought）”与“动作（Action）”的范式。模型先思考下一步该做什么，再决定调用哪个工具，工具返回的结果作为 Observation 再次进入思考，直到得出 Final Answer。",
          },
        ],
      },
      {
        id: "flow",
        heading: "二、执行流程",
        blocks: [
          {
            type: "mermaid",
            title: "ReAct 循环",
            source: `flowchart TB
  Q["问题"] --> T1["Thought: 需要查库存"]
  T1 --> A1["Action: get_inventory(SKU)"]
  A1 --> O1["Observation: 库存=3"]
  O1 --> T2["Thought: 库存不足"]
  T2 --> FA["Final Answer: 缺货"]`,
            caption: "Thought 与 Action 交替，Observation 提供真实反馈。",
          },
        ],
      },
      {
        id: "code",
        heading: "三、最小实现（Python）",
        blocks: [
          {
            type: "code",
            language: "python",
            filename: "react_loop.py",
            runnable: false,
            code: `from openai import OpenAI

client = OpenAI()
tools = {
    "get_inventory": lambda sku: f"库存(SKU={sku})=3",
}

SYSTEM = "你是 ReAct Agent。按 Thought/Action/Observation/Final Answer 推理。"

def run(user_q: str, max_steps: int = 5):
    messages = [{"role": "system", "content": SYSTEM},
                {"role": "user", "content": user_q}]
    for step in range(max_steps):
        r = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
        text = r.choices[0].message.content
        print(text)
        if "Final Answer" in text:
            return text
        # 解析 Action 并调用工具（教学简化）
        if "Action:" in text:
            obs = "Observation: " + tools["get_inventory"]("A1")
            messages.append({"role": "assistant", "content": text})
            messages.append({"role": "user", "content": obs})
    return "超过最大步数"

run("SKU A1 是否有货？")`,
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
              "把工具定义为带 JSON Schema 的函数，便于模型正确生成参数。",
              "对 Action 做解析与校验，防止模型输出无法解析的格式。",
              "保留完整 Thought/Action/Observation 轨迹用于评估与复盘。",
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
              "Q：ReAct 的 Thought 能作为真实思维过程吗？A：不能。它只是提示技巧下的文本输出，不代表模型内部真实可观测机制（参见 ReAct 模拟器说明）。",
              "Q：循环停不下来怎么办？A：设置最大步数，并定义明确的终止词与完成条件。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "六、最佳实践",
        blocks: [
          {
            type: "list",
            items: [
              "使用结构化提示明确输出格式，降低解析成本。",
              "对工具结果做截断与摘要，避免 Observation 过长撑爆上下文。",
              "高敏感动作前引入人工审批或策略检查。",
            ],
          },
        ],
      },
      {
        id: "next",
        heading: "七、延伸阅读",
        blocks: [{ type: "list", items: ["Agent 执行循环", "Tool Calling", "Planning & Reasoning"] }],
      },
    ],
    tags: ["ReAct", "模式", "推理"],
    architectureIds: ["a02", "a04"],
    relatedTutorialIds: ["agent-fundamentals", "agent-execution-loop", "tool-calling"],
    references: [{ title: "Yao et al., ReAct: Synergizing Reasoning and Acting in Language Models" }],
    updatedAt: "2026-11-10",
    status: "published",
    featured: true,
  },
  {
    id: "t-ae-03",
    slug: "agent-execution-loop",
    domainId: "d01",
    title: "Agent 执行循环：理解—计划—行动—观察",
    englishTitle: "Agent Execution Loop",
    summary: "拆解企业级 Agent 从用户输入到返回结果的完整执行循环与状态流转。",
    difficulty: "中级",
    estimatedMinutes: 35,
    prerequisites: ["Agent 基础", "ReAct Pattern"],
    learningObjectives: ["描述执行循环的每一阶段", "理解状态如何被更新", "识别循环终止条件"],
    sections: [
      {
        id: "overview",
        heading: "一、执行循环全景",
        blocks: [
          {
            type: "paragraph",
            text: "一个企业级 Agent 从用户输入开始，依次经历：理解任务 → 制定计划 → 调用工具 → 获取结果 → 更新状态 → 下一轮决策 → 返回结果。这个循环由 Runtime 驱动，每一步都可能触发工具、记忆或护栏。",
          },
        ],
      },
      {
        id: "phases",
        heading: "二、关键阶段",
        blocks: [
          {
            type: "table",
            headers: ["阶段", "输入", "输出", "要点"],
            rows: [
              ["理解", "用户请求", "任务表示", "意图识别、目标拆解"],
              ["计划", "任务表示", "步骤列表", "可动态调整"],
              ["行动", "计划+状态", "工具调用", "参数校验、权限检查"],
              ["观察", "工具结果", "结构化观察", "截断/摘要处理"],
              ["决策", "观察+状态", "下一步/终止", "置信度评估"],
            ],
          },
        ],
      },
      {
        id: "state",
        heading: "三、状态管理",
        blocks: [
          {
            type: "paragraph",
            text: "循环中的状态包括：当前目标、已完成步骤、工具返回、记忆检索结果、错误计数等。状态需可被序列化以支持检查点与恢复（见 Agent Runtime 架构）。",
          },
          {
            type: "mermaid",
            title: "带状态的循环",
            source: `flowchart LR
  IN["输入"] --> LOOP["循环"]
  LOOP --> ST["状态 State"]
  LOOP --> LLM["LLM 决策"]
  LOOP --> TOOL["工具"]
  TOOL --> ST
  ST -->|"完成"| OUT["输出"]
  ST -->|"继续"| LOOP`,
            caption: "状态在每轮被读取与更新。",
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
              "每轮记录 trace（输入/决策/工具/观察），便于复盘。",
              "对观察结果做长度与格式约束，防止上下文溢出。",
              "设置最大步数与超时，避免失控。",
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
              "Q：循环应该在哪一层终止？A：由 Runtime 根据“完成信号”或最大步数终止，不应依赖模型自己停。",
              "Q：多次工具调用结果如何组织？A：存入工作记忆并以结构化方式注入后续提示。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "六、最佳实践",
        blocks: [
          {
            type: "list",
            items: [
              "让每一步都可被观测、可回放。",
              "把规划与执行解耦，支持“先计划后执行”或“边走边看”。",
              "对错误进行分类：可重试错误与终止错误分别处理。",
            ],
          },
        ],
      },
      {
        id: "next",
        heading: "七、延伸阅读",
        blocks: [{ type: "list", items: ["Agent Runtime 架构", "Agent State 管理", "Agent 错误处理", "企业级 Agent 参考架构"] }],
      },
    ],
    tags: ["执行循环", "Runtime", "状态"],
    architectureIds: ["a01", "a04"],
    relatedTutorialIds: ["agent-fundamentals", "react-pattern", "agent-runtime", "agent-state-management"],
    references: [{ title: "Anthropic: Agents vs workflows" }],
    updatedAt: "2026-11-10",
    status: "published",
    featured: true,
  },
  {
    id: "t-ae-04",
    slug: "agent-runtime",
    domainId: "d01",
    title: "Agent Runtime 架构与实现",
    englishTitle: "Agent Runtime",
    summary: "承载执行循环、状态、工具、记忆与错误处理的运行时设计与落地。",
    difficulty: "高级",
    estimatedMinutes: 40,
    prerequisites: ["Agent 执行循环", "Tool Calling"],
    learningObjectives: ["设计可恢复的 Runtime", "实现工具调度与护栏", "理解检查点与持久化"],
    sections: [
      {
        id: "role",
        heading: "一、Runtime 的职责",
        blocks: [
          {
            type: "paragraph",
            text: "Agent Runtime 是 Agent 的“操作系统”：它驱动执行循环、加载与调度工具、读写状态、执行护栏校验，并在出错时重试或终止。一个健壮的 Runtime 应当无状态计算 + 有状态存储，从而支持水平扩展与断点恢复。",
          },
        ],
      },
      {
        id: "arch",
        heading: "二、Runtime 架构",
        blocks: [
          {
            type: "mermaid",
            title: "Runtime 内部",
            source: `flowchart TB
  IN["任务"] --> ENGINE["执行引擎 Engine"]
  ENGINE --> REASON["LLM 推理"]
  ENGINE --> SCHED["工具调度"]
  ENGINE --> STATE["状态读写"]
  ENGINE --> GUARD["护栏"]
  GUARD -->|通过| ENGINE
  GUARD -->|终止| OUT["输出"]
  STATE --> STORE[(持久化)]
  ENGINE --> CP["检查点"]`,
            caption: "引擎驱动循环，状态与检查点外置。",
          },
        ],
      },
      {
        id: "code",
        heading: "三、核心接口（TypeScript）",
        blocks: [
          {
            type: "code",
            language: "typescript",
            filename: "runtime.ts",
            runnable: false,
            code: `interface Tool {
  name: string;
  schema: object;
  run: (args: any) => Promise<{ ok: boolean; data: any }>;
}

interface AgentState {
  goal: string;
  steps: Step[];
  scratchpad: string;
}

class AgentRuntime {
  constructor(private tools: Tool[], private llm: LLM, private store: StateStore) {}

  async run(initial: AgentState, maxSteps = 8): Promise<string> {
    let state = initial;
    for (let i = 0; i < maxSteps; i++) {
      await this.store.save(state); // 检查点
      const decision = await this.llm.decide(state);
      if (decision.type === "finish") return decision.answer;
      const tool = this.tools.find((t) => t.name === decision.tool);
      const res = await tool!.run(decision.args); // 工具调用
      state.steps.push({ action: decision, observation: res.data });
    }
    return "已达到最大步数";
  }
}`,
          },
        ],
      },
      {
        id: "resilience",
        heading: "四、容错与恢复",
        blocks: [
          {
            type: "list",
            items: [
              "检查点：每轮保存状态，崩溃后可从最近检查点续跑。",
              "重试：工具调用失败按指数退避重试，超过阈值则终止或转人工。",
              "回退：关键节点失败后可回退到上一稳定状态。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "五、工程实践",
        blocks: [
          {
            type: "list",
            items: [
              "Runtime 与工具后端解耦，工具经 MCP/网关访问，便于权限治理。",
              "每次 LLM 调用都附上“可读状态”，避免模型丢失上下文。",
              "为长任务设计异步执行与进度回调。",
            ],
          },
        ],
      },
      {
        id: "faq",
        heading: "六、常见问题",
        blocks: [
          {
            type: "list",
            items: [
              "Q：Runtime 需要自己写吗？A：可用 LangGraph 等框架，但理解其内部有助于定制与排错。",
              "Q：状态存在哪？A：短期用内存/Redis，需恢复的长期状态用 Postgres 等持久化。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "七、最佳实践",
        blocks: [
          {
            type: "list",
            items: [
              "计算无状态、存储有状态，便于扩展。",
              "所有外部副作用走工具，并在工具层统一鉴权。",
              "错误可观测：区分模型错误、工具错误与系统错误。",
            ],
          },
        ],
      },
      {
        id: "next",
        heading: "八、延伸阅读",
        blocks: [{ type: "list", items: ["Agent 错误处理", "Agent State 管理", "MCP 网关", "AgentOps 架构"] }],
      },
    ],
    tags: ["Runtime", "架构", "状态"],
    architectureIds: ["a04", "a01"],
    relatedTutorialIds: ["agent-execution-loop", "agent-error-handling", "agent-state-management"],
    references: [{ title: "LangGraph 文档", url: "https://langchain-ai.github.io/langgraph/" }],
    updatedAt: "2026-11-10",
    status: "published",
    featured: true,
  },
  {
    id: "t-ae-05",
    slug: "tool-calling",
    domainId: "d01",
    title: "Tool Calling：让 Agent 行动",
    englishTitle: "Tool Calling",
    summary: "理解工具调用的原理、Schema 定义、参数校验与企业接入方式。",
    difficulty: "初级",
    estimatedMinutes: 28,
    prerequisites: ["Agent 基础"],
    learningObjectives: ["定义工具 Schema", "解析与校验模型输出", "安全接入企业工具"],
    sections: [
      {
        id: "concept",
        heading: "一、Tool Calling 原理",
        blocks: [
          {
            type: "paragraph",
            text: "Tool Calling（或 Function Calling）指模型在推理时输出结构化调用请求（工具名 + 参数），由运行时执行外部工具并把结果回传。它是 Agent 从“说”到“做”的关键。",
          },
        ],
      },
      {
        id: "schema",
        heading: "二、工具 Schema 定义",
        blocks: [
          {
            type: "code",
            language: "json",
            filename: "tool.schema.json",
            runnable: false,
            code: `{
  "name": "create_ticket",
  "description": "在 ITSM 中创建故障工单",
  "parameters": {
    "type": "object",
    "properties": {
      "title": { "type": "string", "description": "工单标题" },
      "priority": { "type": "string", "enum": ["P1", "P2", "P3"] }
    },
    "required": ["title", "priority"]
  }
}`,
          },
        ],
      },
      {
        id: "flow",
        heading: "三、调用流程",
        blocks: [
          {
            type: "mermaid",
            title: "Tool Calling 流程",
            source: `sequenceDiagram
  participant U as 用户
  participant A as Agent
  participant M as 模型
  participant T as 工具
  U->>A: 请求
  A->>M: 含工具定义的提示
  M-->>A: 调用 create_ticket(...)
  A->>T: 执行
  T-->>A: 结果
  A-->>U: 最终回答`,
            caption: "模型只输出调用意图，执行由运行时完成。",
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
              "描述（description）要精确，直接影响模型是否选对工具。",
              "对参数做 JSON Schema 校验，拒绝不合法调用。",
              "工具执行设置超时与权限边界。",
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
              "Q：Tool Calling 与 MCP 什么关系？A：Tool Calling 是模型能力，MCP 是标准化承载工具的后端协议；MCP Server 最终会暴露为模型可调用的工具。",
              "Q：模型乱调用工具怎么办？A：用策略引擎限制可用工具集合与参数范围。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "六、最佳实践",
        blocks: [
          {
            type: "list",
            items: [
              "每个工具只做一件事，保持单一职责。",
              "返回结构化、简洁的观察结果，必要时摘要。",
              "对写操作类工具强制审批或二次确认。",
            ],
          },
        ],
      },
      {
        id: "next",
        heading: "七、延伸阅读",
        blocks: [{ type: "list", items: ["MCP 基础", "Agent 安全架构", "Agent Runtime"] }],
      },
    ],
    tags: ["Tool Calling", "函数调用", "MCP"],
    architectureIds: ["a06", "a04"],
    relatedTutorialIds: ["agent-fundamentals", "mcp-fundamentals", "agent-runtime"],
    references: [],
    updatedAt: "2026-11-10",
    status: "published",
  },
  {
    id: "t-ae-06",
    slug: "agent-error-handling",
    domainId: "d01",
    title: "Agent 错误处理、重试与检查点",
    englishTitle: "Agent Error Handling",
    summary: "企业级 Agent 必须具备的错误分类、重试、回退与检查点恢复能力。",
    difficulty: "高级",
    estimatedMinutes: 32,
    prerequisites: ["Agent Runtime", "Agent 执行循环"],
    learningObjectives: ["分类错误类型", "设计重试与回退", "实现检查点"],
    sections: [
      {
        id: "types",
        heading: "一、错误分类",
        blocks: [
          {
            type: "table",
            headers: ["类型", "例子", "处理"],
            rows: [
              ["模型错误", "输出无法解析", "重试 / 改写提示"],
              ["工具错误", "API 超时", "退避重试 / 换工具"],
              ["系统错误", "存储不可用", "终止 / 告警"],
              ["业务错误", "权限不足", "转人工 / 拒绝"],
            ],
          },
        ],
      },
      {
        id: "retry",
        heading: "二、重试与退避",
        blocks: [
          {
            type: "paragraph",
            text: "对瞬时错误（超时、限流）采用指数退避重试，并设置最大尝试次数；对确定性错误（参数非法、权限不足）直接失败并走人工或拒绝路径，避免无谓重试。",
          },
        ],
      },
      {
        id: "checkpoint",
        heading: "三、检查点",
        blocks: [
          {
            type: "paragraph",
            text: "在每轮循环开始时保存状态快照。长任务崩溃后可恢复，而非从头重跑，显著降低成本与延迟。",
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
              "为每类错误定义明确的处理策略（retry/fallback/escalate）。",
              "记录错误上下文到 trace，便于复盘。",
              "对不可逆操作（发邮件、改数据库）在失败前做幂等保护。",
            ],
          },
        ],
      },
      {
        id: "faq",
        heading: "五、常见问题",
        blocks: [
          { type: "list", items: ["Q：重试会加重成本吗？A：会，因此只对瞬时错误重试并设上限，同时利用检查点避免整轮重算。"] },
        ],
      },
      {
        id: "best",
        heading: "六、最佳实践",
        blocks: [
          { type: "list", items: ["错误可观测优先", "区分可重试与不可重试", "关键写操作幂等化"] },
        ],
      },
      {
        id: "next",
        heading: "七、延伸阅读",
        blocks: [{ type: "list", items: ["Agent Runtime", "AgentOps 架构", "生产就绪清单"] }],
      },
    ],
    tags: ["错误处理", "重试", "检查点"],
    architectureIds: ["a04", "a13"],
    relatedTutorialIds: ["agent-runtime", "agent-execution-loop"],
    references: [],
    updatedAt: "2026-11-09",
    status: "published",
  },
  {
    id: "t-ae-07",
    slug: "agent-state-management",
    domainId: "d01",
    title: "Agent State 管理",
    englishTitle: "Agent State Management",
    summary: "如何设计、序列化与隔离 Agent 运行态，支撑多会话与多租户。",
    difficulty: "中级",
    estimatedMinutes: 26,
    prerequisites: ["Agent Runtime"],
    learningObjectives: ["区分运行态与配置", "设计状态存储", "实现租户隔离"],
    sections: [
      {
        id: "what",
        heading: "一、什么是 Agent State",
        blocks: [
          {
            type: "paragraph",
            text: "Agent State 是运行期间的全部可变信息：目标、步骤、中间观察、变量、错误计数等。与之相对的是静态配置（系统提示、工具清单）。把二者分离，状态才能被持久化与恢复。",
          },
        ],
      },
      {
        id: "storage",
        heading: "二、存储设计",
        blocks: [
          {
            type: "list",
            items: [
              "短期：Redis / 内存，存活跃会话。",
              "长期：Postgres / 对象存储，存检查点与历史。",
              "隔离：以 tenant_id + session_id 为键，避免串台。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [
          { type: "list", items: ["状态结构需可序列化（JSON）", "敏感字段加密存储", "提供状态查询接口用于调试"] },
        ],
      },
      {
        id: "faq",
        heading: "四、常见问题",
        blocks: [{ type: "list", items: ["Q：状态太大放不进上下文？A：只把“当前需要”的部分注入提示，其余留存储按需检索。"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["状态与配置分离", "轻量注入、按需检索", "严格租户隔离"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["Agent Memory 架构", "Agent Runtime", "多租户平台"] }],
      },
    ],
    tags: ["State", "持久化", "隔离"],
    architectureIds: ["a04"],
    relatedTutorialIds: ["agent-runtime", "memory-architecture"],
    references: [],
    updatedAt: "2026-11-09",
    status: "published",
  },
  {
    id: "t-ae-08",
    slug: "agent-human-in-the-loop",
    domainId: "d01",
    title: "Agent 人工介入 Human-in-the-loop",
    englishTitle: "Agent Human-in-the-loop",
    summary: "在关键决策、敏感操作与低置信度场景引入人工确认的设计。",
    difficulty: "中级",
    estimatedMinutes: 24,
    prerequisites: ["Agent 执行循环", "Agent 安全"],
    learningObjectives: ["识别需人工的节点", "设计审批闸口", "实现暂停-恢复"],
    sections: [
      {
        id: "when",
        heading: "一、何时需要人工",
        blocks: [
          {
            type: "list",
            items: [
              "不可逆或高影响动作（发起付款、删除数据）。",
              "模型置信度低于阈值。",
              "命中合规/安全策略要求审批。",
            ],
          },
        ],
      },
      {
        id: "design",
        heading: "二、审批闸口设计",
        blocks: [
          {
            type: "mermaid",
            title: "HITL 流程",
            source: `flowchart LR
  A["Agent 决策"] --> CHECK{"敏感?"}
  CHECK -->|是| H["人工审批"]
  CHECK -->|否| EX["执行"]
  H -->|通过| EX
  H -->|拒绝| STOP["终止"]`,
            caption: "敏感动作需人工确认后再执行。",
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [
          { type: "list", items: ["把审批请求持久化，支持异步恢复", "向人工提供充分上下文（决策依据、影响）", "记录审批人与结果用于审计"] },
        ],
      },
      {
        id: "faq",
        heading: "四、常见问题",
        blocks: [{ type: "list", items: ["Q：人工介入会不会拖慢？A：只对真正高风险动作介入，多数路径仍可自动完成。"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["最小必要介入", "提供决策上下文", "全程审计"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["Agent 安全架构", "Workflow 审批", "企业 AI 治理"] }],
      },
    ],
    tags: ["HITL", "审批", "安全"],
    architectureIds: ["a14", "a05"],
    relatedTutorialIds: ["agent-guardrails", "human-approval"],
    references: [],
    updatedAt: "2026-11-09",
    status: "published",
  },
  {
    id: "t-ae-09",
    slug: "agent-design-patterns",
    domainId: "d01",
    title: "企业级 Agent 设计模式",
    englishTitle: "Agent Design Patterns",
    summary: "汇总 ReAct、Plan-and-Execute、Reflection、Tool-use、Routing 等常用模式与取舍。",
    difficulty: "中级",
    estimatedMinutes: 30,
    prerequisites: ["Agent 基础", "ReAct Pattern"],
    learningObjectives: ["识别主流模式", "理解各自适用场景", "能组合使用"],
    sections: [
      {
        id: "patterns",
        heading: "一、主流模式",
        blocks: [
          {
            type: "table",
            headers: ["模式", "适用", "特点"],
            rows: [
              ["ReAct", "通用任务", "边想边做"],
              ["Plan-and-Execute", "复杂任务", "先计划后执行"],
              ["Reflection", "质量要求高", "自我反思修正"],
              ["Routing", "多类请求", "分类后分发"],
              ["Tool-use", "强工具依赖", "围绕工具循环"],
            ],
          },
        ],
      },
      {
        id: "combine",
        heading: "二、模式组合",
        blocks: [
          {
            type: "paragraph",
            text: "真实系统常组合模式：用 Routing 把请求分到不同 Agent，内部用 Plan-and-Execute + Reflection 提升质量，敏感节点用 HITL。",
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["从最简单模式起步，按需升级", "为模式选择提供评估依据", "记录各模式的成本与质量"] }],
      },
      {
        id: "faq",
        heading: "四、常见问题",
        blocks: [{ type: "list", items: ["Q：选错模式会怎样？A：可能成本失控或质量不达标，需通过评估闭环迭代。"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["模式服务于目标", "可组合而非绑定单一", "用数据选模式"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["Multi-Agent 模式", "Workflow 设计", "Agent 评估"] }],
      },
    ],
    tags: ["设计模式", "ReAct", "Plan"],
    architectureIds: ["a01", "a03"],
    relatedTutorialIds: ["react-pattern", "planning-reasoning", "supervisor-pattern"],
    references: [],
    updatedAt: "2026-11-08",
    status: "published",
  },
  {
    id: "t-ae-10",
    slug: "planning-reasoning",
    domainId: "d01",
    title: "Planning & Reasoning：规划与推理",
    englishTitle: "Planning & Reasoning",
    summary: "理解 Agent 的规划策略（先计划后执行、逐步推理）与推理能力边界。",
    difficulty: "中级",
    estimatedMinutes: 28,
    prerequisites: ["Agent 基础"],
    learningObjectives: ["理解规划的价值", "掌握 Plan-and-Execute", "认识推理局限"],
    sections: [
      {
        id: "why",
        heading: "一、为什么需要规划",
        blocks: [
          {
            type: "paragraph",
            text: "复杂任务若只靠逐步试错，容易陷入循环或遗漏步骤。先制定显式计划，再执行并视情况重规划，可显著提升成功率与可解释性。",
          },
        ],
      },
      {
        id: "plan-execute",
        heading: "二、Plan-and-Execute",
        blocks: [
          {
            type: "mermaid",
            title: "Plan-and-Execute",
            source: `flowchart TB
  Q["任务"] --> P["制定计划"]
  P --> S1["步骤1"]
  S1 --> S2["步骤2"]
  S2 --> R{"完成?"}
  R -->|否| P
  R -->|是| F["Final"]`,
            caption: "先计划，逐步执行，未达标则重规划。",
          },
        ],
      },
      {
        id: "limits",
        heading: "三、推理能力边界",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            title: "注意",
            text: "LLM 的推理并非真实逻辑推导，长链推理易出错。对强逻辑/算术任务，应交给工具或符号系统，而非依赖模型“心算”。",
          },
        ],
      },
      {
        id: "practice",
        heading: "四、工程实践",
        blocks: [{ type: "list", items: ["计划以可检查的步骤表达", "每步结束验证中间结果", "把推理留给模型，把计算交给工具"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["计划可验证", "失败即重规划", "关键计算用工具"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["ReAct Pattern", "Agent 设计模式", "Multi-Agent 规划"] }],
      },
    ],
    tags: ["Planning", "Reasoning", "规划"],
    architectureIds: ["a02", "a01"],
    relatedTutorialIds: ["react-pattern", "agent-design-patterns"],
    references: [],
    updatedAt: "2026-11-08",
    status: "published",
  },
  {
    id: "t-ae-11",
    slug: "deployment",
    domainId: "d01",
    title: "Agent 部署与运行",
    englishTitle: "Agent Deployment",
    summary: "企业级 Agent 的上线、扩缩容、灰度与回滚实践。",
    difficulty: "高级",
    estimatedMinutes: 30,
    prerequisites: ["Agent Runtime", "AgentOps"],
    learningObjectives: ["设计部署拓扑", "实现灰度与回滚", "保障可用性"],
    sections: [
      {
        id: "topology",
        heading: "一、部署拓扑",
        blocks: [
          {
            type: "paragraph",
            text: "推荐无状态 Runtime + 有状态存储 + 独立工具/MCP 网关。Runtime 可水平扩展，工具后端部署在内网以收紧权限。",
          },
        ],
      },
      {
        id: "release",
        heading: "二、发布策略",
        blocks: [
          {
            type: "list",
            items: [
              "灰度：按租户/流量比例放量。",
              "评估门禁：关键指标不退化才全量。",
              "回滚：保留上一版 Prompt/模型配置，一键回退。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["配置与代码分离（Prompt/模型版本化）", "健康检查与限流", "为长任务提供异步与进度"] }],
      },
      {
        id: "faq",
        heading: "四、常见问题",
        blocks: [{ type: "list", items: ["Q：模型升级导致行为变化？A：把模型版本纳入配置并做回归评估，避免隐式升级。"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["可观测先行", "配置版本化", "回滚预案常备"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["AgentOps 架构", "AI 平台架构", "生产就绪清单"] }],
      },
    ],
    tags: ["部署", "运维", "灰度"],
    architectureIds: ["a15", "a13"],
    relatedTutorialIds: ["agent-runtime", "agentops-overview"],
    references: [],
    updatedAt: "2026-11-08",
    status: "published",
  },
  {
    id: "t-ae-12",
    slug: "enterprise-agent-architecture",
    domainId: "d01",
    title: "企业级 Agent 参考架构",
    englishTitle: "Enterprise Agent Reference Architecture",
    summary: "整合用户、Runtime、多智能体、MCP、RAG、记忆、工作流与平台的全景架构。",
    difficulty: "专家",
    estimatedMinutes: 45,
    prerequisites: ["Agent Runtime", "MCP", "RAG", "Agent 安全"],
    learningObjectives: ["建立企业 Agent 全景", "理解各层职责", "掌握分层与边界"],
    sections: [
      {
        id: "layers",
        heading: "一、分层视图",
        blocks: [
          {
            type: "mermaid",
            title: "企业 Agent 参考架构",
            source: `flowchart TB
  U["用户/业务"] --> GW["API 网关+鉴权"]
  GW --> ORCH["编排层"]
  ORCH --> SA["单/多 Agent"]
  ORCH --> WF["工作流"]
  SA --> RT["Runtime"]
  RT --> MCP["MCP 网关"]
  RT --> MEM["记忆"]
  RT --> RAG["RAG"]
  ORCH --> OBS["AgentOps"]
  ORCH --> GOV["治理"]`,
            caption: "从入口到能力层再到治理层的完整分层。",
          },
        ],
      },
      {
        id: "boundaries",
        heading: "二、关键边界",
        blocks: [
          {
            type: "list",
            items: [
              "入口边界：统一鉴权与多租户路由。",
              "决策边界：Agent 负责不确定性决策，确定性走工作流。",
              "能力边界：工具/知识经标准化网关接入。",
              "治理边界：安全与可观测贯穿全链路。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "三、落地建议",
        blocks: [
          { type: "list", items: ["先建最小闭环（Runtime+工具+RAG）", "再补多智能体与平台治理", "以参考架构为蓝图逐步演进"] },
        ],
      },
      {
        id: "faq",
        heading: "四、常见问题",
        blocks: [{ type: "list", items: ["Q：一定要上多智能体吗？A：不必。从单 Agent 起步，复杂度上升再引入编排。"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["分层解耦", "安全内建", "以可观测驱动迭代"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["Multi-Agent 架构", "MCP 架构", "AgentOps 架构", "AI 平台架构"] }],
      },
    ],
    tags: ["参考架构", "企业", "全景"],
    architectureIds: ["a01", "a15", "a14"],
    relatedTutorialIds: ["agent-runtime", "mcp-gateway", "agentops-overview"],
    references: [],
    updatedAt: "2026-11-10",
    status: "published",
    featured: true,
  },
];
