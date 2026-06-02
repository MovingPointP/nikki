import { describe, it, expect, beforeEach, vi } from "vitest";
import { useMemoriesStore } from "./memoriesStore";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("@tauri-apps/plugin-fs", () => ({
  readTextFile: vi.fn(),
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

import * as fs from "@tauri-apps/plugin-fs";
const mockReadTextFile = vi.mocked(fs.readTextFile);

import { useSettingsStore } from "./settingsStore";
const mockGetState = vi.mocked(useSettingsStore.getState);

// ────────────────────────────────────────────
// セットアップ
// ────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockGetState.mockReturnValue({ savePath: "/test" } as ReturnType<typeof useSettingsStore.getState>);
  mockReadTextFile.mockResolvedValue("日記の内容");
  useMemoriesStore.setState({ tabs: [], activeTabIndex: 0 });
});

// ────────────────────────────────────────────
// initTabs
// ────────────────────────────────────────────

describe("initTabs", () => {
  it("savePath が null のときは tabs を変更しない", async () => {
    mockGetState.mockReturnValue({ savePath: null } as ReturnType<typeof useSettingsStore.getState>);
    await useMemoriesStore.getState().initTabs(["2026-05-03"], "2026-06-03");
    expect(useMemoriesStore.getState().tabs).toEqual([]);
  });

  it("タブのラベルが TAB_DEFINITIONS の順に設定される", async () => {
    await useMemoriesStore.getState().initTabs([], "2026-06-03");
    const labels = useMemoriesStore.getState().tabs.map((t) => t.label);
    expect(labels).toEqual(["1か月前", "1年前", "ランダム"]);
  });

  it("1か月前のタブの日付が正しく計算される", async () => {
    await useMemoriesStore.getState().initTabs([], "2026-06-03");
    expect(useMemoriesStore.getState().tabs[0].date).toBe("2026-05-03");
  });

  it("1年前のタブの日付が正しく計算される", async () => {
    await useMemoriesStore.getState().initTabs([], "2026-06-03");
    expect(useMemoriesStore.getState().tabs[1].date).toBe("2025-06-03");
  });

  it("月末またぎ：3月31日の1か月前は2月28日になる", async () => {
    await useMemoriesStore.getState().initTabs([], "2026-03-31");
    expect(useMemoriesStore.getState().tabs[0].date).toBe("2026-02-28");
  });

  it("うるう年またぎ：2024年2月29日の1年前は2023年2月28日になる", async () => {
    await useMemoriesStore.getState().initTabs([], "2024-02-29");
    expect(useMemoriesStore.getState().tabs[1].date).toBe("2023-02-28");
  });

  it("日記が存在するタブは isActive: true になり content が設定される", async () => {
    await useMemoriesStore.getState().initTabs(["2026-05-03"], "2026-06-03");
    const monthAgoTab = useMemoriesStore.getState().tabs[0];
    expect(monthAgoTab.isActive).toBe(true);
    expect(monthAgoTab.content).toBe("日記の内容");
  });

  it("日記が存在しないタブは isActive: false になり content が null になる", async () => {
    await useMemoriesStore.getState().initTabs([], "2026-06-03");
    const tabs = useMemoriesStore.getState().tabs;
    expect(tabs[0].isActive).toBe(false);
    expect(tabs[0].content).toBeNull();
  });

  it("最初のアクティブタブが activeTabIndex になる", async () => {
    // 1年前のみ日記がある → index 1 が最初のアクティブタブ
    await useMemoriesStore.getState().initTabs(["2025-06-03"], "2026-06-03");
    expect(useMemoriesStore.getState().activeTabIndex).toBe(1);
  });

  it("アクティブなタブが1つもない場合は activeTabIndex が 0 になる", async () => {
    await useMemoriesStore.getState().initTabs([], "2026-06-03");
    expect(useMemoriesStore.getState().activeTabIndex).toBe(0);
  });

  it("ランダムタブは今日・1か月前・1年前と重複しない", async () => {
    const today    = "2026-06-03";
    const monthAgo = "2026-05-03";
    const yearAgo  = "2025-06-03";
    const other    = "2026-01-01";
    await useMemoriesStore.getState().initTabs([today, monthAgo, yearAgo, other], today);
    expect(useMemoriesStore.getState().tabs[2].date).toBe(other);
  });

  it("ランダムの候補がない場合は date が null になり isActive: false になる", async () => {
    const today    = "2026-06-03";
    const monthAgo = "2026-05-03";
    const yearAgo  = "2025-06-03";
    // dateList が今日・1か月前・1年前のみで候補なし
    await useMemoriesStore.getState().initTabs([today, monthAgo, yearAgo], today);
    const randomTab = useMemoriesStore.getState().tabs[2];
    expect(randomTab.date).toBeNull();
    expect(randomTab.isActive).toBe(false);
  });
});

// ────────────────────────────────────────────
// setActiveTabIndex
// ────────────────────────────────────────────

describe("setActiveTabIndex", () => {
  beforeEach(() => {
    useMemoriesStore.setState({
      tabs: [
        { label: "1か月前",  date: "2026-05-03", content: "内容", isActive: true  },
        { label: "1年前",    date: "2025-06-03", content: null,   isActive: false },
        { label: "ランダム", date: "2026-01-01", content: "内容", isActive: true  },
      ],
      activeTabIndex: 0,
    });
  });

  it("アクティブなタブに切り替えられる", () => {
    useMemoriesStore.getState().setActiveTabIndex(2);
    expect(useMemoriesStore.getState().activeTabIndex).toBe(2);
  });

  it("非アクティブなタブには切り替えられない", () => {
    useMemoriesStore.getState().setActiveTabIndex(1);
    expect(useMemoriesStore.getState().activeTabIndex).toBe(0);
  });

  it("範囲外のインデックスを渡しても切り替えられない", () => {
    useMemoriesStore.getState().setActiveTabIndex(99);
    expect(useMemoriesStore.getState().activeTabIndex).toBe(0);
  });
});
