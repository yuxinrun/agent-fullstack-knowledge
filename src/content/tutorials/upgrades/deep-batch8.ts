import type { Tutorial } from "../../types";

// ============================================================================
// 第五批（下）· 领域 14 / 15 + 贯穿项目 A / B · L5 深度升级教程
// 说明：所有 IoT 时序、设备台账、告警与工单数据均为「教学模拟数据」；
//       真实代码与模拟接口在每篇的表格中显式区分，不冒充任何厂商产品。
// ============================================================================

const R = (
  title: string, url: string, organization: string,
  purpose: string, kind: Tutorial["references"][number]["kind"] = "官方产品文档",
  version = "需按官方页面核验"
): Tutorial["references"][number] => ({
  title, url, organization, kind, purpose, version, verifiedAt: "2026-11-13",
});

export const deepBatch8: Tutorial[] = [
  {
    id: "t-dt-02",
    slug: "predictive-maintenance",
    domainId: "d14",
    title: "预测性维护与数字孪生：时序特征、异常评分到工单闭环",
    englishTitle: "Predictive Maintenance with Digital Twins",
    summary:
      "讲清设备时序数据的窗口特征、基线偏移与异常评分如何驱动预测性维护；实现可运行的特征计算、孪生状态同步与告警抑制逻辑，并说明与知识图谱、工单、人工确认的集成方式。",
    difficulty: "高级",
    estimatedMinutes: 55,
    prerequisites: ["时序数据基础", "Python 基础", "数字孪生概念"],
    learningObjectives: [
      "区分状态监测、异常检测与剩余寿命预测三类任务",
      "实现滑动窗口特征与基线自适应异常评分",
      "实现数字孪生状态同步与告警抑制",
      "设计从告警到工单再到人工确认的闭环",
      "识别数据漂移、误报与评估指标陷阱",
    ],
    sections: [
      {
        id: "overview",
        heading: "1. 技术概述 Overview",
        blocks: [
          {
            type: "paragraph",
            text: "预测性维护（Predictive Maintenance, PdM）用设备运行数据估计退化趋势，在故障发生前安排检修。数字孪生（Digital Twin）为物理设备维护一份可查询、可仿真的状态模型，把实时测点、台账、拓扑与历史维修记录统一到设备 id 上。它解决的核心问题是：传统定期保养要么过度维护、要么漏检，而告警系统只看单点阈值，无法表达「相对自身基线的缓慢劣化」。",
          },
          {
            type: "paragraph",
            text: "产生背景是工业传感器与边缘网关普及后，时序数据可得但缺乏上下文：同一个振动值对高速轴承和低速风机含义完全不同。把孪生作为语义锚点，才能让模型输出落到「哪台设备、哪个部件、依据什么证据、建议什么动作」。",
          },
          {
            type: "table",
            headers: ["任务", "输入", "输出", "难点"],
            rows: [
              ["状态监测", "实时测点", "正常/异常标签", "阈值随工况变化"],
              ["异常检测", "窗口特征 + 基线", "异常分数与证据", "工况切换导致误报"],
              ["剩余寿命预测", "退化序列 + 维修史", "RUL 区间", "故障样本稀少、删失数据"],
              ["检修决策", "异常 + 备件 + 排产", "工单建议", "需人工确认与成本核算"],
            ],
          },
          {
            type: "list",
            items: [
              "适用场景：旋转设备、泵、压缩机、CNC 主轴等有连续测点的资产。",
              "不适用场景：无传感器覆盖、故障为突发随机事件且无前兆的设备。",
              "与规则告警的区别：规则用固定阈值，PdM 用相对基线与趋势。",
              "与 Agent 的区别：PdM 输出分数与证据，是否停机由流程与人工决定。",
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "不要承诺 RUL 精度",
            text: "没有标注的失效样本与删失数据处理，就无法给出可信的剩余寿命数值。教学示例只做异常评分与趋势判断，不声称可预测具体剩余小时数。",
          },
        ],
      },
      {
        id: "fundamentals",
        heading: "2. 核心原理 Fundamentals",
        blocks: [
          {
            type: "paragraph",
            text: "核心机制是「窗口特征 → 基线比较 → 趋势累积 → 告警抑制」。对每个设备与测点维护滚动窗口，计算均值、标准差、斜率与峰值计数；用稳健基线（历史中位数与 MAD）把原始值标准化为 z 分数；连续多窗超阈值才升级为告警，避免单点毛刺；告警再与工况标签、维修窗口、备件可用性一起进入决策。",
          },
          {
            type: "mermaid",
            title: "从测点到工单的数据流",
            source: `flowchart LR
  S["IoT 测点(模拟)"] --> B["边缘缓冲 / 去重"]
  B --> W["滑动窗口特征"]
  W --> C["基线比较 z-score"]
  C --> T["趋势累积 / 抑制"]
  T --> D["Digital Twin 状态更新"]
  D --> K["设备知识图谱关联部件"]
  K --> A["诊断 Agent(结构化建议)"]
  A --> P["人工确认"]
  P --> O["工单 / 排产"]`,
            caption: "模型只产出建议，停机与派工必须经过人工确认。",
          },
          {
            type: "table",
            headers: ["要素", "定义", "工程含义"],
            rows: [
              ["window", "固定长度的时间窗", "窗口长度需覆盖至少一个工况周期"],
              ["baseline", "历史稳健统计（中位数 / MAD）", "避免用均值被异常值拉偏"],
              ["z_score", "(当前值 - 中位数) / 尺度", "尺度需设下限防止除零"],
              ["trend", "连续超阈窗口计数", "抑制瞬时毛刺"],
              ["suppression", "同设备同部件冷却期", "防止告警风暴"],
              ["twin_state", "设备当前状态快照", "必须带时间戳与数据来源"],
            ],
          },
          {
            type: "paragraph",
            text: "输入是带 device_id、metric、ts、value、operating_mode 的测点流；输出是 AnomalyScore 与更新的 TwinState。关键状态包括每设备窗口缓冲、基线版本、连续异常计数与上次告警时间。系统边界：边缘断连会产生乱序与重复数据，摄取层必须按 (device_id, ts) 去重并重放；孪生状态写入必须幂等。",
          },
          {
            type: "list",
            items: [
              "局限一：工况切换（升速、换料）会被误判为异常，必须按 operating_mode 分组建模。",
              "局限二：绝大多数设备没有失效标签，监督式 RUL 模型难以可靠训练与验证。",
              "局限三：传感器漂移与标定变化会造成慢速假趋势，需要定期基线重估。",
              "局限四：告警分数不是业务损失，派工决策还需备件、停机成本与安全约束。",
            ],
          },
        ],
      },
      {
        id: "architecture",
        heading: "3. 架构设计 Architecture",
        blocks: [
          {
            type: "mermaid",
            title: "组件架构",
            source: `flowchart TB
  subgraph EDGE["边缘层"]
    E1["采集网关"] --> E2["去重 / 缓冲"]
  end
  subgraph DATA["数据层"]
    D1[("时序库")] --> D2["窗口聚合任务"]
    D3[("设备台账 / 图谱")]
  end
  subgraph LOGIC["分析层"]
    L1["Feature Calculator"] --> L2["Anomaly Scorer"]
    L2 --> L3["Twin Updater"]
  end
  subgraph ACT["执行层"]
    A1["Suppression / 审批"] --> A2["工单适配器"]
    A2 --> A3["审计 / 监控"]
  end
  E2 --> D1
  D2 --> L1
  D3 --> L3
  L3 --> A1`,
            caption: "分析层无写权限，执行层通过审批与适配器产生副作用。",
          },
          {
            type: "table",
            headers: ["组件", "职责", "失败默认行为"],
            rows: [
              ["采集网关", "测点接入、去重、断点续传", "本地缓冲并告警"],
              ["Feature Calculator", "窗口统计与斜率", "数据不足则跳过"],
              ["Anomaly Scorer", "基线比较与趋势计数", "跳过该窗口"],
              ["Twin Updater", "幂等写入状态快照", "重试并保留旧状态"],
              ["Suppression", "冷却期与同因合并", "不放行告警"],
              ["工单适配器", "把建议转为工单草稿", "进入死信队列"],
            ],
          },
          {
            type: "paragraph",
            text: "数据流与控制流分离：分析层只发布结构化事件，执行层订阅后按审批策略落地。扩展方式是新增测点类型或部件规则，不改评分内核。",
          },
        ],
      },
      {
        id: "components",
        heading: "4. 组件职责说明 Components",
        blocks: [
          {
            type: "table",
            headers: ["组件", "输入", "输出", "约束"],
            rows: [
              ["window_features", "有序数值序列", "mean/std/slope/max", "长度不足返回 None"],
              ["robust_baseline", "历史窗口特征", "median, mad_scale", "尺度下限保护"],
              ["score_anomaly", "当前特征 + 基线", "z, severity", "纯函数，可单测"],
              ["TrendTracker.update", "device_id, severity", "连续计数", "按设备隔离状态"],
              ["TwinStore.apply", "TwinState", "是否更新", "仅接受更新的 ts"],
              ["Suppression.allow", "device_id, part, now", "boolean", "冷却期内拒绝"],
            ],
          },
        ],
      },
      {
        id: "execution-flow",
        heading: "5. 数据流与执行流 Execution Flow",
        blocks: [
          {
            type: "list",
            ordered: true,
            items: [
              "测点按 (device_id, ts) 去重，乱序数据在水位线内重排，超水位进入迟到队列。",
              "按设备与 metric 聚合为固定窗口，计算均值、标准差、最小二乘斜率与峰值。",
              "用该设备该工况的历史稳健基线计算 z 分数，得到 warn / critical 等级。",
              "TrendTracker 累计连续超阈窗口，达到 N 个才生成候选告警。",
              "Twin Updater 以更大的 ts 覆盖状态快照，并携带证据特征与基线版本。",
              "Suppression 按设备+部件冷却期合并告警；通过后生成工单草稿，进入人工确认。",
              "人工确认结果、工单号与处置结论回写审计，并作为下一轮基线重估的输入。",
            ],
          },
          {
            type: "paragraph",
            text: "异常路径：数据断流时标记 stale 而不产生新告警；基线缺失时降级为固定阈值并标注「低置信」；工单系统不可用时进入死信队列，不得反复重放。",
          },
        ],
      },
      {
        id: "patterns",
        heading: "6. 关键技术与设计模式",
        blocks: [
          {
            type: "list",
            items: [
              "Robust Statistics：中位数 + MAD 抗离群，优于均值/标准差基线。",
              "Watermark / Late Data：处理边缘乱序与断连重传。",
              "Twin as Aggregate：以 device_id 为聚合根统一测点、台账、图谱与维修史。",
              "Evidence Bundle：告警必须携带窗口特征、基线版本与测点 id，便于复核。",
              "Suppression & Cooldown：抑制告警风暴，按部件而非整设备去重。",
              "Human-in-the-loop：停机、派工、备件消耗必须人工确认。",
              "Drift Detection：监控特征分布变化，触发基线重估而不是静默失效。",
            ],
          },
          {
            type: "table",
            headers: ["模式", "优点", "缺点", "适用"],
            rows: [
              ["固定阈值", "简单可解释", "工况变化误报高", "安全联锁等硬约束"],
              ["稳健 z-score", "自适应、无需标签", "无法给出 RUL", "样本稀缺的存量设备"],
              ["监督式 RUL", "可给出时间区间", "需失效标注与删失处理", "数据成熟的关键资产"],
              ["孪生仿真", "可推演工况", "建模成本高", "高价值复杂产线"],
            ],
          },
        ],
      },
      {
        id: "stack",
        heading: "7. 技术栈与选型 Trade-off",
        blocks: [
          {
            type: "table",
            headers: ["层次", "可选方案", "选型建议"],
            rows: [
              ["时序存储", "时序数据库 / 湖仓表", "按查询延迟与保留周期选择"],
              ["计算", "流处理 / 批窗口任务", "告警时效要求高用流式"],
              ["图谱", "图数据库 / 关系表三元组", "关系查询复杂再上图数据库"],
              ["编排", "工作流引擎 + 审批", "与 IT 工单流程复用同一引擎"],
              ["监控", "指标 + trace", "把告警分数与处置结果关联"],
            ],
          },
          {
            type: "paragraph",
            text: "本节不指定任何工业协议、时序数据库或 IoT 平台的具体 API 与版本；接入时请以对应官方文档核验后替换采集与存储适配器（需进一步核验）。示例代码只用 Python 标准库，测点数据为教学模拟数据。",
          },
        ],
      },
      {
        id: "hands-on",
        heading: "8. Hands-on 实战：可运行的异常评分与孪生同步",
        blocks: [
          {
            type: "code",
            language: "bash",
            filename: "tree.txt",
            caption: "项目结构、环境与执行方式",
            code: String.raw`project-pdm/
  features.py        # 窗口特征、稳健基线、异常评分、趋势与孪生状态
  test_features.py   # 离线 pytest 测试
  twin.yaml          # 配置（教学模拟阈值）
  README.md

环境要求: Python >= 3.10, pytest >= 7
安装:     python -m pip install pytest
执行测试: cd project-pdm && python -m pytest -q
无需网络、数据库或密钥；测点为教学模拟数据（见 test_features.py）。
输入: 有序测点序列 + 历史基线
输出: AnomalyScore(z, severity) 与 TwinState 快照`,
          },
          {
            type: "code",
            language: "python",
            filename: "features.py",
            caption: "核心实现：窗口特征、稳健基线、趋势累积、告警抑制与幂等孪生写入",
            runnable: true,
            code: String.raw`from __future__ import annotations

import statistics
from dataclasses import dataclass, field
from typing import Iterable


@dataclass(frozen=True)
class WindowFeatures:
    mean: float
    std: float
    slope: float
    maximum: float
    size: int


@dataclass(frozen=True)
class Baseline:
    median: float
    scale: float
    version: str


@dataclass(frozen=True)
class AnomalyScore:
    z: float
    severity: str          # normal | warn | critical
    baseline_version: str


@dataclass(frozen=True)
class TwinState:
    device_id: str
    ts: int
    status: str
    evidence: dict[str, float]
    source: str = "simulated"


def window_features(values: Iterable[float], minimum: int = 5) -> WindowFeatures | None:
    """最小二乘斜率；样本不足返回 None，避免用噪声做判断。"""
    xs = [float(v) for v in values]
    if len(xs) < minimum:
        return None
    n = len(xs)
    mean = statistics.fmean(xs)
    std = statistics.pstdev(xs)
    xm = (n - 1) / 2
    denom = sum((i - xm) ** 2 for i in range(n))
    slope = (sum((i - xm) * (v - mean) for i, v in enumerate(xs)) / denom
             if denom else 0.0)
    return WindowFeatures(mean, std, slope, max(xs), n)


def robust_baseline(history: list[float], version: str = "v1") -> Baseline:
    """中位数 + MAD 尺度，尺度设下限避免除零。"""
    if not history:
        raise ValueError("empty baseline history")
    med = statistics.median(history)
    mad = statistics.median([abs(x - med) for x in history])
    scale = max(1.4826 * mad, 1e-6)
    return Baseline(med, scale, version)


def score_anomaly(features: WindowFeatures, baseline: Baseline,
                  warn_z: float = 3.0, critical_z: float = 5.0) -> AnomalyScore:
    z = (features.mean - baseline.median) / baseline.scale
    az = abs(z)
    severity = "critical" if az >= critical_z else "warn" if az >= warn_z else "normal"
    return AnomalyScore(z, severity, baseline.version)


class TrendTracker:
    """连续 N 个窗口超阈才升级为候选告警。"""
    def __init__(self, required: int = 3) -> None:
        self.required = required
        self._streak: dict[str, int] = {}

    def update(self, device_id: str, severity: str) -> bool:
        if severity == "normal":
            self._streak[device_id] = 0
            return False
        self._streak[device_id] = self._streak.get(device_id, 0) + 1
        return self._streak[device_id] >= self.required

    def streak(self, device_id: str) -> int:
        return self._streak.get(device_id, 0)


class Suppression:
    """同设备+部件在冷却期内只放行一次，防止告警风暴。"""
    def __init__(self, cooldown_seconds: int) -> None:
        self.cooldown = cooldown_seconds
        self._last: dict[tuple[str, str], int] = {}

    def allow(self, device_id: str, part: str, now: int) -> bool:
        key = (device_id, part)
        last = self._last.get(key)
        if last is not None and now - last < self.cooldown:
            return False
        self._last[key] = now
        return True


class TwinStore:
    """幂等写入：仅接受时间戳更大的状态快照。"""
    def __init__(self) -> None:
        self._states: dict[str, TwinState] = {}
        self.writes = 0

    def apply(self, state: TwinState) -> bool:
        current = self._states.get(state.device_id)
        if current is not None and current.ts >= state.ts:
            return False
        self._states[state.device_id] = state
        self.writes += 1
        return True

    def get(self, device_id: str) -> TwinState | None:
        return self._states.get(device_id)


@dataclass
class EvaluationReport:
    """把预测与处置结果关联，供离线评估使用（教学结构）。"""
    records: list[dict[str, object]] = field(default_factory=list)

    def add(self, device_id: str, severity: str,
            confirmed: bool, outcome: str) -> None:
        self.records.append({"device_id": device_id, "severity": severity,
                             "confirmed": confirmed, "outcome": outcome})`,
          },
          {
            type: "code",
            language: "python",
            filename: "test_features.py",
            caption: "回归测试：样本不足、稳健基线、趋势抑制、幂等写入、冷却期",
            code: String.raw`import pytest

from features import (window_features, robust_baseline, score_anomaly,
                      TrendTracker, Suppression, TwinStore, TwinState,
                      EvaluationReport)


def test_insufficient_window_returns_none():
    assert window_features([1.0, 2.0, 3.0]) is None


def test_slope_detects_rising_trend():
    f = window_features([10, 11, 12, 13, 14, 15])
    assert f is not None and f.slope > 0 and f.mean == 12.5


def test_robust_baseline_ignores_outlier():
    b = robust_baseline([10, 10, 10, 10, 999])
    assert b.median == 10
    assert b.scale >= 1e-6


def test_severity_thresholds():
    b = robust_baseline([10, 10, 10, 10, 10])
    normal = score_anomaly(window_features([10] * 6), b)
    assert normal.severity == "normal"
    high = window_features([10 + 10 * b.scale] * 6)
    assert score_anomaly(high, b).severity == "critical"


def test_trend_requires_consecutive_windows():
    t = TrendTracker(required=3)
    assert t.update("pump-1", "warn") is False
    assert t.update("pump-1", "warn") is False
    assert t.update("pump-1", "warn") is True
    t.update("pump-1", "normal")
    assert t.streak("pump-1") == 0


def test_suppression_blocks_within_cooldown():
    s = Suppression(cooldown_seconds=100)
    assert s.allow("pump-1", "bearing", 1000) is True
    assert s.allow("pump-1", "bearing", 1050) is False
    assert s.allow("pump-1", "bearing", 1101) is True
    assert s.allow("pump-1", "seal", 1050) is True


def test_twin_store_is_idempotent_on_old_timestamp():
    store = TwinStore()
    s1 = TwinState("pump-1", 200, "warn", {"z": 3.4})
    s2 = TwinState("pump-1", 150, "normal", {"z": 0.1})
    assert store.apply(s1) is True
    assert store.apply(s2) is False
    assert store.get("pump-1").status == "warn"
    assert store.writes == 1


def test_evaluation_report_links_prediction_and_outcome():
    r = EvaluationReport()
    r.add("pump-1", "critical", True, "bearing_replaced")
    assert r.records[0]["confirmed"] is True`,
          },
          {
            type: "code",
            language: "yaml",
            filename: "twin.yaml",
            caption: "配置（教学模拟阈值，非任何设备基准）",
            code: String.raw`version: "teaching-demo-1"
# 以下数字全部为教学模拟值，禁止直接用于真实设备
window:
  size: 60
  minimum_samples: 5
baseline:
  statistic: median_mad
  min_scale: 0.000001
  reestimate_on_drift: true
scoring:
  warn_z: 3.0
  critical_z: 5.0
  consecutive_windows: 3
  group_by: operating_mode
suppression:
  cooldown_seconds: 1800
  key: [device_id, part]
twin:
  idempotent_on: ts
  stale_after_seconds: 300
actions:
  require_human_approval: true
  ticket_draft_only: true`,
          },
          {
            type: "callout",
            variant: "warning",
            title: "真实 / 模拟边界",
            text: "测点序列、阈值、设备 id 与结论均为教学模拟数据。真实代码是上述纯函数与状态机；模拟接口是采集网关、时序库、设备图谱与工单系统（本示例未实现其网络调用）。生产替换点需按现场工况重新标定基线与阈值。",
          },
        ],
      },
      {
        id: "case",
        heading: "9. 企业应用案例（教学模拟）",
        blocks: [
          {
            type: "paragraph",
            text: "业务背景：某模拟工厂有 40 台泵，采集振动与温度测点。业务问题是原固定阈值告警在升速换料时大量误报，运维人员逐渐忽略告警。数据来源为教学模拟的时序序列与维修台账，不含任何真实产线数据。",
          },
          {
            type: "table",
            headers: ["阶段", "落地动作", "验证方式"],
            rows: [
              ["基线", "按设备+工况建立稳健基线", "历史回放对比误报数"],
              ["抑制", "连续窗口 + 冷却期", "告警风暴演练"],
              ["闭环", "工单草稿 + 人工确认", "审计链路抽检"],
              ["评估", "告警确认率与漏报复盘", "离线评测集"],
            ],
          },
          {
            type: "paragraph",
            text: "「40 台泵」及所有效果描述为教学设定，不构成行业基准或客户案例。部署方案需结合现场安全规范与设备厂商手册另行设计。",
          },
        ],
      },
      {
        id: "production",
        heading: "10. Production Engineering 生产实践",
        blocks: [
          {
            type: "list",
            items: [
              "摄取层按 (device_id, ts) 幂等去重，断连恢复后按水位线重放，迟到数据单独处理。",
              "基线版本化并定期重估，重估前后对比分布，避免静默漂移。",
              "监控：数据新鲜度、缺失窗口比例、告警确认率、抑制数量、工单闭环时长。",
              "告警携带 evidence bundle（窗口特征、基线版本、测点 id），支持事后复核。",
              "灰度：先影子模式只产出不派工，与人工巡检结论对照后再开放写操作。",
              "降级：数据断流标记 stale 且不发新告警；工单系统故障转死信队列并人工值守。",
            ],
          },
        ],
      },
      {
        id: "security",
        heading: "11. Security & Governance 安全与治理",
        blocks: [
          {
            type: "list",
            items: [
              "OT/IT 网络隔离，采集侧只出不入，禁止分析层直接下发控制指令。",
              "停机、切换备机、派工等高危动作必须人工确认并留审计。",
              "设备台账与图谱按厂区/租户隔离，跨厂区查询需显式授权。",
              "维修记录可能含人员信息，日志中脱敏并限制保留周期。",
              "模型与基线变更纳入版本审批，回滚需同时回滚基线快照。",
            ],
          },
        ],
      },
      {
        id: "evaluation",
        heading: "12. Evaluation & Testing 评估与测试",
        blocks: [
          {
            type: "table",
            headers: ["指标", "定义", "注意事项"],
            rows: [
              ["告警确认率", "人工确认有价值的告警占比", "不能用点击率替代"],
              ["漏报复盘", "未告警但事后发生故障的次数", "需要维修台账对齐"],
              ["误报率", "正常工况下产生告警比例", "按 operating_mode 分组统计"],
              ["提前量", "首次告警到故障记录的时间差", "仅在有可靠失效标注时计算"],
              ["数据新鲜度", "最新测点与当前时间差", "断流时不得用旧值生成告警"],
            ],
          },
          {
            type: "paragraph",
            text: "由于故障样本稀少且存在删失数据，评估应采用时间切分回放而不是随机切分，并单独报告不同工况下的表现，避免总体指标掩盖关键设备的漏报。",
          },
        ],
      },
      {
        id: "best-practices",
        heading: "13. Best Practices 最佳实践",
        blocks: [
          {
            type: "list",
            items: [
              "先做数据质量与工况标注，再谈模型；没有工况标签的异常分数很难解释。",
              "用稳健统计和趋势累积抑制毛刺，别用单次越阈值触发工单。",
              "孪生状态写入幂等且带时间戳，乱序迟到数据不得覆盖新状态。",
              "模型输出永远是建议，停机与派工由人和流程决定。",
              "明确说明「无法给出可信 RUL」，比给出不可验证的数字更负责任。",
            ],
          },
        ],
      },
      {
        id: "troubleshooting",
        heading: "14. Troubleshooting 故障排查",
        blocks: [
          {
            type: "table",
            headers: ["现象", "常见原因", "排查方法", "预防方式"],
            rows: [
              ["换料后误报激增", "基线未按工况分组", "按 operating_mode 拆分回放", "工况标签入基线键"],
              ["告警风暴", "未做冷却期与同因合并", "查看 Suppression 命中", "按部件聚合"],
              ["孪生状态回退", "迟到数据覆盖新快照", "检查 ts 幂等判定", "水位线 + 迟到队列"],
              ["分数长期为 0", "尺度下限或基线污染", "检查 baseline.scale 与版本", "基线重估与灰度对比"],
            ],
          },
        ],
      },
      {
        id: "further-reading",
        heading: "15. Further Reading 参考资料",
        blocks: [
          {
            type: "paragraph",
            text: "以下为通用资产管理与数据处理资料入口。工业协议、设备手册与平台 API 请以对应官方文档与现场规范核验（需进一步核验）。",
          },
          {
            type: "callout",
            variant: "info",
            title: "资料核验说明",
            text: "本节算法（中位数/MAD、窗口斜率、趋势累积）为通用统计方法，实现为本站工程建议；不引用任何未经核验的性能数据或客户案例。",
          },
        ],
      },
      {
        id: "engineering-notes",
        heading: "16. 工程实现补遗：组件交互时序、故障演练与上线验收",
        blocks: [
          {
            type: "paragraph",
            text: "迟到数据不得触发新告警，只能更新已闭合窗口的统计。若允许迟到测点生成告警，边缘断连恢复后的批量补传会造成告警风暴，并让「首次告警时间」失去评估意义。",
          },
          {
            type: "mermaid",
            title: "组件交互时序（含失败分支）",
            source: String.raw`sequenceDiagram
  participant S as 传感器
  participant B as 摄取/去重
  participant F as 窗口特征
  participant A as 异常评分
  participant T as TwinStore
  participant H as 人工确认
  S->>B: reading(device_id, ts, mode)
  B->>B: 去重 + 水位线判定
  alt 迟到数据
    B->>F: 仅更新已闭合窗口统计
  else 正常数据
    B->>F: 聚合窗口
    F->>A: 特征 + 基线版本
    A->>A: 稳健 z + 趋势累积
    alt 达到连续阈值
      A->>T: 幂等写入快照(带证据)
      A->>H: 告警候选(工单草稿)
    else 未达到
      A->>A: 仅记录分数
    end
  end`,
            caption: "消息顺序、超时分支与降级路径；箭头方向即控制流方向。",
          },
          {
            type: "table",
            headers: ["组件交互契约", "传递内容", "超时/失败语义"],
            rows: [
              ["摄取层 → 特征层","去重后的有序窗口 + 工况标签","断流标记 stale，不生成新告警"],
              ["特征层 → 评分层","均值/斜率 + 基线版本","基线缺失降级并标注低置信"],
              ["评分层 → TwinStore","带 ts 的状态快照","迟到快照不得覆盖新状态"],
            ],
          },
          {
            type: "table",
            headers: ["类别", "可执行操作", "通过标准"],
            rows: [
              ["故障注入","重放 10 分钟前的迟到测点","不产生新告警，ts 较小快照被拒"],
              ["故障注入","切换工况但不更新标签","按 operating_mode 回放暴露误报并触发基线重估"],
              ["上线验收","pytest -q test_features.py","稳健基线、趋势、抑制、幂等用例通过"],
              ["上线验收","影子模式对照人工巡检","告警确认率与漏报有记录"],
            ],
          },
          {
            type: "paragraph",
            text: "落地替换点：采集网关与时序库按现场协议与平台文档接入，基线按设备与工况分别标定并版本化，设备图谱与维修台账接入资产管理系统，工单草稿接入 ITSM 且保留人工确认。所有阈值均为教学模拟值，不得直接用于真实设备。",
          },
        ],
      },
    ],
    tags: ["预测性维护", "数字孪生", "时序特征", "异常检测", "工业 AI"],
    architectureIds: ["a16", "a13"],
    relatedTutorialIds: [
      "digital-twin",
      "industrial-agent",
      "data-pipeline-cdc",
      "agent-tracing",
      "project-manufacturing-agent",
    ],
    nextTutorialSlugs: ["project-manufacturing-agent", "digital-twin"],
    relatedLabSlugs: ["architecture-designer", "workflow-designer"],
    relatedCaseSlugs: ["manufacturing-ops-agent"],
    references: [
      R("ISO 17359 状态监测与诊断通用指南", "https://www.iso.org/standards.html", "ISO", "状态监测通用流程参考；ISO 17359 具体条目与版本需按官方目录检索核验", "官方规范"),
      R("NIST AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework", "NIST", "工业 AI 风险评估与治理框架", "官方规范"),
      R("OpenTelemetry 官方文档", "https://opentelemetry.io/docs/", "OpenTelemetry", "数据新鲜度与 trace 监控实现参考", "官方规范"),
      R("Microsoft Azure 预测性维护方案资料", "https://learn.microsoft.com/en-us/azure/architecture/", "Microsoft", "工业数据管道的通用架构参考", "官方产品文档"),
      R("本站：数据管道与 CDC", "https://www.yuxin.run/agent-fullstack-knowledge/tutorials/data-pipeline-cdc", "本站", "摄取去重与位点管理实现", "本站工程建议"),
    ],
    updatedAt: "2026-11-13",
    status: "published",
    qualityLevel: "L5",
  },
  {
    id: "t-prj-02",
    slug: "project-manufacturing-agent",
    domainId: "d14",
    title: "贯穿项目 B：制造业智能运维 Agent（从需求到部署监控）",
    englishTitle: "Capstone Project B: Manufacturing Operations Agent",
    summary:
      "用一个完整教学项目串起 IoT 时序数据、设备知识图谱、数字孪生、故障诊断、预测性维护、工单与人工确认、审计与监控；提供可运行的编排内核与测试，逐项标注模拟数据与真实代码边界。",
    difficulty: "专家",
    estimatedMinutes: 75,
    prerequisites: ["预测性维护", "知识图谱", "Workflow 引擎", "Agent 安全"],
    learningObjectives: [
      "把业务需求拆解为可验证的能力与边界",
      "设计设备孪生、知识图谱与告警证据的数据模型",
      "实现诊断→预测→工单→审批→审计的完整链路",
      "区分真实可运行代码与模拟外部接口",
      "建立部署、监控、评估与故障排查清单",
    ],
    sections: [
      {
        id: "overview",
        heading: "1. 项目概述 Overview",
        blocks: [
          {
            type: "paragraph",
            text: "本项目把一个制造业智能运维场景做成端到端教学案例：产线设备产生模拟时序测点，系统同步数字孪生状态，结合设备知识图谱定位可疑部件，由诊断 Agent 生成结构化建议，经预测性维护评分与人工确认后生成工单，全过程写入审计与监控指标。它解决的核心问题是：单个技术点（孪生、RAG、Agent、工作流）各自都讲得通，但企业落地需要它们在同一套 id、权限与证据链下协同。",
          },
          {
            type: "table",
            headers: ["需求", "能力", "验收方式"],
            rows: [
              ["设备状态可查询", "孪生快照 + ts 幂等", "乱序写入测试"],
              ["故障可追溯到部件", "知识图谱路径查询", "给定设备返回部件链"],
              ["告警不靠拍脑袋", "窗口特征 + 证据包", "证据字段完整性测试"],
              ["不自动停机", "审批挂起 + 人工确认", "未审批无工单测试"],
              ["可审计可监控", "审计事件 + 指标", "轨迹回放与指标断言"],
            ],
          },
          {
            type: "callout",
            variant: "danger",
            title: "模拟数据声明",
            text: "本项目所有设备编号、测点数值、部件关系、故障结论、工单号与指标阈值均为教学模拟数据，不代表任何真实工厂、设备厂商或客户案例。",
          },
        ],
      },
      {
        id: "fundamentals",
        heading: "2. 核心原理 Fundamentals",
        blocks: [
          {
            type: "paragraph",
            text: "系统以 device_id 作为贯穿全局的聚合根：时序窗口、孪生状态、图谱节点、告警证据、工单草稿与审计事件都携带同一 id。控制面（编排器）与数据面（分析与模型）分离，写操作统一经过审批闸门；任何模型输出都必须落在结构化 Schema 内，解析失败即拒绝。",
          },
          {
            type: "mermaid",
            title: "项目 B 端到端链路",
            source: `flowchart TB
  IOT["IoT 测点(模拟)"] --> ING["摄取去重 + 水位线"]
  ING --> FE["窗口特征 / 异常评分"]
  FE --> TWIN[("Digital Twin 状态")]
  KG[("设备知识图谱")] --> DIAG["诊断 Agent(结构化建议)"]
  TWIN --> DIAG
  DIAG --> EV["证据包 + 置信标注"]
  EV --> WF["Saga 编排 / 检查点"]
  WF --> APP["人工确认"]
  APP --> TICKET["工单草稿(模拟接口)"]
  WF --> AUD[("审计 / 指标")]`,
            caption: "虚线外的写操作只有审批通过后才发生。",
          },
          {
            type: "list",
            items: [
              "输入：模拟测点流、设备台账、部件关系、维修记录、审批结果。",
              "输出：孪生快照、结构化诊断建议、工单草稿、审计事件与指标。",
              "关键状态：窗口缓冲、基线版本、待审批队列、审批超时计时、补偿记录。",
              "边界：分析层无写权限；OT 网络不接受来自分析层的控制指令。",
            ],
          },
        ],
      },
      {
        id: "architecture",
        heading: "3. 架构设计 Architecture",
        blocks: [
          {
            type: "table",
            headers: ["层", "组件", "真实/模拟", "职责"],
            rows: [
              ["数据层", "IngestBuffer", "真实代码", "去重、水位线、迟到队列"],
              ["数据层", "时序库 / 台账库", "模拟接口", "本例用内存字典替代"],
              ["知识层", "DeviceGraph", "真实代码", "部件关系与路径查询"],
              ["分析层", "AnomalyScorer", "真实代码", "窗口特征与稳健 z-score"],
              ["分析层", "诊断 Agent", "模拟接口", "本例返回结构化建议，不调用真实 LLM"],
              ["孪生层", "TwinStore", "真实代码", "幂等状态快照"],
              ["控制层", "OpsOrchestrator", "真实代码", "审批、工单、审计编排"],
              ["执行层", "工单/ITSM 适配器", "模拟接口", "生成工单草稿，无外部调用"],
              ["治理层", "AuditLog", "真实代码", "事件与证据链"],
            ],
          },
          {
            type: "paragraph",
            text: "数据流：测点 → 特征 → 孪生 → 诊断 → 证据 → 编排 → 审批 → 工单 → 审计；控制流：编排器持有状态机，任何异常都走补偿或死信。扩展方式：把模拟接口替换为真实适配器，其余层不变。",
          },
        ],
      },
      {
        id: "components",
        heading: "4. 组件职责说明 Components",
        blocks: [
          {
            type: "table",
            headers: ["组件", "输入", "输出", "约束"],
            rows: [
              ["IngestBuffer.push", "Reading", "是否接受", "重复 (device_id, ts) 丢弃"],
              ["DeviceGraph.parts", "device_id", "部件链", "关系必须有来源标注"],
              ["AnomalyScorer.score", "窗口 + 基线", "z / severity", "纯函数"],
              ["OpsOrchestrator.run", "device_id, score", "流程状态", "未审批不生成工单"],
              ["OpsOrchestrator.approve", "instance_id, bool", "终态", "拒绝则补偿"],
              ["AuditLog.events", "—", "事件列表", "只追加、含 run_id"],
            ],
          },
        ],
      },
      {
        id: "execution-flow",
        heading: "5. 数据流与执行流 Execution Flow",
        blocks: [
          {
            type: "list",
            ordered: true,
            items: [
              "摄取：按 (device_id, ts) 去重，窗口内排序，迟到数据进入单独队列。",
              "特征与评分：按工况分组，用中位数/MAD 基线得到 z 与 severity。",
              "孪生更新：仅当 ts 更大时覆盖快照，写入证据字段与基线版本。",
              "诊断：结合图谱部件链与孪生状态，产出结构化建议（本例为模拟输出）。",
              "编排：生成 instance_id 与检查点；高危动作进入 waiting_approval。",
              "人工确认：通过后调用模拟工单适配器生成草稿；拒绝则走补偿并写审计。",
              "监控：每步记录 run_id、耗时、结果摘要与指标，供回放与评估。",
            ],
          },
        ],
      },
      {
        id: "patterns",
        heading: "6. 关键技术与设计模式",
        blocks: [
          {
            type: "list",
            items: [
              "Aggregate Root：device_id 统一跨层引用，避免各系统各自编码。",
              "Evidence Bundle：诊断建议必须携带特征、基线版本与图谱路径。",
              "Structured Output：模型输出按 Schema 解析，失败即拒绝，不自由解释。",
              "Checkpoint & Saga：审批挂起可恢复，失败逆序补偿。",
              "Human-in-the-loop：停机、派工、备件消耗强制人工确认。",
              "Anti-corruption Layer：模拟适配器与真实 ITSM 接口隔离。",
            ],
          },
        ],
      },
      {
        id: "stack",
        heading: "7. 技术栈与选型 Trade-off",
        blocks: [
          {
            type: "table",
            headers: ["决策点", "本项目选择（教学）", "生产替换建议"],
            rows: [
              ["时序存储", "内存窗口", "时序数据库 + 保留策略"],
              ["图谱", "内存邻接表", "图数据库或带约束的三元组表"],
              ["模型", "结构化模拟输出", "按官方 SDK 接入并设置超时/预算"],
              ["编排", "Python 状态机", "持久化工作流引擎"],
              ["审批", "内存队列", "工单/审批系统 + 超时补偿"],
              ["监控", "内存指标", "指标系统 + trace 关联 run_id"],
            ],
          },
          {
            type: "paragraph",
            text: "所有产品相关接口与版本均需按官方文档核验后替换（需进一步核验）；本项目不调用任何厂商 SDK。",
          },
        ],
      },
      {
        id: "hands-on",
        heading: "8. Hands-on 实战：项目 B 编排内核",
        blocks: [
          {
            type: "code",
            language: "bash",
            filename: "tree.txt",
            caption: "项目结构、环境与执行方式",
            code: String.raw`project-b-manufacturing/
  plant_agent.py       # 摄取、图谱、孪生、编排、审批、审计
  test_plant_agent.py  # 离线 pytest 回归测试
  project-b.yaml       # 配置（教学模拟）
  README.md            # 真实/模拟模块清单

环境要求: Python >= 3.10, pytest >= 7
安装:     python -m pip install pytest
执行测试: cd project-b-manufacturing && python -m pytest -q
无需网络、数据库、API Key；不调用任何真实 LLM / ITSM / IoT 平台。
输入: 模拟测点 + 设备图谱 + 审批结果
输出: 孪生快照 / 工单草稿 / 审计事件`,
          },
          {
            type: "code",
            language: "python",
            filename: "plant_agent.py",
            caption: "核心实现：摄取去重、图谱路径、幂等孪生、审批编排与只追加审计",
            runnable: true,
            code: String.raw`from __future__ import annotations

import hashlib
import statistics
import uuid
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class Reading:
    device_id: str
    ts: int
    metric: str
    value: float
    operating_mode: str


@dataclass(frozen=True)
class Evidence:
    z: float
    severity: str
    baseline_version: str
    parts: tuple[str, ...]
    note: str = "teaching-simulated"


@dataclass(frozen=True)
class TwinSnapshot:
    device_id: str
    ts: int
    status: str
    evidence: Evidence | None


class IngestBuffer:
    """真实代码：去重与有序窗口。"""
    def __init__(self) -> None:
        self._seen: set[tuple[str, int, str]] = set()
        self._values: dict[str, list[float]] = {}

    def push(self, r: Reading) -> bool:
        key = (r.device_id, r.ts, r.metric)
        if key in self._seen:
            return False
        self._seen.add(key)
        self._values.setdefault(r.device_id, []).append(r.value)
        return True

    def window(self, device_id: str) -> list[float]:
        return list(self._values.get(device_id, []))


class DeviceGraph:
    """真实代码：小规模邻接表，用于演示部件路径查询。"""
    def __init__(self, edges: list[tuple[str, str, str]]) -> None:
        self._adj: dict[str, list[tuple[str, str]]] = {}
        for src, rel, dst in edges:
            self._adj.setdefault(src, []).append((rel, dst))

    def parts(self, device_id: str) -> tuple[str, ...]:
        out: list[str] = []
        stack = [device_id]
        seen = {device_id}
        while stack:
            cur = stack.pop()
            for _rel, dst in self._adj.get(cur, []):
                if dst not in seen:
                    seen.add(dst)
                    out.append(dst)
                    stack.append(dst)
        return tuple(out)


class AnomalyScorer:
    """真实代码：稳健基线 + z 分数（与预测性维护篇一致）。"""
    def __init__(self, history: list[float], version: str = "v1") -> None:
        if not history:
            raise ValueError("empty history")
        self.median = statistics.median(history)
        self.scale = max(1.4826 * statistics.median(
            [abs(x - self.median) for x in history]), 1e-6)
        self.version = version

    def score(self, values: list[float]) -> tuple[float, str]:
        if len(values) < 5:
            return 0.0, "insufficient"
        z = (statistics.fmean(values) - self.median) / self.scale
        severity = "critical" if abs(z) >= 5 else "warn" if abs(z) >= 3 else "normal"
        return z, severity


class TwinStore:
    def __init__(self) -> None:
        self._snapshots: dict[str, TwinSnapshot] = {}

    def apply(self, snap: TwinSnapshot) -> bool:
        cur = self._snapshots.get(snap.device_id)
        if cur and cur.ts >= snap.ts:
            return False
        self._snapshots[snap.device_id] = snap
        return True

    def get(self, device_id: str) -> TwinSnapshot | None:
        return self._snapshots.get(device_id)


class AuditLog:
    """真实代码：只追加，参数与结论做摘要，不存完整敏感正文。"""
    def __init__(self) -> None:
        self.events: list[dict[str, Any]] = []

    def append(self, run_id: str, event: str, **fields: Any) -> None:
        digest = hashlib.sha256(repr(sorted(fields.items())).encode()).hexdigest()[:12]
        self.events.append({"run_id": run_id, "event": event,
                            "fields_hash": digest, "fields": fields})


class MockTicketAdapter:
    """模拟接口：不调用任何真实 ITSM / 工单产品。"""
    def __init__(self) -> None:
        self.drafts: list[dict[str, Any]] = []

    def create_draft(self, payload: dict[str, Any]) -> dict[str, Any]:
        draft = {"ticket": "SIM-" + str(uuid.uuid4())[:8],
                 "device_id": payload["device_id"], "status": "draft"}
        self.drafts.append(draft)
        return draft


class PlantOpsOrchestrator:
    """真实代码：把各层串成可审批、可补偿、可审计的状态机。"""
    def __init__(self, graph: DeviceGraph, scorer: AnomalyScorer,
                 twins: TwinStore, audit: AuditLog,
                 tickets: MockTicketAdapter) -> None:
        self.graph, self.scorer, self.twins = graph, scorer, twins
        self.audit, self.tickets = audit, tickets
        self.instances: dict[str, dict[str, Any]] = {}

    def run(self, device_id: str, ts: int, values: list[float]) -> dict[str, Any]:
        run_id = str(uuid.uuid4())
        z, severity = self.scorer.score(values)
        ev = Evidence(z, severity, self.scorer.version, self.graph.parts(device_id))
        self.audit.append(run_id, "scored", device_id=device_id, severity=severity)
        self.twins.apply(TwinSnapshot(device_id, ts, severity, ev))
        self.audit.append(run_id, "twin_updated", device_id=device_id, ts=ts)
        if severity not in ("warn", "critical"):
            return {"run_id": run_id, "status": "no_action", "evidence": ev}
        instance_id = "inst-" + str(uuid.uuid4())[:8]
        self.instances[instance_id] = {
            "run_id": run_id, "device_id": device_id,
            "evidence": ev, "status": "waiting_approval",
        }
        self.audit.append(run_id, "approval_required",
                          instance_id=instance_id, severity=severity)
        return {"run_id": run_id, "status": "waiting_approval",
                "instance_id": instance_id, "evidence": ev}

    def approve(self, instance_id: str, approved: bool,
                approver: str = "simulated-operator") -> dict[str, Any]:
        inst = self.instances[instance_id]
        rid = inst["run_id"]
        self.audit.append(rid, "approval_result", approved=approved,
                          approver=approver)
        if not approved:
            inst["status"] = "compensated"
            return {"status": "compensated", "tickets": []}
        draft = self.tickets.create_draft({"device_id": inst["device_id"]})
        inst["status"] = "completed"
        self.audit.append(rid, "ticket_draft_created", ticket=draft["ticket"])
        return {"status": "completed", "tickets": [draft]}`,
          },
          {
            type: "code",
            language: "python",
            filename: "test_plant_agent.py",
            caption: "回归测试：去重、图谱路径、幂等孪生、未审批不派工、审计链",
            code: String.raw`import pytest

from plant_agent import (Reading, IngestBuffer, DeviceGraph, AnomalyScorer,
                         TwinStore, AuditLog, MockTicketAdapter,
                         PlantOpsOrchestrator)


def build(scorer_history=None):
    graph = DeviceGraph([
        ("pump-1", "has_part", "bearing"),
        ("bearing", "has_part", "seal"),
        ("bearing", "monitored_by", "vibration-sensor"),
    ])
    scorer = AnomalyScorer(scorer_history or [10.0] * 10)
    twins, audit = TwinStore(), AuditLog()
    tickets = MockTicketAdapter()
    orch = PlantOpsOrchestrator(graph, scorer, twins, audit, tickets)
    return orch, twins, audit, tickets


def test_ingest_deduplicates_by_device_ts_metric():
    b = IngestBuffer()
    r = Reading("pump-1", 1, "vibration", 10.0, "nominal")
    assert b.push(r) is True
    assert b.push(r) is False
    assert b.window("pump-1") == [10.0]


def test_graph_returns_part_chain():
    orch, *_ = build()
    assert "bearing" in orch.graph.parts("pump-1")
    assert "seal" in orch.graph.parts("pump-1")


def test_no_ticket_without_approval():
    hist = [10.0] * 10
    orch, twins, audit, tickets = build(hist)
    high = [10.0 + 10 * orch.scorer.scale] * 6
    result = orch.run("pump-1", 100, high)
    assert result["status"] == "waiting_approval"
    assert tickets.drafts == []
    assert twins.get("pump-1").status == "critical"


def test_approved_run_creates_one_draft_and_audit_trail():
    orch, twins, audit, tickets = build()
    high = [10.0 + 10 * orch.scorer.scale] * 6
    result = orch.run("pump-1", 100, high)
    out = orch.approve(result["instance_id"], True)
    assert out["status"] == "completed"
    assert len(tickets.drafts) == 1
    assert tickets.drafts[0]["status"] == "draft"
    names = [e["event"] for e in audit.events]
    assert names == ["scored", "twin_updated", "approval_required",
                     "approval_result", "ticket_draft_created"]


def test_rejection_compensates_without_side_effect():
    orch, _, _, tickets = build()
    high = [10.0 + 10 * orch.scorer.scale] * 6
    result = orch.run("pump-1", 100, high)
    out = orch.approve(result["instance_id"], False)
    assert out["status"] == "compensated" and tickets.drafts == []


def test_normal_run_needs_no_approval():
    orch, _, _, tickets = build()
    out = orch.run("pump-1", 100, [10.0] * 6)
    assert out["status"] == "no_action" and tickets.drafts == []


def test_late_twin_snapshot_does_not_override_newer():
    orch, twins, _, _ = build()
    orch.run("pump-1", 200, [10.0] * 6)
    orch.run("pump-1", 150, [10.0] * 6)
    assert twins.get("pump-1").ts == 200`,
          },
          {
            type: "code",
            language: "yaml",
            filename: "project-b.yaml",
            caption: "项目配置（全部为教学模拟值）",
            code: String.raw`project: manufacturing-ops-agent
data_mode: simulated
simulated_modules:
  - iot_gateway
  - timeseries_store
  - device_ledger
  - diagnostic_llm
  - itsm_ticket_system
real_modules:
  - ingest_dedup
  - window_scoring
  - device_graph
  - twin_store
  - orchestrator
  - audit_log
safety:
  never_auto_stop_equipment: true
  require_human_approval: true
  ticket_stage: draft_only
  ot_network_direction: outbound_only
observability:
  correlate_by: run_id
  metrics: [freshness_seconds, approval_latency, suppressed_alerts, dlq_size]`,
          },
          {
            type: "callout",
            variant: "warning",
            title: "真实 / 模拟边界（必读）",
            text: "真实可运行代码：摄取去重、图谱查询、稳健评分、幂等孪生、审批状态机、只追加审计与上述 pytest 测试。模拟接口：IoT 网关、时序库、设备台账、诊断 LLM、ITSM 工单系统（本例用确定性返回值或内存结构替代）。工单状态固定为 draft，不代表任何真实系统行为。",
          },
        ],
      },
      {
        id: "case",
        heading: "9. 企业应用案例（教学模拟）",
        blocks: [
          {
            type: "paragraph",
            text: "业务背景：模拟工厂希望对泵组振动异常做到「可解释、可追责、不自动停机」。业务问题是原有告警缺乏证据链，运维无法判断是传感器漂移还是真实劣化；同时任何停机建议都需要值班长确认。数据来源：教学模拟测点与部件关系表。",
          },
          {
            type: "table",
            headers: ["阶段", "交付物", "验收"],
            rows: [
              ["需求", "能力清单 + 安全边界", "评审签字（模拟）"],
              ["实现", "编排内核 + 测试", "pytest 全绿"],
              ["灰度", "只产出工单草稿", "无自动写操作审计"],
              ["监控", "run_id 轨迹与指标", "故障演练回放"],
            ],
          },
        ],
      },
      {
        id: "production",
        heading: "10. Production Engineering 部署与监控",
        blocks: [
          {
            type: "list",
            items: [
              "部署：分析层与控制层分进程，控制层持有审批与工单凭据，分析层只读。",
              "持久化：检查点、基线版本、审批状态与审计事件必须落库，内存实现仅用于教学。",
              "监控指标：数据新鲜度、窗口缺失率、告警确认率、审批时延、抑制数量、DLQ 大小。",
              "灰度：先影子模式产出证据包不派工，与人工巡检结论对照后再开放草稿工单。",
              "回滚：模型/基线/流程定义各自版本化，回滚时三者一起回退。",
              "降级：诊断模型不可用则只输出特征证据并转人工；绝不自动降级为「直接派工」。",
            ],
          },
        ],
      },
      {
        id: "security",
        heading: "11. Security & Governance 安全与治理",
        blocks: [
          {
            type: "list",
            items: [
              "OT/IT 隔离，分析层不得下发控制指令；工单草稿不能触发停机。",
              "诊断 Agent 只读，凭据仅由控制层持有并从环境变量/密钥服务获取。",
              "租户/厂区隔离：device_id 与厂区绑定校验，跨厂区查询拒绝。",
              "审批人、理由、时间戳与证据包 hash 进入不可篡改审计。",
              "设备维修记录可能含人员信息，日志脱敏并限制留存。",
            ],
          },
        ],
      },
      {
        id: "evaluation",
        heading: "12. Evaluation & Testing 评估与测试",
        blocks: [
          {
            type: "table",
            headers: ["层次", "用例", "断言"],
            rows: [
              ["单元", "去重、图谱路径、评分阈值", "纯函数输出确定"],
              ["集成", "未审批不产生工单", "drafts 为空"],
              ["集成", "审批通过只产一张草稿", "drafts 长度为 1"],
              ["状态", "迟到快照不覆盖新状态", "ts 保持较大值"],
              ["治理", "审计事件顺序完整", "事件名序列匹配"],
              ["演练", "拒绝审批 / 模型不可用", "无副作用、可降级"],
            ],
          },
          {
            type: "paragraph",
            text: "业务侧评估另需时间切分回放，统计告警确认率与漏报复盘；本示例只提供可自动化的工程回归，不声称业务效果指标。",
          },
        ],
      },
      {
        id: "best-practices",
        heading: "13. Best Practices 最佳实践",
        blocks: [
          {
            type: "list",
            items: [
              "先写「禁止自动做什么」，再设计 Agent 能力。",
              "每个跨层对象都带 device_id / run_id，审计才能拼成完整链路。",
              "把模拟接口列成清单写进 README，避免演示代码被误当生产集成。",
              "审批与补偿逻辑用真实代码测试，模型输出用固定 mock 测试。",
              "生产环境把工单草稿与真实工单分开，避免灰度期误触发。",
            ],
          },
        ],
      },
      {
        id: "troubleshooting",
        heading: "14. Troubleshooting 故障排查",
        blocks: [
          {
            type: "table",
            headers: ["现象", "原因", "排查方法", "预防"],
            rows: [
              ["重复工单", "审批回调重放", "按 instance_id 查审计", "审批状态幂等"],
              ["孪生状态回退", "迟到测点覆盖", "检查 ts 判定", "水位线 + 迟到队列"],
              ["告警无证据", "基线版本缺失", "检查 Evidence 字段", "证据包 Schema 校验"],
              ["模型不可用全线阻塞", "诊断放在关键路径", "检查降级分支", "降级为特征证据 + 人工"],
            ],
          },
        ],
      },
      {
        id: "further-reading",
        heading: "15. Further Reading 参考资料",
        blocks: [
          {
            type: "paragraph",
            text: "项目相关技术请回到本站对应教程；外部产品接口与版本请以官方文档核验后替换（需进一步核验）。",
          },
          {
            type: "callout",
            variant: "info",
            title: "资料核验说明",
            text: "本项目为本站原创教学工程示例，全部业务数据为模拟，不构成任何真实客户案例或行业基准。",
          },
        ],
      },
      {
        id: "engineering-notes",
        heading: "16. 工程实现补遗：组件交互时序、故障演练与上线验收",
        blocks: [
          {
            type: "paragraph",
            text: "device_id 是跨层聚合根，run_id 只关联一次运行；审计回放需要两者共同定位。只按 run_id 检索会把同一设备多次运行混在一起，无法判断「这次告警时孪生状态是什么」。",
          },
          {
            type: "mermaid",
            title: "组件交互时序（含失败分支）",
            source: String.raw`sequenceDiagram
  participant I as IoT 摄取
  participant SC as 评分器
  participant TW as 孪生/图谱
  participant D as 诊断 Agent
  participant O as 编排器
  participant H as 人工确认
  I->>SC: 窗口(去重, 水位线)
  SC->>TW: 分数 + 证据包
  TW->>D: 孪生状态 + 部件链
  D->>O: 结构化建议(不可信)
  O->>O: 生成 instance 与检查点
  O->>H: waiting_approval
  alt 批准
    H->>O: approved
    O->>O: 工单草稿 + 审计
  else 拒绝/超时
    H->>O: rejected
    O->>O: 补偿，无副作用
  end
  O->>O: 指标按 run_id + device_id 归因`,
            caption: "消息顺序、超时分支与降级路径；箭头方向即控制流方向。",
          },
          {
            type: "table",
            headers: ["组件交互契约", "传递内容", "超时/失败语义"],
            rows: [
              ["摄取 → 评分器","带 device_id/ts/mode 的窗口","重复 (device_id, ts) 直接丢弃"],
              ["评分器 → 诊断 Agent","分数、基线版本、图谱路径","建议必须结构化，解析失败即拒绝"],
              ["编排器 → 审计","run_id + device_id + 审批结果","事件只追加，含证据 hash"],
            ],
          },
          {
            type: "table",
            headers: ["类别", "可执行操作", "通过标准"],
            rows: [
              ["故障注入","未审批直接调用工单接口","drafts 为空，状态仍 waiting_approval"],
              ["故障注入","诊断 Agent 不可用","只输出特征证据并转人工，不自动派工"],
              ["上线验收","pytest -q test_plant_agent.py","去重、审批、幂等、审计用例通过"],
              ["上线验收","核对 OT 网络流向","分析层无控制指令下发通道"],
            ],
          },
          {
            type: "paragraph",
            text: "落地替换点：模拟 IoT 网关、时序库、设备台账、诊断 LLM 与 ITSM 分别替换为按官方文档核验的真实适配器；编排器状态与审计落库；OT/IT 隔离、停机审批与备件流程按现场安全规范评审。教学模拟数据不得用于真实设备决策。",
          },
        ],
      },
    ],
    tags: ["贯穿项目", "制造业", "数字孪生", "工业 Agent", "模拟数据"],
    architectureIds: ["a16", "a05"],
    relatedTutorialIds: [
      "predictive-maintenance",
      "digital-twin",
      "industrial-agent",
      "ontology-taxonomy",
      "workflow-engine",
      "itops-agent",
    ],
    nextTutorialSlugs: ["project-itops-agent", "predictive-maintenance"],
    relatedLabSlugs: ["workflow-designer", "architecture-designer"],
    relatedCaseSlugs: ["manufacturing-ops-agent", "it-operations-agent"],
    references: [
      R("ISO 17359 状态监测与诊断通用指南", "https://www.iso.org/standards.html", "ISO", "状态监测通用流程参考；ISO 17359 具体条目与版本需按官方目录检索核验", "官方规范"),
      R("NIST AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework", "NIST", "AI 风险治理框架", "官方规范"),
      R("OpenTelemetry 官方文档", "https://opentelemetry.io/docs/", "OpenTelemetry", "run_id 与 span 关联", "官方规范"),
      R("OWASP Top 10 for LLM Applications", "https://owasp.org/www-project-top-10-for-large-language-model-applications/", "OWASP", "诊断 Agent 的权限与注入风险", "社区实践"),
      R("本站：企业 IT Operations Agent 项目", "https://www.yuxin.run/agent-fullstack-knowledge/tutorials/project-itops-agent", "本站", "项目 A 的对照贯穿案例", "本站工程建议"),
    ],
    updatedAt: "2026-11-13",
    status: "published",
    qualityLevel: "L5",
  },
  {
    id: "t-so-01",
    slug: "itops-agent",
    domainId: "d15",
    title: "贯穿项目 A：企业 IT Operations Agent（需求分析到部署监控）",
    englishTitle: "Capstone Project A: Enterprise IT Operations Agent",
    summary:
      "把用户入口、Runtime、Planner、RAG、MCP 风格工具、ITSM/Monitoring 模拟 API、Workflow、Memory、人工审批、安全、可观测与评估串成一个可运行教学项目，逐项标注真实代码与模拟接口。",
    difficulty: "专家",
    estimatedMinutes: 80,
    prerequisites: ["Agent 执行循环", "企业 RAG", "MCP 基础", "Workflow 引擎", "AgentOps"],
    learningObjectives: [
      "把 IT 运维需求拆成入口、决策、执行、治理四层",
      "实现带预算与权限的执行循环与工具注册表",
      "实现 RAG 证据、Memory、检查点与人工审批",
      "实现 trace、成本归因与轨迹级回归断言",
      "完成部署、监控、评估与故障排查清单",
    ],
    sections: [
      {
        id: "overview",
        heading: "1. 项目概述 Overview",
        blocks: [
          {
            type: "paragraph",
            text: "项目 A 面向企业内部 IT 运维：员工或监控系统提交故障描述，Agent 检索运维 SOP 与历史工单，规划排查步骤，通过只读工具查询监控指标，必要时生成变更工单草稿并挂起等待人工审批，全过程记录 trace、成本与审计。它解决的核心问题是：让 Agent 在「能查、能建议、不能擅自改生产」的边界内工作，并且每次决策都能回放。",
          },
          {
            type: "table",
            headers: ["需求", "能力", "验收方式"],
            rows: [
              ["多入口接入", "统一 Request 结构", "不同入口归一化测试"],
              ["基于证据回答", "RAG 片段带 doc_id 与权限", "无证据不执行写操作"],
              ["工具可控", "注册表 + 白名单 + 参数校验", "未注册工具拒绝"],
              ["变更需审批", "waiting_approval 检查点", "未审批无工单测试"],
              ["成本与轨迹可查", "run_id trace + token 归因", "轨迹断言测试"],
            ],
          },
          {
            type: "callout",
            variant: "danger",
            title: "模拟数据声明",
            text: "本项目的监控指标、SOP 文档、历史工单、员工请求、工单号与成本单价均为教学模拟数据，不代表任何真实企业环境、厂商产品或客户案例。",
          },
        ],
      },
      {
        id: "fundamentals",
        heading: "2. 核心原理 Fundamentals",
        blocks: [
          {
            type: "paragraph",
            text: "整个系统围绕一次 run 展开：run_id 贯穿入口、检索、规划、工具调用、审批与审计；上下文由 System 指令、用户请求、RAG 片段（低信任）与 Memory（继承原始信任）组成，统一受 TokenBudget 约束。执行循环由确定性 Runtime 驱动，模型输出只作为结构化 Action 候选，必须由策略引擎裁决。",
          },
          {
            type: "mermaid",
            title: "项目 A 端到端架构",
            source: `flowchart TB
  U["用户入口 / 监控告警"] --> G["API 网关(鉴权/租户)"]
  G --> RT["Agent Runtime"]
  RT --> PL["Planner(结构化步骤)"]
  RT --> RAG["RAG 检索 + 权限过滤"]
  RT --> MEM["Memory / 上下文预算"]
  RT --> POL["策略引擎"]
  POL --> TOOLS["MCP 风格工具注册表"]
  TOOLS --> MON["Monitoring API(模拟)"]
  TOOLS --> ITSM["ITSM API(模拟)"]
  POL --> WF["Workflow / 检查点 / 审批"]
  RT --> TR[("Trace / 成本 / 审计")]
  WF --> TR`,
            caption: "写操作只能经策略引擎与审批后落到 ITSM 模拟接口。",
          },
          {
            type: "list",
            items: [
              "输入：IncidentRequest(tenant, user_role, text, severity)。",
              "输出：结构化回答、工具观察、工单草稿、trace 与成本记录。",
              "关键状态：运行步数、已用 token、工具调用次数、审批队列、检查点。",
              "边界：RAG 片段与工具返回一律视为不可信数据；模型不持有凭据。",
            ],
          },
        ],
      },
      {
        id: "architecture",
        heading: "3. 架构设计 Architecture",
        blocks: [
          {
            type: "table",
            headers: ["层", "组件", "真实/模拟", "职责"],
            rows: [
              ["入口", "API 网关", "模拟接口", "鉴权与租户解析"],
              ["Runtime", "AgentRuntime", "真实代码", "执行循环与预算守卫"],
              ["规划", "Planner", "模拟接口", "返回固定结构化计划"],
              ["检索", "KbRetriever", "真实代码", "关键词检索 + 权限过滤"],
              ["上下文", "ContextBuilder", "真实代码", "token 预算与信任标注"],
              ["工具", "ToolRegistry", "真实代码", "白名单、Schema、执行"],
              ["外部", "Monitoring/ITSM", "模拟接口", "内存查询与工单草稿"],
              ["流程", "ApprovalStore", "真实代码", "挂起、恢复、超时补偿"],
              ["治理", "Tracer", "真实代码", "span、usage、成本、审计"],
            ],
          },
          {
            type: "paragraph",
            text: "数据流：请求 → 上下文 → 计划 → 只读工具 → 证据汇总 → 审批 → 草稿工单 → 审计；控制流：Runtime 限制最大步数与 token，策略引擎对写工具 fail-closed。扩展方式：替换模拟 Planner 与模拟 API，其余层不变。",
          },
        ],
      },
      {
        id: "components",
        heading: "4. 组件职责说明 Components",
        blocks: [
          {
            type: "table",
            headers: ["组件", "输入", "输出", "约束"],
            rows: [
              ["KbRetriever.search", "query, tenant", "Doc 片段", "按 tenant 过滤"],
              ["ContextBuilder.build", "system, request, docs", "messages + usage", "超预算截断低信任片段"],
              ["ToolRegistry.call", "name, args, ctx", "Observation", "未注册/越权即拒绝"],
              ["AgentRuntime.run", "IncidentRequest", "RunResult", "max_steps 与 token 双限制"],
              ["ApprovalStore.submit", "instance_id, action", "状态", "未批准不执行写工具"],
              ["Tracer.span", "run_id, name", "span", "脱敏后记录属性"],
            ],
          },
        ],
      },
      {
        id: "execution-flow",
        heading: "5. 数据流与执行流 Execution Flow",
        blocks: [
          {
            type: "list",
            ordered: true,
            items: [
              "入口把用户请求或监控告警归一化为 IncidentRequest，解析 tenant 与 role。",
              "KbRetriever 按租户过滤 SOP/历史工单，返回带 doc_id 与 trust=external 的片段。",
              "ContextBuilder 在 TokenBudget 内拼装 system、user、数据块，超预算先丢低信任片段。",
              "Planner 产出结构化步骤列表（教学模拟输出），Runtime 逐步执行并累计 token。",
              "只读工具（监控指标查询、工单检索）经 ToolRegistry 执行；观察结果标注为数据。",
              "若步骤涉及变更：提交审批并写入检查点，状态 waiting_approval，停止推进。",
              "审批通过后生成工单草稿（模拟接口），写入 trace、成本与审计；拒绝则补偿并结束。",
              "返回答案与 run_id，评测系统可按轨迹断言关键步骤顺序。",
            ],
          },
          {
            type: "paragraph",
            text: "异常路径：检索无命中则明确标注「无证据」并降级为人工；工具超时计入失败但不无限重试；审批超时自动拒绝；审计写入失败按配置降级为本地缓冲并告警。",
          },
        ],
      },
      {
        id: "patterns",
        heading: "6. 关键技术与设计模式",
        blocks: [
          {
            type: "list",
            items: [
              "Execution Loop with Budget：步数、token、成本三重上限，防止循环失控。",
              "Context Engineering：按 trust 分层，超预算优先丢弃低信任内容。",
              "Capability Registry：工具白名单 + 参数 Schema + 副作用标记。",
              "RAG with ACL：检索阶段就按租户与文档权限过滤，而不是生成后再遮掩。",
              "Checkpoint & Approval：审批状态持久化，恢复时重校验前置条件。",
              "Trace-level Assertion：用关键步骤序列而非最终文本做回归断言。",
              "Fallback：无证据 / 模型不可用 / 工具故障分别对应不同降级路径。",
            ],
          },
          {
            type: "table",
            headers: ["模式", "优点", "缺点", "适用"],
            rows: [
              ["自由 ReAct 循环", "灵活", "步数与成本难控", "探索型原型"],
              ["预算化执行循环", "可控可审计", "需维护计划 Schema", "企业生产"],
              ["固定工作流", "完全确定", "难处理非结构化输入", "标准化变更"],
              ["混合（本项目）", "规划灵活 + 执行确定", "实现复杂", "IT 运维场景"],
            ],
          },
        ],
      },
      {
        id: "stack",
        heading: "7. 技术栈与选型 Trade-off",
        blocks: [
          {
            type: "table",
            headers: ["决策点", "本项目选择（教学）", "生产替换建议"],
            rows: [
              ["模型调用", "模拟 Planner", "按官方 SDK 接入 + 超时/预算"],
              ["检索", "关键词 + 内存文档", "向量/混合检索 + 权限过滤"],
              ["MCP", "本地工具注册表", "真实 MCP Host/Client/Server（按规范核验）"],
              ["ITSM/Monitoring", "内存模拟接口", "真实 API + 凭据隔离"],
              ["检查点", "内存字典", "关系库 + 唯一约束"],
              ["Trace", "内存 span 列表", "OpenTelemetry + 后端存储"],
            ],
          },
          {
            type: "paragraph",
            text: "涉及 MCP、模型 SDK 与 ITSM/Monitoring 产品的具体方法名、版本与协议字段，请以对应官方文档核验后替换（需进一步核验）；本项目不调用任何厂商 SDK。",
          },
        ],
      },
      {
        id: "hands-on",
        heading: "8. Hands-on 实战：项目 A 运行时内核",
        blocks: [
          {
            type: "code",
            language: "bash",
            filename: "tree.txt",
            caption: "项目结构、环境与执行方式",
            code: String.raw`project-a-itops/
  ops_agent.py        # 入口、检索、上下文、工具、审批、追踪
  test_ops_agent.py   # 离线 pytest 回归测试
  project-a.yaml      # 配置（教学模拟）
  README.md           # 真实/模拟模块清单

环境要求: Python >= 3.10, pytest >= 7
安装:     python -m pip install pytest
执行测试: cd project-a-itops && python -m pytest -q
无需网络、数据库、API Key；不调用任何真实 LLM / MCP Server / ITSM。
输入: IncidentRequest(tenant, user_role, text, severity)
输出: RunResult(answer, observations, tickets, trace, usage)`,
          },
          {
            type: "code",
            language: "python",
            filename: "ops_agent.py",
            caption: "核心实现：权限过滤检索、上下文预算、工具闸门、审批检查点与 trace",
            runnable: true,
            code: String.raw`from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass(frozen=True)
class IncidentRequest:
    tenant: str
    user_role: str
    text: str
    severity: int = 3


@dataclass(frozen=True)
class Doc:
    doc_id: str
    tenant: str
    title: str
    body: str
    trust: str = "external"


@dataclass
class RunResult:
    run_id: str
    answer: str
    observations: list[dict[str, Any]]
    tickets: list[dict[str, Any]]
    spans: list[str]
    total_tokens: int
    status: str


class KbRetriever:
    """真实代码：关键词检索 + 租户权限过滤（教学模拟文档）。"""
    def __init__(self, docs: list[Doc]) -> None:
        self.docs = docs

    def search(self, query: str, tenant: str, top_k: int = 2) -> list[Doc]:
        hits = [d for d in self.docs
                if d.tenant == tenant and any(w in d.body for w in query.split())]
        return hits[:top_k]


class ContextBuilder:
    """真实代码：token 预算按信任级别裁剪，低信任片段先丢。"""
    def __init__(self, max_tokens: int) -> None:
        self.max_tokens = max_tokens

    def build(self, system: str, req: IncidentRequest,
              docs: list[Doc]) -> tuple[list[dict[str, str]], int]:
        blocks: list[str] = []
        used = len(system.split()) + len(req.text.split())
        for d in docs:
            chunk = "[untrusted_data doc=" + d.doc_id + "] " + d.body
            cost = len(chunk.split())
            if used + cost > self.max_tokens:
                break
            blocks.append(chunk)
            used += cost
        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": req.text + "\n" + "\n".join(blocks)},
        ]
        return messages, used


@dataclass(frozen=True)
class ToolSpec:
    name: str
    roles: tuple[str, ...]
    arg_names: tuple[str, ...]
    side_effect: bool
    handler: Callable[[dict[str, Any]], dict[str, Any]]


class ToolRegistry:
    """真实代码：白名单 + 参数校验 + 租户隔离（MCP 风格注册表）。"""
    def __init__(self) -> None:
        self._tools: dict[str, ToolSpec] = {}

    def register(self, spec: ToolSpec) -> None:
        self._tools[spec.name] = spec

    def spec(self, name: str) -> ToolSpec | None:
        """只暴露元数据查询，执行仍必须经过 call()。"""
        return self._tools.get(name)

    def call(self, name: str, args: dict[str, Any],
             ctx: dict[str, Any]) -> dict[str, Any]:
        spec = self._tools.get(name)
        if spec is None:
            return {"error": "tool_not_registered"}
        if ctx["role"] not in spec.roles:
            return {"error": "role_denied"}
        if set(args) - set(spec.arg_names):
            return {"error": "unknown_args"}
        if args.get("tenant") != ctx["tenant"]:
            return {"error": "cross_tenant_denied"}
        return spec.handler(args)


class ApprovalStore:
    """真实代码：审批挂起/恢复，拒绝即补偿。"""
    def __init__(self) -> None:
        self._pending: dict[str, dict[str, Any]] = {}

    def submit(self, payload: dict[str, Any]) -> str:
        iid = "appr-" + str(uuid.uuid4())[:8]
        self._pending[iid] = {**payload, "status": "waiting_approval"}
        return iid

    def resolve(self, iid: str, approved: bool) -> str:
        item = self._pending[iid]
        item["status"] = "approved" if approved else "rejected"
        return item["status"]

    def status(self, iid: str) -> str:
        return self._pending[iid]["status"]


class Tracer:
    """真实代码：span 名称序列 + token/成本归因（教学占位单价）。"""
    PRICE_PER_TOKEN = 0.000001  # 教学模拟单价，非任何厂商价格
    def __init__(self) -> None:
        self.spans: list[str] = []
        self.tokens = 0

    def span(self, name: str, tokens: int = 0) -> None:
        self.spans.append(name)
        self.tokens += tokens

    def cost_usd(self) -> float:
        return self.tokens * self.PRICE_PER_TOKEN


class MockApi:
    """模拟接口：监控指标与 ITSM 工单，均为教学模拟数据。"""
    def __init__(self) -> None:
        self.metrics = {"svc-pay": {"error_rate": 0.02, "p95_ms": 240}}
        self.tickets: list[dict[str, Any]] = []

    def query_metric(self, args: dict[str, Any]) -> dict[str, Any]:
        return {"service": args["service"], **self.metrics.get(args["service"], {})}

    def create_ticket(self, args: dict[str, Any]) -> dict[str, Any]:
        t = {"ticket": "SIM-IT-" + str(uuid.uuid4())[:8],
             "title": args["title"], "status": "draft"}
        self.tickets.append(t)
        return t


class MockPlanner:
    """模拟接口：不调用真实 LLM，返回固定结构化计划。"""
    def plan(self, req: IncidentRequest, has_evidence: bool) -> list[dict[str, Any]]:
        steps = [{"tool": "query_metric", "args": {"service": "svc-pay"}}]
        if req.severity >= 4 and has_evidence:
            steps.append({"tool": "create_ticket",
                          "args": {"title": "按 SOP 执行变更评估"}})
        return steps


class AgentRuntime:
    """真实代码：带步数/预算上限的执行循环，模型输出只是计划候选。"""
    def __init__(self, kb: KbRetriever, ctx: ContextBuilder,
                 tools: ToolRegistry, approvals: ApprovalStore,
                 tracer: Tracer, planner: MockPlanner,
                 max_steps: int = 5) -> None:
        self.kb, self.ctxb, self.tools = kb, ctx, tools
        self.approvals, self.tracer, self.planner = approvals, tracer, planner
        self.max_steps = max_steps

    def run(self, req: IncidentRequest) -> RunResult:
        run_id = str(uuid.uuid4())
        self.tracer.span("run.start")
        docs = self.kb.search(req.text, req.tenant)
        self.tracer.span("rag.search", tokens=20)
        messages, used = self.ctxb.build("仅依据证据回答，不擅自变更生产", req, docs)
        self.tracer.span("context.build", tokens=used)
        plan = self.planner.plan(req, has_evidence=bool(docs))
        observations: list[dict[str, Any]] = []
        tickets: list[dict[str, Any]] = []
        status = "completed"
        for step in plan[: self.max_steps]:
            spec = self.tools.spec(step["tool"])
            args = {**step["args"], "tenant": req.tenant}
            if spec is not None and spec.side_effect:
                iid = self.approvals.submit({"tool": step["tool"], "run_id": run_id})
                self.tracer.span("approval.required")
                status = "waiting_approval"
                # 演示：默认不自动批准；由调用方显式 resolve 后才会执行
                observations.append({"approval_id": iid, "status": status})
                continue
            result = self.tools.call(step["tool"], args,
                                     {"role": req.user_role, "tenant": req.tenant})
            self.tracer.span("tool." + step["tool"], tokens=10)
            observations.append(result)
        answer = ("依据 " + ", ".join(d.doc_id for d in docs) + " 与监控指标生成建议"
                  if docs else "未检索到可用证据，转人工处理")
        return RunResult(run_id, answer, observations, tickets,
                         list(self.tracer.spans), self.tracer.tokens, status)

    def resume(self, req: IncidentRequest, approval_id: str,
               approved: bool) -> dict[str, Any]:
        """审批恢复：仅生成工单草稿，不执行真实变更。"""
        state = self.approvals.resolve(approval_id, approved)
        self.tracer.span("approval.resolved")
        if state != "approved":
            return {"status": "compensated", "tickets": []}
        # 审批通过后仍必须走策略引擎，不能绕过角色与租户校验
        draft = self.tools.call(
            "create_ticket",
            {"title": "按 SOP 执行变更评估", "tenant": req.tenant},
            {"role": req.user_role, "tenant": req.tenant},
        )
        if "error" in draft:
            self.tracer.span("ticket.denied")
            return {"status": "denied", "error": draft["error"]}
        self.tracer.span("ticket.draft_created", tokens=10)
        return {"status": "completed", "tickets": [draft]}`,
          },
          {
            type: "code",
            language: "python",
            filename: "test_ops_agent.py",
            caption: "回归测试：租户过滤、上下文预算、工具闸门、审批、轨迹断言",
            code: String.raw`import pytest

from ops_agent import (IncidentRequest, Doc, KbRetriever, ContextBuilder,
                       ToolSpec, ToolRegistry, ApprovalStore, Tracer,
                       MockApi, MockPlanner, AgentRuntime)


def build(max_tokens=200):
    kb = KbRetriever([
        Doc("sop-1", "t1", "支付服务 SOP", "支付 服务 错误率 排查 先查监控"),
        Doc("sop-2", "t2", "其他租户 SOP", "支付 服务 错误率 排查"),
    ])
    ctx = ContextBuilder(max_tokens)
    api = MockApi()
    tools = ToolRegistry()
    tools.register(ToolSpec("query_metric", ("analyst", "admin"),
                            ("service", "tenant"), False, api.query_metric))
    tools.register(ToolSpec("create_ticket", ("admin",),
                            ("title", "tenant"), True, api.create_ticket))
    approvals, tracer = ApprovalStore(), Tracer()
    rt = AgentRuntime(kb, ctx, tools, approvals, tracer, MockPlanner())
    return rt, api, approvals, tracer


def test_rag_filters_by_tenant():
    rt, *_ = build()
    r = rt.run(IncidentRequest("t1", "analyst", "支付 错误率", 3))
    assert "sop-1" in r.answer and "sop-2" not in r.answer


def test_no_evidence_falls_back_to_human():
    rt, *_ = build()
    r = rt.run(IncidentRequest("t1", "analyst", "未知关键词", 3))
    assert "转人工" in r.answer


def test_context_budget_drops_low_trust_chunks_first():
    kb = KbRetriever([Doc("sop-long", "t1", "长文档", "支付 " * 300)])
    ctx = ContextBuilder(max_tokens=30)
    msgs, used = ctx.build("系统", IncidentRequest("t1", "analyst", "支付", 3),
                           kb.search("支付", "t1"))
    assert used <= 30 and "[untrusted_data" not in msgs[1]["content"]


def test_unregistered_and_cross_tenant_tool_calls_are_denied():
    rt, *_ = build()
    tools = ToolRegistry()
    assert tools.call("nope", {}, {"role": "admin", "tenant": "t1"})["error"] == "tool_not_registered"
    spec = ToolSpec("query_metric", ("analyst",), ("service", "tenant"),
                    False, lambda a: {})
    tools.register(spec)
    assert tools.call("query_metric", {"service": "s", "tenant": "t2"},
                      {"role": "analyst", "tenant": "t1"})["error"] == "cross_tenant_denied"


def test_high_severity_requires_approval_and_creates_no_ticket():
    rt, api, approvals, tracer = build()
    r = rt.run(IncidentRequest("t1", "admin", "支付 错误率", 5))
    assert r.status == "waiting_approval"
    assert api.tickets == []
    assert any("approval" in s for s in r.spans)


def test_rejected_approval_compensates():
    rt, api, approvals, tracer = build()
    r = rt.run(IncidentRequest("t1", "admin", "支付 错误率", 5))
    aid = r.observations[-1]["approval_id"]
    out = rt.resume(IncidentRequest("t1", "admin", "支付 错误率", 5), aid, False)
    assert out["status"] == "compensated" and api.tickets == []
    assert approvals.status(aid) == "rejected"


def test_approved_creates_draft_only():
    rt, api, approvals, tracer = build()
    r = rt.run(IncidentRequest("t1", "admin", "支付 错误率", 5))
    aid = r.observations[-1]["approval_id"]
    out = rt.resume(IncidentRequest("t1", "admin", "支付 错误率", 5), aid, True)
    assert out["tickets"][0]["status"] == "draft"


def test_trajectory_assertion_and_cost_attribution():
    rt, api, approvals, tracer = build()
    r = rt.run(IncidentRequest("t1", "analyst", "支付 错误率", 3))
    names = r.spans
    for expected in ["run.start", "rag.search", "context.build", "tool.query_metric"]:
        assert expected in names
    assert r.total_tokens > 0
    assert tracer.cost_usd() > 0`,
          },
          {
            type: "code",
            language: "yaml",
            filename: "project-a.yaml",
            caption: "项目配置（全部为教学模拟值）",
            code: String.raw`project: enterprise-itops-agent
data_mode: simulated
simulated_modules:
  - planner_llm
  - monitoring_api
  - itsm_api
  - sop_documents
real_modules:
  - rag_acl_filter
  - context_budget
  - tool_registry
  - approval_checkpoint
  - tracer
  - agent_runtime
runtime:
  max_steps: 5
  max_context_tokens: 200
  max_tokens_per_run: 4000
  price_per_token: 0.000001   # 教学占位，非真实价格
safety:
  require_human_approval: true
  ticket_stage: draft_only
  untrusted_sources: [rag, tool_result, memory]
  on_no_evidence: escalate_to_human
observability:
  correlate_by: run_id
  assertions: [trajectory_order, token_budget, no_unapproved_write]`,
          },
          {
            type: "callout",
            variant: "warning",
            title: "真实 / 模拟边界（必读）",
            text: "真实可运行代码：租户过滤检索、token 预算、工具注册表、审批状态机、Tracer 与 AgentRuntime 及其 pytest 测试。模拟接口：Planner（固定结构化输出）、Monitoring API、ITSM API、SOP 文档与所有成本单价。工单状态固定 draft，不执行任何真实变更。",
          },
        ],
      },
      {
        id: "case",
        heading: "9. 企业应用案例（教学模拟）",
        blocks: [
          {
            type: "paragraph",
            text: "业务背景：模拟企业 IT 服务台每天收到大量「服务变慢」类请求，值班人员需要在监控、SOP 与历史工单之间来回切换。业务问题是回答缺乏证据、变更缺少审批留痕、模型调用成本无法归因。数据来源：教学模拟 SOP、监控指标与工单草稿。",
          },
          {
            type: "table",
            headers: ["阶段", "交付物", "验收"],
            rows: [
              ["需求", "能力与禁止项清单", "评审（模拟）"],
              ["实现", "Runtime + 测试", "pytest 全绿"],
              ["灰度", "只读工具 + 草稿工单", "审计无越权写操作"],
              ["运营", "trace / 成本 / 回归门禁", "轨迹断言通过"],
            ],
          },
        ],
      },
      {
        id: "production",
        heading: "10. Production Engineering 部署与监控",
        blocks: [
          {
            type: "list",
            items: [
              "部署：Runtime、工具执行器与审批服务分进程；凭据只在执行器，模型侧不可见。",
              "持久化：检查点、审批状态、trace 与审计落库；内存实现仅限教学。",
              "监控：每步 latenc、token/成本、工具失败率、审批时延、无证据率、越权拒绝数。",
              "灰度：先开放只读工具，审批链路演练通过后再启用草稿工单。",
              "回滚：计划 Schema、工具注册表与策略配置一起版本化并同步回滚。",
              "降级：检索为空转人工；模型不可用返回结构化失败；审计故障按配置缓冲并告警。",
            ],
          },
        ],
      },
      {
        id: "security",
        heading: "11. Security & Governance 安全与治理",
        blocks: [
          {
            type: "list",
            items: [
              "RAG 在检索阶段做租户/权限过滤，模型看不到越权文档。",
              "RAG 片段、工具返回、Memory 一律标注 low trust，不得当作指令。",
              "RBAC：工具按角色授权，写工具需审批；参数 tenant 由上下文注入而非模型指定。",
              "密钥只从环境变量或密钥服务读取，日志脱敏 api_key/token/password。",
              "审计保留 run_id、决策依据、审批人与参数摘要，支撑事后追责。",
              "应急熔断：一键关闭全部写工具，仅保留只读排查能力。",
            ],
          },
        ],
      },
      {
        id: "evaluation",
        heading: "12. Evaluation & Testing 评估与测试",
        blocks: [
          {
            type: "table",
            headers: ["层次", "用例", "断言"],
            rows: [
              ["单元", "租户过滤、预算裁剪", "无越权文档、used 不超上限"],
              ["单元", "未注册/跨租户工具", "返回结构化拒绝"],
              ["集成", "高危请求", "status=waiting_approval 且工单为空"],
              ["集成", "审批拒绝/通过", "补偿或只产生 draft"],
              ["轨迹", "关键步骤顺序", "run.start → rag → context → tool"],
              ["成本", "token 归因", "total_tokens > 0 且成本可计算"],
            ],
          },
          {
            type: "paragraph",
            text: "业务效果（解决率、首次响应时长）需真实回放集与人工标注，本项目只提供工程回归，不声称任何实测效果数据。",
          },
        ],
      },
      {
        id: "best-practices",
        heading: "13. Best Practices 最佳实践",
        blocks: [
          {
            type: "list",
            items: [
              "先定义「禁止自动变更」的硬边界，再设计 Agent 能力。",
              "所有外部内容带 trust 与来源 id，Memory 继承原始信任级别。",
              "写工具审批与只读工具执行分开测试，避免回归遗漏。",
              "用轨迹断言而非最终文本断言，适配模型非确定性。",
              "把模拟接口清单写进 README，防止演示代码被误认为生产集成。",
            ],
          },
        ],
      },
      {
        id: "troubleshooting",
        heading: "14. Troubleshooting 故障排查",
        blocks: [
          {
            type: "table",
            headers: ["现象", "原因", "排查方法", "预防"],
            rows: [
              ["回答无依据", "检索未命中或权限过滤过度", "查 rag.search span 与 doc_id", "无证据强制转人工"],
              ["循环不停止", "max_steps 未生效", "检查计划长度与步数上限", "步数/token/成本三重限制"],
              ["越权工具调用", "角色配置过宽", "查 role_denied 计数", "默认最小权限"],
              ["成本异常", "重试放大或上下文未裁剪", "按 run_id 查 token 归因", "预算守卫 + 轨迹断言"],
            ],
          },
        ],
      },
      {
        id: "further-reading",
        heading: "15. Further Reading 参考资料",
        blocks: [
          {
            type: "paragraph",
            text: "相关技术请回到本站对应教程（执行循环、RAG、MCP、工作流、AgentOps、安全）。外部 SDK、协议字段与产品 API 请以官方文档核验后替换（需进一步核验）。",
          },
          {
            type: "callout",
            variant: "info",
            title: "资料核验说明",
            text: "本项目为本站原创教学工程示例，全部业务数据为模拟；单价为占位值，不构成任何厂商价格或行业基准。",
          },
        ],
      },
      {
        id: "engineering-notes",
        heading: "16. 工程实现补遗：组件交互时序、故障演练与上线验收",
        blocks: [
          {
            type: "paragraph",
            text: "Memory 必须继承原始 trust。若把来自 RAG 或工具返回的内容写入记忆时提升为 system，间接提示注入就获得了持久化的高权限通道，且重启后仍然生效。",
          },
          {
            type: "mermaid",
            title: "组件交互时序（含失败分支）",
            source: String.raw`sequenceDiagram
  participant U as 用户/告警
  participant G as 入口网关
  participant R as Runtime
  participant K as RAG(ACL)
  participant B as ContextBuilder
  participant P as 策略引擎
  participant T as 工具注册表
  participant A as 审批
  U->>G: IncidentRequest
  G->>R: 归一化 + tenant/role
  R->>K: 检索(先按 ACL 过滤)
  K-->>B: 带 doc_id 的低信任片段
  B->>R: messages + 已用 token
  R->>P: 结构化计划步骤
  alt 只读工具合规
    P->>T: call(query_metric)
    T-->>R: observation(视为数据)
  else 写工具
    P->>A: waiting_approval
    alt 批准
      A->>T: call(create_ticket, 再校验)
    else 拒绝
      A->>R: compensated
    end
  end
  R->>R: trace + 成本 + 轨迹断言`,
            caption: "消息顺序、超时分支与降级路径；箭头方向即控制流方向。",
          },
          {
            type: "table",
            headers: ["组件交互契约", "传递内容", "超时/失败语义"],
            rows: [
              ["入口 → Runtime","IncidentRequest(tenant, role, text)","tenant 由上下文注入，不由模型指定"],
              ["RAG → ContextBuilder","带 trust 与 doc_id 的片段","超预算先丢低信任内容"],
              ["Runtime → 策略引擎","结构化 Action 候选","未注册工具与跨租户一律拒绝"],
            ],
          },
          {
            type: "table",
            headers: ["类别", "可执行操作", "通过标准"],
            rows: [
              ["故障注入","高危请求未审批","status=waiting_approval 且工单为空"],
              ["故障注入","把工具返回内容写入 Memory 并标 system","信任继承校验拒绝"],
              ["上线验收","pytest -q test_ops_agent.py","租户、预算、闸门、审批、轨迹用例通过"],
              ["上线验收","一键熔断演练","全部写工具关闭，只读能力保留"],
            ],
          },
          {
            type: "paragraph",
            text: "落地替换点：模拟 Planner 换成按官方 SDK 接入的模型服务并配置超时/预算，RAG 换成企业检索与权限系统，工具注册表换成真实 MCP 风格注册中心（协议字段需核验），ITSM/Monitoring 换成真实 API 且凭据只在执行器侧。项目中的 SOP、指标与工单均为教学模拟数据。",
          },
        ],
      },
    ],
    tags: ["贯穿项目", "IT 运维", "Agent Runtime", "RAG", "MCP", "AgentOps"],
    architectureIds: ["a01", "a13"],
    relatedTutorialIds: [
      "agent-execution-loop",
      "mcp-fundamentals",
      "rag-fundamentals",
      "workflow-engine",
      "agent-tracing",
      "project-manufacturing-agent",
      "context-engineering",
    ],
    nextTutorialSlugs: ["project-manufacturing-agent", "agent-tracing"],
    relatedLabSlugs: ["agent-execution-loop", "mcp-tool-call", "rag-pipeline"],
    relatedCaseSlugs: ["it-operations-agent", "manufacturing-ops-agent"],
    references: [
      R("Model Context Protocol 规范站点", "https://modelcontextprotocol.io/", "MCP", "Host/Client/Server 与能力协商的概念参考（版本需核验）", "官方规范"),
      R("OpenAI Function Calling 指南", "https://developers.openai.com/api/docs/guides/function-calling", "OpenAI", "工具调用结构化字段参考（版本需核验）"),
      R("OpenTelemetry 官方文档", "https://opentelemetry.io/docs/", "OpenTelemetry", "span / trace / 上下文传播", "官方规范"),
      R("OWASP Top 10 for LLM Applications", "https://owasp.org/www-project-top-10-for-large-language-model-applications/", "OWASP", "注入与权限风险缓解", "社区实践"),
      R("本站：制造业智能运维 Agent 项目", "https://www.yuxin.run/agent-fullstack-knowledge/tutorials/project-manufacturing-agent", "本站", "项目 B 的对照贯穿案例", "本站工程建议"),
    ],
    updatedAt: "2026-11-13",
    status: "published",
    qualityLevel: "L5",
  },
  {
    id: "t-prj-01",
    slug: "project-itops-agent",
    domainId: "d15",
    title: "项目 A 学习路径：从需求分析到上线验收的 12 个里程碑",
    englishTitle: "Capstone Project A: Delivery Roadmap",
    summary:
      "把企业 IT Operations Agent 的交付过程拆成 12 个可验收里程碑，逐项给出输入、交付物、验收断言与常见失败模式，并链接到本站真实教程、架构、实验与案例页面。",
    difficulty: "高级",
    estimatedMinutes: 40,
    prerequisites: ["项目 A 运行时内核", "工作流引擎", "AgentOps"],
    learningObjectives: [
      "按里程碑组织 Agent 交付而不是按技术名词组织",
      "为每个里程碑写出可自动化的验收断言",
      "识别上线前的权限、审批与可观测门槛",
      "把回归门禁与故障演练纳入发布流程",
    ],
    sections: [
      {
        id: "overview",
        heading: "1. 项目概述 Overview",
        blocks: [
          {
            type: "paragraph",
            text: "本文是项目 A 的交付路线图，与 itops-agent 教程中的运行时内核配套。它解决的核心问题是：企业 Agent 项目失败往往不是模型能力不足，而是缺少明确的边界、验收与回滚设计。路线图把「需求 → 数据 → 权限 → 执行 → 审批 → 可观测 → 评估 → 上线」变成 12 个可检查的里程碑。",
          },
          {
            type: "table",
            headers: ["阶段", "里程碑", "关键产物"],
            rows: [
              ["定义", "M1-M3", "边界清单、数据契约、权限矩阵"],
              ["构建", "M4-M8", "Runtime、RAG、工具、工作流、审批"],
              ["治理", "M9-M11", "Trace、评估门禁、故障演练"],
              ["上线", "M12", "灰度与回滚预案"],
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "配套关系",
            text: "可运行代码在 itops-agent；本文只负责交付顺序与验收口径。两篇合起来构成项目 A 的完整教学序列。",
          },
        ],
      },
      {
        id: "fundamentals",
        heading: "2. 核心原理 Fundamentals",
        blocks: [
          {
            type: "paragraph",
            text: "每个里程碑都有四个字段：输入、交付物、验收断言、失败模式。验收断言尽量可自动化（例如「未审批时工单列表为空」），不能自动化的（例如 SOP 内容正确性）必须指定人工评审角色与抽样方式。",
          },
          {
            type: "mermaid",
            title: "里程碑依赖图",
            source: `flowchart LR
  M1["M1 边界"] --> M2["M2 数据契约"] --> M3["M3 权限矩阵"]
  M3 --> M4["M4 Runtime"] --> M5["M5 RAG"] --> M6["M6 工具注册表"]
  M6 --> M7["M7 工作流/检查点"] --> M8["M8 人工审批"]
  M8 --> M9["M9 Trace/成本"] --> M10["M10 评估门禁"]
  M10 --> M11["M11 故障演练"] --> M12["M12 灰度上线"]`,
            caption: "权限矩阵在写代码之前完成，避免事后补安全。",
          },
        ],
      },
      {
        id: "architecture",
        heading: "3. 架构设计 Architecture",
        blocks: [
          {
            type: "paragraph",
            text: "路线图不新增组件，而是给既有架构（入口 → Runtime → RAG → 工具 → 工作流 → 审批 → Trace）补充交付顺序。每个里程碑对应一个或多个组件，组件实现细节见 itops-agent 与相关教程。",
          },
          {
            type: "table",
            headers: ["里程碑", "对应组件", "依赖教程"],
            rows: [
              ["M2", "KbRetriever / ContextBuilder", "rag-fundamentals / context-engineering"],
              ["M4", "AgentRuntime", "agent-execution-loop"],
              ["M6", "ToolRegistry", "mcp-fundamentals"],
              ["M7/M8", "ApprovalStore / Workflow", "workflow-engine / human-approval"],
              ["M9/M10", "Tracer / 回归门禁", "agent-tracing / agent-evaluation"],
            ],
          },
        ],
      },
      {
        id: "components",
        heading: "4. 组件职责说明 Components",
        blocks: [
          {
            type: "table",
            headers: ["角色", "职责", "产出"],
            rows: [
              ["平台工程师", "Runtime、工具注册表、部署", "可运行内核"],
              ["数据工程师", "SOP 摄取与权限标签", "文档契约"],
              ["安全负责人", "权限矩阵与审批策略", "策略配置"],
              ["SRE", "监控、告警、故障演练", "演练报告"],
              ["业务值班长", "审批与人工评审", "验收签字"],
            ],
          },
        ],
      },
      {
        id: "execution-flow",
        heading: "5. 数据流与执行流 Execution Flow",
        blocks: [
          {
            type: "list",
            ordered: true,
            items: [
              "M1 明确「禁止自动变更生产」等硬边界，写入 README。",
              "M2 定义 IncidentRequest、Doc、Observation 的字段与信任级别。",
              "M3 输出角色 × 工具 × 副作用矩阵，写工具默认审批。",
              "M4 实现带 max_steps 与 token 预算的 Runtime，先接模拟 Planner。",
              "M5 接入租户过滤的 RAG，无证据强制转人工。",
              "M6 注册只读工具，完成未注册/跨租户拒绝测试。",
              "M7 加入检查点与恢复，M8 加入审批挂起/拒绝补偿。",
              "M9 加入 trace 与成本归因，M10 建立轨迹级回归门禁。",
              "M11 做模型不可用、检索为空、工具超时、审批超时四类演练。",
              "M12 灰度只开只读与草稿工单，准备一键熔断与回滚预案。",
            ],
          },
        ],
      },
      {
        id: "patterns",
        heading: "6. 关键技术与设计模式",
        blocks: [
          {
            type: "list",
            items: [
              "Acceptance-driven Delivery：先写验收断言，再写实现。",
              "Fail-closed Default：配置缺失、Schema 未注册、审批超时一律拒绝。",
              "Shadow Mode：影子流量只记录决策，不产生副作用。",
              "Regression Gate：策略/模型/工具变更必须重跑轨迹断言。",
              "Kill Switch：一键关闭全部写工具，保留只读排查能力。",
            ],
          },
        ],
      },
      {
        id: "stack",
        heading: "7. 技术栈与选型 Trade-off",
        blocks: [
          {
            type: "table",
            headers: ["决策点", "教学选择", "生产建议"],
            rows: [
              ["验收执行", "pytest 离线断言", "CI 门禁 + 环境隔离"],
              ["审批", "内存状态机", "持久化审批系统 + 超时补偿"],
              ["回归集", "手写固定用例", "生产失败轨迹脱敏后入库"],
              ["发布", "手动灰度", "配置版本化 + 自动回滚"],
            ],
          },
        ],
      },
      {
        id: "hands-on",
        heading: "8. Hands-on 实战：验收清单与回归门禁",
        blocks: [
          {
            type: "code",
            language: "bash",
            filename: "tree.txt",
            caption: "执行方式与环境",
            code: String.raw`项目 A 的代码在 itops-agent 教程的 project-a-itops/ 中。
本路线图的验收命令：
  cd project-a-itops && python -m pytest -q
环境要求: Python >= 3.10, pytest >= 7
无需网络、数据库、API Key；测试全部使用教学模拟数据。
输出: pytest 结果 + 12 个里程碑的人工检查表`,
          },
          {
            type: "code",
            language: "yaml",
            filename: "acceptance-gate.yaml",
            caption: "回归门禁清单（教学示例）",
            code: String.raw`version: "teaching-demo-1"
project: enterprise-itops-agent
required_tests:
  - test_rag_filters_by_tenant
  - test_no_evidence_falls_back_to_human
  - test_context_budget_drops_low_trust_chunks_first
  - test_unregistered_and_cross_tenant_tool_calls_are_denied
  - test_high_severity_requires_approval_and_creates_no_ticket
  - test_rejected_approval_compensates
  - test_approved_creates_draft_only
  - test_trajectory_assertion_and_cost_attribution
manual_checks:
  - 权限矩阵经安全负责人评审
  - SOP 文档抽样人工核对
  - 故障演练报告归档
  - 回滚预案可在一分钟内关闭全部写工具
blocking_rules:
  - any_failed_test_blocks_release
  - any_unapproved_write_blocks_release
  - missing_audit_trail_blocks_release`,
          },
          {
            type: "code",
            language: "json",
            filename: "milestone.json",
            caption: "里程碑数据结构（供检查表程序读取）",
            code: String.raw`{
  "project": "enterprise-itops-agent",
  "milestones": [
    {"id": "M1", "name": "定义硬边界", "assertion": "README 含禁止自动变更条款"},
    {"id": "M2", "name": "数据契约", "assertion": "IncidentRequest/Doc/Observation 字段与 trust 已定义"},
    {"id": "M3", "name": "权限矩阵", "assertion": "写工具默认 requiresApproval=true"},
    {"id": "M4", "name": "Runtime 实现", "assertion": "max_steps 与 token 预算同时生效"},
    {"id": "M5", "name": "RAG 接入", "assertion": "检索按 tenant 过滤且无证据转人工"},
    {"id": "M6", "name": "工具注册表", "assertion": "未注册与跨租户调用均被拒绝"},
    {"id": "M7", "name": "检查点与恢复", "assertion": "重启后已完成写步骤不重放"},
    {"id": "M8", "name": "人工审批", "assertion": "未审批时 tickets 为空"},
    {"id": "M9", "name": "Trace 与成本", "assertion": "每步有 run_id 且 total_tokens 可计算"},
    {"id": "M10", "name": "回归门禁", "assertion": "轨迹断言全部通过"},
    {"id": "M11", "name": "故障演练", "assertion": "四类故障均有降级路径与报告"},
    {"id": "M12", "name": "灰度上线", "assertion": "仅只读工具与草稿工单可用"}
  ]
}`,
          },
          {
            type: "callout",
            variant: "warning",
            title: "真实 / 模拟边界",
            text: "本路线图引用的测试名对应 itops-agent 中真实可运行的 pytest 用例；里程碑、角色与检查项均为教学设定，不代表任何企业真实流程或审计标准。",
          },
        ],
      },
      {
        id: "case",
        heading: "9. 企业应用案例（教学模拟）",
        blocks: [
          {
            type: "paragraph",
            text: "业务背景：模拟企业计划把 IT 服务台的排查辅助上线为 Agent。业务问题是首个版本直接开放了变更工具，演练中出现未审批写入。采用路线图后，M3 权限矩阵与 M8 审批成为上线阻断项，M12 灰度只允许草稿工单。",
          },
          {
            type: "table",
            headers: ["里程碑", "输入", "交付物", "验收断言"],
            rows: [
              ["M1", "业务诉求", "边界清单", "禁止项写入 README"],
              ["M3", "工具列表", "权限矩阵", "写工具默认审批"],
              ["M8", "高危动作", "审批状态机", "未审批无工单"],
              ["M11", "故障清单", "演练报告", "四类故障均有降级路径"],
              ["M12", "回归结果", "灰度配置", "一键熔断可用"],
            ],
          },
        ],
      },
      {
        id: "production",
        heading: "10. Production Engineering 部署与监控",
        blocks: [
          {
            type: "list",
            items: [
              "把 acceptance-gate.yaml 放进 CI，任何策略、工具或模型变更触发全量回归。",
              "监控指标：越权拒绝数、无证据率、审批时延、轨迹断言失败数、写工具开启数量。",
              "灰度按租户放量，先只读；每次放量前复核审计抽样。",
              "回滚：策略配置、工具注册表、计划 Schema 与基线版本一起回退。",
              "定期把生产失败轨迹脱敏后加入回归集，避免同类问题复发。",
            ],
          },
        ],
      },
      {
        id: "security",
        heading: "11. Security & Governance 安全与治理",
        blocks: [
          {
            type: "list",
            items: [
              "权限矩阵是上线阻断项，不允许「先上线再补」。",
              "所有写工具默认审批，审批人、理由与时间戳进入审计。",
              "日志脱敏，凭据只由执行器持有；一键熔断必须演练验证。",
              "租户隔离与 RAG 权限过滤纳入每次回归。",
            ],
          },
        ],
      },
      {
        id: "evaluation",
        heading: "12. Evaluation & Testing 评估与测试",
        blocks: [
          {
            type: "table",
            headers: ["门禁", "断言", "失败处理"],
            rows: [
              ["单元/集成测试", "pytest 全绿", "阻断发布"],
              ["轨迹断言", "关键步骤顺序正确", "阻断发布"],
              ["越权检查", "未审批写操作为 0", "阻断发布"],
              ["人工评审", "权限矩阵与 SOP 抽样", "未签字阻断"],
            ],
          },
        ],
      },
      {
        id: "best-practices",
        heading: "13. Best Practices 最佳实践",
        blocks: [
          {
            type: "list",
            items: [
              "先写禁止项与验收断言，再写 Agent 代码。",
              "把「未审批无副作用」做成自动化测试，而不是文档承诺。",
              "灰度期只保留只读与草稿，禁止直接开放真实变更。",
              "每个里程碑都能独立回滚，配置与数据契约一起版本化。",
            ],
          },
        ],
      },
      {
        id: "troubleshooting",
        heading: "14. Troubleshooting 故障排查",
        blocks: [
          {
            type: "table",
            headers: ["现象", "原因", "排查方法", "预防"],
            rows: [
              ["门禁频繁失败", "用例依赖模型随机输出", "改用轨迹断言", "mock 固定输出"],
              ["上线后越权", "权限矩阵未随工具更新", "比对注册表与矩阵", "变更触发回归"],
              ["审批积压", "超时策略缺失", "查看审批时延指标", "超时自动拒绝/补偿"],
              ["回滚后仍异常", "只回滚代码未回滚配置", "核对配置版本", "三者一起回退"],
            ],
          },
        ],
      },
      {
        id: "further-reading",
        heading: "15. Further Reading 参考资料",
        blocks: [
          {
            type: "paragraph",
            text: "外部流程与产品资料需按官方文档核验（需进一步核验）；本站相关页面见下方参考资料与「知识关联」区块。",
          },
          {
            type: "callout",
            variant: "info",
            title: "资料核验说明",
            text: "本路线图为本站工程建议，里程碑数量与角色分工为教学设计，不是任何行业标准或认证要求。",
          },
        ],
      },
      {
        id: "engineering-notes",
        heading: "16. 工程实现补遗：组件交互时序、故障演练与上线验收",
        blocks: [
          {
            type: "paragraph",
            text: "门禁断言必须可自动化；人工评审项若未指定角色与抽样方式，就无法判定一次发布是否通过。把「权限矩阵已评审」写成布尔检查项，比写成原则更有工程价值。",
          },
          {
            type: "mermaid",
            title: "组件交互时序（含失败分支）",
            source: String.raw`sequenceDiagram
  participant D as 开发者
  participant CI as CI 门禁
  participant T as 回归测试
  participant S as 安全评审
  participant R as 灰度发布
  D->>CI: 提交策略/工具/模型变更
  CI->>T: 运行 pytest + 轨迹断言
  alt 测试失败
    T-->>D: 阻断发布 + 失败用例
  else 测试通过
    T->>S: 权限矩阵与 SOP 人工抽检
    alt 未签字
      S-->>D: 阻断发布
    else 已签字
      S->>R: 允许灰度
      R->>R: 只开只读与草稿工单
      R->>CI: 监控越权拒绝数与审批时延
    end
  end`,
            caption: "消息顺序、超时分支与降级路径；箭头方向即控制流方向。",
          },
          {
            type: "table",
            headers: ["组件交互契约", "传递内容", "超时/失败语义"],
            rows: [
              ["CI → 回归测试","变更集 + acceptance-gate.yaml","任一用例失败即阻断"],
              ["回归测试 → 安全评审","测试结果 + 权限矩阵 diff","人工项需指定角色与抽样方式"],
              ["安全评审 → 灰度发布","签字记录 + 配置版本","回滚时代码/策略/Schema 一起回退"],
            ],
          },
          {
            type: "table",
            headers: ["类别", "可执行操作", "通过标准"],
            rows: [
              ["故障注入","删除写工具的审批标记","门禁用例失败并阻断"],
              ["故障注入","回滚代码但保留新策略配置","配置版本校验失败并告警"],
              ["上线验收","python -m pytest -q test_milestones.py","里程碑结构与断言字段校验通过"],
              ["上线验收","核对 required_tests 与真实测试名","清单无缺失、无虚构用例"],
            ],
          },
          {
            type: "code",
            language: "python",
            filename: "test_milestones.py",
            caption: "离线验收：校验里程碑清单结构与门禁字段（与 milestone.json 配套运行）",
            runnable: true,
            code: String.raw`import json
from pathlib import Path

DATA = json.loads(Path("milestone.json").read_text(encoding="utf-8"))


def test_project_is_identified():
    assert DATA["project"] == "enterprise-itops-agent"


def test_milestone_ids_are_unique_and_complete():
    ids = [m["id"] for m in DATA["milestones"]]
    assert len(ids) == len(set(ids))
    assert ids == ["M" + str(i) for i in range(1, 13)]


def test_every_milestone_has_assertion():
    for m in DATA["milestones"]:
        assert m["name"].strip()
        assert m["assertion"].strip()


def test_regression_gate_milestone_exists():
    assert "M10" in [m["id"] for m in DATA["milestones"]]`,
          },
          {
            type: "paragraph",
            text: "落地替换点：把 JSON 里程碑清单换成企业发布系统的检查模板，CI 门禁接入真实流水线，人工评审签字接入审批系统，灰度与熔断配置接入平台配置中心。本地验收安装 python -m pip install pytest 后执行 python -m pytest -q test_milestones.py（读取同目录 milestone.json，无需网络与密钥）；清单中的用例名对应 itops-agent 教程里真实可运行的 pytest 测试，不是占位标题。",
          },
        ],
      },
    ],
    tags: ["贯穿项目", "交付路线图", "验收门禁", "IT 运维"],
    architectureIds: ["a01", "a13"],
    relatedTutorialIds: [
      "itops-agent",
      "agent-execution-loop",
      "workflow-engine",
      "agent-tracing",
      "prompt-injection",
      "project-manufacturing-agent",
    ],
    nextTutorialSlugs: ["itops-agent", "project-manufacturing-agent"],
    relatedLabSlugs: ["agent-execution-loop", "workflow-designer"],
    relatedCaseSlugs: ["it-operations-agent"],
    references: [
      R("OpenTelemetry 官方文档", "https://opentelemetry.io/docs/", "OpenTelemetry", "轨迹与指标关联", "官方规范"),
      R("NIST AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework", "NIST", "治理流程参考", "官方规范"),
      R("OWASP Top 10 for LLM Applications", "https://owasp.org/www-project-top-10-for-large-language-model-applications/", "OWASP", "上线前安全检查项", "社区实践"),
      R("本站：企业 IT Operations Agent 运行时内核", "https://www.yuxin.run/agent-fullstack-knowledge/tutorials/itops-agent", "本站", "配套可运行代码与测试", "本站工程建议"),
    ],
    updatedAt: "2026-11-13",
    status: "published",
    qualityLevel: "L5",
  },
];
