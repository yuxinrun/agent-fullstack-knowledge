// 轻量、零依赖的代码高亮器：基于 token 扫描，安全转义后输出 HTML 字符串。
// 支持通用关键字/字符串/注释/数字/函数名高亮，语言差异通过关键字集合微调。

type Token = { text: string; cls?: string };

const KEYWORDS: Record<string, string[]> = {
  python: [
    "def", "class", "return", "if", "elif", "else", "for", "while", "import",
    "from", "as", "with", "try", "except", "finally", "raise", "lambda",
    "None", "True", "False", "in", "is", "not", "and", "or", "pass", "yield",
    "global", "nonlocal", "async", "await", "assert", "del", "break", "continue",
  ],
  ts: [
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "class", "extends", "implements", "import", "from", "export", "default",
    "async", "await", "new", "interface", "type", "enum", "public", "private",
    "protected", "readonly", "static", "try", "catch", "finally", "throw",
    "typeof", "instanceof", "of", "as", "void", "this", "super", "yield",
  ],
  bash: [
    "if", "then", "else", "fi", "for", "while", "do", "done", "case", "esac",
    "function", "return", "export", "local", "echo", "cd", "sudo", "npm", "npx",
  ],
  sql: [
    "SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "TABLE",
    "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "GROUP", "BY", "ORDER",
    "HAVING", "LIMIT", "AS", "AND", "OR", "NOT", "IN", "NULL", "WITH", "DISTINCT",
    "COUNT", "SUM", "AVG", "CASE", "WHEN", "THEN", "ELSE", "END", "IS",
  ],
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function tokenizeLine(line: string, lang: string): Token[] {
  const kw = KEYWORDS[lang] || KEYWORDS.ts;
  const kwSet = new Set(kw.map((k) => k.toLowerCase()));
  const tokens: Token[] = [];
  let i = 0;
  const n = line.length;

  const push = (text: string, cls?: string) => tokens.push({ text, cls });

  while (i < n) {
    const ch = line[i];

    // comments
    if (lang === "python" && ch === "#") {
      push(line.slice(i), "tok-com");
      break;
    }
    if ((lang === "ts" || lang === "bash" || lang === "sql") && ch === "/" && line[i + 1] === "/") {
      push(line.slice(i), "tok-com");
      break;
    }
    if (lang === "ts" && ch === "/" && line[i + 1] === "*") {
      const end = line.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      push(line.slice(i, stop), "tok-com");
      i = stop;
      continue;
    }

    // strings
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      while (j < n) {
        if (line[j] === "\\") { j += 2; continue; }
        if (line[j] === quote) { j++; break; }
        j++;
      }
      push(line.slice(i, j), "tok-str");
      i = j;
      continue;
    }

    // numbers
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < n && /[0-9._]/.test(line[j])) j++;
      push(line.slice(i, j), "tok-num");
      i = j;
      continue;
    }

    // identifiers
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const next = line[j];
      if (kwSet.has(word.toLowerCase())) {
        push(word, "tok-kw");
      } else if (next === "(") {
        push(word, "tok-fn");
      } else if (/^[A-Z]/.test(word)) {
        push(word, "tok-type");
      } else {
        push(word);
      }
      i = j;
      continue;
    }

    push(ch);
    i++;
  }
  return tokens;
}

export function highlight(code: string, lang: string): string {
  const normalized =
    lang === "typescript" || lang === "tsx" || lang === "javascript" || lang === "js"
      ? "ts"
      : lang === "python" || lang === "py"
      ? "python"
      : lang === "shell" || lang === "sh" || lang === "console"
      ? "bash"
      : lang === "json" || lang === "yaml" || lang === "yml"
      ? "ts"
      : lang === "sql"
      ? "sql"
      : "ts";

  const lines = code.split("\n");
  const html = lines
    .map((line) => {
      const toks = tokenizeLine(line, normalized);
      const inner = toks
        .map((t) => (t.cls ? `<span class="${t.cls}">${escapeHtml(t.text)}</span>` : escapeHtml(t.text)))
        .join("");
      return inner === "" ? " " : inner;
    })
    .join("\n");
  return html;
}
