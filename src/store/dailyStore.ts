import { create } from "zustand";
import { readDir } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { useSettingsStore } from "./settingsStore";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// 日記ファイルの保存先サブフォルダ名
const DIARY_DIR = "diary";
// 日記ファイル名のパターン（YYYY-MM-DD.md）
const DIARY_FILE_PATTERN = /^\d{4}-\d{2}-\d{2}\.md$/;

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface DailyState {
  // スキャン済みの日付一覧（YYYY-MM-DD 形式）。カレンダー表示・存在確認に使う
  dateList: string[];

  // 起動時に diary/ フォルダをスキャンして dateList を構築する
  scanDiaryFiles: () => Promise<void>;
}

// ────────────────────────────────────────────
// ストア
// ────────────────────────────────────────────

export const useDailyStore = create<DailyState>((set) => ({
  dateList: [],

  // ── diary/ フォルダのスキャン ────────────────────────
  scanDiaryFiles: async () => {
    const savePath = useSettingsStore.getState().savePath;
    // 保存フォルダ未設定の場合はスキャンしない
    if (!savePath) return;

    const diaryPath = await join(savePath, DIARY_DIR);
    const entries = await readDir(diaryPath);

    const dates = entries
      .map((entry) => entry.name ?? "")
      // YYYY-MM-DD.md 形式のファイルだけを対象にする
      .filter((name) => DIARY_FILE_PATTERN.test(name))
      // 拡張子を除いた日付文字列（YYYY-MM-DD）に変換する
      .map((name) => name.replace(".md", ""))
      .sort();

    set({ dateList: dates });
  },
}));
