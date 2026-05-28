import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TemplatePreviewPane from "./TemplatePreviewPane";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("../store/templateStore");

import { useTemplateStore } from "../store/templateStore";
const mockUseTemplateStore = vi.mocked(useTemplateStore);

// セレクタを受け取って状態から値を返すヘルパー
function mockState(state: { content: string }) {
  mockUseTemplateStore.mockImplementation((selector) =>
    selector(state as Parameters<typeof selector>[0])
  );
}

beforeEach(() => {
  mockState({ content: "" });
});

// ────────────────────────────────────────────
// ヘッダー表示
// ────────────────────────────────────────────

describe("ヘッダー表示", () => {
  it("「テンプレートプレビュー」ラベルが常に表示される", () => {
    render(<TemplatePreviewPane />);
    expect(screen.getByText("テンプレートプレビュー")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// プレビュー本文
// ────────────────────────────────────────────

describe("プレビュー本文", () => {
  it("content が空のときマークダウンが表示されない", () => {
    mockState({ content: "" });
    render(<TemplatePreviewPane />);
    // level: 1 で h1 のみ確認（MUI Typography の h6 と区別する）
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("content が設定されているときマークダウンが表示される", () => {
    mockState({ content: "# テンプレート見出し" });
    render(<TemplatePreviewPane />);
    expect(
      screen.getByRole("heading", { level: 1, name: "テンプレート見出し" })
    ).toBeInTheDocument();
  });

  it("フロントマターが除去されて表示される", () => {
    mockState({
      content: "---\ntags: []\n---\n\n# 本文",
    });
    render(<TemplatePreviewPane />);
    expect(screen.getByRole("heading", { level: 1, name: "本文" })).toBeInTheDocument();
    expect(screen.queryByText("tags")).not.toBeInTheDocument();
  });
});
