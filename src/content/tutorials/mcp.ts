import type { Tutorial } from "../types";

export const mcpTutorials: Tutorial[] = [
  {
    id: "t-mcp-01",
    slug: "mcp-fundamentals",
    domainId: "d04",
    title: "MCP 基础与整体架构",
    englishTitle: "MCP Fundamentals",
    summary: "理解 Model Context Protocol 解决的问题、Host/Client/Server 架构与核心原语。",
    difficulty: "中级",
    estimatedMinutes: 26,
    prerequisites: ["Tool Calling", "Agent 基础"],
    learningObjectives: ["理解 MCP 解决的问题", "掌握 Host/Client/Server 架构", "认识 Tools/Resources/Prompts"],
    sections: [
      {
        id: "why",
        heading: "一、MCP 解决什么",
        blocks: [
          {
            type: "paragraph",
            text: "每个 Agent 为接入一个新系统都要写一套私有集成，导致“N 个模型 × M 个工具”的组合爆炸。MCP 提供统一协议，让工具以标准方式暴露能力，模型侧一次适配即可复用所有 MCP Server。",
          },
        ],
      },
      {
        id: "arch",
        heading: "二、整体架构",
        blocks: [
          {
            type: "mermaid",
            title: "MCP 架构",
            source: `flowchart LR
  H["Host (如 IDE/Agent)"] --> C["MCP Client"]
  C -->|"JSON-RPC"| S["MCP Server"]
  S --> T["Tools"]
  S --> R["Resources"]
  S --> P["Prompts"]`,
            caption: "Host 通过 Client 与多个 Server 通信。",
          },
        ],
      },
      {
        id: "primitives",
        heading: "三、核心原语",
        blocks: [
          {
            type: "table",
            headers: ["原语", "含义", "类比"],
            rows: [
              ["Tools", "可执行的动作（写/调用）", "函数"],
              ["Resources", "可读取的数据/文件", "只读上下文"],
              ["Prompts", "可复用的提示模板", "Prompt 片段"],
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "四、工程实践",
        blocks: [{ type: "list", items: ["Server 只暴露必要原语", "传输优先 stdio/HTTP+SSE", "权限在网关层统一收敛"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["协议标准化", "能力最小化", "权限集中治理"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["开发 MCP Server", "MCP 网关", "Tool Calling"] }],
      },
    ],
    tags: ["MCP", "协议", "工具"],
    architectureIds: ["a06"],
    relatedTutorialIds: ["mcp-server-dev", "mcp-gateway", "tool-calling"],
    references: [{ title: "Model Context Protocol 官方文档", url: "https://modelcontextprotocol.io" }],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-mcp-02",
    slug: "mcp-server-dev",
    domainId: "d04",
    title: "开发你的第一个 MCP Server",
    englishTitle: "MCP Server Development",
    summary: "用一个最小示例开发一个暴露 Tools 的 MCP Server，并接入 Agent Client。",
    difficulty: "中级",
    estimatedMinutes: 38,
    prerequisites: ["MCP 基础与整体架构"],
    learningObjectives: ["定义 Tool 的 Schema", "实现工具处理函数", "本地调试与接入"],
    sections: [
      {
        id: "setup",
        heading: "一、项目骨架",
        blocks: [
          {
            type: "paragraph",
            text: "一个 MCP Server 本质是监听 JSON-RPC 的服务进程。下面以 Python SDK 为例，定义一个查询库存的 Tool。",
          },
        ],
      },
      {
        id: "code",
        heading: "二、最小实现（Python）",
        blocks: [
          {
            type: "code",
            language: "python",
            filename: "server.py",
            runnable: false,
            code: String.raw`from mcp.server import Server
from mcp.types import Tool, TextContent

app = Server("inventory")

@app.list_tools()
async def list_tools():
    return [Tool(
        name="get_inventory",
        description="按 SKU 查询库存数量",
        inputSchema={"type": "object",
            "properties": {"sku": {"type": "string"}},
            "required": ["sku"]},
    )]

@app.call_tool()
async def call_tool(name, arguments):
    if name == "get_inventory":
        sku = arguments["sku"]
        return [TextContent(type="text", text=f"库存(SKU={sku})=3")]
    raise ValueError("未知工具")

if __name__ == "__main__":
    app.run(transport="stdio")`,
          },
        ],
      },
      {
        id: "wire",
        heading: "三、接入 Client",
        blocks: [
          {
            type: "paragraph",
            text: "在 Agent Host 中声明该 Server 后，Client 会自动 list_tools 并把工具映射为模型可调用的函数。模型输出的 tool_call 经 Client 转发到 Server 执行，结果回传。",
          },
        ],
      },
      {
        id: "practice",
        heading: "四、工程实践",
        blocks: [{ type: "list", items: ["Schema 描述精确", "返回值简洁结构化", "错误以标准错误格式返回"] }],
      },
      {
        id: "best",
        heading: "五、最佳实践",
        blocks: [{ type: "list", items: ["单一职责", "可观测日志", "输入校验"] }],
      },
      {
        id: "next",
        heading: "六、延伸阅读",
        blocks: [{ type: "list", items: ["MCP 网关", "Agent Runtime", "Tool Calling"] }],
      },
    ],
    tags: ["MCP", "Server", "开发"],
    architectureIds: ["a06"],
    relatedTutorialIds: ["mcp-fundamentals", "mcp-gateway", "tool-calling"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-mcp-03",
    slug: "mcp-gateway",
    domainId: "d04",
    title: "MCP 网关与企业级部署",
    englishTitle: "MCP Gateway",
    summary: "通过 MCP Gateway 收敛鉴权、审计与多租户，安全接入企业系统。",
    difficulty: "高级",
    estimatedMinutes: 30,
    prerequisites: ["MCP 基础与整体架构", "Agent 安全基础"],
    learningObjectives: ["设计 MCP 网关", "统一鉴权与审计", "实现多租户隔离"],
    sections: [
      {
        id: "why",
        heading: "一、为什么需要网关",
        blocks: [
          {
            type: "paragraph",
            text: "直接让 Agent 直连各业务系统的 MCP Server，会带来鉴权分散、审计缺失、权限蔓延等问题。网关作为统一出入口，集中处理认证、授权、限流、审计与协议转换。",
          },
        ],
      },
      {
        id: "arch",
        heading: "二、网关架构",
        blocks: [
          {
            type: "mermaid",
            title: "MCP 网关",
            source: `flowchart TB
  A["Agent Host"] --> GW["MCP 网关"]
  GW --> AUTH["认证/授权"]
  GW --> AUDIT["审计日志"]
  GW --> S1["Server: ERP"]
  GW --> S2["Server: CRM"]
  GW --> S3["Server: 数据"]`,
            caption: "所有 MCP 流量经网关统一治理。",
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [
          { type: "list", items: ["按租户路由到不同后端", "记录每次 tool_call 的调用方与结果", "对写操作强制审批策略"] },
        ],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["网关收敛权限", "全量审计", "后端内网化"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Agent 安全架构", "AI 平台架构", "MCP 基础"] }],
      },
    ],
    tags: ["MCP", "网关", "企业"],
    architectureIds: ["a06", "a15"],
    relatedTutorialIds: ["mcp-fundamentals", "ai-security-fundamentals", "ai-platform-architecture"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
