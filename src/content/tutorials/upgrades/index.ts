import type { Tutorial } from "../../types";
import { deepAgentEngineering } from "./deep-agent-engineering";
import { deepMcp } from "./deep-mcp";
import { deepMultiAgentWorkflow } from "./deep-multi-agent-workflow";
import { deepBatch2 } from "./deep-batch2";
import { deepBatch3 } from "./deep-batch3";
import { deepBatch4 } from "./deep-batch4";
import { deepBatch5 } from "./deep-batch5";
import { deepBatch6 } from "./deep-batch6";
import { deepBatch7 } from "./deep-batch7";
import { deepBatch8 } from "./deep-batch8";

// ============================================================================
// V2.0 深度升级教程汇总
//
// 覆盖式升级（overlay）约定：
// - 这里每篇教程的 slug 都对应一个已有教程，id / domainId / URL 保持不变；
// - 合并时以 slug 为键替换正文，列表顺序仍由基础数组决定；
// - 若某篇是新 slug，则追加到末尾（用于未来补充新主题）；
// - 基础教程数据文件完全不改动，随时可回退，符合「保留已有教程」的要求。
//
// 后续批次继续在此追加 import 与数组即可，无需改动任何页面或路由。
// ============================================================================

export const upgradedTutorials: Tutorial[] = [
  ...deepAgentEngineering,
  ...deepMcp,
  ...deepMultiAgentWorkflow,
  ...deepBatch2,
  ...deepBatch3,
  ...deepBatch4,
  ...deepBatch5,
  ...deepBatch6,
  ...deepBatch7,
  ...deepBatch8,
];

/** 用升级版覆盖基础版（保持基础顺序、保留全部 URL） */
export function applyUpgrades(base: Tutorial[], upgrades: Tutorial[]): Tutorial[] {
  const map = new Map(upgrades.map((t) => [t.slug, t]));
  // 强制继承基础教程的 id / domainId，保证学习进度 key、搜索索引与关联逻辑稳定
  const overridden = base.map((t) => {
    const up = map.get(t.slug);
    return up ? { ...up, id: t.id, domainId: t.domainId, slug: t.slug } : t;
  });
  const additions = upgrades.filter((t) => !base.some((b) => b.slug === t.slug));
  return [...overridden, ...additions];
}
