import { Fragment } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import vscDarkPlus from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";

SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("json", json);

export interface CodeHighlight {
  text: string;
  className: string;
}

interface CodeBlockProps {
  code: string;
  language?: "typescript" | "json";
  /** Plain-text mode only — wraps the first occurrence of each highlight's
   * text in a span using its className (e.g. to call out the job
   * description and the sample rubric inside a larger prompt). Ignored
   * when `language` is set. */
  highlights?: CodeHighlight[];
}

function renderWithHighlights(code: string, highlights: CodeHighlight[]) {
  const matches = highlights
    .map((h) => {
      const index = code.indexOf(h.text);
      return index === -1 ? null : { ...h, index, end: index + h.text.length };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort((a, b) => a.index - b.index);

  if (matches.length === 0) return code;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.index > cursor) nodes.push(<Fragment key={`t${i}`}>{code.slice(cursor, m.index)}</Fragment>);
    nodes.push(
      <span key={`h${i}`} className={m.className}>
        {code.slice(m.index, m.end)}
      </span>,
    );
    cursor = m.end;
  });
  if (cursor < code.length) nodes.push(<Fragment key="tail">{code.slice(cursor)}</Fragment>);
  return nodes;
}

export function CodeBlock({ code, language, highlights }: CodeBlockProps) {
  if (!language) {
    return (
      <div className="overflow-hidden rounded-lg border border-[#2a2a2e] bg-[#1e1e1e] shadow-sm">
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap p-3 font-mono text-[11px] leading-relaxed text-[#e4e4e7]">
          {highlights && highlights.length > 0 ? renderWithHighlights(code, highlights) : code}
        </pre>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#2a2a2e] bg-[#1e1e1e] shadow-sm">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "0.75rem",
          background: "transparent",
          maxHeight: "20rem",
          fontSize: "11px",
          lineHeight: 1.6,
        }}
        codeTagProps={{ style: { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
