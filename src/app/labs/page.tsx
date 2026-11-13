import type { Metadata } from "next";
import { labs } from "@/content/tutorials";
import { LabCard } from "@/components/cards";
import { Breadcrumb, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "交互实验室",
  description: "Agent 执行循环、RAG 检索、MCP 调用、权限检查等可交互教学实验。",
};

export default function LabsPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "实验室" }]} />
      <div className="mt-6">
        <SectionHeading
          eyebrow="交互实验室"
          title="动手实验，理解机制"
          description="每个实验都可实际交互：输入或选择会影响展示结果。模拟结果均标注为教学用途，不伪装真实系统输出。"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((l) => (
          <LabCard key={l.id} lab={l} />
        ))}
      </div>
    </div>
  );
}
