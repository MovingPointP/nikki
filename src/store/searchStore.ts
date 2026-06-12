import { create } from "zustand";

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface SearchState {
  // 選択中のタグ（null = 未選択）
  selectedTag: string | null;
  // ホバー中の日付（null = ホバーなし）
  hoveredDate: string | null;

  // ── タグ選択 ────────────────────────
  setSelectedTag: (tag: string | null) => void;

  // ── ホバー日付の更新 ────────────────────────
  setHoveredDate: (date: string | null) => void;
}

// ────────────────────────────────────────────
// ストア
// ────────────────────────────────────────────

export const useSearchStore = create<SearchState>((set) => ({
  selectedTag: null,
  hoveredDate: null,

  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setHoveredDate: (date) => set({ hoveredDate: date }),
}));
