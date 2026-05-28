import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PreviewPane from "./PreviewPane";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("../store/dailyStore");

import { useDailyStore } from "../store/dailyStore";
const mockUseDailyStore = vi.mocked(useDailyStore);

// セレクタを受け取って状態から値を返すヘルパー
function mockState(state: { content: string; currentDate: string | null }) {
  mockUseDailyStore.mockImplementation((selector) =>
    selector(state as Parameters<typeof selector>[0])
  );
}

beforeEach(() => {
  mockState({ content: "", currentDate: null });
});

// ────────────────────────────────────────────
// ヘッダー表示
// ────────────────────────────────────────────

describe("ヘッダー表示", () => {
  it("「プレビュー」ラベルが常に表示される", () => {
    render(<PreviewPane />);
    expect(screen.getByText("プレビュー")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// プレビュー本文
// ────────────────────────────────────────────

describe("プレビュー本文", () => {
  it("currentDate が null のときマークダウンが表示されない", () => {
    mockState({ content: "# Hello", currentDate: null });
    render(<PreviewPane />);
    // level: 1 で h1 のみ確認（MUI Typography の h6 と区別する）
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });

  it("currentDate が設定されているときコンテンツが表示される", () => {
    mockState({ content: "# Hello", currentDate: "2024-01-01" });
    render(<PreviewPane />);
    expect(screen.getByRole("heading", { level: 1, name: "Hello" })).toBeInTheDocument();
  });

  it("フロントマターが除去されて表示される", () => {
    mockState({
      content: "---\ntags: []\n---\n\n# 本文",
      currentDate: "2024-01-01",
    });
    render(<PreviewPane />);
    expect(screen.getByRole("heading", { level: 1, name: "本文" })).toBeInTheDocument();
    expect(screen.queryByText("tags")).not.toBeInTheDocument();
  });
});
