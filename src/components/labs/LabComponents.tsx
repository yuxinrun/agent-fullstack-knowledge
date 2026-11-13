"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Play, RotateCcw, Check, X, Plus, Trash2 } from "lucide-react";
import MermaidViewer from "@/components/MermaidViewer";
import { cn } from "@/lib/utils";

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-line bg-surface/50 p-4", className)}>{children}</div>;
}
function StepList({ steps, active }: { steps: { t: string; d: string }[]; active: number }) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li
          key={i}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            i === active
              ? "border-primary/60 bg-primary/10 text-ink"
              : i < active
              ? "border-line bg-surface/30 text-ink-muted"
              : "border-line bg-transparent text-ink-muted"
          )}
        >
          <div className="font-medium">
            {i < active && <Check size={14} className="mr-1 inline text-primary" />}
            {s.t}
          </div>
          {i === active && <div className="mt-1 text-ink-secondary">{s.d}</div>}
        </li>
      ))}
    </ol>
  );
}

// Lab 01 执行循环
function LabExecutionLoop() {
  const steps = [
    { t: "用户输入", d: "用户提出任务：为 SKU-A1 生成缺货应对方案。" },
    { t: "推理 Reasoning", d: "模型判断需要先查询库存与历史销售。" },
    { t: "规划 Planning", d: "拆解为：查库存 → 查销售 → 生成方案。" },
    { t: "工具选择 Tool", d: "选择 get_inventory 与 get_sales 工具。" },
    { t: "工具执行 Execute", d: "Runtime 调用工具并返回原始数据。" },
    { t: "观察 Observation", d: "库存=0，近 30 天销量 120 件，需补货。" },
    { t: "下一步决策", d: "信息充足，无需更多工具，进入生成。" },
    { t: "最终答案 Final", d: "输出补货建议与时间表。" },
  ];
  const [i, setI] = useState(0);
  return (
    <Panel>
      <div className="mb-3 text-sm text-ink-muted">点击推进观察 Agent 执行循环的每个阶段。</div>
      <StepList steps={steps} active={i} />
      <div className="mt-4 flex gap-2">
        <button onClick={() => setI((v) => Math.min(steps.length - 1, v + 1))} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-bg">下一步</button>
        <button onClick={() => setI((v) => Math.max(0, v - 1))} className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-secondary">上一步</button>
        <button onClick={() => setI(0)} className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-secondary"><RotateCcw size={14} className="mr-1 inline" />重置</button>
      </div>
    </Panel>
  );
}

// Lab 02 ReAct
function LabReact() {
  const steps = [
    { type: "Thought", text: "用户想知道北京天气，需调用天气工具。" },
    { type: "Action", text: "get_weather(city='北京')" },
    { type: "Observation", text: "北京，晴，22°C，西北风 3 级。" },
    { type: "Thought", text: "已获得天气信息，可以作答。" },
    { type: "Final Answer", text: "北京今天晴，22°C，适合外出。" },
  ];
  const [i, setI] = useState(0);
  const color: Record<string, string> = { Thought: "#7C8CFF", Action: "#38D6B0", Observation: "#F0B86E", "Final Answer": "#9AE6B4" };
  return (
    <Panel>
      <div className="mb-3 text-sm text-ink-muted">教学模拟：真实模型内部思维过程不可直接观测，此为学生化简化流程。</div>
      <div className="space-y-2">
        {steps.map((s, idx) => (
          <div key={idx} className={cn("rounded-lg border px-3 py-2 text-sm", idx <= i ? "border-line bg-surface/40" : "border-line/50 opacity-50")}>
            <span className="mr-2 rounded px-1.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${color[s.type]}22`, color: color[s.type] }}>{s.type}</span>
            <span className="text-ink-secondary">{s.text}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => setI((v) => Math.min(steps.length - 1, v + 1))} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-bg">下一步</button>
        <button onClick={() => setI(0)} className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-secondary">重置</button>
      </div>
    </Panel>
  );
}

// Lab 03 多智能体
function LabMultiAgent() {
  const roles = [
    { id: "planner", name: "Planner 规划", out: "拆解任务为：检索知识、分析数据、生成报告。" },
    { id: "researcher", name: "Researcher 研究", out: "从知识库检索到 3 篇相关文档。" },
    { id: "analyst", name: "Analyst 分析", out: "汇总数据得出 Q3 增长 18%。" },
    { id: "executor", name: "Executor 执行", out: "调用报表系统生成 PDF。" },
    { id: "reviewer", name: "Reviewer 复核", out: "校验数据与来源，确认无误。" },
  ];
  const [run, setRun] = useState(-1);
  const [running, setRunning] = useState(false);
  function runAll() {
    setRun(-1); setRunning(true);
    roles.forEach((_, idx) => setTimeout(() => setRun(idx), (idx + 1) * 600));
    setTimeout(() => setRunning(false), roles.length * 600 + 200);
  }
  return (
    <Panel>
      <div className="mb-3 text-sm text-ink-muted">点击"运行协作"观察任务在角色间的分配、传递与汇总。</div>
      <div className="space-y-2">
        {roles.map((r, idx) => (
          <div key={r.id} className={cn("rounded-lg border px-3 py-2 text-sm transition-colors", idx <= run ? "border-primary/50 bg-primary/10" : "border-line bg-transparent")}>
            <div className="font-medium text-ink">{r.name}</div>
            {idx <= run && <div className="mt-1 text-ink-secondary">{r.out}</div>}
          </div>
        ))}
      </div>
      <button onClick={runAll} disabled={running} className="mt-4 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-bg disabled:opacity-50">
        <Play size={14} className="mr-1 inline" /> {running ? "运行中…" : "运行协作"}
      </button>
    </Panel>
  );
}

// Lab 04 RAG
function LabRag() {
  const [topK, setTopK] = useState(5);
  const [chunk, setChunk] = useState(400);
  const [strategy, setStrategy] = useState("hybrid");
  const corpus = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ id: i + 1, rel: Math.round((1 - i / 14) * 100) })), []);
  const noise = strategy === "dense" ? 0.25 : strategy === "sparse" ? 0.45 : 0.12;
  const relevant = Math.round(topK * (1 - noise));
  return (
    <Panel>
      <div className="mb-3 text-sm text-ink-muted">教学模拟数据：以下结果用于演示参数影响，非真实模型/库执行。</div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm text-ink-secondary">Top-K：<b className="text-ink">{topK}</b>
          <input type="range" min={1} max={10} value={topK} onChange={(e) => setTopK(+e.target.value)} className="w-full" />
        </label>
        <label className="text-sm text-ink-secondary">Chunk Size：<b className="text-ink">{chunk}</b>
          <input type="range" min={100} max={1000} step={50} value={chunk} onChange={(e) => setChunk(+e.target.value)} className="w-full" />
        </label>
        <label className="text-sm text-ink-secondary">检索策略
          <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-ink">
            <option value="dense">稠密向量</option>
            <option value="sparse">稀疏关键词</option>
            <option value="hybrid">混合 Hybrid</option>
          </select>
        </label>
      </div>
      <div className="mt-4 rounded-lg border border-line bg-surface/40 p-3 text-sm">
        <div>召回片段：<b className="text-primary">{topK}</b> 条 · 其中相关 <b className="text-primary">{relevant}</b> 条 · 噪声率约 {(noise * 100).toFixed(0)}%</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {corpus.slice(0, topK).map((c) => (
            <span key={c.id} className={cn("rounded px-2 py-0.5 text-xs", c.id <= relevant ? "bg-primary/15 text-primary" : "bg-red-500/15 text-red-300")}>
              Chunk {c.id} · 相关度 {c.rel}
            </span>
          ))}
        </div>
        <div className="mt-2 text-xs text-ink-muted">Chunk Size 越大单块信息越全但粒度越粗；Hybrid 通常噪声更低。</div>
      </div>
    </Panel>
  );
}

// Lab 05 MCP
function LabMcp() {
  const tools = {
    get_weather: { input: { city: "string" }, output: "北京，晴，22°C" },
    query_crm: { input: { customer_id: "string" }, output: "{ name: 'Acme', tier: 'VIP' }" },
    create_ticket: { input: { title: "string", priority: "P1|P2|P3" }, output: "{ ticket_id: 'T-1024' }" },
  } as const;
  const [sel, setSel] = useState<keyof typeof tools>("query_crm");
  const t = tools[sel];
  return (
    <Panel>
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(tools) as (keyof typeof tools)[]).map((k) => (
          <button key={k} onClick={() => setSel(k)} className={cn("rounded-lg border px-3 py-1.5 text-sm", sel === k ? "border-primary/50 bg-primary/10 text-primary" : "border-line text-ink-secondary")}>{k}</button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface/40 p-3 text-sm">
          <div className="mb-1 font-semibold text-ink">MCP Server 暴露的工具</div>
          <pre className="whitespace-pre-wrap text-ink-secondary">{JSON.stringify(t.input, null, 2)}</pre>
        </div>
        <div className="rounded-lg border border-line bg-surface/40 p-3 text-sm">
          <div className="mb-1 font-semibold text-ink">模拟返回结果</div>
          <pre className="whitespace-pre-wrap text-primary">{t.output}</pre>
        </div>
      </div>
      <div className="mt-3 text-xs text-ink-muted">调用链：Host → MCP Client → (JSON-RPC) → MCP Server → Tool → Result</div>
    </Panel>
  );
}

// Lab 06 Memory
function LabMemory() {
  const data: Record<string, string[]> = {
    short: ["当前对话：用户正在配置 Agent 工具", "本轮待办：完成 MCP 接入"],
    semantic: ["用户偏好：中文回复", "项目背景：企业 IT 运维"],
    long: ["历史工单 #1023 已解决（权限错误）", "用户曾部署过 RAG 知识库"],
  };
  const [type, setType] = useState<keyof typeof data>("semantic");
  return (
    <Panel>
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.keys(data).map((k) => (
          <button key={k} onClick={() => setType(k as keyof typeof data)} className={cn("rounded-lg border px-3 py-1.5 text-sm", type === k ? "border-primary/50 bg-primary/10 text-primary" : "border-line text-ink-secondary")}>{k === "short" ? "短期/工作记忆" : k === "semantic" ? "语义记忆" : "长期记忆"}</button>
        ))}
      </div>
      <ul className="space-y-1.5 text-sm text-ink-secondary">
        {data[type].map((d, i) => (
          <li key={i} className="rounded-lg border border-line bg-surface/40 px-3 py-2">· {d}</li>
        ))}
      </ul>
      <div className="mt-3 text-xs text-ink-muted">检索时按任务类型选择记忆源，注入上下文，避免窗口污染。</div>
    </Panel>
  );
}

// Lab 07 Workflow 设计器
function LabWorkflow() {
  const all = ["Start", "Task", "Condition", "Agent", "Tool", "Approval", "End"] as const;
  const [nodes, setNodes] = useState<string[]>(["Start", "Task", "End"]);
  const diagram = `flowchart LR\n${nodes.map((n, i) => `N${i}["${n}"]`).join("\n")}\n${nodes.map((_, i) => i < nodes.length - 1 ? `N${i} --> N${i + 1}` : "").join("\n")}`;
  return (
    <Panel>
      <div className="mb-3 flex flex-wrap gap-2">
        {all.map((n) => (
          <button key={n} onClick={() => setNodes((p) => [...p, n])} className="rounded-lg border border-line px-2.5 py-1 text-xs text-ink-secondary hover:text-ink"><Plus size={12} className="mr-1 inline" />{n}</button>
        ))}
        <button onClick={() => setNodes((p) => p.slice(0, -1))} className="rounded-lg border border-line px-2.5 py-1 text-xs text-red-300"><Trash2 size={12} className="mr-1 inline" />移除末尾</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {nodes.map((n, i) => (
          <span key={i} className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm text-ink">{n}{i < nodes.length - 1 && <span className="ml-2 text-primary">→</span>}</span>
        ))}
      </div>
      <MermaidViewer source={diagram} title="工作流预览" />
      <div className="text-xs text-ink-muted">说明：此为配置版设计器，拖动节点能力可后续扩展；流程图由所选节点顺序生成。</div>
    </Panel>
  );
}

// Lab 08 Security
function LabSecurity() {
  const roles = ["employee", "admin", "guest"] as const;
  const tools = ["read_doc", "query_db", "send_email", "delete_record"] as const;
  const [role, setRole] = useState<(typeof roles)[number]>("employee");
  const [tool, setTool] = useState<(typeof tools)[number]>("read_doc");
  const writeTools = ["send_email", "delete_record"];
  const allowed =
    role === "admin" ? true : role === "guest" ? !writeTools.includes(tool) && tool !== "query_db" : !writeTools.includes(tool);
  const reason =
    role === "admin" ? "管理员拥有全部权限" :
    role === "guest" ? (allowed ? "访客仅可读文档" : "访客禁止写操作与数据库查询") :
    (allowed ? "员工可读/查询，禁止写操作" : "写操作需管理员或审批");
  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-sm text-ink-secondary">身份</div>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <button key={r} onClick={() => setRole(r)} className={cn("rounded-lg border px-3 py-1.5 text-sm", role === r ? "border-primary/50 bg-primary/10 text-primary" : "border-line text-ink-secondary")}>{r}</button>
            ))}
          </div>
          <div className="mb-1 mt-3 text-sm text-ink-secondary">工具</div>
          <div className="flex flex-wrap gap-2">
            {tools.map((t) => (
              <button key={t} onClick={() => setTool(t)} className={cn("rounded-lg border px-3 py-1.5 text-sm", tool === t ? "border-primary/50 bg-primary/10 text-primary" : "border-line text-ink-secondary")}>{t}</button>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface/40 p-3">
          <div className="flex items-center gap-2 text-lg font-semibold">
            {allowed ? <Check className="text-primary" /> : <X className="text-red-400" />}
            <span className={allowed ? "text-primary" : "text-red-400"}>{allowed ? "允许" : "拒绝"}</span>
          </div>
          <div className="mt-2 text-sm text-ink-secondary">{reason}</div>
          <div className="mt-3 rounded border border-line bg-bg/50 p-2 text-xs text-ink-muted">
            AUDIT: [{new Date().toLocaleTimeString()}] role={role} tool={tool} → {allowed ? "ALLOW" : "DENY"}
          </div>
        </div>
      </div>
    </Panel>
  );
}

// Lab 09 Cost
function LabCost() {
  const prices: Record<string, { in: number; out: number }> = {
    "gpt-4o (示例)": { in: 0.005, out: 0.015 },
    "gpt-4o-mini (示例)": { in: 0.00015, out: 0.0006 },
    "claude-3.5 (示例)": { in: 0.003, out: 0.015 },
    "自托管 7B (示例)": { in: 0.0001, out: 0.0001 },
  };
  const [model, setModel] = useState("gpt-4o-mini (示例)");
  const [inp, setInp] = useState(800);
  const [out, setOut] = useState(400);
  const [req, setReq] = useState(2000);
  const [agents, setAgents] = useState(3);
  const p = prices[model];
  const dailyIn = inp * req * agents / 1000 * p.in;
  const dailyOut = out * req * agents / 1000 * p.out;
  const daily = dailyIn + dailyOut;
  return (
    <Panel>
      <div className="mb-2 text-xs text-ink-muted">价格为示例数据（美元/千 token），请以官方最新定价为准；可改用自托管以降低成本。</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-ink-secondary">模型
          <select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-ink">{Object.keys(prices).map((m) => <option key={m}>{m}</option>)}</select>
        </label>
        <label className="text-sm text-ink-secondary">Agent 数量：<b className="text-ink">{agents}</b>
          <input type="range" min={1} max={20} value={agents} onChange={(e) => setAgents(+e.target.value)} className="w-full" />
        </label>
        <label className="text-sm text-ink-secondary">输入 Token/次：<b className="text-ink">{inp}</b>
          <input type="number" value={inp} onChange={(e) => setInp(+e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-ink" />
        </label>
        <label className="text-sm text-ink-secondary">输出 Token/次：<b className="text-ink">{out}</b>
          <input type="number" value={out} onChange={(e) => setOut(+e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-ink" />
        </label>
        <label className="text-sm text-ink-secondary">每日请求数：<b className="text-ink">{req}</b>
          <input type="number" value={req} onChange={(e) => setReq(+e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-ink" />
        </label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-surface/40 p-3 text-center"><div className="text-xs text-ink-muted">日输入成本</div><div className="text-primary">${dailyIn.toFixed(2)}</div></div>
        <div className="rounded-lg bg-surface/40 p-3 text-center"><div className="text-xs text-ink-muted">日输出成本</div><div className="text-primary">${dailyOut.toFixed(2)}</div></div>
        <div className="rounded-lg bg-surface/40 p-3 text-center"><div className="text-xs text-ink-muted">日合计</div><div className="text-primary">${daily.toFixed(2)}</div></div>
        <div className="rounded-lg bg-surface/40 p-3 text-center"><div className="text-xs text-ink-muted">月合计</div><div className="text-primary">${(daily * 30).toFixed(2)}</div></div>
      </div>
    </Panel>
  );
}

// Lab 10 Architecture Designer
function LabArchitecture() {
  const caps = ["Single Agent", "Multi-Agent", "Workflow", "RAG", "MCP", "Memory", "Enterprise API", "Human Approval"] as const;
  const [sel, setSel] = useState<string[]>(["Single Agent", "RAG"]);
  function toggle(c: string) { setSel((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]); }
  const diagram = `flowchart TB
  U["用户"] --> A["Agent"]
  ${sel.includes("Memory") ? 'A --> M["Memory"]' : ""}
  ${sel.includes("RAG") ? 'A --> R["RAG"]' : ""}
  ${sel.includes("MCP") ? 'A --> MCP["MCP 网关"]' : ""}
  ${sel.includes("Workflow") ? 'A --> W["Workflow"]' : ""}
  ${sel.includes("Multi-Agent") ? 'A --> MA["Multi-Agent"]' : ""}
  ${sel.includes("Enterprise API") ? 'A --> E["企业 API"]' : ""}
  ${sel.includes("Human Approval") ? 'A --> H["人工审批"]' : ""}`;
  return (
    <Panel>
      <div className="mb-3 flex flex-wrap gap-2">
        {caps.map((c) => (
          <button key={c} onClick={() => toggle(c)} className={cn("rounded-lg border px-3 py-1.5 text-sm", sel.includes(c) ? "border-primary/50 bg-primary/10 text-primary" : "border-line text-ink-secondary")}>{c}</button>
        ))}
      </div>
      <MermaidViewer source={diagram} title="教学级架构图" />
      <div className="text-xs text-ink-muted">说明：架构图随所选能力动态生成，仅用于教学示意，非生产蓝图。</div>
    </Panel>
  );
}

export const labRegistry: Record<string, () => JSX.Element> = {
  "lab-execution-loop": LabExecutionLoop,
  "lab-react": LabReact,
  "lab-multi-agent": LabMultiAgent,
  "lab-rag": LabRag,
  "lab-mcp": LabMcp,
  "lab-memory": LabMemory,
  "lab-workflow": LabWorkflow,
  "lab-security": LabSecurity,
  "lab-cost": LabCost,
  "lab-architecture": LabArchitecture,
};
