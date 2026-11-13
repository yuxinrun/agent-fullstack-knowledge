import type { ContentBlock } from "@/content/types";
import CodeBlock from "./CodeBlock";
import MermaidViewer from "./MermaidViewer";
import { Callout } from "./ui";

export function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p>{block.text}</p>;
    case "list":
      return block.ordered ? (
        <ol>
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      ) : (
        <ul>
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <Callout variant={block.variant} title={block.title}>
          {block.text}
        </Callout>
      );
    case "code":
      return (
        <CodeBlock
          code={block.code}
          language={block.language}
          filename={block.filename}
          caption={block.caption}
          runnable={block.runnable}
        />
      );
    case "mermaid":
      return (
        <MermaidViewer source={block.source} title={block.title} caption={block.caption} />
      );
    case "table":
      return (
        <table className="doc-table">
          <thead>
            <tr>
              {block.headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    default:
      return null;
  }
}
