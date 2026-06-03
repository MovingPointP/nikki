// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// フロントマターブロック（---〜---）を抽出する正規表現
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\n---\r?\n?/;

// フロントマターを除いた本文を返す
export function stripFrontmatter(raw: string): string {
  return raw.replace(FRONTMATTER_RE, "");
}

// フロントマター内の tags フィールドをパースして返す
// tags: [tag1, tag2] 形式と tags: \n  - tag1 形式の両方に対応
export function parseTags(raw: string): string[] {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return [];

  //フロントマター内の文字列を取得
  const frontmatter = match[1];

  // インライン配列形式: tags: [tag1, tag2]
  const inlineMatch = frontmatter.match(/^tags:\s*\[([^\]]*)\]/m);
  if (inlineMatch) {
    return inlineMatch[1]
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  // ブロック形式: tags:\n  - tag1\n  - tag2
  const blockMatch = frontmatter.match(/^tags:\s*\n((?:\s*-\s*.+\n?)*)/m);
  if (blockMatch) {
    return blockMatch[1]
      .split("\n")
      .map((line) => line.replace(/^\s*-\s*/, "").trim())
      .filter((t) => t.length > 0);
  }

  return [];
}
