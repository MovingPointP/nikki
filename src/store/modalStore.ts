import { create } from "zustand";

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

// 開くことができるモーダルの種別
export type Modal = "settings" | "calendar" | "memories";

interface ModalState {
  // 現在開いているモーダル（null = すべて閉じている）
  activeModal: Modal | null;

  // ── モーダル操作 ────────────────────────
  openModal: (modal: Modal) => void;
  closeModal: () => void;
}

// ────────────────────────────────────────────
// ストア
// ────────────────────────────────────────────

export const useModalStore = create<ModalState>((set) => ({
  activeModal: null,

  openModal:  (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}));
