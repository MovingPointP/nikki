import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MarkdownPreview from "./MarkdownPreview";

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
});
