import { create } from "zustand";
import { load } from "@tauri-apps/plugin-store";

const STORE_FILE = "settings.json";
const KEY_VAULT_PATH = "vaultPath";

interface SettingsState {
  vaultPath: string | null;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  setVaultPath: (path: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  vaultPath: null,
  isLoaded: false,

  loadSettings: async () => {
    const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
    const vaultPath = await store.get<string>(KEY_VAULT_PATH);
    set({ vaultPath: vaultPath ?? null, isLoaded: true });
  },

  setVaultPath: async (path: string) => {
    const store = await load(STORE_FILE, { autoSave: false, defaults: {} });
    await store.set(KEY_VAULT_PATH, path);
    await store.save();
    set({ vaultPath: path, isLoaded: true });
  },
}));
