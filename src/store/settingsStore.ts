import { create } from "zustand";
import { load } from "@tauri-apps/plugin-store";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// @tauri-apps/plugin-store が管理する設定ファイル名
const STORE_FILE = "settings.json";
// 日記の保存フォルダパスを格納するキー名
const KEY_SAVE_PATH = "savePath";

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// autoSave: false のため、読み書きのたびに明示的に save() を呼ぶ必要がある
const openStore = () => load(STORE_FILE, { autoSave: false, defaults: {} });

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface SettingsState {
  // 日記の保存フォルダパス（未設定なら null）
  savePath: string | null;

  // 設定の読み込みが完了したか（App.tsx でローディング画面の制御に使う）
  isLoaded: boolean;

  // 起動時に設定ファイルから保存パスを取得する
  loadSettings: () => Promise<void>;

  // 設定ファイルに保存パスを登録する
  setSavePath: (path: string) => Promise<void>;
}

// ────────────────────────────────────────────
// ストア
// ────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>((set) => ({
  savePath: null,
  isLoaded: false,

  // ── 設定の読み込み ────────────────────────
  loadSettings: async () => {
    try {
      const store = await openStore();
      const savePath = await store.get<string>(KEY_SAVE_PATH);
      // キーが存在しない場合は undefined が返るため null に統一する
      set({ savePath: savePath ?? null, isLoaded: true });
    } catch {
      // 読み込み失敗時（初回起動・ファイル破損など）は未設定扱いで設定画面へ進める
      set({ savePath: null, isLoaded: true });
    }
  },

  // ── 保存パスの更新 ────────────────────────
  setSavePath: async (path: string) => {
    const store = await openStore();
    await store.set(KEY_SAVE_PATH, path);
    // autoSave: false のため明示的に save() を呼ぶ必要がある
    await store.save();
    set({ savePath: path, isLoaded: true });
  },
}));
