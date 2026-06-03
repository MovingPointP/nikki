import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppInit } from "./useAppInit";
import { useSettingsStore } from "../store/settingsStore";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

// settingsStore が依存する Tauri モジュール
vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn(),
}));
vi.mock("@tauri-apps/api/webview", () => ({
  getCurrentWebview: vi.fn(),
}));

vi.mock("../store/dailyStore", () => ({
  useDailyStore: { getState: vi.fn() },
}));
vi.mock("../store/memoriesStore", () => ({
  useMemoriesStore: { getState: vi.fn() },
}));
vi.mock("../store/modalStore", () => ({
  useModalStore: { getState: vi.fn() },
}));
vi.mock("../utils/date", () => ({
  toDateString: vi.fn(() => "2026-06-03"),
}));

import { load } from "@tauri-apps/plugin-store";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { useDailyStore } from "../store/dailyStore";
import { useMemoriesStore } from "../store/memoriesStore";
import { useModalStore } from "../store/modalStore";

const mockLoad             = vi.mocked(load);
const mockGetCurrentWebview = vi.mocked(getCurrentWebview);

const mockScanDiaryFiles = vi.fn();
const mockOpenDiary      = vi.fn();
const mockInitTabs       = vi.fn();
const mockOpenModal      = vi.fn();

// ────────────────────────────────────────────
// セットアップ
// ────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks();

  // Tauri モックの再設定
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockLoad.mockResolvedValue({
    get: vi.fn().mockResolvedValue(undefined),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  } as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockGetCurrentWebview.mockReturnValue({
    setZoom: vi.fn().mockResolvedValue(undefined),
  } as any);

  // settingsStore をリセット
  useSettingsStore.setState({ savePath: null, isLoaded: false });

  // dailyStore のモック
  mockScanDiaryFiles.mockResolvedValue(undefined);
  mockOpenDiary.mockResolvedValue(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useDailyStore.getState).mockReturnValue({
    scanDiaryFiles: mockScanDiaryFiles,
    openDiary: mockOpenDiary,
    dateList: [],
  } as any);

  // memoriesStore のモック（デフォルトはアクティブタブなし）
  mockInitTabs.mockResolvedValue(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useMemoriesStore.getState).mockReturnValue({
    initTabs: mockInitTabs,
    tabs: [],
  } as any);

  // modalStore のモック
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useModalStore.getState).mockReturnValue({
    openModal: mockOpenModal,
  } as any);
});

// ────────────────────────────────────────────
// loadSettings
// ────────────────────────────────────────────

describe("loadSettings", () => {
  it("起動時に loadSettings が実行され isLoaded が true になる", async () => {
    renderHook(() => useAppInit());
    await act(async () => {});
    expect(useSettingsStore.getState().isLoaded).toBe(true);
  });
});

// ────────────────────────────────────────────
// 起動シーケンス（savePath が未設定）
// ────────────────────────────────────────────

describe("savePath が null のとき", () => {
  it("scanDiaryFiles を呼ばない", async () => {
    renderHook(() => useAppInit());
    await act(async () => {});
    expect(mockScanDiaryFiles).not.toHaveBeenCalled();
  });

  it("openDiary を呼ばない", async () => {
    renderHook(() => useAppInit());
    await act(async () => {});
    expect(mockOpenDiary).not.toHaveBeenCalled();
  });
});

// ────────────────────────────────────────────
// 起動シーケンス（savePath が設定済み）
// ────────────────────────────────────────────

describe("savePath が設定されたとき", () => {
  it("scanDiaryFiles → openDiary → initTabs の順に呼ばれる", async () => {
    const callOrder: string[] = [];
    mockScanDiaryFiles.mockImplementation(async () => { callOrder.push("scan"); });
    mockOpenDiary.mockImplementation(async () => { callOrder.push("open"); });
    mockInitTabs.mockImplementation(async () => { callOrder.push("init"); });

    renderHook(() => useAppInit());
    await act(async () => {
      useSettingsStore.setState({ savePath: "/test" });
    });

    expect(callOrder).toEqual(["scan", "open", "init"]);
  });

  it("openDiary に今日の日付が渡される", async () => {
    renderHook(() => useAppInit());
    await act(async () => {
      useSettingsStore.setState({ savePath: "/test" });
    });
    expect(mockOpenDiary).toHaveBeenCalledWith("2026-06-03");
  });

  it("initTabs に dateList と今日の日付が渡される", async () => {
    vi.mocked(useDailyStore.getState).mockReturnValue({
      scanDiaryFiles: mockScanDiaryFiles,
      openDiary: mockOpenDiary,
      dateList: ["2026-05-01", "2026-06-03"],
    } as unknown as ReturnType<typeof useDailyStore.getState>);

    renderHook(() => useAppInit());
    await act(async () => {
      useSettingsStore.setState({ savePath: "/test" });
    });
    expect(mockInitTabs).toHaveBeenCalledWith(["2026-05-01", "2026-06-03"], "2026-06-03");
  });
});

// ────────────────────────────────────────────
// Memories モーダルの表示制御
// ────────────────────────────────────────────

describe("Memories モーダル", () => {
  it("初回起動でアクティブタブがあればモーダルを開く", async () => {
    vi.mocked(useMemoriesStore.getState).mockReturnValue({
      initTabs: mockInitTabs,
      tabs: [{ label: "1か月前", date: "2026-05-03", content: "内容", isActive: true }],
    } as unknown as ReturnType<typeof useMemoriesStore.getState>);

    renderHook(() => useAppInit());
    await act(async () => {
      useSettingsStore.setState({ savePath: "/test" });
    });

    expect(mockOpenModal).toHaveBeenCalledWith("memories");
  });

  it("初回起動でアクティブタブがなければモーダルを開かない", async () => {
    vi.mocked(useMemoriesStore.getState).mockReturnValue({
      initTabs: mockInitTabs,
      tabs: [{ label: "1か月前", date: null, content: null, isActive: false }],
    } as unknown as ReturnType<typeof useMemoriesStore.getState>);

    renderHook(() => useAppInit());
    await act(async () => {
      useSettingsStore.setState({ savePath: "/test" });
    });

    expect(mockOpenModal).not.toHaveBeenCalled();
  });

  it("savePath の変更が2回目のときはモーダルを開かない", async () => {
    vi.mocked(useMemoriesStore.getState).mockReturnValue({
      initTabs: mockInitTabs,
      tabs: [{ label: "1か月前", date: "2026-05-03", content: "内容", isActive: true }],
    } as unknown as ReturnType<typeof useMemoriesStore.getState>);

    renderHook(() => useAppInit());

    // 1回目（初回起動）
    await act(async () => {
      useSettingsStore.setState({ savePath: "/first" });
    });
    expect(mockOpenModal).toHaveBeenCalledOnce();
    mockOpenModal.mockClear();

    // 2回目（設定画面からの変更を想定）
    await act(async () => {
      useSettingsStore.setState({ savePath: "/second" });
    });
    expect(mockOpenModal).not.toHaveBeenCalled();
  });
});

// ────────────────────────────────────────────
// エラーハンドリング
// ────────────────────────────────────────────

describe("エラーハンドリング", () => {
  it("初期化中にエラーが発生したとき console.error を呼ぶ", async () => {
    mockScanDiaryFiles.mockRejectedValue(new Error("scan failed"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderHook(() => useAppInit());
    await act(async () => {
      useSettingsStore.setState({ savePath: "/test" });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to initialize diary or memories:",
      expect.any(Error),
    );
  });
});
