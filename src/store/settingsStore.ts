import { create } from "zustand";
import { load } from "@tauri-apps/plugin-store";

const STORE_FILE = "settings.json";
const KEY_SAVE_PATH = "savePath";

interface SettingsState {
  savePath: string | null;
  isLoaded: boolean;
  // 設定ファイルから保存パスを取得
  loadSettings: () => Promise<void>;
  // 設定ファイルに保存パスを登録
  setSavePath: (path: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  savePath: null,
  isLoaded: false,

  loadSettings: async () => {
    const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
    const savePath = await store.get<string>(KEY_SAVE_PATH);
    set({ savePath: savePath ?? null, isLoaded: true });
  },

  setSavePath: async (path: string) => {
    const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
    await store.set(KEY_SAVE_PATH, path);
    await store.save();
    set({ savePath: path, isLoaded: true });
  },
}));
