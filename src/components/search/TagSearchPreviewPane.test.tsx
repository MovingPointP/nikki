import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TagSearchPreviewPane from "./TagSearchPreviewPane";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("@tauri-apps/plugin-fs", () => ({
  readTextFile: vi.fn(),
}));
vi.mock("@tauri-apps/api/path", () => ({
  join: vi.fn((...parts: string[]) => Promise.resolve(parts.join("/"))),
}));
vi.mock("../../store/searchStore", () => ({
  useSearchStore: vi.fn(),
}));
vi.mock("../../store/settingsStore", () => ({
  useSettingsStore: vi.fn(),
}));

import * as fs from "@tauri-apps/plugin-fs";
import { useSearchStore } from "../../store/searchStore";
import { useSettingsStore } from "../../store/settingsStore";

const mockReadTextFile    = vi.mocked(fs.readTextFile);
const mockUseSearchStore  = vi.mocked(useSearchStore);
const mockUseSettingsStore = vi.mocked(useSettingsStore);

function setup(hoveredDate: string | null, savePath = "/test") {
  mockUseSearchStore.mockImplementation((selector: any) => selector({ hoveredDate }));
  mockUseSettingsStore.mockImplementation((selector: any) => selector({ savePath }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ────────────────────────────────────────────
// ヘッダー表示
// ────────────────────────────────────────────

describe("ヘッダー表示", () => {
  it("hoveredDate が null のとき「プレビュー」が表示される", () => {
    setup(null);
    render(<TagSearchPreviewPane />);
    expect(screen.getByText("プレビュー")).toBeInTheDocument();
  });

  it("hoveredDate が設定されるとヘッダーに日付が表示される", () => {
    setup("2024-01-01");
    mockReadTextFile.mockResolvedValue("本文");
    render(<TagSearchPreviewPane />);
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// プレビュー表示
// ────────────────────────────────────────────

describe("プレビュー表示", () => {
  it("ファイルが読み込まれると本文が表示される", async () => {
    setup("2024-01-01");
    mockReadTextFile.mockResolvedValue("今日はいい天気だった");
    render(<TagSearchPreviewPane />);
    await waitFor(() => {
      expect(screen.getByText("今日はいい天気だった")).toBeInTheDocument();
    });
  });

  it("フロントマターがある場合は本文のみ表示される", async () => {
    setup("2024-01-01");
    mockReadTextFile.mockResolvedValue("---\ntags: [旅行]\n---\n今日の日記");
    render(<TagSearchPreviewPane />);
    await waitFor(() => {
      expect(screen.getByText("今日の日記")).toBeInTheDocument();
    });
  });

  it("タグバッジが表示される", async () => {
    setup("2024-01-01");
    mockReadTextFile.mockResolvedValue("---\ntags: [旅行, 映画]\n---\n本文");
    render(<TagSearchPreviewPane />);
    await waitFor(() => {
      expect(screen.getByText("旅行")).toBeInTheDocument();
      expect(screen.getByText("映画")).toBeInTheDocument();
    });
  });

  it("ファイル読み込みに失敗しても何も表示されない", async () => {
    setup("2024-01-01");
    mockReadTextFile.mockRejectedValue(new Error("read error"));
    render(<TagSearchPreviewPane />);
    await waitFor(() => {
      expect(screen.queryByText("旅行")).not.toBeInTheDocument();
    });
  });
});
