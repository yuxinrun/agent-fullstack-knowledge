"use client";

import { toolRegistry } from "./ToolComponents";

export default function ToolRenderer({ component }: { component: string }) {
  const C = toolRegistry[component];
  if (!C) {
    return (
      <div className="card p-8 text-center text-ink-muted">工具加载中…</div>
    );
  }
  return <C />;
}
