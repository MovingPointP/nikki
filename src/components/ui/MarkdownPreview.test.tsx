import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MarkdownPreview from "./MarkdownPreview";

vi.mock("@tauri-apps/api/core", () => ({
  convertFileSrc: (path: string) => `asset://localhost/${path}`,
}));

// ────────────────────────────────────────────
// テスト
// ────────────────────────────────────────────

describe("MarkdownPreview", () => {
  it("content が空のときマークダウンが表示されない", () => {
    render(<MarkdownPreview content="" />);
    // level: 1 で h1 のみ確認（MUI Typography の h6 と区別する）
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("Markdown がレンダリングされる", () => {
    render(<MarkdownPreview content="# 見出し" />);
    expect(screen.getByRole("heading", { level: 1, name: "見出し" })).toBeInTheDocument();
  });

  it("フロントマターが除去されて表示される", () => {
    render(<MarkdownPreview content={"---\ntags: []\n---\n\n# 本文"} />);
    expect(screen.getByRole("heading", { level: 1, name: "本文" })).toBeInTheDocument();
    expect(screen.queryByText("tags")).not.toBeInTheDocument();
  });

  describe("画像レンダリング", () => {
    it("https:// URL はそのまま src に使われる", () => {
      render(<MarkdownPreview content="![alt](https://example.com/image.png)" />);
      expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/image.png");
    });

    it("file:// URL（Unix）は asset:// に変換される", () => {
      render(<MarkdownPreview content="![alt](file:///home/user/image.png)" />);
      expect(screen.getByRole("img")).toHaveAttribute("src", "asset://localhost//home/user/image.png");
    });

    it("file:// URL（Windows）は先頭の / を除去して asset:// に変換される", () => {
      render(<MarkdownPreview content="![alt](file:///C:/Users/user/image.png)" />);
      expect(screen.getByRole("img")).toHaveAttribute("src", "asset://localhost/C:/Users/user/image.png");
    });

    it("Unix 絶対パスは asset:// に変換される", () => {
      render(<MarkdownPreview content="![alt](/home/user/image.png)" />);
      expect(screen.getByRole("img")).toHaveAttribute("src", "asset://localhost//home/user/image.png");
    });

    it("alt テキストが img の alt 属性に設定される", () => {
      render(<MarkdownPreview content="![説明テキスト](https://example.com/image.png)" />);
      expect(screen.getByRole("img")).toHaveAttribute("alt", "説明テキスト");
    });
  });
});
