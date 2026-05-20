import { describe, it, expect, beforeEach, vi } from "vitest";
import { useDailyStore } from "./dailyStore";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("@tauri-apps/plugin-fs", () => ({
  readDir: vi.fn(),
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  mkdir: vi.fn(),
  remove: vi.fn(),
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
const mockReadDir      = vi.mocked(fs.readDir);
const mockReadTextFile = vi.mocked(fs.readTextFile);
const mockWriteTextFile = vi.mocked(fs.writeTextFile);
const mockRemove       = vi.mocked(fs.remove);

import { useSettingsStore } from "./settingsStore";
const mockGetState = vi.mocked(useSettingsStore.getState);

// ────────────────────────────────────────────
// ヘルパー
// ────────────────────────────────────────────

// readDir が返す DirEntry の最小実装
function dirEntry(name: string) {
  return { name, isFile: true, isDirectory: false, isSymlink: false };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetState.mockReturnValue({ savePath: "/test" } as ReturnType<typeof useSettingsStore.getState>);
  useDailyStore.setState({
    dateList: [],
    currentDate: null,
    content: "",
    isDirty: false,
    isLoading: false,
    isSaving: false,
  });
});

// ────────────────────────────────────────────
// scanDiaryFiles
// ────────────────────────────────────────────

describe("scanDiaryFiles", () => {
  it("savePath が null のときは dateList を変更しない", async () => {
    mockGetState.mockReturnValue({ savePath: null } as ReturnType<typeof useSettingsStore.getState>);
    await useDailyStore.getState().scanDiaryFiles();
    expect(useDailyStore.getState().dateList).toEqual([]);
  });

  it("diary/ フォルダが存在しないときは dateList が空になる", async () => {
    mockReadDir.mockRejectedValue(new Error("not found"));
    await useDailyStore.getState().scanDiaryFiles();
    expect(useDailyStore.getState().dateList).toEqual([]);
  });

  it("YYYY-MM-DD.md 形式のファイルだけを dateList に追加する", async () => {
    mockReadDir.mockResolvedValue([
      dirEntry("2024-01-01.md"),
      dirEntry("2024-01-03.md"),
      dirEntry("README.md"),     // 除外されるべき
      dirEntry("notes.txt"),     // 除外されるべき
    ]);
    await useDailyStore.getState().scanDiaryFiles();
    expect(useDailyStore.getState().dateList).toEqual(["2024-01-01", "2024-01-03"]);
  });

  it("dateList が日付順にソートされる", async () => {
    mockReadDir.mockResolvedValue([
      dirEntry("2024-03-01.md"),
      dirEntry("2024-01-15.md"),
      dirEntry("2024-02-10.md"),
    ]);
    await useDailyStore.getState().scanDiaryFiles();
    expect(useDailyStore.getState().dateList).toEqual([
      "2024-01-15",
      "2024-02-10",
      "2024-03-01",
    ]);
  });
});

// ────────────────────────────────────────────
// openDiary
// ────────────────────────────────────────────

describe("openDiary", () => {
  it("savePath が null のときは何もしない", async () => {
    mockGetState.mockReturnValue({ savePath: null } as ReturnType<typeof useSettingsStore.getState>);
    await useDailyStore.getState().openDiary("2024-01-01");
    expect(useDailyStore.getState().currentDate).toBeNull();
  });

  it("既存の日記はファイルを読み込んで content にセットする", async () => {
    useDailyStore.setState({ dateList: ["2024-01-01"] });
    mockReadTextFile.mockResolvedValue("今日の日記");
    await useDailyStore.getState().openDiary("2024-01-01");
    expect(useDailyStore.getState().content).toBe("今日の日記");
    expect(useDailyStore.getState().currentDate).toBe("2024-01-01");
    expect(useDailyStore.getState().isDirty).toBe(false);
    expect(useDailyStore.getState().isLoading).toBe(false);
  });

  it("新規の日記はテンプレートを展開して content にセットする", async () => {
    await useDailyStore.getState().openDiary("2024-01-08");
    // "2024-01-08" は月曜日
    expect(useDailyStore.getState().content).toBe("# 2024-01-08（月）");
    expect(useDailyStore.getState().currentDate).toBe("2024-01-08");
    expect(useDailyStore.getState().isDirty).toBe(false);
    expect(useDailyStore.getState().isLoading).toBe(false);
  });
});

// ────────────────────────────────────────────
// setContent
// ────────────────────────────────────────────

describe("setContent", () => {
  it("content が更新され isDirty が true になる", () => {
    useDailyStore.getState().setContent("新しい内容");
    expect(useDailyStore.getState().content).toBe("新しい内容");
    expect(useDailyStore.getState().isDirty).toBe(true);
  });
});

// ────────────────────────────────────────────
// saveDiary
// ────────────────────────────────────────────

describe("saveDiary", () => {
  it("savePath が null のときは保存しない", async () => {
    mockGetState.mockReturnValue({ savePath: null } as ReturnType<typeof useSettingsStore.getState>);
    await useDailyStore.getState().saveDiary();
    expect(mockWriteTextFile).not.toHaveBeenCalled();
  });

  it("currentDate が null のときは保存しない", async () => {
    await useDailyStore.getState().saveDiary();
    expect(mockWriteTextFile).not.toHaveBeenCalled();
  });

  it("保存後に isDirty と isSaving が false になる", async () => {
    useDailyStore.setState({ currentDate: "2024-01-01", content: "内容", isDirty: true });
    mockWriteTextFile.mockResolvedValue(undefined);
    await useDailyStore.getState().saveDiary();
    expect(useDailyStore.getState().isDirty).toBe(false);
    expect(useDailyStore.getState().isSaving).toBe(false);
  });

  it("新規の場合は dateList に追加してソートを維持する", async () => {
    useDailyStore.setState({ currentDate: "2024-02-01", content: "", dateList: ["2024-01-01", "2024-03-01"] });
    mockWriteTextFile.mockResolvedValue(undefined);
    await useDailyStore.getState().saveDiary();
    expect(useDailyStore.getState().dateList).toEqual(["2024-01-01", "2024-02-01", "2024-03-01"]);
  });

  it("既存の場合は dateList を変更しない", async () => {
    useDailyStore.setState({ currentDate: "2024-01-01", content: "", dateList: ["2024-01-01"] });
    mockWriteTextFile.mockResolvedValue(undefined);
    await useDailyStore.getState().saveDiary();
    expect(useDailyStore.getState().dateList).toEqual(["2024-01-01"]);
  });
});

// ────────────────────────────────────────────
// deleteDiary
// ────────────────────────────────────────────

describe("deleteDiary", () => {
  it("savePath が null のときは削除しない", async () => {
    mockGetState.mockReturnValue({ savePath: null } as ReturnType<typeof useSettingsStore.getState>);
    await useDailyStore.getState().deleteDiary("2024-01-01");
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("dateList から削除される", async () => {
    useDailyStore.setState({ dateList: ["2024-01-01", "2024-01-02"] });
    mockRemove.mockResolvedValue(undefined);
    await useDailyStore.getState().deleteDiary("2024-01-01");
    expect(useDailyStore.getState().dateList).toEqual(["2024-01-02"]);
  });

  it("開いている日記を削除するとエディタがリセットされる", async () => {
    useDailyStore.setState({ currentDate: "2024-01-01", content: "内容", isDirty: true, dateList: ["2024-01-01"] });
    mockRemove.mockResolvedValue(undefined);
    await useDailyStore.getState().deleteDiary("2024-01-01");
    expect(useDailyStore.getState().currentDate).toBeNull();
    expect(useDailyStore.getState().content).toBe("");
    expect(useDailyStore.getState().isDirty).toBe(false);
  });

  it("別の日記を削除してもエディタはリセットされない", async () => {
    useDailyStore.setState({ currentDate: "2024-01-02", content: "内容", dateList: ["2024-01-01", "2024-01-02"] });
    mockRemove.mockResolvedValue(undefined);
    await useDailyStore.getState().deleteDiary("2024-01-01");
    expect(useDailyStore.getState().currentDate).toBe("2024-01-02");
    expect(useDailyStore.getState().content).toBe("内容");
  });
});
