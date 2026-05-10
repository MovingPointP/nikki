import { create } from "zustand";
import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { useSettingsStore } from "./settingsStore";
import { DEFAULT_TEMPLATE } from "../constants/defaultTemplate";

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

  // 現在開いている日記の日付（未選択なら null）
  currentDate: string | null;

  // エディタの現在の内容
  content: string;

  // 未保存の変更がある場合 true
  isDirty: boolean;

  // ファイル読み込み中の場合 true
  isLoading: boolean;

  // 起動時に diary/ フォルダをスキャンして dateList を構築する
  scanDiaryFiles: () => Promise<void>;

  // 指定日の日記を開く。ファイルがなければテンプレートを適用して新規状態にする
  openDiary: (date: string) => Promise<void>;
}

// ────────────────────────────────────────────
// ストア
// ────────────────────────────────────────────

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

const DAY_NAMES = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];

// テンプレート文字列の {{date}} {{day}} を実際の値に展開する
function applyTemplate(template: string, date: string): string {
  const day = DAY_NAMES[new Date(date).getDay()];
  return template.replace("{{date}}", date).replace("{{day}}", day);
}

// ────────────────────────────────────────────
// ストア
// ────────────────────────────────────────────

export const useDailyStore = create<DailyState>((set, get) => ({
  dateList: [],
  currentDate: null,
  content: "",
  isDirty: false,
  isLoading: false,

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

  // ── 日記を開く ────────────────────────
  openDiary: async (date: string) => {
    const savePath = useSettingsStore.getState().savePath;
    if (!savePath) return;

    set({ isLoading: true });

    const fileExists = get().dateList.includes(date);
    let content: string;

    if (fileExists) {
      const filePath = await join(savePath, DIARY_DIR, `${date}.md`);
      content = await readTextFile(filePath);
    } else {
      content = applyTemplate(DEFAULT_TEMPLATE, date);
    }

    set({ currentDate: date, content, isDirty: false, isLoading: false });
  },
}));
