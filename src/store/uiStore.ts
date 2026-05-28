import { create } from "zustand";

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

// メインエリアの表示モード
export type AppMode = "diary" | "template";

interface UiState {
  // メインエリアの現在の表示モード
  mode: AppMode;

  // ── モード切り替え ────────────────────────
  setMode: (mode: AppMode) => void;
}

// ────────────────────────────────────────────
// ストア
// ────────────────────────────────────────────

export const useUiStore = create<UiState>((set) => ({
  mode: "diary",

  setMode: (mode) => set({ mode }),
}));
