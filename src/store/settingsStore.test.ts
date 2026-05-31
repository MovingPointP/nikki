import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSettingsStore } from "./settingsStore";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn(),
}));

vi.mock("@tauri-apps/api/webview", () => ({
  getCurrentWebview: vi.fn(),
}));

import { load } from "@tauri-apps/plugin-store";
import { getCurrentWebview } from "@tauri-apps/api/webview";
const mockLoad = vi.mocked(load);
const mockGetCurrentWebview = vi.mocked(getCurrentWebview);

// WebView オブジェクトの最小実装
function createMockWebview() {
  return { setZoom: vi.fn().mockResolvedValue(undefined) };
}

// plugin-store が返すストアオブジェクトの最小実装
// キーごとに返す値を指定できる
function createMockStore({
  savePath,
  zoomLevel,
}: { savePath?: string; zoomLevel?: number } = {}) {
  return {
    get: vi.fn().mockImplementation(async (key: string) => {
      if (key === "savePath") return savePath;
      if (key === "zoomLevel") return zoomLevel;
      return undefined;
    }),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  } as unknown as Awaited<ReturnType<typeof load>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  useSettingsStore.setState({ savePath: null, isLoaded: false, zoomLevel: 1.0 });

  // デフォルトで webview モックを差し込む
  mockGetCurrentWebview.mockReturnValue(createMockWebview() as unknown as ReturnType<typeof getCurrentWebview>);
});

// ────────────────────────────────────────────
// loadSettings
// ────────────────────────────────────────────

describe("loadSettings", () => {
  it("保存パスが設定されている場合は savePath にセットする", async () => {
    mockLoad.mockResolvedValue(createMockStore({ savePath: "/home/user/diary" }));
    await useSettingsStore.getState().loadSettings();
    expect(useSettingsStore.getState().savePath).toBe("/home/user/diary");
    expect(useSettingsStore.getState().isLoaded).toBe(true);
  });

  it("保存パスが未設定（undefined）の場合は savePath が null になる", async () => {
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().loadSettings();
    expect(useSettingsStore.getState().savePath).toBeNull();
    expect(useSettingsStore.getState().isLoaded).toBe(true);
  });

  it("保存済みの zoomLevel を state にセットする", async () => {
    mockLoad.mockResolvedValue(createMockStore({ zoomLevel: 1.5 }));
    await useSettingsStore.getState().loadSettings();
    expect(useSettingsStore.getState().zoomLevel).toBe(1.5);
  });

  it("zoomLevel が未設定の場合はデフォルト値 1.0 になる", async () => {
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().loadSettings();
    expect(useSettingsStore.getState().zoomLevel).toBe(1.0);
  });

  it("保存済みの zoomLevel を WebView に適用する", async () => {
    const mockWebview = createMockWebview();
    mockGetCurrentWebview.mockReturnValue(mockWebview as unknown as ReturnType<typeof getCurrentWebview>);
    mockLoad.mockResolvedValue(createMockStore({ zoomLevel: 1.2 }));
    await useSettingsStore.getState().loadSettings();
    expect(mockWebview.setZoom).toHaveBeenCalledWith(1.2);
  });

  it("zoomLevel 未設定時は WebView にデフォルト値 1.0 を適用する", async () => {
    const mockWebview = createMockWebview();
    mockGetCurrentWebview.mockReturnValue(mockWebview as unknown as ReturnType<typeof getCurrentWebview>);
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().loadSettings();
    expect(mockWebview.setZoom).toHaveBeenCalledWith(1.0);
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

// ────────────────────────────────────────────
// setZoomLevel
// ────────────────────────────────────────────

describe("setZoomLevel", () => {
  it("指定した値が state に反映される", async () => {
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().setZoomLevel(1.5);
    expect(useSettingsStore.getState().zoomLevel).toBe(1.5);
  });

  it("WebView の setZoom が呼ばれる", async () => {
    const mockWebview = createMockWebview();
    mockGetCurrentWebview.mockReturnValue(mockWebview as unknown as ReturnType<typeof getCurrentWebview>);
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().setZoomLevel(1.5);
    expect(mockWebview.setZoom).toHaveBeenCalledWith(1.5);
  });

  it("store.set と store.save が呼ばれる", async () => {
    const mockStore = createMockStore();
    mockLoad.mockResolvedValue(mockStore);
    await useSettingsStore.getState().setZoomLevel(1.5);
    expect(mockStore.set).toHaveBeenCalledWith("zoomLevel", 1.5);
    expect(mockStore.save).toHaveBeenCalled();
  });

  it("最小値 0.5 より小さい値はクランプされる", async () => {
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().setZoomLevel(0.1);
    expect(useSettingsStore.getState().zoomLevel).toBe(0.5);
  });

  it("最大値 3.0 より大きい値はクランプされる", async () => {
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().setZoomLevel(5.0);
    expect(useSettingsStore.getState().zoomLevel).toBe(3.0);
  });

  it("範囲内の値はそのまま設定される", async () => {
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().setZoomLevel(2.0);
    expect(useSettingsStore.getState().zoomLevel).toBe(2.0);
  });

  it("クランプ後の値が WebView と store に渡される", async () => {
    const mockWebview = createMockWebview();
    mockGetCurrentWebview.mockReturnValue(mockWebview as unknown as ReturnType<typeof getCurrentWebview>);
    const mockStore = createMockStore();
    mockLoad.mockResolvedValue(mockStore);
    await useSettingsStore.getState().setZoomLevel(10.0);
    expect(mockWebview.setZoom).toHaveBeenCalledWith(3.0);
    expect(mockStore.set).toHaveBeenCalledWith("zoomLevel", 3.0);
  });
});

// ────────────────────────────────────────────
// zoomIn / zoomOut / zoomReset
// ────────────────────────────────────────────

describe("zoomIn", () => {
  it("現在のズームレベルを 0.1 拡大する", async () => {
    useSettingsStore.setState({ zoomLevel: 1.0 });
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().zoomIn();
    expect(useSettingsStore.getState().zoomLevel).toBeCloseTo(1.1);
  });

  it("最大値 3.0 を超えない", async () => {
    useSettingsStore.setState({ zoomLevel: 3.0 });
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().zoomIn();
    expect(useSettingsStore.getState().zoomLevel).toBe(3.0);
  });
});

describe("zoomOut", () => {
  it("現在のズームレベルを 0.1 縮小する", async () => {
    useSettingsStore.setState({ zoomLevel: 1.0 });
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().zoomOut();
    expect(useSettingsStore.getState().zoomLevel).toBeCloseTo(0.9);
  });

  it("最小値 0.5 を下回らない", async () => {
    useSettingsStore.setState({ zoomLevel: 0.5 });
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().zoomOut();
    expect(useSettingsStore.getState().zoomLevel).toBe(0.5);
  });
});

describe("zoomReset", () => {
  it("ズームレベルを 1.0 にリセットする", async () => {
    useSettingsStore.setState({ zoomLevel: 2.5 });
    mockLoad.mockResolvedValue(createMockStore());
    await useSettingsStore.getState().zoomReset();
    expect(useSettingsStore.getState().zoomLevel).toBe(1.0);
  });
});
