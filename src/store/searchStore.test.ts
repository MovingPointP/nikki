import { describe, it, expect, beforeEach } from "vitest";
import { useSearchStore } from "./searchStore";

// 各テスト前にストアを初期状態にリセットする
beforeEach(() => {
  useSearchStore.setState({ selectedTag: null, hoveredDate: null });
});

// ────────────────────────────────────────────
// setSelectedTag
// ────────────────────────────────────────────

describe("setSelectedTag", () => {
  it("初期値は null になる", () => {
    expect(useSearchStore.getState().selectedTag).toBeNull();
  });

  it("タグを設定すると selectedTag が更新される", () => {
    useSearchStore.getState().setSelectedTag("旅行");
    expect(useSearchStore.getState().selectedTag).toBe("旅行");
  });

  it("null を設定すると selectedTag が null になる", () => {
    useSearchStore.setState({ selectedTag: "旅行" });
    useSearchStore.getState().setSelectedTag(null);
    expect(useSearchStore.getState().selectedTag).toBeNull();
  });
});

// ────────────────────────────────────────────
// setHoveredDate
// ────────────────────────────────────────────

describe("setHoveredDate", () => {
  it("初期値は null になる", () => {
    expect(useSearchStore.getState().hoveredDate).toBeNull();
  });

  it("日付を設定すると hoveredDate が更新される", () => {
    useSearchStore.getState().setHoveredDate("2024-01-01");
    expect(useSearchStore.getState().hoveredDate).toBe("2024-01-01");
  });

  it("null を設定すると hoveredDate が null になる", () => {
    useSearchStore.setState({ hoveredDate: "2024-01-01" });
    useSearchStore.getState().setHoveredDate(null);
    expect(useSearchStore.getState().hoveredDate).toBeNull();
  });
});
