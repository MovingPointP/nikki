// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// フロントマターブロック（---〜---）を抽出する正規表現
export const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

// ファイル全体をフロントマター内部文字列と本文に分割して返す
// frontmatter は ---区切りを含まない内部文字列
export function splitFrontmatter(raw: string): { frontmatter: string; content: string } {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return { frontmatter: "", content: raw };
  return { frontmatter: match[1], content: raw.slice(match[0].length) };
}

// フロントマター内部文字列と本文を結合してファイル文字列を返す
// frontmatter が空なら content のみ返す
// content の改行スタイル（LF / CRLF）に合わせてフロントマター区切りを生成する
export function mergeFrontmatterAndContent(frontmatter: string, content: string): string {
  if (!frontmatter) return content;
  const nl = content.includes("\r\n") ? "\r\n" : "\n";
  const fm = frontmatter.replace(/\n/g, nl);
  return `---${nl}${fm}${nl}---${nl}${content}`;
}

// テキストにフロントマターが含まれるか判定する（バリデーション用）
export function hasFrontmatter(text: string): boolean {
  return FRONTMATTER_RE.test(text);
}

// フロントマター内部文字列の tags フィールドをパースして返す
// tags: [tag1, tag2] のインライン配列形式のみ対応（ブロック形式は無視）
export function parseTags(frontmatter: string): string[] {
  const inlineMatch = frontmatter.match(/^tags:\s*\[([^\]]*)\]/m);
  if (inlineMatch) {
    return Array.from(new Set(
      inlineMatch[1]
        .split(",")
        .map((t) => t.trim().replace(/^["']|["']$/g, ""))
        .filter((t) => t.length > 0)
    ));
  }
  return [];
}

// フロントマター内部文字列の tags フィールドを指定した配列で上書きして返す
// tags フィールドがない場合は末尾に追加する
export function setTagsInFrontmatter(frontmatter: string, tags: string[]): string {
  const tagLine = `tags: [${tags.join(", ")}]`;

  if (!frontmatter) return tagLine;

  const lines = frontmatter.split(/\r?\n/);
  const newLines: string[] = [];
  let inserted = false;
  let inBlockTags = false;

  for (const line of lines) {
    if (/^tags:\s*\[/.test(line)) {
      // インライン形式: そのまま置き換え
      newLines.push(tagLine);
      inserted = true;
    } else if (/^tags:\s*$/.test(line)) {
      // ブロック形式の開始行: インライン形式に置き換え
      newLines.push(tagLine);
      inserted = true;
      inBlockTags = true;
    } else if (inBlockTags && /^\s*-/.test(line)) {
      // ブロック形式のタグ要素行: 削除（スキップ）
      continue;
    } else {
      if (inBlockTags) inBlockTags = false;
      newLines.push(line);
    }
  }

  if (!inserted) newLines.push(tagLine);

  return newLines.join("\n");
}
