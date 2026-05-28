import { create } from "zustand";
import { readTextFile, writeTextFile, mkdir } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { useSettingsStore } from "./settingsStore";
import { DEFAULT_TEMPLATE } from "../constants/defaultTemplate";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// テンプレートファイルの保存先サブフォルダ名
export const TEMPLATE_DIR = "templates";
// テンプレートファイル名
export const TEMPLATE_FILE = "default.md";

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface TemplateState {
  // エディタの現在の内容
  content: string;

  // 未保存の変更がある場合 true
  isDirty: boolean;

  // ファイル保存中の場合 true
  isSaving: boolean;

  // テンプレートが読み込み済みの場合 true
  isLoaded: boolean;

  // テンプレートファイルを読み込む。ファイルがなければ DEFAULT_TEMPLATE を使う
  loadTemplate: () => Promise<void>;

  // エディタの入力内容を更新し、未保存状態にする
  setContent: (content: string) => void;

  // 現在の内容をテンプレートファイルに保存する
  saveTemplate: () => Promise<void>;
}

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// settingsStore から保存パスを取得する
function getSavePath(): string | null {
  return useSettingsStore.getState().savePath;
}

// ────────────────────────────────────────────
// ストア
// ────────────────────────────────────────────

export const useTemplateStore = create<TemplateState>((set, get) => ({
  content: "",
  isDirty: false,
  isSaving: false,
  isLoaded: false,

  // ── テンプレートの読み込み ────────────────────────
  loadTemplate: async () => {
    if (get().isLoaded) return;
    const savePath = getSavePath();
    if (!savePath) return;

    try {
      const filePath = await join(savePath, TEMPLATE_DIR, TEMPLATE_FILE);
      const content = await readTextFile(filePath);
      set({ content, isDirty: false, isLoaded: true });
    } catch {
      // ファイルが存在しない場合はデフォルトテンプレートで初期化する
      set({ content: DEFAULT_TEMPLATE, isDirty: false, isLoaded: true });
    }
  },

  // ── エディタ入力の反映 ────────────────────────
  setContent: (content: string) => {
    set({ content, isDirty: true });
  },

  // ── テンプレートの保存 ────────────────────────
  saveTemplate: async () => {
    const savePath = getSavePath();
    if (!savePath) return;

    set({ isSaving: true });

    try {
      const dirPath = await join(savePath, TEMPLATE_DIR);
      const filePath = await join(dirPath, TEMPLATE_FILE);

      // templates/ フォルダが存在しない場合に備えて作成する
      await mkdir(dirPath, { recursive: true });
      await writeTextFile(filePath, get().content);

      set({ isSaving: false, isDirty: false });
    } catch (e) {
      set({ isSaving: false });
      throw e;
    }
  },
}));
