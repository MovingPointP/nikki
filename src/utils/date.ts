// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// インスタンス生成はロケール解決のコストがかかるため、モジュールロード時に1度だけ作成してキャッシュする
const FORMATTERS = {
  short: new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", weekday: "narrow" }),
  long:  new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", weekday: "long"   }),
} as const;

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// YYYY-MM-DD 文字列から曜日名を JST で返す
// "short" → "月"（narrow）、"long" → "月曜日"
export function getDayName(dateStr: string, format: "short" | "long" = "long"): string {
  return FORMATTERS[format].format(new Date(dateStr));
}
