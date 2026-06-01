import { create } from "zustand";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { useSettingsStore } from "./settingsStore";
import { toDateString } from "../utils/date";
import { DIARY_DIR } from "../constants/diary";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// タブ定義。順序が表示順になる。
const TAB_DEFINITIONS = [
  { label: "1か月前", type: "monthAgo" as const },
  { label: "1年前",   type: "yearAgo"  as const },
  { label: "ランダム", type: "random"   as const },
];

type TabType = (typeof TAB_DEFINITIONS)[number]["type"];

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

export interface MemoriesTab {
  // タブの表示ラベル
  label: string;
  // 表示対象の日付（YYYY-MM-DD）。ランダムで候補なしの場合は null
  date: string | null;
  // 読み込み済みの日記本文。日記が存在しない場合は null
  content: string | null;
  // 対応する日記ファイルが存在するか
  isActive: boolean;
}

interface MemoriesState {
  // タブの一覧（TAB_DEFINITIONS の定義順）
  tabs: MemoriesTab[];
  // 現在選択中のタブインデックス
  activeTabIndex: number;

  // 起動時にタブを初期化し、各日記コンテンツを読み込む
  initTabs: (dateList: string[], today: string) => Promise<void>;
  // タブを切り替える（isActive が false のタブには切り替えない）
  setActiveTabIndex: (index: number) => void;
}

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// n か月前の日付を YYYY-MM-DD で返す。月末をまたぐ場合は対象月の末日にクランプする
function subMonths(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  // 対象月の1日を作成
  const target = new Date(y, m - 1 - n, 1);
  // 対象月の末日を取得
  const maxDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  // 元の日か末日の小さいほうをセット
  target.setDate(Math.min(d, maxDay));
  return toDateString(target);
}

// n 年前の日付を YYYY-MM-DD で返す。うるう年をまたぐ場合は 2/28 にクランプする
function subYears(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y - n, m - 1, 1);
  const maxDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d, maxDay));
  return toDateString(target);
}

// 除外リストに含まれない日付からランダムに 1 件選ぶ。候補がなければ null を返す
function pickRandom(dateList: string[], exclude: string[]): string | null {
  const excludeSet = new Set(exclude);
  const candidates = dateList.filter((d) => !excludeSet.has(d));
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// タブ種別ごとに表示対象の日付を決定する
function resolveDate(
  type: TabType,
  today: string,
  dateList: string[],
  exclude: string[]
): string | null {
  switch (type) {
    case "monthAgo": return subMonths(today, 1);
    case "yearAgo":  return subYears(today, 1);
    case "random":   return pickRandom(dateList, exclude);
  }
}

// 指定日の日記本文をファイルから読み込む。失敗した場合は null を返す
async function loadContent(savePath: string, dateStr: string): Promise<string | null> {
  try {
    const filePath = await join(savePath, DIARY_DIR, `${dateStr}.md`);
    return await readTextFile(filePath);
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────
// ストア
// ────────────────────────────────────────────

export const useMemoriesStore = create<MemoriesState>((set) => ({
  tabs: [],
  activeTabIndex: 0,

  // ── タブの初期化 ────────────────────────
  initTabs: async (dateList: string[], today: string) => {
    const savePath = useSettingsStore.getState().savePath;
    if (!savePath) return;

    const dateSet = new Set(dateList);

    // ランダムの除外リストをタブ順に構築しながら全タブの日付を確定する
    const exclude = [today];
    const resolvedDates: (string | null)[] = [];
    for (const def of TAB_DEFINITIONS) {
      const date = resolveDate(def.type, today, dateList, exclude);
      resolvedDates.push(date);
      if (date) exclude.push(date);
    }

    // 各タブのコンテンツを並行して読み込む
    const contents = await Promise.all(
      resolvedDates.map((date) =>
        date && dateSet.has(date)
          ? loadContent(savePath, date)
          : Promise.resolve(null)
      )
    );

    const tabs: MemoriesTab[] = TAB_DEFINITIONS.map((def, i) => ({
      label:    def.label,
      date:     resolvedDates[i],
      content:  contents[i],
      isActive: contents[i] !== null,
    }));

    // アクティブなタブのうち最初のものを選ぶ（「1か月前」が先頭のため自然に優先される）
    const activeTabIndex = tabs.findIndex((t) => t.isActive);

    set({ tabs, activeTabIndex: Math.max(activeTabIndex, 0) });
  },

  // ── タブの切り替え ────────────────────────
  setActiveTabIndex: (index: number) => {
    set((s) => {
      if (!s.tabs[index]?.isActive) return s;
      return { activeTabIndex: index };
    });
  },
}));
