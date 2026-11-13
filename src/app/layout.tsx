import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProgressProvider } from "@/components/ProgressProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

// 在 React 水合前同步应用主题，避免浅色/深色闪烁（FOUC）。
const THEME_INIT = `(function(){try{var t=localStorage.getItem('eak:theme:v1');var d=t==='light'||t==='dark';var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches;var s=d?t:(m?'light':'dark');document.documentElement.setAttribute('data-theme',s);}catch(e){}})();`;

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
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <ThemeProvider>
          <ProgressProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
