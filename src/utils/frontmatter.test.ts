import { describe, it, expect } from "vitest";
import {
  splitFrontmatter,
  mergeFrontmatterAndContent,
  hasFrontmatter,
  parseTags,
  setTagsInFrontmatter,
} from "./frontmatter";

// ────────────────────────────────────────────
// splitFrontmatter
// ────────────────────────────────────────────

describe("splitFrontmatter", () => {
  it("フロントマターと本文を分割して返す", () => {
    const raw = "---\ntags: [foo]\n---\n本文";
    expect(splitFrontmatter(raw)).toEqual({ frontmatter: "tags: [foo]", content: "本文" });
  });

  it("フロントマターがない場合は frontmatter を空文字にする", () => {
    expect(splitFrontmatter("本文のみ")).toEqual({ frontmatter: "", content: "本文のみ" });
  });

  it("CRLF改行のフロントマターを分割できる", () => {
    const raw = "---\r\ntags: [foo]\r\ntitle: 日記\r\n---\r\n本文";
    expect(splitFrontmatter(raw)).toEqual({
      frontmatter: "tags: [foo]\r\ntitle: 日記",
      content: "本文",
    });
  });
});

// ────────────────────────────────────────────
// mergeFrontmatterAndContent
// ────────────────────────────────────────────

describe("mergeFrontmatterAndContent", () => {
  it("フロントマターと本文を結合する", () => {
    expect(mergeFrontmatterAndContent("tags: [foo]", "本文")).toBe("---\ntags: [foo]\n---\n本文");
  });

  it("frontmatter が空なら content のみ返す", () => {
    expect(mergeFrontmatterAndContent("", "本文")).toBe("本文");
  });

  it("content が CRLF の場合はフロントマター区切りも CRLF にする", () => {
    const content = "本文\r\n続き";
    expect(mergeFrontmatterAndContent("tags: [foo]", content)).toBe(
      "---\r\ntags: [foo]\r\n---\r\n本文\r\n続き"
    );
  });
});

// ────────────────────────────────────────────
// hasFrontmatter
// ────────────────────────────────────────────

describe("hasFrontmatter", () => {
  it("フロントマターを含む場合は true を返す", () => {
    expect(hasFrontmatter("---\ntags: [foo]\n---\n本文")).toBe(true);
  });

  it("フロントマターがない場合は false を返す", () => {
    expect(hasFrontmatter("本文のみ")).toBe(false);
  });

  it("本文中に --- がある場合は false を返す（先頭でない）", () => {
    expect(hasFrontmatter("本文\n---\n区切り")).toBe(false);
  });
});

// ────────────────────────────────────────────
// parseTags
// ────────────────────────────────────────────

describe("parseTags", () => {
  it("インライン形式のタグを返す", () => {
    expect(parseTags("tags: [foo, bar, baz]")).toEqual(["foo", "bar", "baz"]);
  });

  it("タグが空のインライン形式は空配列を返す", () => {
    expect(parseTags("tags: []")).toEqual([]);
  });

  it("フロントマターが空文字の場合は空配列を返す", () => {
    expect(parseTags("")).toEqual([]);
  });

  it("tags フィールドがない場合は空配列を返す", () => {
    expect(parseTags("title: 日記")).toEqual([]);
  });

  it("タグ前後の空白を除去する", () => {
    expect(parseTags("tags: [  foo  ,  bar  ]")).toEqual(["foo", "bar"]);
  });

  it("タグがクォーテーションで囲まれている場合は除去する", () => {
    expect(parseTags('tags: ["foo", \'bar\']')).toEqual(["foo", "bar"]);
  });

  it("重複したタグは除外する", () => {
    expect(parseTags("tags: [foo, bar, foo]")).toEqual(["foo", "bar"]);
  });

  it("複数フィールドがある場合も tags だけを返す", () => {
    expect(parseTags("title: 日記\ntags: [foo, bar]")).toEqual(["foo", "bar"]);
  });
});

// ────────────────────────────────────────────
// setTagsInFrontmatter
// ────────────────────────────────────────────

describe("setTagsInFrontmatter", () => {
  it("既存の tags フィールドを上書きする", () => {
    expect(setTagsInFrontmatter("tags: [foo]", ["foo", "bar"])).toBe("tags: [foo, bar]");
  });

  it("tags を空配列にする", () => {
    expect(setTagsInFrontmatter("tags: [foo]", [])).toBe("tags: []");
  });

  it("frontmatter が空の場合は tags 行を返す", () => {
    expect(setTagsInFrontmatter("", ["foo"])).toBe("tags: [foo]");
  });

  it("tags フィールドがない frontmatter に tags を追加する", () => {
    expect(setTagsInFrontmatter("title: 日記", ["foo"])).toBe("title: 日記\ntags: [foo]");
  });

  it("tags の後ろに別フィールドがある場合でも改行が保たれる", () => {
    expect(setTagsInFrontmatter("tags: [foo]\ntitle: 日記", ["baz"])).toBe("tags: [baz]\ntitle: 日記");
  });

  it("ブロック形式の tags をインライン形式で上書きしブロック行を削除する", () => {
    expect(setTagsInFrontmatter("tags:\n  - foo\n  - bar", ["baz"])).toBe("tags: [baz]");
  });

  it("ブロック形式の tags の後ろに別フィールドがある場合でも正しく置換できる", () => {
    expect(setTagsInFrontmatter("tags:\n  - foo\ntitle: 日記", ["baz"])).toBe("tags: [baz]\ntitle: 日記");
  });
});
