import type { Tutorial } from "../../types";

// ============================================================================
// 第五批（中）· 领域 10 / 11 / 12 · L4 深度升级教程
// 覆盖：AgentOps 追踪评估、AI 安全护栏、企业 AI 平台多租户架构。
// ============================================================================

const R = (
  title: string, url: string, organization: string,
  purpose: string, kind: Tutorial["references"][number]["kind"] = "官方产品文档"
): Tutorial["references"][number] => ({
  title, url, organization, kind, purpose, verifiedAt: "2026-11-13",
});

export const deepBatch6: Tutorial[] = [
  {
    id: "t-ops-02",
    slug: "agent-tracing",
    domainId: "d10",
    title: "Agent 追踪与可观测性：从轨迹到根因",
    englishTitle: "Agent Tracing & Observability",
    summary:
      "讲清 Agent 追踪的 span 模型、上下文传播、指标与成本归因、日志脱敏与采样，给出可运行的 Python 追踪器与断言式回归测试，以及企业案例与生产实践。",
    difficulty: "高级",
    estimatedMinutes: 55,
    prerequisites: ["Agent 执行循环", "Python 基础", "日志与监控概念"],
    learningObjectives: [
      "解释为什么 Agent 失败必须靠轨迹而非单条日志定位",
      "实现 run_id 关联的 span 追踪与嵌套上下文",
      "把 token、成本、延迟与工具调用归因到每一步",
      "设计脱敏、采样与回归断言",
      "从追踪数据定位循环失控与工具错误",
    ],
    sections: [
      {
        id: "overview",
        heading: "1. 技术概述 Overview",
        blocks: [
          {
            type: "paragraph",
            text: "Agent 追踪（Tracing）把一次 Agent 运行表示为一条 trace，内含层层嵌套的 span（模型推理、工具调用、参数校验、权限判定、护栏检查）。它解决的核心问题是：Agent 的失败往往发生在多步循环内部，单条应用日志无法回答「模型当时看到了什么、为什么选了这个工具」。",
          },
          {
            type: "paragraph",
            text: "产生背景是 Agent 比传统服务多了非确定性决策与多轮状态；传统 APM 只记录请求进出，看不到内部迭代。可观测性需要把「轨迹」作为一等数据来采集、存储与回放。",
          },
          {
            type: "table",
            headers: ["维度", "传统应用监控", "Agent 可观测性"],
            rows: [
              ["基本单位", "请求 / 事务", "trace + span + 轨迹"],
              ["关键数据", "状态码、耗时", "messages、tool_calls、token、成本"],
              ["失败归因", "异常堆栈", "逐步回放与输入快照"],
              ["回归方式", "接口断言", "轨迹级断言"],
            ],
          },
          {
            type: "list",
            items: [
              "适用场景：生产 Agent 排障、成本治理、版本回归、安全审计。",
              "不适用场景：纯静态内容站点；无内部迭代的单次 LLM 调用（普通日志足够）。",
              "与日志的区别：日志是离散事件，trace 是带父子关系与因果顺序的结构化视图。",
              "与评估的区别：评估回答「整体是否变好」，追踪回答「这一次为什么错」。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "轨迹是排障的唯一依据",
            text: "没有记录模型输入与工具观察，就无法区分是检索没找到证据、参数校验失败，还是模型误判——只能靠猜。",
          },
        ],
      },
      {
        id: "fundamentals",
        heading: "2. 核心原理 Fundamentals",
        blocks: [
          {
            type: "paragraph",
            text: "核心机制是「上下文传播 + span 树」。每次运行生成 run_id，每步生成 span_id 并指向 parent_span_id；span 记录 name、start/end、status、attributes（工具名、参数摘要、token、成本、错误码）。关键数据结构是 Trace（run_id、spans、总 token、总成本、终态）与 Span（父子关系、耗时、脱敏后的输入输出）。",
          },
          {
            type: "mermaid",
            title: "Agent Trace 结构",
            source: `flowchart TB
  TR["Trace run_id"] --> S1["span: run"]
  S1 --> S2["span: step.1"]
  S2 --> S3["span: model.infer"]
  S2 --> S4["span: validate"]
  S2 --> S5["span: tool.call"]
  S1 --> S6["span: step.2"]
  S6 --> S7["span: model.infer"]
  S1 --> S8["span: aggregate"]
  TR --> M["指标: token/成本/延迟"]
  TR --> A[("审计/回放存储")]`,
            caption: "span 按因果嵌套，指标从 span 聚合到 trace。",
          },
          {
            type: "table",
            headers: ["要素", "定义", "工程含义"],
            rows: [
              ["run_id", "一次运行的唯一标识", "跨 Agent、跨服务必须透传"],
              ["span_id / parent", "步骤与父子关系", "支持嵌套与关键路径分析"],
              ["attributes", "结构化元数据", "参数与返回值需脱敏"],
              ["usage", "token 与成本", "按模型单价折算，单价需版本化"],
              ["status", "ok / error / timeout / denied", "错误分类驱动告警"],
              ["sampling", "采样策略", "错误与慢请求全采，正常请求按比例"],
            ],
          },
          {
            type: "paragraph",
            text: "输入是运行时事件流；输出是 trace 与聚合指标；关键状态包括当前活跃 span 栈（上下文传播）、累计 token/成本、错误计数与采样决策。系统边界：追踪数据常含敏感内容，采集侧必须脱敏；追踪系统不可用不得阻塞主流程（降级为本地缓冲或丢弃）。",
          },
          {
            type: "list",
            items: [
              "局限一：全量记录 messages 成本高且含敏感信息，需要采样与脱敏。",
              "局限二：跨进程/跨 Agent 若 run_id 未透传，轨迹断裂。",
              "局限三：不同厂商 usage 字段不一致，成本归因需统一适配层。",
              "局限四：追踪只能解释已发生的路径，不能替代离线评测。",
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
            title: "可观测架构",
            source: `flowchart LR
  RT["Agent Runtime"] --> SDK["Tracer SDK 埋点"]
  SDK --> RED["脱敏/采样"]
  RED --> BUF[("本地缓冲")]
  BUF --> COL["采集器"]
  COL --> OBS[("Trace 存储")]
  OBS --> DASH["看板/根因查询"]
  OBS --> ALERT["告警"]
  OBS --> EVAL["评测集/回归"]`,
            caption: "采集异步化，追踪失败不影响业务链路。",
          },
          {
            type: "table",
            headers: ["组件", "职责", "输入 / 输出", "依赖"],
            rows: [
              ["Tracer SDK", "生成 span 与传播上下文", "运行事件 / span", "Runtime"],
              ["脱敏器", "移除 PII 与密钥", "原始属性 / 安全属性", "规则配置"],
              ["缓冲与采集", "异步批量上报", "span / trace", "采集器"],
              ["Trace 存储", "持久化与检索", "trace / 查询结果", "存储"],
              ["看板与告警", "指标可视化与异常通知", "聚合指标 / 告警", "告警系统"],
              ["评测联动", "把失败轨迹转评测样本", "trace / 评测集", "CI"],
            ],
          },
          {
            type: "list",
            items: [
              "控制流：Runtime 事件 → SDK 生成 span → 脱敏/采样 → 缓冲 → 上报。",
              "数据流：messages 摘要、工具参数摘要、usage 与错误码进入 span。",
              "状态流：活跃 span 栈随上下文传播，累积 token/成本聚合到 trace。",
              "外部依赖：采集器、Trace 存储、告警平台、评测与 CI。",
              "异常处理：上报失败降级为本地缓冲或丢弃，绝不抛异常中断 Agent。",
              "扩展方式：自定义 span 类型；按租户分区存储；对接标准可观测协议。",
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
            headers: ["组件", "为什么需要", "实现方式", "常见问题"],
            rows: [
              ["上下文传播", "跨步骤关联", "显式 run_id/span 栈", "异步任务丢失上下文"],
              ["脱敏器", "合规", "字段白名单 + 正则/分类", "把完整参数写进日志"],
              ["成本归因", "预算治理", "统一 usage 适配", "单价硬编码且过期"],
              ["采样器", "控制成本", "错误全采 + 正常比例", "恰好漏掉故障样本"],
              ["轨迹回放", "复现问题", "按 run_id 重建", "只存最终文本"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "组件顺序原则",
            text: "脱敏必须在上报之前完成。把原始 messages 先写日志再「事后清理」，等于已经产生泄露面。",
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
              "请求进入，生成 run_id 并创建根 span。",
              "每轮循环创建 step span，记录轮次与预算计数。",
              "模型调用创建 model.infer span，记录模型名、超时、重试与 usage。",
              "参数校验与权限判定各自创建 span，记录通过/拒绝原因。",
              "工具调用创建 tool.call span，记录工具名、参数摘要、耗时与结果码。",
              "所有属性经脱敏器过滤后写入 span。",
              "span 结束计算耗时，聚合 token 与成本到 trace。",
              "终态写入 trace（成功/超预算/转人工），按采样策略决定是否上报。",
              "异步批量上报；失败则本地缓冲或降级丢弃，不阻塞响应。",
              "看板按指标聚合，告警检查错误率、P95 延迟与成本阈值。",
              "失败轨迹经人工确认后转入评测集，成为回归样本。",
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
              ["全量轨迹", "调试/低流量", "信息完整", "成本高、含敏感数据"],
              ["错误全采 + 正常抽样", "生产", "成本可控且保留故障", "偶发问题可能漏采"],
              ["轨迹快照断言", "回归测试", "适配非确定性", "需维护基线"],
              ["指标聚合", "容量与成本治理", "趋势清晰", "无法解释单次失败"],
              ["轨迹转评测集", "持续改进", "闭环", "需人工标注"],
            ],
          },
          {
            type: "list",
            items: [
              "常见错误 1：只记最终答案，失败时无法归因。",
              "常见错误 2：追踪上报抛异常导致业务中断。",
              "常见错误 3：跨 Agent 未透传 run_id，轨迹断裂。",
              "常见错误 4：成本单价硬编码，模型调价后指标失真。",
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
              ["标准可观测协议/后端", "已有 APM 体系", "成熟 / 中", "高", "低", "优先复用"],
              ["LLM 专用观测工具", "需 messages/token 视图", "活跃 / 版本演进快", "中高", "中", "按需评估"],
              ["自研 Tracer + 日志库", "特殊合规要求", "可控 / 需自建回放", "高", "低", "强合规场景"],
              ["列式/时序存储", "指标聚合", "成熟 / 中", "高", "低", "大规模指标"],
              ["对象存储轨迹", "长期回放与审计", "成熟 / 成本低", "高", "低", "冷数据归档"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "版本核验提示",
            text: "上表为定性判断，不含性能数据或排名。具体工具版本与协议支持须按官方文档核验（需进一步核验）。",
          },
        ],
      },
      {
        id: "hands-on",
        heading: "8. Hands-on 实战：可运行的 Tracer 与轨迹断言",
        blocks: [
          {
            type: "paragraph",
            text: "实验目标：实现带上下文传播、脱敏、成本归因、采样与轨迹断言的 Tracer，并用离线测试覆盖嵌套、脱敏、成本聚合与超预算告警。代码仅用 Python 标准库。",
          },
          {
            type: "code",
            language: "text",
            filename: "项目目录结构",
            caption: "本节多文件项目布局",
            code: String.raw`agent-tracer/
├── requirements.txt
├── tracer.py        # span/trace、脱敏、成本归因、采样
└── test_tracer.py   # 离线测试`,
          },
          {
            type: "code",
            language: "python",
            filename: "tracer.py",
            caption: "核心实现：span 树、脱敏、usage 聚合、采样与轨迹断言",
            code: String.raw`"""Agent Tracer（教学实现，Python 3.11+ 标准库）。

依赖：仅标准库
环境变量：无
说明：单价为教学占位值，生产必须从配置中心读取并版本化；
      不连接任何外部可观测平台。
"""
from __future__ import annotations

import re
import time
import uuid
from contextlib import contextmanager
from dataclasses import dataclass, field
from typing import Any, Iterator


@dataclass
class Span:
    span_id: str
    parent_id: str | None
    name: str
    start: float
    end: float | None = None
    status: str = "ok"
    attributes: dict[str, Any] = field(default_factory=dict)

    @property
    def duration_ms(self) -> float:
        return ((self.end or self.start) - self.start) * 1000.0


@dataclass
class Trace:
    run_id: str
    spans: list[Span] = field(default_factory=list)
    total_tokens: int = 0
    total_cost_usd: float = 0.0

    def names(self) -> list[str]:
        return [s.name for s in self.spans]


SENSITIVE = re.compile(r"(api[_-]?key|password|token|secret|authorization)", re.I)
PII = re.compile(r"\b1[3-9]\d{9}\b")


def redact(attrs: dict[str, Any]) -> dict[str, Any]:
    """脱敏：敏感键置为 [REDACTED]，文本中的手机号形态掩码。"""
    out: dict[str, Any] = {}
    for k, v in attrs.items():
        if SENSITIVE.search(k):
            out[k] = "[REDACTED]"
        elif isinstance(v, str):
            out[k] = PII.sub("[PII]", v)
        else:
            out[k] = v
    return out


# 教学占位单价（非真实价格，禁止用于成本核算）
PRICING: dict[str, float] = {"mock-model": 0.000001}


class Tracer:
    def __init__(self, sample_rate: float = 1.0) -> None:
        self._stack: list[str] = []
        self._traces: dict[str, Trace] = {}
        self.sample_rate = sample_rate

    def start_trace(self, run_id: str | None = None) -> str:
        rid = run_id or str(uuid.uuid4())
        self._traces[rid] = Trace(run_id=rid)
        return rid

    @contextmanager
    def span(self, run_id: str, name: str,
             **attributes: Any) -> Iterator[Span]:
        """上下文管理：自动维护父子关系、耗时与状态。"""
        trace = self._traces.setdefault(run_id, Trace(run_id=run_id))
        parent = self._stack[-1] if self._stack else None
        sp = Span(str(uuid.uuid4()), parent, name, time.time(),
                  attributes=redact(attributes))
        trace.spans.append(sp)
        self._stack.append(sp.span_id)
        try:
            yield sp
        except TimeoutError:
            sp.status = "timeout"
            raise
        except Exception:
            sp.status = "error"
            raise
        finally:
            sp.end = time.time()
            self._stack.pop()

    def record_usage(self, run_id: str, model: str,
                     input_tokens: int, output_tokens: int) -> None:
        tokens = input_tokens + output_tokens
        trace = self._traces[run_id]
        trace.total_tokens += tokens
        trace.total_cost_usd += tokens * PRICING.get(model, 0.0)
        if tokens < 0:
            raise ValueError("negative token usage")

    def finish(self, run_id: str, status: str = "ok") -> Trace:
        trace = self._traces[run_id]
        trace.spans.append(Span(str(uuid.uuid4()), None, "trace.finish",
                                time.time(), time.time(), status))
        return trace

    def should_sample(self, trace: Trace) -> bool:
        """错误与超时全采，正常轨迹按比例采样。"""
        if any(s.status in ("error", "timeout") for s in trace.spans):
            return True
        return hash(trace.run_id) % 100 < int(self.sample_rate * 100)


def assert_trajectory(trace: Trace, expected: list[str]) -> None:
    """轨迹级回归断言：只校验关键步骤顺序，适配非确定性输出。"""
    names = trace.names()
    pos = 0
    for step in expected:
        try:
            pos = names.index(step, pos) + 1
        except ValueError as exc:
            raise AssertionError(f"missing step: {step}") from exc`,
          },
          {
            type: "code",
            language: "python",
            filename: "test_tracer.py",
            caption: "离线测试：嵌套、脱敏、成本聚合、异常状态、采样与轨迹断言",
            code: String.raw`import pytest

from tracer import (Tracer, redact, assert_trajectory,
                    PRICING, SENSITIVE)


def test_nested_spans_have_parent():
    t = Tracer()
    rid = t.start_trace("r1")
    with t.span(rid, "run"):
        with t.span(rid, "model.infer", model="mock-model") as sp:
            sp.attributes["input_tokens"] = 10
    trace = t.finish(rid)
    names = trace.names()
    assert "run" in names and "model.infer" in names
    child = next(s for s in trace.spans if s.name == "model.infer")
    assert child.parent_id is not None


def test_redaction_hides_secrets_and_pii():
    out = redact({"api_key": "sk-REAL", "note": "联系 13800138000"})
    assert out["api_key"] == "[REDACTED]"
    assert "13800138000" not in out["note"]


def test_usage_is_aggregated():
    t = Tracer()
    rid = t.start_trace("r1")
    t.record_usage(rid, "mock-model", 100, 50)
    t.record_usage(rid, "mock-model", 200, 50)
    trace = t.finish(rid)
    assert trace.total_tokens == 400
    assert trace.total_cost_usd == 400 * PRICING["mock-model"]


def test_negative_usage_rejected():
    t = Tracer()
    with pytest.raises(ValueError):
        t.record_usage(t.start_trace("r1"), "mock-model", -1, 0)


def test_exception_marks_span_error_and_is_always_sampled():
    t = Tracer(sample_rate=0.0)
    rid = t.start_trace("r1")
    with pytest.raises(RuntimeError):
        with t.span(rid, "tool.call"):
            raise RuntimeError("boom")
    trace = t.finish(rid, "failed")
    assert any(s.status == "error" for s in trace.spans)
    assert t.should_sample(trace) is True


def test_trajectory_assertion():
    t = Tracer()
    rid = t.start_trace("r1")
    for name in ["run", "model.infer", "validate", "tool.call"]:
        with t.span(rid, name):
            pass
    trace = t.finish(rid)
    assert_trajectory(trace, ["run", "validate", "tool.call"])
    with pytest.raises(AssertionError):
        assert_trajectory(trace, ["nonexistent"])


def test_duration_is_measured():
    t = Tracer()
    rid = t.start_trace("r1")
    with t.span(rid, "run"):
        pass
    span = t.finish(rid).spans[0]
    assert span.end is not None and span.duration_ms >= 0`,
          },
          {
            type: "code",
            language: "yaml",
            filename: "observability.yaml",
            caption: "配置示例：采样、脱敏与告警阈值（教学模拟阈值）",
            code: String.raw`tracing:
  sample_rate_normal: 0.1
  sample_rate_error: 1.0
  redact_keys: ["api_key", "password", "authorization", "secret"]
  async_export: true
  buffer_size: 1000
metrics:
  task_success_rate_min: 0.85
  p95_latency_ms_max: 12000
  max_cost_per_task_usd: 0.15
  unauthorized_tool_calls_max: 0
note: "阈值为教学模拟配置，非行业基准；上线前需按真实流量校准。"`,
          },
          {
            type: "code",
            language: "bash",
            filename: "运行方式",
            caption: "环境：Python 3.11+；安装与执行",
            code: String.raw`# requirements.txt
pytest>=8.0

pip install -r requirements.txt
python -m pytest -q test_tracer.py`,
          },
          {
            type: "table",
            headers: ["项目", "内容"],
            rows: [
              ["输入示例", "python -m pytest -q test_tracer.py"],
              ["输出示例", "7 passed in 0.xx s"],
              ["结果解释", "span 嵌套与父子关系正确、敏感字段被脱敏、token 与成本聚合、异常 span 全采、轨迹断言可回归"],
              ["常见错误 1", "异步任务未透传 run_id：轨迹断裂，需在任务上下文显式传递"],
              ["常见错误 2", "上报失败抛异常：追踪不可影响业务，必须降级"],
              ["常见错误 3", "成本单价硬编码：本示例 PRICING 为教学占位值，禁止用于真实核算"],
              ["常见错误 4", "只记录最终答案：无法归因检索/校验/工具各阶段"],
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "哪些部分需要替换",
            text: "内存 Trace 存储、占位单价与采样哈希均为教学模拟；生产需替换为标准可观测协议后端、配置化单价、跨进程上下文传播与持久化轨迹存储。span 模型与轨迹断言可直接沿用。",
          },
        ],
      },
      {
        id: "case",
        heading: "9. 企业应用案例：IT Operations Agent 可观测（教学模拟案例）",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            title: "教学模拟案例声明",
            text: "本节为贯穿全站项目 A 的可观测层案例，系统与指标均为虚构，不代表真实客户或生产效果。",
          },
          {
            type: "paragraph",
            text: "业务背景：IT 运维 Agent 上线后偶发「答非所问」与费用尖峰，缺少内部轨迹导致排障耗时。业务问题是无法区分检索未命中、参数校验失败还是模型误判。技术目标是建立全链路追踪并把失败轨迹转为回归样本。",
          },
          {
            type: "table",
            headers: ["环节", "工程细节"],
            rows: [
              ["系统设计", "Tracer SDK 埋点 + 脱敏 + 异步采集 + Trace 存储 + 看板告警"],
              ["数据来源", "Runtime 事件、模型 usage、工具调用日志、审批事件（教学模拟）"],
              ["组件选择", "统一 usage 适配层、错误全采策略、轨迹回放、评测集联动"],
              ["执行流程", "run_id 生成 → 逐步 span → 脱敏 → 聚合 → 采样 → 上报 → 回放"],
              ["安全权限", "轨迹按租户隔离，参数与 messages 脱敏，审计角色可查"],
              ["异常处理", "上报失败降级；错误/超时全采；成本超阈值告警"],
              ["部署方案", "采集器独立部署，Trace 冷热分层存储，看板按租户分权"],
              ["效果评估", "根因定位时长、轨迹完整率、成本归因准确率、回归集增长量"],
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
              "高可用：采集异步化，追踪后端故障不影响 Agent 主链路。",
              "可扩展性：按 run_id 分区存储；错误轨迹优先保留；正常轨迹按比例采样。",
              "并发：span 栈随请求上下文隔离，异步任务需显式传播 run_id。",
              "延迟与成本：批量上报；长 messages 只存摘要；冷热分层降低存储成本。",
              "超时与重试：上报设超时与有限重试；重试耗尽丢弃并计数。",
              "幂等性：span_id 唯一，重复上报按 (run_id, span_id) 去重。",
              "状态持久化：轨迹与聚合指标外置，支持按 run_id 回放。",
              "日志/监控/追踪：任务成功率、工具调用准确率、P95 延迟、单任务成本全量聚合。",
              "灰度发布与版本管理：Prompt、模型、工具 Schema 版本写入 trace 属性，便于对比退化。",
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
              "身份认证：轨迹查询按角色授权，禁止跨租户访问。",
              "权限控制：审计角色可看完整轨迹，普通角色只看脱敏视图。",
              "数据保护：PII、密钥、完整 messages 在上报前脱敏；留存有期限。",
              "输入验证：span attributes 按 Schema 白名单接收。",
              "输出校验：看板展示再次做字段级过滤。",
              "工具权限：轨迹写接口只开放给 Runtime，读接口只读。",
              "审计：记录谁在何时回放了哪条轨迹。",
              "风险控制：采样率可调、应急关闭全量采集、成本告警。",
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
              ["轨迹完整性", "断言关键 span 齐全", "预设执行序列", "缺失 span 数 = 0"],
              ["脱敏有效性", "注入密钥与 PII", "对抗属性集", "泄露数 = 0"],
              ["成本归因", "多次 usage 聚合", "token 序列", "聚合误差 = 0"],
              ["降级正确性", "模拟上报失败", "故障注入", "业务中断次数 = 0"],
              ["回归", "轨迹断言 + CI", "版本变更前后", "关键步骤序列一致性"],
              ["可观测指标", "线上采样", "真实流量", "任务成功率、P95、单任务成本"],
            ],
          },
          {
            type: "paragraph",
            text: "回归以轨迹断言为主：关键步骤顺序、span 状态、成本与脱敏结果。test_tracer.py 已覆盖嵌套、脱敏、聚合、异常全采与断言；把失败轨迹转评测集接入 CI，Prompt/模型/工具 Schema 变更即触发回归。",
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
              "全链路统一 run_id，跨 Agent 与异步任务显式透传。",
              "脱敏在上报之前，错误/超时轨迹全采。",
              "成本单价配置化、版本化，禁止硬编码。",
              "追踪失败降级，绝不阻塞业务。",
              "以轨迹断言而非字符串相等做回归。",
              "把失败轨迹沉淀为评测集，形成闭环。",
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
              ["轨迹断裂", "run_id 未透传", "比对各段 span 的 run_id", "显式传播上下文", "跨服务契约测试"],
              ["费用尖峰无解释", "缺 usage 或单价过期", "看 model.infer span 与单价版本", "统一适配 + 配置化单价", "成本告警"],
              ["敏感信息进入日志", "脱敏在采集之后", "抽查 span attributes", "脱敏前置", "脱敏红队用例"],
              ["恰好漏掉故障样本", "正常采样率误用于错误", "检查采样分支", "错误全采", "采样单测"],
              ["看板延迟高", "同步上报阻塞", "看上报耗时", "异步批量 + 缓冲", "上报超时演练"],
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
              "相关教程：AgentOps 概览、Agent 评估与回归测试、Agent 执行循环、Agent 错误处理。",
              "相关架构：AgentOps 可观测架构、企业 AI 平台参考架构。",
              "相关实验：成本计算器、Agent 执行循环模拟器。",
              "相关企业案例：IT Operations Agent（项目 A 可观测层）。",
              "官方资料见下方参考资料。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "资料核验说明",
            text: "本节单价、阈值与采样策略均为教学模拟，不代表任何厂商价格或行业基准。可观测工具具体版本与协议支持须按官方文档核验（需进一步核验）。",
          },
        ],
      },
      {
        id: "engineering-notes",
        heading: "16. 工程实现补遗：组件交互时序、故障演练与上线验收",
        blocks: [
          {
            type: "paragraph",
            text: "span 栈是上下文局部变量：跨线程或协程必须用 contextvars（或等效上下文传播机制）保存当前 span，否则父子关系会错乱，整条 trace 变成扁平列表，关键路径分析失效。",
          },
          {
            type: "mermaid",
            title: "组件交互时序（含失败分支）",
            source: String.raw`sequenceDiagram
  participant R as Runtime
  participant T as Tracer
  participant X as 采集器
  participant S as 只写存储
  R->>T: start_trace(run_id)
  T->>T: contextvars 保存当前 span
  R->>T: span(model.infer)
  T->>T: 嵌套 parent_span_id
  alt 步骤异常
    R->>T: raise / timeout
    T->>T: status=error, 强制全采
  else 正常
    R->>T: usage(model, tokens)
  end
  T->>X: 脱敏后的 trace 批次
  alt 采集器可用
    X->>S: 写入(只追加)
  else 采集器故障
    X->>X: 本地缓冲 + 告警，不阻塞主流程
  end`,
            caption: "消息顺序、超时分支与降级路径；箭头方向即控制流方向。",
          },
          {
            type: "table",
            headers: ["组件交互契约", "传递内容", "超时/失败语义"],
            rows: [
              ["Runtime → Tracer","run_id + span 名 + 脱敏属性","跨进程必须透传 run_id"],
              ["Tracer → 采集器","批量 trace + 采样决策","错误与超时轨迹强制全采"],
              ["采集器 → 存储","只写追加记录","不可用时不阻断业务"],
            ],
          },
          {
            type: "table",
            headers: ["类别", "可执行操作", "通过标准"],
            rows: [
              ["故障注入","让采集器返回 5xx","业务成功，告警与本地缓冲生效"],
              ["故障注入","在 span 属性里放入 api_key","落库前被替换为 REDACTED"],
              ["上线验收","pytest -q test_tracer.py","嵌套、脱敏、成本、断言用例通过"],
              ["上线验收","回放失败轨迹并生成回归用例","关键步骤序列断言成立"],
            ],
          },
          {
            type: "paragraph",
            text: "落地替换点：把内存 Tracer 换成 OpenTelemetry SDK 导出到企业可观测后端，单价表从账单系统同步并版本化，采样与脱敏策略由安全团队评审。示例中的单价与阈值均为教学占位值，不能直接用于成本核算。",
          },
        ],
      },
    ],
    tags: ["AgentOps", "Tracing", "可观测性", "成本归因", "回归测试"],
    architectureIds: ["a13", "a01"],
    relatedTutorialIds: [
      "agentops-overview",
      "agent-evaluation",
      "agent-execution-loop",
      "agent-error-handling",
      "agent-tracing",
    ],
    nextTutorialSlugs: ["agent-evaluation", "agentops-overview"],
    relatedLabSlugs: ["cost-calculator", "agent-execution-loop"],
    relatedCaseSlugs: ["it-operations-agent"],
    references: [
      R("OpenTelemetry 官方文档", "https://opentelemetry.io/docs/", "OpenTelemetry", "span/trace 模型与上下文传播的标准化参考", "官方规范"),
      R("OpenAI Function Calling 指南", "https://developers.openai.com/api/docs/guides/function-calling", "OpenAI", "usage 与工具调用字段的真实结构"),
      R("Building Effective Agents", "https://www.anthropic.com/research/building-effective-agents", "Anthropic", "Agent 复杂度控制与评估建议"),
      R("OWASP Top 10 for LLM Applications", "https://owasp.org/www-project-top-10-for-large-language-model-applications/", "OWASP", "日志与追踪中的敏感信息风险", "社区实践"),
    ],
    updatedAt: "2026-11-13",
    status: "published",
    qualityLevel: "L5",
  },
];
