// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// フロントマターブロック（---〜---）を抽出する正規表現
export const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\n---\r?\n?/;

// フロントマターを除いた本文を返す
export function stripFrontmatter(raw: string): string {
  return raw.replace(FRONTMATTER_RE, "");
}

// フロントマター内の tags フィールドをパースして返す
// tags: [tag1, tag2] のインライン配列形式のみ対応（ブロック形式は無視）
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
  
  return [];
}

// frontmatter の tags フィールドを指定した配列で上書きした文字列を返す
// frontmatter が存在しない場合は先頭に追加する。tags フィールドがない場合は末尾に追加する
export function setTagsInFrontmatter(raw: string, tags: string[]): string {
  // ファイル全体の改行コードを検出して統一する
  const nl = raw.includes("\r\n") ? "\r\n" : "\n";
  const tagLine = `tags: [${tags.join(", ")}]`;

  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    // frontmatter が存在しない場合は先頭に追加する
    return `---\n${tagLine}\n---\n`.replace(/\r?\n/g, nl) + raw;
  }

  const frontmatter = match[1];

  // 行単位で処理してインライン形式・ブロック形式の両方を安全に置換・削除する
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

  if (!inserted) {
    newLines.push(tagLine);
  }

  const newFrontmatter = newLines.join("\n");
  return raw.replace(FRONTMATTER_RE, `---\n${newFrontmatter}\n---\n`.replace(/\r?\n/g, nl));
}
