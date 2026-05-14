import { WEEKDAY_NAMES } from "../constants/weekdays";

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// YYYY-MM-DD 文字列から曜日名を返す（例: "月"）
export function getDayName(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return WEEKDAY_NAMES[new Date(year, month - 1, day).getDay()];
}
