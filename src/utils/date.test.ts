import { describe, it, expect } from "vitest";
import { toDateString, getDayName } from "./date";

// ────────────────────────────────────────────
// toDateString
// ────────────────────────────────────────────

describe("toDateString", () => {
  it("月・日が1桁のとき0埋めする", () => {
    expect(toDateString(new Date(2024, 0, 5))).toBe("2024-01-05");
  });

  it("月・日が2桁のときそのまま返す", () => {
    expect(toDateString(new Date(2024, 11, 31))).toBe("2024-12-31");
  });

  it("うるう年の2月29日を正しく返す", () => {
    expect(toDateString(new Date(2024, 1, 29))).toBe("2024-02-29");
  });
});

// ────────────────────────────────────────────
// getDayName
// ────────────────────────────────────────────

describe("getDayName", () => {
  it.each([
    ["2024-01-07", "日"],
    ["2024-01-08", "月"],
    ["2024-01-09", "火"],
    ["2024-01-10", "水"],
    ["2024-01-11", "木"],
    ["2024-01-12", "金"],
    ["2024-01-13", "土"],
  ])("%s → %s", (dateStr, expected) => {
    expect(getDayName(dateStr)).toBe(expected);
  });
});
