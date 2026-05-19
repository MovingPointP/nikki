import { describe, it, expect, beforeEach } from "vitest";
import { useModalStore } from "./modalStore";

// 各テスト前にストアを初期状態にリセットする
beforeEach(() => {
  useModalStore.setState({ activeModal: null });
});

// ────────────────────────────────────────────
// openModal
// ────────────────────────────────────────────

describe("openModal", () => {
  it("settings を開くと activeModal が settings になる", () => {
    useModalStore.getState().openModal("settings");
    expect(useModalStore.getState().activeModal).toBe("settings");
  });

  it("calendar を開くと activeModal が calendar になる", () => {
    useModalStore.getState().openModal("calendar");
    expect(useModalStore.getState().activeModal).toBe("calendar");
  });

  it("別のモーダルが開いている状態で openModal すると上書きされる", () => {
    useModalStore.getState().openModal("settings");
    useModalStore.getState().openModal("calendar");
    expect(useModalStore.getState().activeModal).toBe("calendar");
  });
});

// ────────────────────────────────────────────
// closeModal
// ────────────────────────────────────────────

describe("closeModal", () => {
  it("モーダルを閉じると activeModal が null になる", () => {
    useModalStore.getState().openModal("settings");
    useModalStore.getState().closeModal();
    expect(useModalStore.getState().activeModal).toBeNull();
  });

  it("何も開いていない状態で closeModal しても null のまま", () => {
    useModalStore.getState().closeModal();
    expect(useModalStore.getState().activeModal).toBeNull();
  });
});
