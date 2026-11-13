import type { Metadata } from "next";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import { Breadcrumb } from "@/components/ui";

export const metadata: Metadata = {
  title: "知识关系图谱",
  description: "交互式企业 AI 知识关系图谱，支持拖动、缩放、过滤与高亮上下游。",
};

export default function KnowledgeGraphPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "知识图谱" }]} />
      <div className="mt-6">
        <h1 className="text-3xl font-bold md:text-4xl">知识关系图谱</h1>
        <p className="mt-2 max-w-2xl text-ink-secondary">
          图谱基于真实内容关系构建：领域、架构、术语、实验与工具之间的关联。支持节点拖动、缩放、
          按类型过滤、搜索节点，以及点击查看上下游依赖与关联教程。
        </p>
      </div>
      <div className="mt-6">
        <KnowledgeGraph />
      </div>
    </div>
  );
}
