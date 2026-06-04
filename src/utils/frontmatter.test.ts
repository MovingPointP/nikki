import { describe, it, expect } from "vitest";
import { stripFrontmatter, parseTags, setTagsInFrontmatter } from "./frontmatter";

// ────────────────────────────────────────────
// stripFrontmatter
// ────────────────────────────────────────────

describe("stripFrontmatter", () => {
  it("フロントマターを除いた本文を返す", () => {
    const raw = "---\ntags: [foo]\n---\n本文";
    expect(stripFrontmatter(raw)).toBe("本文");
  });

  it("フロントマターがない場合はそのまま返す", () => {
    expect(stripFrontmatter("本文のみ")).toBe("本文のみ");
  });

  it("CRLF改行のフロントマターを除去できる", () => {
    const raw = "---\r\ntags: [foo]\r\n---\r\n本文";
    expect(stripFrontmatter(raw)).toBe("本文");
  });
});

// ────────────────────────────────────────────
// parseTags
// ────────────────────────────────────────────

describe("parseTags", () => {
  it("インライン形式のタグを返す", () => {
    const raw = "---\ntags: [foo, bar, baz]\n---\n本文";
    expect(parseTags(raw)).toEqual(["foo", "bar", "baz"]);
  });

  it("ブロック形式のタグを返す", () => {
    const raw = "---\ntags:\n  - foo\n  - bar\n---\n本文";
    expect(parseTags(raw)).toEqual(["foo", "bar"]);
  });

  it("タグが空のインライン形式は空配列を返す", () => {
    const raw = "---\ntags: []\n---\n本文";
    expect(parseTags(raw)).toEqual([]);
  });

  it("フロントマターがない場合は空配列を返す", () => {
    expect(parseTags("本文のみ")).toEqual([]);
  });

  it("tags フィールドがないフロントマターは空配列を返す", () => {
    const raw = "---\ntitle: 日記\n---\n本文";
    expect(parseTags(raw)).toEqual([]);
  });

  it("タグ前後の空白を除去する", () => {
    const raw = "---\ntags: [  foo  ,  bar  ]\n---\n本文";
    expect(parseTags(raw)).toEqual(["foo", "bar"]);
  });

  it("タグがクォーテーションで囲まれている場合は除去する", () => {
    const raw = "---\ntags: [\"foo\", 'bar']\n---\n本文";
    expect(parseTags(raw)).toEqual(["foo", "bar"]);
  });

  it("重複したタグは除外する", () => {
    const raw = "---\ntags: [foo, bar, foo]\n---\n本文";
    expect(parseTags(raw)).toEqual(["foo", "bar"]);
  });
});

// ────────────────────────────────────────────
// setTagsInFrontmatter
// ────────────────────────────────────────────

describe("setTagsInFrontmatter", () => {
  it("既存の tags フィールドを上書きする", () => {
    const raw = "---\ntags: [foo]\n---\n本文";
    expect(setTagsInFrontmatter(raw, ["foo", "bar"])).toBe("---\ntags: [foo, bar]\n---\n本文");
  });

  it("tags を空配列にする", () => {
    const raw = "---\ntags: [foo]\n---\n本文";
    expect(setTagsInFrontmatter(raw, [])).toBe("---\ntags: []\n---\n本文");
  });

  it("frontmatter がない場合は先頭に追加する", () => {
    expect(setTagsInFrontmatter("本文", ["foo"])).toBe("---\ntags: [foo]\n---\n本文");
  });

  it("tags フィールドがない frontmatter に tags を追加する", () => {
    const raw = "---\ntitle: 日記\n---\n本文";
    expect(setTagsInFrontmatter(raw, ["foo"])).toBe("---\ntitle: 日記\ntags: [foo]\n---\n本文");
  });

  it("ブロック形式の tags も上書きできる", () => {
    const raw = "---\ntags:\n  - foo\n  - bar\n---\n本文";
    expect(setTagsInFrontmatter(raw, ["baz"])).toBe("---\ntags: [baz]\n---\n本文");
  });
});
