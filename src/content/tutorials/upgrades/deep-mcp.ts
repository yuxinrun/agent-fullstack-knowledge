import type { Tutorial } from "../../types";

// ============================================================================
// 第一批 · 领域 04 MCP 与 Agent 工具生态 · L5 / L4 深度升级
// 重要：本节替换了旧教程中使用 `from mcp.server import Server` +
// `@app.list_tools()` 的过时写法，改用 2026-11-13 核验的官方 Python SDK v2
// 真实 API（MCPServer / @mcp.tool() / mcp run --transport streamable-http）。
// 规范版本以 https://modelcontextprotocol.io/specification/2026-07-28 为基准。
// ============================================================================

export const deepMcp: Tutorial[] = [
  {
    id: "t-mcp-01",
    slug: "mcp-fundamentals",
    domainId: "d04",
    title: "MCP 深度解析：协议架构、生命周期与企业工具生态",
    englishTitle: "Model Context Protocol in Depth",
    summary:
      "从规范层面讲清 MCP 的 Host/Client/Server 架构、JSON-RPC 2.0 消息模型、初始化与能力协商、Tools/Resources/Prompts 与 Sampling/Roots/Elicitation 六类原语、传输层差异、鉴权与安全边界，并给出真实 SDK v2 代码与企业级网关设计。",
    difficulty: "中级",
    estimatedMinutes: 80,
    prerequisites: ["Function Calling 概念", "JSON-RPC 基础", "Agent 执行循环"],
    learningObjectives: [
      "解释 MCP 解决的 N×M 集成问题及其与 Function Calling、REST API 的边界",
      "画出并说明一次完整 MCP 会话的初始化、能力协商与工具调用流程",
      "区分服务端原语与客户端原语，说明各自的数据流与控制流",
      "能按官方 SDK 真实 API 开发 Server 并完成 Client 集成",
      "能设计企业级 MCP 网关的鉴权、审计、隔离与灰度策略",
    ],
    sections: [
      {
        id: "overview",
        heading: "1. 技术概述 Overview",
        blocks: [
          {
            type: "paragraph",
            text: "MCP（Model Context Protocol）是一个开放协议，用统一方式把 LLM 应用连接到外部数据源与工具。它规定了消息格式（JSON-RPC 2.0）、会话生命周期（初始化与能力协商）、能力原语（工具、资源、提示模板）以及传输方式，使「N 个 Host × M 个服务」的私有适配退化为「各实现一次协议」。",
          },
          {
            type: "paragraph",
            text: "技术背景是工具集成碎片化：每个 Agent 框架都自定义一套工具描述与调用协议，同一个 ERP 系统要为不同框架重复开发适配器。MCP 把这些约定标准化，让工具成为可被任意兼容 Host 复用的能力单元。",
          },
          {
            type: "table",
            headers: ["维度", "MCP", "Function Calling", "普通 REST/OpenAPI"],
            rows: [
              ["定位", "Host 与工具服务之间的协议", "模型与程序之间的调用约定", "服务之间的 HTTP 接口约定"],
              ["发现能力", "运行时 list_tools 动态发现", "请求时由调用方硬编码传入", "需查阅文档或 OpenAPI 文件"],
              ["会话", "有状态连接 + 能力协商", "无状态，单请求内完成", "通常无状态"],
              ["双向能力", "支持 Sampling / Elicitation 反向请求", "不支持", "需自行实现回调"],
              ["安全模型", "规范要求用户同意与工具描述不可信", "由调用方应用负责", "由服务自身负责"],
            ],
          },
          {
            type: "list",
            items: [
              "适用场景：需要跨多个 Agent 宿主复用同一批工具；工具集需动态发现；企业需统一收口工具权限与审计。",
              "不适用场景：单个应用内一次性、固定的少量内部函数（直接函数调用更简单）；超高吞吐、无需语义描述的纯数据管道。",
              "与 Function Calling 的关系而非替代：模型侧仍用 function calling 表达「想调什么」，MCP 负责「这个工具从哪来、怎么发现、怎么安全执行」。",
              "MCP 不是 Agent 框架，也不是编排引擎；它不负责规划、记忆与循环控制。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "规范版本",
            text: "截至 2026-11-13，官方规范 latest 为 2026-07-28，历史版本包括 2025-11-25、2025-06-18、2025-03-26、2024-11-05。实现与教程必须标注所依据版本，因为传输层与安全要求在各版本间有变化。",
          },
        ],
      },
      {
        id: "fundamentals",
        heading: "2. 核心原理 Fundamentals",
        blocks: [
          {
            type: "paragraph",
            text: "MCP 会话是「有状态的、双向的 JSON-RPC 2.0 连接」。连接建立后 Client 首先发起 initialize，双方交换协议版本与能力集合（capabilities），协商成功后进入操作阶段，最后显式关闭。能力协商决定了本次会话能使用哪些原语，因此同一 Server 对不同 Client 可以呈现不同能力集。",
          },
          {
            type: "mermaid",
            title: "MCP 会话生命周期",
            source: `sequenceDiagram
  participant H as Host(含 MCP Client)
  participant S as MCP Server
  H->>S: initialize(protocolVersion, capabilities, clientInfo)
  S-->>H: InitializeResult(protocolVersion, capabilities, serverInfo)
  H->>S: notifications/initialized
  H->>S: tools/list
  S-->>H: tools[](name, description, inputSchema)
  H->>S: tools/call(name, arguments)
  S-->>H: CallToolResult(content, structuredContent, isError)
  S->>H: notifications/tools/list_changed (可选)
  H->>S: shutdown / 关闭传输`,
            caption: "初始化 → 能力协商 → 发现 → 调用 → 变更通知 → 关闭。",
          },
          {
            type: "table",
            headers: ["原语", "提供方", "控制方", "典型方法", "语义"],
            rows: [
              ["Tools", "Server", "模型（建议调用）", "tools/list、tools/call", "可执行动作，可能产生副作用"],
              ["Resources", "Server", "应用/用户", "resources/list、resources/read", "可读取的上下文数据"],
              ["Prompts", "Server", "用户", "prompts/list、prompts/get", "可复用的提示模板"],
              ["Sampling", "Client", "Server 请求、用户批准", "sampling/createMessage", "Server 反向借用 Host 的模型能力"],
              ["Roots", "Client", "用户/应用", "roots/list", "Server 可访问的文件系统边界"],
              ["Elicitation", "Client", "Server 请求、用户批准", "elicitation/create", "运行中向用户补充索取信息"],
            ],
          },
          {
            type: "paragraph",
            text: "关键数据结构是工具描述对象：name、description、inputSchema（JSON Schema）、以及可选的输出 Schema 与注解。关键状态包括协议版本、已协商能力、会话ID、订阅的资源与通知序列。系统边界必须明确：Server 提供的工具描述是不可信文本，可能包含诱导模型的指令；Host 必须把工具定义与工具返回值都当作数据而非指令。",
          },
          {
            type: "list",
            items: [
              "局限一：协议本身不提供业务级权限模型，RBAC/ABAC 与审批需由网关或 Host 实现。",
              "局限二：工具描述的自然语言质量直接决定模型调用准确率，描述歧义会造成错误调用。",
              "局限三：跨网络远程 Server 引入额外的延迟、鉴权与可用性问题。",
              "局限四：多版本规范并存，Client/Server 版本不匹配时需降级协商或拒绝连接。",
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
            title: "MCP 三层架构与企业网关",
            source: `flowchart TB
  subgraph HOST["Host 进程（IDE / Agent 应用）"]
    APP["Agent Runtime"]
    C1["MCP Client A"]
    C2["MCP Client B"]
  end
  APP --> C1
  APP --> C2
  C1 --> GW["企业 MCP 网关 认证/授权/审计/限流"]
  C2 --> GW
  GW --> S1["MCP Server: ERP"]
  GW --> S2["MCP Server: ITSM"]
  GW --> S3["MCP Server: 知识库"]
  S1 --> DB1[("业务库")]
  S2 --> API["ITSM API"]
  S3 --> VDB[("向量库")]
  GW --> AUD[("审计日志")]
  GW --> POL["策略引擎 RBAC/ABAC"]`,
            caption: "一个 Host 可持多个 Client；企业侧以网关收敛鉴权与审计。",
          },
          {
            type: "table",
            headers: ["组件", "职责", "输入", "输出", "依赖"],
            rows: [
              ["Host", "承载模型与 Agent Runtime，发起连接并呈现工具", "用户目标", "工具调用请求", "MCP Client"],
              ["MCP Client", "维护与单个 Server 的 1:1 有状态会话", "Host 请求", "JSON-RPC 消息", "传输层"],
              ["MCP Server", "暴露工具/资源/提示，执行真实业务动作", "tools/call", "CallToolResult", "业务系统"],
              ["MCP 网关", "统一认证、授权、限流、审计、协议转换", "所有 RPC", "放行/拒绝 + 日志", "策略引擎、审计存储"],
              ["传输层", "承载 stdio / Streamable HTTP 消息", "JSON-RPC 字节流", "消息帧", "进程或 HTTP"],
            ],
          },
          {
            type: "list",
            items: [
              "控制流：Host 决定调用哪个 Client；Client 与 Server 通过 initialize 协商能力；tools/call 由网关校验后转发。",
              "数据流：工具描述与资源内容从 Server 流向 Host；参数与审批决策从 Host 流向 Server。",
              "状态流：会话状态在 Client/Server 两侧维护；网关维护租户上下文与审计序号；重启后需重新协商。",
              "外部依赖：业务系统 API、数据库、身份提供方（IdP）、密钥管理、策略引擎、审计存储。",
              "异常处理：工具执行失败以 isError 结果返回而非协议崩溃；连接断开需重连并重新 initialize；网关限流返回标准错误。",
              "扩展方式：新增 Server 即新增能力；网关按租户路由；高频工具可水平扩容并做无状态化改造。",
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
            headers: ["组件", "为什么需要", "输入 / 输出", "如何实现", "常见问题"],
            rows: [
              ["Tool Registry", "统一发现与描述", "无 / tools[]", "Server 侧注册 + inputSchema", "描述含糊导致误调用"],
              ["Resource Provider", "让模型读取文件/记录", "URI / 内容", "resources/read + 订阅", "未做范围校验导致越权读取"],
              ["Transport", "承载双向消息", "JSON-RPC / 帧", "stdio 或 Streamable HTTP", "混用旧 SSE 引发兼容问题"],
              ["Auth Layer", "远程连接必须鉴权", "令牌 / 身份", "OAuth 2.1 等（按规范版本实现）", "把密钥写进配置或日志"],
              ["Client Session", "维护能力与订阅", "initialize / 会话状态", "按协议版本协商", "版本不匹配未显式报错"],
              ["Gateway", "企业统一治理", "RPC / 放行或拒绝", "反向代理 + 策略引擎", "只做转发不做授权"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "传输层选型",
            text: "stdio 适合本机子进程（低延迟、无网络暴露）；Streamable HTTP 适合远程服务。官方已把旧 HTTP+SSE 传输标记为弃用，新代码不应再采用；具体传输名称与参数请按所用规范版本与 SDK 版本核验。",
          },
        ],
      },
      {
        id: "flow",
        heading: "5. 工作流程 Execution Flow",
        blocks: [
          {
            type: "list",
            ordered: true,
            items: [
              "Host 启动并按配置为每个 Server 创建一个 MCP Client。",
              "Client 建立传输连接（stdio 子进程或 HTTP 会话）。",
              "Client 发送 initialize，携带协议版本、自身能力与客户端信息。",
              "Server 返回 InitializeResult：确认版本、声明能力（tools/resources/prompts 等）与服务端信息。",
              "Client 发送 notifications/initialized，会话进入可操作状态。",
              "Client 调用 tools/list 拉取工具描述与 inputSchema，Host 把其映射为模型可见的 function calling 定义。",
              "模型产出工具名与参数；Host 按 inputSchema 做参数校验。",
              "网关执行身份认证与 RBAC/ABAC 授权，敏感工具触发人工审批。",
              "Client 发送 tools/call；Server 执行真实业务动作。",
              "Server 返回 CallToolResult（content / structuredContent / isError）。",
              "Host 把结果作为观察回灌 Agent 执行循环，进入下一轮推理。",
              "Server 可选发送 list_changed 通知触发重新发现；会话结束关闭传输。",
            ],
          },
          {
            type: "mermaid",
            title: "工具调用的数据流与控制流",
            source: `flowchart LR
  M["模型产出 tool_call"] --> V["Host 参数校验"]
  V --> P["网关 认证+授权+审批"]
  P -->|拒绝| E["错误观察回灌"]
  P -->|允许| C["MCP Client tools/call"]
  C --> S["MCP Server 执行"]
  S --> B["业务系统"]
  B --> R["CallToolResult"]
  R --> O["观察回灌轨迹"]
  E --> O`,
            caption: "授权失败也必须生成可回灌的结构化错误，而不是中断整个会话。",
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
              ["本地 stdio Server", "IDE 插件、本机文件与脚本", "低延迟、凭据不出机", "无法集中治理与审计"],
              ["远程 Streamable HTTP", "企业共享工具服务", "可集中鉴权与扩容", "需处理网络、令牌与可用性"],
              ["MCP 网关", "多租户企业平台", "权限/审计/限流统一", "增加一跳延迟与运维复杂度"],
              ["能力分组 Server", "按业务域拆分工具", "边界清晰、最小权限", "Server 数量增多、发现成本高"],
              ["Server 聚合", "把多个后端聚合成一个 Server", "客户端配置简单", "故障域扩大、权限粒度变粗"],
            ],
          },
          {
            type: "list",
            items: [
              "常见错误 1：把工具描述当作可信指令拼进 system prompt（间接提示注入通道）。",
              "常见错误 2：tools/call 前不做参数 Schema 校验，直接把模型 JSON 传给后端。",
              "常见错误 3：写操作没有审批与幂等键，重试造成重复副作用。",
              "常见错误 4：用网关只做转发而不做授权，等同于无权限控制。",
              "常见错误 5：把所有工具塞进一个 Server，无法按租户做最小权限隔离。",
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
              ["官方 Python SDK（mcp）", "Python 工具服务", "官方维护、迭代较快 / 需跟版本", "高", "低", "Python 技术栈首选"],
              ["官方 TypeScript SDK", "Node/前端 Host 集成", "官方维护 / 需跟版本", "高", "低", "TS 项目首选"],
              ["Java / Kotlin / C# / Go 等官方 SDK", "既有企业后端语言栈", "官方维护，成熟度各异", "中高", "低", "按现有技术栈选"],
              ["stdio + 子进程", "本机工具", "稳定 / 运维轻", "低", "低", "开发调试与 IDE 场景"],
              ["Streamable HTTP + 网关", "企业共享服务", "需自建鉴权与可观测", "高", "低", "生产多租户场景"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "版本核验提示",
            text: "SDK 版本演进较快，API 名称与导入路径可能变化（例如 Python SDK v1 的 FastMCP 与 v2 的 MCPServer 路径不同）。本节示例依据 2026-11-13 核验的官方 README；落地前须按实际安装版本复核导入路径与方法签名，不能照抄旧教程。",
          },
          {
            type: "list",
            items: [
              "维护成本：协议版本升级会波及所有 Server，建议封装一层内部适配接口。",
              "性能考虑：远程工具的主要开销在业务系统调用，协议本身开销小；重点是连接复用与并发控制。",
              "降低锁定：业务实现与协议层分离，使替换为其他工具协议时不改动业务逻辑。",
            ],
          },
        ],
      },
      {
        id: "hands-on",
        heading: "8. Hands-on 实战：开发并调用一个真实 MCP Server",
        blocks: [
          {
            type: "paragraph",
            text: "实验目标：用官方 Python SDK 的当前 API 开发一个暴露只读工具的 MCP Server，再用官方 Client 完成能力发现与调用，并给出参数错误、权限拒绝、超时三类异常的处理示例。以下 API 形态依据 2026-11-13 核验的官方仓库 README（`mcp[cli]`、`MCPServer`、`@mcp.tool()`、`Client`、`structured_content`）；安装前请按实际版本复核。",
          },
          {
            type: "code",
            language: "text",
            filename: "项目目录结构",
            caption: "本节多文件项目布局",
            code: String.raw`mcp-inventory/
├── requirements.txt
├── .env.example
├── server.py         # MCP Server：暴露只读库存工具
├── client.py         # MCP Client：发现并调用工具
└── test_tools.py     # 离线单元测试（不依赖网络）`,
          },
          {
            type: "code",
            language: "bash",
            filename: "requirements.txt / 安装与运行命令",
            caption: "环境要求：Python 3.11+（官方 SDK 要求 3.10+，推荐 3.11+）",
            code: String.raw`# requirements.txt
mcp[cli]>=1.0
pytest>=8.0

# 或使用 uv（官方示例常用）
# uv add "mcp[cli]"

# 安装
python -m venv .venv
. .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install "mcp[cli]"

# 本地调试（官方 CLI）
mcp dev server.py

# 以 Streamable HTTP 启动远程服务
mcp run server.py --transport streamable-http

# 另开终端运行客户端
python client.py

# 离线测试
pytest -q test_tools.py`,
          },
          {
            type: "code",
            language: "python",
            filename: "server.py",
            caption: "真实 SDK API：MCPServer + @mcp.tool()；业务实现为教学模拟数据",
            code: String.raw`"""MCP Server：暴露一个只读库存查询工具。

依赖：pip install "mcp[cli]"（Python 3.11+）
运行：mcp dev server.py  或  mcp run server.py --transport streamable-http
说明：inventory_lookup 为教学模拟实现，不含真实业务系统。
API 形态核验：官方 modelcontextprotocol/python-sdk README（2026-11-13）。
"""
from typing import Any

from mcp.server import MCPServer

mcp = MCPServer("inventory-service")

# 教学模拟数据源；生产环境替换为真实库存服务客户端
MOCK_DB: dict[str, dict[str, Any]] = {
    "A-1003": {"sku": "A-1003", "available": 3, "warehouse": "WH-01"},
    "B-2001": {"sku": "B-2001", "available": 0, "warehouse": "WH-02"},
}


def inventory_lookup(sku: str) -> dict[str, Any]:
    """按 SKU 查询库存；参数由 SDK 依据类型注解生成 inputSchema。"""
    if not sku or not isinstance(sku, str):
        return {"error": "invalid_arguments", "detail": "sku 必须为非空字符串"}
    row = MOCK_DB.get(sku)
    if row is None:
        return {"found": False, "sku": sku}
    return {"found": True, **row, "source": "mock-inventory-db"}


# 用官方核验过的装饰器注册为 MCP Tool（名称、描述、Schema 由 SDK 从函数签名与 docstring 推导）
@mcp.tool()
def get_inventory(sku: str) -> dict[str, Any]:
    """按 SKU 查询当前可用库存（只读）。生产环境替换为真实库存服务。"""
    return inventory_lookup(sku)


@mcp.resource("inventory://{sku}")
def inventory_resource(sku: str) -> str:
    """以 Resource 形式提供同一数据的只读视图。"""
    row = MOCK_DB.get(sku)
    return f"SKU {sku}: available={row['available'] if row else 'unknown'}"


if __name__ == "__main__":
    mcp.run()`,
          },
          {
            type: "code",
            language: "python",
            filename: "client.py",
            caption: "官方 Client：连接、能力发现、工具调用与结构化结果读取",
            code: String.raw`"""MCP Client 集成示例（异步）。

运行前先启动：mcp run server.py --transport streamable-http
环境变量：MCP_SERVER_URL（默认 http://localhost:8000/mcp）
API 形态核验：官方 python-sdk README（2026-11-13）。
"""
import asyncio
import json
import os

from mcp import Client


async def main() -> None:
    url = os.environ.get("MCP_SERVER_URL", "http://localhost:8000/mcp")
    async with Client(url) as client:
        # 能力发现：列出服务端工具
        tools = await client.list_tools()
        names = [t.name for t in tools.tools] if hasattr(tools, "tools") else [str(t) for t in tools]
        print("discovered tools:", names)

        # 工具调用：返回结构化结果
        result = await client.call_tool("get_inventory", {"sku": "A-1003"})
        print("structured_content:", getattr(result, "structured_content", None))
        print("is_error:", getattr(result, "is_error", False))

        # 错误参数：应返回可解释的错误，而不是抛未处理异常
        bad = await client.call_tool("get_inventory", {"sku": ""})
        print("invalid args result:", json.dumps(
            getattr(bad, "structured_content", None), ensure_ascii=False
        ))

        # 资源读取
        try:
            res = await client.read_resource("inventory://A-1003")
            print("resource:", res)
        except Exception as exc:
            print("resource unavailable:", type(exc).__name__)


if __name__ == "__main__":
    asyncio.run(main())`,
          },
          {
            type: "code",
            language: "python",
            filename: "test_tools.py",
            caption: "离线测试：参数边界、未命中、数据源隔离（不启动网络服务）",
            code: String.raw`import pytest

from server import inventory_lookup, MOCK_DB


def test_valid_lookup():
    r = inventory_lookup("A-1003")
    assert r["found"] is True
    assert r["available"] == 3
    assert r["source"] == "mock-inventory-db"


def test_missing_sku():
    r = inventory_lookup("NOT-EXIST")
    assert r == {"found": False, "sku": "NOT-EXIST"}


@pytest.mark.parametrize("bad", ["", None, 123])
def test_invalid_arguments(bad):
    r = inventory_lookup(bad)
    assert r["error"] == "invalid_arguments"


def test_readonly_does_not_mutate():
    before = {k: dict(v) for k, v in MOCK_DB.items()}
    inventory_lookup("A-1003")
    assert MOCK_DB == before`,
          },
          {
            type: "table",
            headers: ["项目", "内容"],
            rows: [
              ["输入示例", "python client.py（服务端已以 streamable-http 启动）"],
              ["输出示例", "discovered tools: ['inventory_lookup', ...] / structured_content: {'found': True, 'sku': 'A-1003', 'available': 3, ...}"],
              ["结果解释", "Client 完成 initialize 与能力协商 → list_tools 发现工具 → call_tool 得到结构化结果"],
              ["常见错误 1", "导入路径报错：SDK 版本差异导致，按已安装版本的官方文档核对 MCPServer/FastMCP 路径"],
              ["常见错误 2", "端口或路径不匹配：确认 MCP_SERVER_URL 与 mcp run 的监听地址一致"],
              ["常见错误 3", "工具名不一致：装饰器注册名与调用名需完全一致"],
              ["常见错误 4", "把旧教程的 `from mcp.server import Server` 照抄：那是过时写法，应改用当前 SDK 的公开 API"],
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "哪些部分是示意 / 需替换",
            text: "MOCK_DB 是教学模拟数据；真实项目需替换为库存服务客户端、加入认证与租户过滤、接入网关审计，并把写操作工具加上审批与幂等键。协议与 Client/Server 结构可直接沿用。",
          },
        ],
      },
      {
        id: "case",
        heading: "9. 企业应用案例：统一工具层（教学模拟案例）",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            title: "教学模拟案例声明",
            text: "本节为贯穿全站项目 A 的工具层案例，系统名称与数据均为虚构，不代表真实客户或生产效果。",
          },
          {
            type: "paragraph",
            text: "业务背景：某企业有 ERP、ITSM、CMDB、知识库四套系统，三个 Agent 应用各自维护一套适配器，权限口径不一致且无法审计工具调用。业务问题是工具接入成本高、越权风险不可控。技术目标是把工具层统一到 MCP 协议，并在网关收敛鉴权与审计。",
          },
          {
            type: "table",
            headers: ["环节", "工程细节"],
            rows: [
              ["系统设计", "每个业务域一个 MCP Server；所有流量经企业 MCP 网关；Host 通过 MCP Client 连接"],
              ["数据来源", "ERP 只读视图、ITSM 工单 API、CMDB 配置项、知识库向量检索（教学模拟）"],
              ["组件选择", "官方 Python SDK 实现 Server；网关做 OAuth 校验、RBAC/ABAC、限流与审计"],
              ["执行流程", "initialize 协商 → 按租户过滤后的 tools/list → 参数校验 → 授权 → tools/call → 审计落库"],
              ["安全权限", "按租户返回可见工具子集；写工具强制审批；工具描述视为不可信内容"],
              ["异常处理", "业务失败以 isError 返回；网关限流返回标准错误；连接断开重连并重新协商"],
              ["部署方案", "Server 无状态多副本部署在 K8s，网关独立限流，审计日志集中存储"],
              ["效果评估", "工具复用率、越权拦截数、tools/call P95 延迟、参数校验失败率"],
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
              "高可用：远程 Server 多副本 + 健康检查；Client 连接断开自动重连并重新 initialize。",
              "可扩展性：按业务域拆分 Server；网关按租户路由；工具级限流避免单个慢工具拖垮会话。",
              "并发：Client 与 Server 保持 1:1 会话，多个工具调用可并发但需控制共享状态写入。",
              "延迟与成本：连接复用减少握手；只对需要的 Server 做 list_tools；对描述做缓存与变更通知。",
              "超时与重试：仅对只读幂等工具重试；写工具必须使用幂等键，避免重复业务副作用。",
              "状态持久化：会话状态在协议层是易失的，业务侧状态必须由业务系统自身持久化。",
              "日志/监控/追踪：网关记录每次 tools/call 的调用方、工具名、参数摘要、耗时、结果码；参数脱敏。",
              "灰度发布与版本管理：工具 Schema 变更需版本化并灰度；Client/Server 协议版本不匹配时显式拒绝并告警。",
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
              "身份认证：远程 Server 按所用规范版本实现授权流程；凭据仅存环境变量或密钥管理，不进代码与日志。",
              "权限控制：按租户返回可见工具子集（能力协商阶段即过滤），运行时再做 RBAC/ABAC 判定。",
              "数据保护：工具描述与返回值可能含敏感字段，入日志前脱敏；Resource 读取做范围校验。",
              "输入验证：模型生成的参数按 inputSchema 强校验，绝不直接透传给后端。",
              "输出校验：CallToolResult 作为数据处理，防止间接提示注入；不拼入 system 指令。",
              "工具权限：只读/写分级，写操作强制用户同意与人工审批，遵循规范的安全原则。",
              "审计：记录调用方、工具、参数摘要、审批人、结果与耗时，支持回放与合规检查。",
              "风险控制：Server 白名单、工具级速率限制、应急熔断开关。",
            ],
          },
          {
            type: "callout",
            variant: "danger",
            title: "规范明确的安全原则",
            text: "官方规范强调：工具调用代表可执行代码，任何工具调用都应有用户明确同意；Host 不得在用户未同意的情况下把数据发给未信任的 Server；工具描述（含注解）应被视为不可信。这些是协议层要求，不是本站建议。",
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
              ["协议一致性", "initialize / list_tools / call_tool 契约测试", "多组协议版本与能力组合", "协商成功率、错误码正确率"],
              ["工具发现准确性", "按描述做工具选择评测", "意图→期望工具映射集", "工具选择准确率"],
              ["参数合法性", "Schema 边界与异常参数", "缺字段、类型错、越界", "非法参数拦截率"],
              ["权限隔离", "跨租户越权用例", "不同租户/角色请求", "越权调用成功数 = 0"],
              ["可靠性", "连接断开、超时、限流注入", "故障注入脚本", "重连成功率、重试副作用次数"],
              ["安全性", "间接提示注入红队用例", "含恶意指令的工具描述/返回值", "越界拦截率"],
            ],
          },
          {
            type: "paragraph",
            text: "回归测试建议：Server 的 tools/list 输出做快照断言（名称、描述、Schema），Schema 变更必须显式更新基线；把 test_tools.py 的离线用例接入 CI，并在网关层加入跨租户越权用例作为发布门禁。",
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
              "工具描述写清「做什么、不做什么、参数含义与副作用」，并保持版本化。",
              "按业务域拆分 Server，按租户过滤可见工具，遵循最小权限。",
              "tools/call 前做 Schema 校验与授权；写操作配幂等键与审批。",
              "把工具描述与返回值都当不可信数据，绝不拼进系统指令。",
              "远程 Server 启用鉴权、限流、审计与协议版本校验，避免只做转发。",
              "为 Client/Server 版本差异写显式降级或拒绝逻辑，不要静默兼容。",
              "接入可观测：每次调用一个 span，含工具名、耗时、结果码与脱敏参数摘要。",
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
              ["initialize 失败", "协议版本或能力不匹配", "对比双方 protocolVersion", "显式协商或拒绝并告警", "锁定并标注所依据规范版本"],
              ["导入路径报错", "SDK 版本差异 / 照抄旧教程", "查已安装版本官方文档", "改用当前版本公开 API", "依赖锁定 + 升级检查清单"],
              ["tools/list 返回空", "租户过滤或注册未生效", "检查装饰器注册与网关过滤", "修正注册与过滤规则", "契约测试快照"],
              ["模型频繁调错工具", "描述含糊、工具过多", "看工具选择评测结果", "重写描述、按域拆分", "工具选择评测纳入门禁"],
              ["远程调用偶发超时", "业务后端慢或连接未复用", "看网关 P95 与连接数", "连接复用 + 超时分级 + 熔断", "容量规划与故障注入"],
              ["越权调用成功", "网关只转发未授权", "审计日志查授权 span", "在网关强制 RBAC/ABAC", "跨租户红队用例"],
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
              "相关教程：开发你的第一个 MCP Server、MCP 网关与企业级部署、Tool Calling 完整执行链、Agent 护栏与权限治理。",
              "相关架构：MCP 工具生态架构、企业 AI 平台参考架构。",
              "相关实验：MCP 工具调用实验。",
              "相关企业案例：IT Operations Agent（项目 A，统一工具层）。",
              "官方资料：MCP 规范（2026-07-28）、官方 Python SDK 仓库、JSON-RPC 2.0 规范，见下方参考资料。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "资料核验说明",
            text: "MCP 规范版本列表、原语划分、生命周期与安全原则，以及 Python SDK 的安装命令与核心 API 形态，均于 2026-11-13 联网核验官方站点与仓库。SDK 小版本号与部分 API 参数未逐项复核，落地前需按实际安装版本复核；本站工程建议不属于行业标准。",
          },
        ],
      },
      {
        id: "engineering-notes",
        heading: "16. 工程实现补遗：组件交互时序、故障演练与上线验收",
        blocks: [
          {
            type: "paragraph",
            text: "能力协商发生在 initialize 阶段：Server 声明的 capabilities 决定后续哪些请求合法。tools/list 返回的 JSON Schema 是 Host 构造参数校验的唯一依据；工具描述文本属于不可信数据，不能当作指令执行。",
          },
          {
            type: "mermaid",
            title: "组件交互时序（含失败分支）",
            source: String.raw`sequenceDiagram
  participant H as Host
  participant C as MCP Client
  participant S as MCP Server
  H->>C: 建立会话
  C->>S: initialize(protocolVersion, capabilities)
  S-->>C: 协商结果(能力集, 版本)
  C->>S: tools/list
  S-->>C: tools Schema(只读)
  H->>C: 用户确认调用某工具
  C->>S: tools/call(name, args)
  alt 执行成功
    S-->>C: structured_content / content
  else 工具报错或越权
    S-->>C: JSON-RPC error
    C-->>H: 结构化错误 + 审计
  end
  C-->>H: 结果(标记为数据)`,
            caption: "消息顺序、超时分支与降级路径；箭头方向即控制流方向。",
          },
          {
            type: "table",
            headers: ["组件交互契约", "传递内容", "超时/失败语义"],
            rows: [
              ["Host → Client","用户授权范围与工具候选","未获同意不得发起 tools/call"],
              ["Client → Server","JSON-RPC 请求 + 协商后的版本","传输断开按重连与超时策略处理"],
              ["Server → Client","Schema 与结构化结果","描述文本与返回值均视为不可信数据"],
            ],
          },
          {
            type: "table",
            headers: ["类别", "可执行操作", "通过标准"],
            rows: [
              ["故障注入","让 Server 返回带指令文本的 resource","Host 不执行其中指令，审计标记注入信号"],
              ["故障注入","stdio 进程中途退出","Client 按重连上限恢复，失败则降级为人工"],
              ["上线验收","按官方 SDK 运行 test_tools.py","能力协商与结构化结果解析通过"],
              ["上线验收","核对工具白名单与最小权限","未注册工具一律拒绝"],
            ],
          },
          {
            type: "paragraph",
            text: "落地替换点：把示例 Server 换成企业工具服务并按官方规范实现传输层，凭据由 Server 侧从密钥服务读取，Host 侧保留用户同意与审计记录。SDK 方法名、协议版本与字段必须按对应官方文档核验后替换，本节不假定任何具体版本。",
          },
        ],
      },
    ],
    tags: ["MCP", "协议", "JSON-RPC", "工具生态", "企业网关"],
    architectureIds: ["a06", "a15"],
    relatedTutorialIds: [
      "mcp-server-dev",
      "mcp-gateway",
      "tool-calling",
      "agent-guardrails",
      "ai-platform-architecture",
    ],
    nextTutorialSlugs: ["mcp-server-dev", "mcp-gateway"],
    relatedLabSlugs: ["mcp-tool-call"],
    relatedCaseSlugs: ["it-operations-agent"],
    references: [
      {
        title: "MCP Specification（latest 2026-07-28）",
        url: "https://modelcontextprotocol.io/specification/2026-07-28",
        organization: "Model Context Protocol",
        kind: "官方规范",
        version: "2026-07-28；历史版本 2025-11-25 / 2025-06-18 / 2025-03-26 / 2024-11-05",
        purpose: "核验协议架构、生命周期、六类原语、传输层与安全原则",
        verifiedAt: "2026-11-13",
      },
      {
        title: "MCP Python SDK 官方仓库 README",
        url: "https://github.com/modelcontextprotocol/python-sdk",
        organization: "Model Context Protocol",
        kind: "官方产品文档",
        version: "v2 系列（在线文档，随版本更新）；核验于 2026-11-13",
        purpose: "核验 mcp[cli] 安装、MCPServer、@mcp.tool()、mcp run --transport、Client.call_tool、structured_content 的真实 API",
        verifiedAt: "2026-11-13",
      },
      {
        title: "JSON-RPC 2.0 Specification",
        url: "https://www.jsonrpc.org/specification",
        organization: "JSON-RPC Working Group",
        kind: "官方规范",
        purpose: "核验请求/响应/通知消息结构与错误对象格式",
        verifiedAt: "2026-11-13",
      },
      {
        title: "MCP 官方架构与概念文档",
        url: "https://modelcontextprotocol.io/docs/learn/architecture",
        organization: "Model Context Protocol",
        kind: "官方产品文档",
        purpose: "核验 Host/Client/Server 职责与能力协商说明；页面路径需进一步核验",
        verifiedAt: "2026-11-13",
      },
    ],
    updatedAt: "2026-11-13",
    status: "published",
    qualityLevel: "L5",
  },
];
