import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSettingsStore } from "./settingsStore";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn(),
}));

import { load } from "@tauri-apps/plugin-store";
const mockLoad = vi.mocked(load);

// plugin-store が返すストアオブジェクトの最小実装
function createMockStore(savedPath: string | undefined = undefined) {
  return {
    get: vi.fn().mockResolvedValue(savedPath),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  } as unknown as Awaited<ReturnType<typeof load>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  useSettingsStore.setState({ savePath: null, isLoaded: false });
});

// ────────────────────────────────────────────
// loadSettings
// ────────────────────────────────────────────

describe("loadSettings", () => {
  it("保存パスが設定されている場合は savePath にセットする", async () => {
    mockLoad.mockResolvedValue(createMockStore("/home/user/diary"));
    await useSettingsStore.getState().loadSettings();
    expect(useSettingsStore.getState().savePath).toBe("/home/user/diary");
    expect(useSettingsStore.getState().isLoaded).toBe(true);
  });

  it("保存パスが未設定（undefined）の場合は savePath が null になる", async () => {
    mockLoad.mockResolvedValue(createMockStore(undefined));
    await useSettingsStore.getState().loadSettings();
    expect(useSettingsStore.getState().savePath).toBeNull();
    expect(useSettingsStore.getState().isLoaded).toBe(true);
  });

  it("読み込み失敗時も isLoaded が true になり savePath は null のまま", async () => {
    mockLoad.mockRejectedValue(new Error("file not found"));
    await useSettingsStore.getState().loadSettings();
    expect(useSettingsStore.getState().savePath).toBeNull();
    expect(useSettingsStore.getState().isLoaded).toBe(true);
  });
});

// ────────────────────────────────────────────
// setSavePath
// ────────────────────────────────────────────

describe("setSavePath", () => {
  it("savePath が更新され isLoaded が true になる", async () => {
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().setSavePath("/new/path");
    expect(useSettingsStore.getState().savePath).toBe("/new/path");
    expect(useSettingsStore.getState().isLoaded).toBe(true);
  });

  it("store.set と store.save が呼ばれる", async () => {
    const mockStore = createMockStore();
    mockLoad.mockResolvedValue(mockStore);
    await useSettingsStore.getState().setSavePath("/new/path");
    expect(mockStore.set).toHaveBeenCalledWith("savePath", "/new/path");
    expect(mockStore.save).toHaveBeenCalled();
  });
});
