import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProgressProvider } from "@/components/ProgressProvider";

export const metadata: Metadata = {
  title: {
    default: "企业级 Agent 全栈工程知识中心",
    template: "%s · 企业级 Agent 全栈工程知识中心",
  },
  description:
    "面向企业 Agent 开发工程师的系统化技术教程、架构解析、代码实践与企业落地指南。覆盖 Agent 工程、Multi-Agent、MCP、RAG、AgentOps、安全治理与部署。",
  keywords: [
    "Agent 工程",
    "Multi-Agent",
    "MCP",
    "RAG",
    "企业 AI",
    "LLMOps",
    "AgentOps",
    "AI 平台",
  ],
  openGraph: {
    title: "企业级 Agent 全栈工程知识中心",
    description:
      "从 Agent 架构、Multi-Agent、MCP、RAG 到 AgentOps、安全治理与企业级部署，系统掌握企业级 Agent 全栈工程。",
    type: "website",
    locale: "zh_CN",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ProgressProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ProgressProvider>
      </body>
    </html>
  );
}
