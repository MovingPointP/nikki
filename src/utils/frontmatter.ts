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
    return Array.from(new Set(
      inlineMatch[1]
        .split(",")
        .map((t) => t.trim().replace(/^["']|["']$/g, ""))
        .filter((t) => t.length > 0)
    ));
  }

  // ブロック形式: tags:\n  - tag1\n  - tag2
  const blockMatch = frontmatter.match(/^tags:\s*\n((?:\s*-\s*.+\n?)*)/m);
  if (blockMatch) {
    return Array.from(new Set(
      blockMatch[1]
        .split("\n")
        .map((line) => line.replace(/^\s*-\s*/, "").trim().replace(/^["']|["']$/g, ""))
        .filter((t) => t.length > 0)
    ));
  }

  return [];
}

// frontmatter の tags フィールドを指定した配列で上書きした文字列を返す
// frontmatter が存在しない場合は先頭に追加する。tags フィールドがない場合は末尾に追加する
export function setTagsInFrontmatter(raw: string, tags: string[]): string {
  const tagLine = `tags: [${tags.join(", ")}]`;

  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    // frontmatter が存在しない場合は先頭に追加する
    return `---\n${tagLine}\n---\n${raw}`;
  }

  const frontmatter = match[1];

  // tags フィールドが存在する場合は行ごと置き換える
  if (/^tags:/m.test(frontmatter)) {
    const newFrontmatter = frontmatter
      .replace(/^tags:.*(\n(?:\s+-\s*.+\n?)*)*/m, tagLine);
    return raw.replace(FRONTMATTER_RE, `---\n${newFrontmatter}\n---\n`);
  }

  // tags フィールドがない場合は frontmatter 末尾に追加する
  const newFrontmatter = `${frontmatter}\n${tagLine}`;
  return raw.replace(FRONTMATTER_RE, `---\n${newFrontmatter}\n---\n`);
}
