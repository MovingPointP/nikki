import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTemplateStore } from "./templateStore";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("@tauri-apps/plugin-fs", () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  mkdir: vi.fn(),
}));

// join(...parts) をスラッシュ結合で代替する
vi.mock("@tauri-apps/api/path", () => ({
  join: vi.fn((...parts: string[]) => Promise.resolve(parts.join("/"))),
}));

vi.mock("./settingsStore", () => ({
  useSettingsStore: {
    getState: vi.fn(),
  },
}));

vi.mock("../constants/defaultTemplate", () => ({
  DEFAULT_TEMPLATE: "# {{date}}（{{day}}）",
}));

// モック関数を型付きで取り出す
import * as fs from "@tauri-apps/plugin-fs";
const mockReadTextFile  = vi.mocked(fs.readTextFile);
const mockWriteTextFile = vi.mocked(fs.writeTextFile);
const mockMkdir         = vi.mocked(fs.mkdir);

import { useSettingsStore } from "./settingsStore";
const mockGetState = vi.mocked(useSettingsStore.getState);

// ────────────────────────────────────────────
// セットアップ
// ────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockGetState.mockReturnValue({ savePath: "/test" } as ReturnType<typeof useSettingsStore.getState>);
  useTemplateStore.setState({
    content: "",
    isDirty: false,
    isSaving: false,
    isLoaded: false,
  });
});

// ────────────────────────────────────────────
// loadTemplate
// ────────────────────────────────────────────

describe("loadTemplate", () => {
  it("savePath が null のときは content を変更しない", async () => {
    mockGetState.mockReturnValue({ savePath: null } as ReturnType<typeof useSettingsStore.getState>);
    await useTemplateStore.getState().loadTemplate();
    expect(useTemplateStore.getState().content).toBe("");
  });

  it("テンプレートファイルが存在するときはその内容を content にセットする", async () => {
    mockReadTextFile.mockResolvedValue("# カスタムテンプレート");
    await useTemplateStore.getState().loadTemplate();
    expect(useTemplateStore.getState().content).toBe("# カスタムテンプレート");
    expect(useTemplateStore.getState().isDirty).toBe(false);
  });

  it("フロントマターが含まれている場合は本文のみをセットする", async () => {
    mockReadTextFile.mockResolvedValue("---\ntags: []\n---\n# テンプレート");
    await useTemplateStore.getState().loadTemplate();
    expect(useTemplateStore.getState().content).toBe("# テンプレート");
  });

  it("テンプレートファイルが存在しないときは DEFAULT_TEMPLATE を使う", async () => {
    mockReadTextFile.mockRejectedValue(new Error("not found"));
    await useTemplateStore.getState().loadTemplate();
    expect(useTemplateStore.getState().content).toBe("# {{date}}（{{day}}）");
    expect(useTemplateStore.getState().isDirty).toBe(false);
  });

  it("正しいパス（savePath/templates/default.md）を読みに行く", async () => {
    mockReadTextFile.mockResolvedValue("");
    await useTemplateStore.getState().loadTemplate();
    expect(mockReadTextFile).toHaveBeenCalledWith("/test/templates/default.md");
  });
});

// ────────────────────────────────────────────
// setContent
// ────────────────────────────────────────────

describe("setContent", () => {
  it("content が更新され isDirty が true になる", () => {
    useTemplateStore.getState().setContent("新しい内容");
    expect(useTemplateStore.getState().content).toBe("新しい内容");
    expect(useTemplateStore.getState().isDirty).toBe(true);
  });
});

// ────────────────────────────────────────────
// saveTemplate
// ────────────────────────────────────────────

describe("saveTemplate", () => {
  it("savePath が null のときは保存しない", async () => {
    mockGetState.mockReturnValue({ savePath: null } as ReturnType<typeof useSettingsStore.getState>);
    await useTemplateStore.getState().saveTemplate();
    expect(mockWriteTextFile).not.toHaveBeenCalled();
  });

  it("正しいパス（savePath/templates/default.md）に保存する", async () => {
    useTemplateStore.setState({ content: "# テンプレート" });
    mockWriteTextFile.mockResolvedValue(undefined);
    await useTemplateStore.getState().saveTemplate();
    expect(mockWriteTextFile).toHaveBeenCalledWith("/test/templates/default.md", "# テンプレート");
  });

  it("保存前に templates/ フォルダを作成する", async () => {
    mockWriteTextFile.mockResolvedValue(undefined);
    await useTemplateStore.getState().saveTemplate();
    expect(mockMkdir).toHaveBeenCalledWith("/test/templates", { recursive: true });
  });

  it("content にフロントマターが含まれている場合はエラーをスローする", async () => {
    useTemplateStore.setState({ content: "---\ntags: []\n---\n本文" });
    await expect(useTemplateStore.getState().saveTemplate()).rejects.toThrow();
    expect(mockWriteTextFile).not.toHaveBeenCalled();
  });

  it("保存後に isDirty と isSaving が false になる", async () => {
    useTemplateStore.setState({ content: "内容", isDirty: true });
    mockWriteTextFile.mockResolvedValue(undefined);
    await useTemplateStore.getState().saveTemplate();
    expect(useTemplateStore.getState().isDirty).toBe(false);
    expect(useTemplateStore.getState().isSaving).toBe(false);
  });
});
