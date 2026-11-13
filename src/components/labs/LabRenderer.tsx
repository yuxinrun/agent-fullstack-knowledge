"use client";

import { labRegistry } from "./LabComponents";

export default function LabRenderer({ component }: { component: string }) {
  const C = labRegistry[component];
  if (!C) {
    return (
      <div className="card p-8 text-center text-ink-muted">实验组件加载中…</div>
    );
  }
  return <C />;
}
