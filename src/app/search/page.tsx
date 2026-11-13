import type { Metadata } from "next";
import { buildSearchIndex } from "@/content/tutorials";
import SearchClient from "@/components/SearchClient";
import { Breadcrumb } from "@/components/ui";

export const metadata: Metadata = {
  title: "全站搜索",
  description: "搜索 15 大知识领域、全部教程、架构、实验、工具与术语。",
};

export default function SearchPage() {
  const items = buildSearchIndex();
  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "搜索" }]} />
      <div className="mt-6">
        <h1 className="text-3xl font-bold md:text-4xl">全站搜索</h1>
        <p className="mt-2 text-ink-secondary">
          覆盖知识领域、教程、架构、实验、工具、术语、案例与学习路径，支持中英文与标签检索。
        </p>
      </div>
      <div className="mt-6">
        <SearchClient items={items} />
      </div>
    </div>
  );
}
