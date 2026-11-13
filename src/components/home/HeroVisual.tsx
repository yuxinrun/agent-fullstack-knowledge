import { cn } from "@/lib/utils";

// 纯 SVG 企业 Agent 架构视觉（无外部依赖，带 CSS 浮动动画）
const nodes = [
  { id: "user", label: "User", x: 50, y: 160, c: "#A7B0C0", sub: "用户 / 业务" },
  { id: "runtime", label: "Agent Runtime", x: 200, y: 160, c: "#38D6B0", sub: "执行循环", hero: true },
  { id: "multi", label: "Multi-Agent", x: 350, y: 50, c: "#7C8CFF", sub: "协作" },
  { id: "mcp", label: "MCP", x: 350, y: 130, c: "#F0B86E", sub: "工具" },
  { id: "rag", label: "RAG", x: 350, y: 210, c: "#3DD4A7", sub: "检索" },
  { id: "memory", label: "Memory", x: 350, y: 290, c: "#C79BFF", sub: "记忆" },
  { id: "ent", label: "Enterprise", x: 200, y: 290, c: "#63B3ED", sub: "企业系统", hero: true },
];

const edges = [
  ["user", "runtime"],
  ["runtime", "multi"],
  ["runtime", "mcp"],
  ["runtime", "rag"],
  ["runtime", "memory"],
  ["runtime", "ent"],
  ["mcp", "ent"],
  ["rag", "ent"],
];

function pos(id: string) {
  return nodes.find((n) => n.id === id)!;
}

export default function HeroVisual() {
  return (
    <div className="relative">
      <div className="glow-primary absolute inset-0 -z-10 rounded-3xl opacity-60" />
      <svg
        viewBox="0 0 400 340"
        className="w-full"
        role="img"
        aria-label="企业 Agent 系统架构示意"
      >
        {edges.map(([a, b], i) => {
          const pa = pos(a);
          const pb = pos(b);
          return (
            <line
              key={i}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke="#273449"
              strokeWidth={1.5}
              className="animate-pulse-soft"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          );
        })}
        {nodes.map((n) => (
          <g
            key={n.id}
            className="animate-pulse-soft"
            style={{ animationDelay: `${nodes.indexOf(n) * 0.3}s` }}
          >
            <circle cx={n.x} cy={n.y} r={n.hero ? 26 : 22} fill="#0a0f1e" stroke={n.c} strokeWidth={2} />
            <circle cx={n.x} cy={n.y} r={4} fill={n.c} />
            <text
              x={n.x}
              y={n.y + (n.hero ? 44 : 40)}
              textAnchor="middle"
              fontSize={n.hero ? 12 : 11}
              fill="#F8FAFC"
              fontWeight={600}
            >
              {n.label}
            </text>
            <text x={n.x} y={n.y + (n.hero ? 57 : 53)} textAnchor="middle" fontSize={9} fill="#748094">
              {n.sub}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
