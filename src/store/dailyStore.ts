import { create } from "zustand";
import { readDir, readTextFile, writeTextFile, mkdir, remove } from "@tauri-apps/plugin-fs";
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
// 曜日名（Date.getDay() のインデックスに対応）
const DAY_NAMES = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];

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

  // ファイル保存中の場合 true
  isSaving: boolean;

  // 起動時に diary/ フォルダをスキャンして dateList を構築する
  scanDiaryFiles: () => Promise<void>;

  // 指定日の日記を開く。ファイルがなければテンプレートを適用して新規状態にする
  openDiary: (date: string) => Promise<void>;

  // エディタの入力内容を更新し、未保存状態にする
  setContent: (content: string) => void;

  // 現在の内容をファイルに保存する。新規の場合は dateList にも追加する
  saveDiary: () => Promise<void>;

  // 指定日の日記を削除する。開いている場合はエディタもリセットする
  deleteDiary: (date: string) => Promise<void>;
}

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// settingsStore から保存パスを取得する
function getSavePath(): string | null {
  return useSettingsStore.getState().savePath;
}

// テンプレート文字列の {{date}} {{day}} を実際の値に展開する
function applyTemplate(template: string, date: string): string {
  // JST の 00:00:00 として解釈させることで UTC ずれを防ぐ
  const day = DAY_NAMES[new Date(`${date}T00:00:00+09:00`).getDay()];
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
  isSaving: false,

  // ── diary/ フォルダのスキャン ────────────────────────
  scanDiaryFiles: async () => {
    const savePath = getSavePath();
    // 保存フォルダ未設定の場合はスキャンしない
    if (!savePath) return;

    const diaryPath = await join(savePath, DIARY_DIR);
    // diary/ フォルダが未作成の場合（初回起動時など）は空リストで終了する
    let entries;
    try {
      entries = await readDir(diaryPath);
    } catch {
      set({ dateList: [] });
      return;
    }

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
    const savePath = getSavePath();
    if (!savePath) return;

    set({ isLoading: true });

    try {
      const fileExists = get().dateList.includes(date);
      let content: string;

      if (fileExists) {
        const filePath = await join(savePath, DIARY_DIR, `${date}.md`);
        content = await readTextFile(filePath);
      } else {
        content = applyTemplate(DEFAULT_TEMPLATE, date);
      }

      set({ currentDate: date, content, isDirty: false, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  // ── エディタ入力の反映 ────────────────────────
  setContent: (content: string) => {
    set({ content, isDirty: true });
  },

  // ── 日記の保存 ────────────────────────
  saveDiary: async () => {
    const savePath = getSavePath();
    const { currentDate, content, dateList } = get();
    if (!savePath || !currentDate) return;

    set({ isSaving: true });

    try {
      const diaryPath = await join(savePath, DIARY_DIR);
      const filePath = await join(diaryPath, `${currentDate}.md`);

      // diary/ フォルダが存在しない場合に備えて作成する
      await mkdir(diaryPath, { recursive: true });
      await writeTextFile(filePath, content);

      // 新規作成の場合は dateList に追加してソートを維持する
      if (!dateList.includes(currentDate)) {
        set({ isSaving: false, isDirty: false, dateList: [...dateList, currentDate].sort() });
      } else {
        set({ isSaving: false, isDirty: false });
      }
    } catch (e) {
      set({ isSaving: false });
      throw e;
    }
  },

  // ── 日記の削除 ────────────────────────
  deleteDiary: async (date: string) => {
    const savePath = getSavePath();
    if (!savePath) return;

    const filePath = await join(savePath, DIARY_DIR, `${date}.md`);
    await remove(filePath);

    const { currentDate, dateList } = get();

    // 削除した日記を開いている場合はエディタをリセットする
    const editorReset = currentDate === date
      ? { currentDate: null, content: "", isDirty: false }
      : {};

    set({ dateList: dateList.filter((d) => d !== date), ...editorReset });
  },
}));
