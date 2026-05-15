import { WEEKDAY_NAMES } from "../constants/weekdays";

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// Date オブジェクトから YYYY-MM-DD 文字列を返す
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// YYYY-MM-DD 文字列から曜日名を返す（例: "月"）
export function getDayName(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return WEEKDAY_NAMES[new Date(year, month - 1, day).getDay()];
}
