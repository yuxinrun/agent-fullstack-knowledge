"use client";

import { useState, useMemo, type ReactNode } from "react";
import { Copy, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-line bg-surface/50 p-4", className)}>{children}</div>;
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm text-ink-secondary">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
const inputCls = "mt-1 w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-ink outline-none focus:border-primary/60";

function useCopy() {
  const [copied, setCopied] = useState(false);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return { copied, copy };
}

// Tool 01 架构选型
function ToolArchSelector() {
  const [complexity, setComplexity] = useState("中");
  const [deterministic, setDeterministic] = useState("否");
  const [multiRole, setMultiRole] = useState("否");
  const [hitl, setHitl] = useState("否");
  const result = useMemo(() => {
    const rec: string[] = [];
    const reasons: string[] = [];
    if (deterministic === "是" && multiRole === "否") {
      rec.push("Workflow 工作流");
      reasons.push("流程确定、可预测，优先用确定性编排保证可控。");
    }
    if (deterministic === "否") {
      if (multiRole === "是" && complexity === "高") {
        rec.push("Multi-Agent（Supervisor）");
        reasons.push("需多角色协作且复杂度高，用主管模式分工。");
      } else {
        rec.push("Single Agent");
        reasons.push("任务不确定但范围可控，单 Agent 即可。");
      }
    }
    if (hitl === "是") rec.push("Human-in-the-loop 人工审批");
    return { rec, reasons };
  }, [complexity, deterministic, multiRole, hitl]);
  return (
    <Panel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="任务复杂度"><select value={complexity} onChange={(e) => setComplexity(e.target.value)} className={inputCls}><option>低</option><option>中</option><option>高</option></select></Field>
        <Field label="流程是否确定"><select value={deterministic} onChange={(e) => setDeterministic(e.target.value)} className={inputCls}><option>是</option><option>否</option></select></Field>
        <Field label="需多角色协作"><select value={multiRole} onChange={(e) => setMultiRole(e.target.value)} className={inputCls}><option>是</option><option>否</option></select></Field>
        <Field label="需人工审批"><select value={hitl} onChange={(e) => setHitl(e.target.value)} className={inputCls}><option>是</option><option>否</option></select></Field>
      </div>
      <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-3">
        <div className="font-semibold text-primary">推荐方案</div>
        <ul className="mt-1 list-disc pl-5 text-sm text-ink-secondary">
          {result.rec.map((r, i) => <li key={i}>{r} — {result.reasons[i]}</li>)}
        </ul>
      </div>
    </Panel>
  );
}

// Tool 02 RAG 配置估算
function ToolRagConfig() {
  const [docs, setDocs] = useState(500);
  const [chars, setChars] = useState(6000);
  const [chunk, setChunk] = useState(400);
  const [topK, setTopK] = useState(5);
  const [qpd, setQpd] = useState(1000);
  const r = useMemo(() => {
    const total = docs * chars;
    const chunks = Math.ceil(total / chunk);
    const indexCost = chunks * 0.0001; // 示例：嵌入 $0.0001/1k tokens
    const monthlyQueries = qpd * 30;
    const retrTokensK = (topK * 0.5 * monthlyQueries) / 1000;
    const retrCost = retrTokensK * 0.01; // 示例重排/生成价格
    return { chunks, indexCost, retrCost, monthly: indexCost + retrCost };
  }, [docs, chars, chunk, topK, qpd]);
  return (
    <Panel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={`文档数量：${docs}`}><input type="range" min={50} max={5000} step={50} value={docs} onChange={(e) => setDocs(+e.target.value)} className="w-full" /></Field>
        <Field label={`单篇平均字数：${chars}`}><input type="range" min={500} max={20000} step={500} value={chars} onChange={(e) => setChars(+e.target.value)} className="w-full" /></Field>
        <Field label={`Chunk Size：${chunk}`}><input type="range" min={100} max={1500} step={50} value={chunk} onChange={(e) => setChunk(+e.target.value)} className="w-full" /></Field>
        <Field label={`Top-K：${topK}`}><input type="range" min={1} max={15} value={topK} onChange={(e) => setTopK(+e.target.value)} className="w-full" /></Field>
        <Field label="每日查询量"><input type="number" value={qpd} onChange={(e) => setQpd(+e.target.value)} className={inputCls} /></Field>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-surface/40 p-3 text-center"><div className="text-xs text-ink-muted">切片数</div><div className="text-primary">{r.chunks.toLocaleString()}</div></div>
        <div className="rounded-lg bg-surface/40 p-3 text-center"><div className="text-xs text-ink-muted">索引成本/月</div><div className="text-primary">${r.indexCost.toFixed(2)}</div></div>
        <div className="rounded-lg bg-surface/40 p-3 text-center"><div className="text-xs text-ink-muted">检索+生成/月</div><div className="text-primary">${r.retrCost.toFixed(2)}</div></div>
        <div className="rounded-lg bg-surface/40 p-3 text-center"><div className="text-xs text-ink-muted">合计/月</div><div className="text-primary">${r.monthly.toFixed(2)}</div></div>
      </div>
      <div className="mt-2 text-xs text-ink-muted">价格为示例数据，请以向量库与模型官方定价为准。</div>
    </Panel>
  );
}

// Tool 03 Token 成本
function ToolTokenCost() {
  const { copied, copy } = useCopy();
  const prices: Record<string, { in: number; out: number }> = {
    "gpt-4o (示例)": { in: 0.005, out: 0.015 },
    "gpt-4o-mini (示例)": { in: 0.00015, out: 0.0006 },
    "claude-3.5 (示例)": { in: 0.003, out: 0.015 },
  };
  const [model, setModel] = useState("gpt-4o-mini (示例)");
  const [inp, setInp] = useState(1000);
  const [out, setOut] = useState(500);
  const [req, setReq] = useState(5000);
  const p = prices[model];
  const daily = (inp * req / 1000 * p.in) + (out * req / 1000 * p.out);
  const summary = `模型：${model}\n输入：${inp} tokens × ${req} 请求/日\n输出：${out} tokens × ${req} 请求/日\n日成本：$${daily.toFixed(2)}\n月成本：$${(daily * 30).toFixed(2)}`;
  return (
    <Panel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="模型"><select value={model} onChange={(e) => setModel(e.target.value)} className={inputCls}>{Object.keys(prices).map((m) => <option key={m}>{m}</option>)}</select></Field>
        <Field label="每日请求数"><input type="number" value={req} onChange={(e) => setReq(+e.target.value)} className={inputCls} /></Field>
        <Field label="平均输入 Token"><input type="number" value={inp} onChange={(e) => setInp(+e.target.value)} className={inputCls} /></Field>
        <Field label="平均输出 Token"><input type="number" value={out} onChange={(e) => setOut(+e.target.value)} className={inputCls} /></Field>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-surface/40 p-3">
        <pre className="whitespace-pre-wrap text-sm text-ink-secondary">{summary}</pre>
        <button onClick={() => copy(summary)} className="ml-3 shrink-0 rounded-lg border border-line px-3 py-1.5 text-sm text-ink-secondary hover:text-ink">{copied ? <Check size={14} className="inline" /> : <Copy size={14} className="inline" />} 复制</button>
      </div>
    </Panel>
  );
}

// Tool 04 Multi-Agent 选择器
function ToolMultiAgent() {
  const [parallel, setParallel] = useState("否");
  const [hier, setHier] = useState("否");
  const [peers, setPeers] = useState("少");
  const [debate, setDebate] = useState("否");
  const r = useMemo(() => {
    if (debate === "是") return { p: "Debate Pattern", why: "需要多视角论证与一致性校验。" };
    if (hier === "是") return { p: "Hierarchical Agents", why: "存在层级管理与子团队分解。" };
    if (parallel === "是" && peers === "多") return { p: "Swarm Pattern", why: "大量对等 Agent 自主协作。" };
    if (parallel === "是") return { p: "Supervisor Pattern", why: "少量角色由主管协调。" };
    return { p: "Single Agent / 顺序 Pipeline", why: "无需多智能体协作。" };
  }, [parallel, hier, peers, debate]);
  return (
    <Panel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="需并行研究"><select value={parallel} onChange={(e) => setParallel(e.target.value)} className={inputCls}><option>是</option><option>否</option></select></Field>
        <Field label="需层级管理"><select value={hier} onChange={(e) => setHier(e.target.value)} className={inputCls}><option>是</option><option>否</option></select></Field>
        <Field label="对等角色数量"><select value={peers} onChange={(e) => setPeers(e.target.value)} className={inputCls}><option>少</option><option>多</option></select></Field>
        <Field label="需辩论/校验"><select value={debate} onChange={(e) => setDebate(e.target.value)} className={inputCls}><option>是</option><option>否</option></select></Field>
      </div>
      <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-ink-secondary">
        <b className="text-primary">{r.p}</b> — {r.why}
      </div>
    </Panel>
  );
}

// 通用清单评分
function Checklist({ title, items, emptyHint }: { title: string; items: { k: string; w: number }[]; emptyHint: string }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  function toggle(k: string) { setChecked((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; }); }
  const total = items.reduce((s, i) => s + i.w, 0);
  const got = items.reduce((s, i) => s + (checked.has(i.k) ? i.w : 0), 0);
  const pct = Math.round((got / total) * 100);
  const missing = items.filter((i) => !checked.has(i.k)).map((i) => i.k);
  return (
    <Panel>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold text-ink">{title}</span>
        <span className="text-sm text-primary">完成度 {pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-2"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <label key={it.k} className="flex items-center gap-2 rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-ink-secondary">
            <input type="checkbox" checked={checked.has(it.k)} onChange={() => toggle(it.k)} className="accent-[#38D6B0]" />
            {it.k}
          </label>
        ))}
      </div>
      {missing.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          待完善：{missing.join("、")}
        </div>
      )}
      {missing.length === 0 && <div className="mt-3 text-sm text-primary">✓ 已覆盖全部检查项</div>}
    </Panel>
  );
}

function ToolMcpChecklist() {
  const items = [
    { k: "协议正确实现 initialize/tools/list/call", w: 2 },
    { k: "工具 Schema 清晰且参数校验", w: 2 },
    { k: "鉴权与最小权限", w: 2 },
    { k: "错误标准化返回", w: 1 },
    { k: "超时与取消处理", w: 1 },
    { k: "调用审计日志", w: 1 },
    { k: "可观测（tracing）", w: 1 },
  ];
  return <Checklist title="MCP Server 设计清单" items={items} emptyHint="" />;
}
function ToolSecurityChecklist() {
  const items = [
    { k: "Prompt Injection 防护", w: 2 },
    { k: "输入/输出护栏", w: 2 },
    { k: "工具最小权限", w: 2 },
    { k: "数据脱敏 / PII 保护", w: 1 },
    { k: "身份与鉴权", w: 1 },
    { k: "审计日志", w: 1 },
    { k: "人工审批闸口", w: 1 },
  ];
  return <Checklist title="Agent Security Checklist" items={items} emptyHint="" />;
}
function ToolProductionReadiness() {
  const items = [
    { k: "分布式追踪 / Tracing", w: 2 },
    { k: "日志与指标可观测", w: 2 },
    { k: "错误重试与回退", w: 2 },
    { k: "评估与回归测试", w: 2 },
    { k: "成本监控", w: 1 },
    { k: "灰度与回滚预案", w: 1 },
  ];
  return <Checklist title="Agent 生产就绪清单" items={items} emptyHint="" />;
}

// Tool 08 技术栈选型
function ToolTechStack() {
  const [team, setTeam] = useState("中型");
  const [compliance, setCompliance] = useState("一般");
  const [cloud, setCloud] = useState("公有云");
  const r = useMemo(() => {
    const gateway = compliance === "严格" ? "自研/开源模型网关（数据不出域）" : "LiteLLM / 云厂商网关";
    const vec = compliance === "严格" ? "自建 pgvector / 私有向量库" : "托管向量库（Milvus/Weaviate）";
    const orch = team === "小型" ? "轻量状态机 / LangGraph" : "Temporal + LangGraph";
    const deploy = cloud === "本地" || compliance === "严格" ? "Kubernetes 私有部署" : "云厂商容器服务";
    return { gateway, vec, orch, deploy };
  }, [team, compliance, cloud]);
  return (
    <Panel>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="团队规模"><select value={team} onChange={(e) => setTeam(e.target.value)} className={inputCls}><option>小型</option><option>中型</option><option>大型</option></select></Field>
        <Field label="合规要求"><select value={compliance} onChange={(e) => setCompliance(e.target.value)} className={inputCls}><option>严格</option><option>一般</option></select></Field>
        <Field label="部署环境"><select value={cloud} onChange={(e) => setCloud(e.target.value)} className={inputCls}><option>公有云</option><option>私有云</option><option>本地</option></select></Field>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {[["模型网关", r.gateway], ["向量库", r.vec], ["编排引擎", r.orch], ["部署", r.deploy]].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm"><b className="text-ink">{k}：</b><span className="text-ink-secondary">{v}</span></div>
        ))}
      </div>
    </Panel>
  );
}

// Tool 09 复杂度
function ToolComplexity() {
  const [task, setTask] = useState(3);
  const [data, setData] = useState(3);
  const [integ, setInteg] = useState(3);
  const [comp, setComp] = useState(2);
  const score = Math.round(((task + data + integ + comp) / 16) * 100);
  const level = score >= 75 ? "高" : score >= 50 ? "中" : "低";
  const risks = score >= 75 ? ["建议先做 PoC 与评估闭环", "强化可观测与回退"] : score >= 50 ? ["优先打通核心链路", "控制工具权限"] : ["可从单 Agent 快速验证"];
  return (
    <Panel>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={`任务复杂度：${task}`}><input type="range" min={1} max={5} value={task} onChange={(e) => setTask(+e.target.value)} className="w-full" /></Field>
        <Field label={`数据准备度：${data}`}><input type="range" min={1} max={5} value={data} onChange={(e) => setData(+e.target.value)} className="w-full" /></Field>
        <Field label={`系统集成度：${integ}`}><input type="range" min={1} max={5} value={integ} onChange={(e) => setInteg(+e.target.value)} className="w-full" /></Field>
        <Field label={`合规要求：${comp}`}><input type="range" min={1} max={5} value={comp} onChange={(e) => setComp(+e.target.value)} className="w-full" /></Field>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="text-3xl font-bold text-primary">{score}</div>
        <div className="text-sm text-ink-secondary">复杂度等级：<b className="text-ink">{level}</b></div>
      </div>
      <ul className="mt-3 list-disc pl-5 text-sm text-ink-secondary">{risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
    </Panel>
  );
}

// Tool 10 架构生成
function ToolArchGen() {
  const goals: Record<string, string[]> = {
    "IT 运维": ["Agent Runtime", "RAG 知识库", "MCP 接入 ITSM/监控", "Workflow 审批", "AgentOps"],
    "智能客服": ["Single/Multi Agent", "RAG 产品知识", "CRM 集成", "人工接管", "护栏"],
    "数据分析": ["语义层", "Text-to-SQL", "数仓连接", "结果解释", "行级权限"],
    "流程自动化": ["Workflow 引擎", "API/RPA 集成", "事件驱动", "人工审批", "监控"],
  };
  const [goal, setGoal] = useState("IT 运维");
  const comps = goals[goal] ?? [];
  return (
    <Panel>
      <Field label="业务目标"><select value={goal} onChange={(e) => setGoal(e.target.value)} className={inputCls}>{Object.keys(goals).map((g) => <option key={g}>{g}</option>)}</select></Field>
      <div className="mt-4 text-sm text-ink-secondary">建议架构组件：</div>
      <div className="mt-2 space-y-2">
        {comps.map((c, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-ink">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs text-primary">{i + 1}</span>
            {c}
          </div>
        ))}
      </div>
    </Panel>
  );
}

export const toolRegistry: Record<string, () => JSX.Element> = {
  "tool-arch-selector": ToolArchSelector,
  "tool-rag-config": ToolRagConfig,
  "tool-token-cost": ToolTokenCost,
  "tool-multi-agent-selector": ToolMultiAgent,
  "tool-mcp-checklist": ToolMcpChecklist,
  "tool-security-checklist": ToolSecurityChecklist,
  "tool-production-checklist": ToolProductionReadiness,
  "tool-tech-stack": ToolTechStack,
  "tool-complexity": ToolComplexity,
  "tool-architecture-generator": ToolArchGen,
};
