import { describe, it, expect, beforeEach } from "vitest";
import { useUiStore } from "./uiStore";

// 各テスト前にストアを初期状態にリセットする
beforeEach(() => {
  useUiStore.setState({ mode: "diary" });
});

// ────────────────────────────────────────────
// setMode
// ────────────────────────────────────────────

describe("setMode", () => {
  it("初期モードは diary になる", () => {
    expect(useUiStore.getState().mode).toBe("diary");
  });

  it("template に切り替えると mode が template になる", () => {
    useUiStore.getState().setMode("template");
    expect(useUiStore.getState().mode).toBe("template");
  });
});
