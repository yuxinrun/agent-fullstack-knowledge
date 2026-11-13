import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui";
import ProgressClient from "@/components/ProgressClient";

export const metadata: Metadata = {
  title: "学习进度",
  description: "查看已完成、已收藏与最近浏览的教程。",
};

export default function ProgressPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "学习进度" }]} />
      <div className="mt-6">
        <h1 className="text-3xl font-bold md:text-4xl">我的学习进度</h1>
        <p className="mt-2 text-ink-secondary">
          进度保存在浏览器本地（localStorage）。未接入账号系统前，不具备云端同步能力。
        </p>
      </div>
      <div className="mt-8">
        <ProgressClient />
      </div>
    </div>
  );
}
