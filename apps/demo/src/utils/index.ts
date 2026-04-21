export type CodeTokenType = "plain" | "kw" | "fn" | "str";

export interface CodeToken {
  text: string;
  type: CodeTokenType;
}

const KEYWORD_RE = /\b(import|export|from|default|config)\b/g;
const STRING_RE = /(["'`])(?:\\.|(?!\1).)*\1/g;

function tokenizePlainSegment(text: string): CodeToken[] {
  if (!text) return [];

  const tokens: CodeToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(KEYWORD_RE)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;

    if (start > lastIndex) {
      tokens.push({ text: text.slice(lastIndex, start), type: "plain" });
    }

    tokens.push({
      text: match[0],
      type: match[0] === "config" ? "fn" : "kw",
    });
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    tokens.push({ text: text.slice(lastIndex), type: "plain" });
  }

  return tokens;
}

function tokenizeLine(line: string): CodeToken[] {
  if (!line) return [];

  const tokens: CodeToken[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(STRING_RE)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;

    if (start > lastIndex) {
      tokens.push(...tokenizePlainSegment(line.slice(lastIndex, start)));
    }

    tokens.push({ text: match[0], type: "str" });
    lastIndex = end;
  }

  if (lastIndex < line.length) {
    tokens.push(...tokenizePlainSegment(line.slice(lastIndex)));
  }

  return tokens;
}

export function highlightCode(code: string): CodeToken[][] {
  return code.split("\n").map((line) => tokenizeLine(line));
}
