import { Box, Dialog, DialogContent, Typography } from "@mui/material";
import { useModalStore } from "../store/modalStore";
import { WEEKDAY_NAMES } from "../constants/weekdays";

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// カレンダーグリッド用の配列を返す。月の1日目の曜日に合わせた数の null を先頭に挿入し、以降は 1 始まりの日付を並べる
function buildCalendarDays(year: number, month: number): (number | null)[] {
  // 月の1日目の曜日インデックス（0=日〜6=土）。
  const firstDay    = new Date(year, month - 1, 1).getDay();
  // month, 0 で 翌月の0日目 = その月の末日 を取得する
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: (number | null)[] = [];
  // 月の1日目までの曜日分だけ空セルを先頭に挿入
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function CalendarModal() {
  const open = useModalStore((s) => s.activeModal === "calendar");

  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth() + 1;
  const days  = buildCalendarDays(year, month);

  return (
    <Dialog
      open={open}
      onClose={() => useModalStore.getState().closeModal()}
      maxWidth="xs"
      fullWidth
    >
      <DialogContent>

        {/* ── ヘッダー ────────────────────────── */}
        <Typography
          variant="h6"
          sx={{ textAlign: "center", fontWeight: "bold", mb: 1, color: "text.primary" }}
        >
          {year}年 {month}月
        </Typography>

        {/* ── カレンダーグリッド ────────────────── */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center" }}>

          {/* 曜日ヘッダー */}
          {WEEKDAY_NAMES.map((day, i) => (
            <Typography
              key={day}
              variant="caption"
              sx={{
                py: 0.5,
                fontWeight: "bold",
                color: i === 0 ? "primary.main"
                     : i === 6 ? "secondary.main"
                     : "text.secondary",
              }}
            >
              {day}
            </Typography>
          ))}

          {/* 日付セル */}
          {days.map((day, idx) => {
            const col = idx % 7; // 0=日, 6=土
            return (
              <Box key={idx} sx={{ py: 0.5 }}>
                {day !== null && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: col === 0 ? "primary.main"
                           : col === 6 ? "secondary.main"
                           : "text.primary",
                    }}
                  >
                    {day}
                  </Typography>
                )}
              </Box>
            );
          })}

        </Box>

      </DialogContent>
    </Dialog>
  );
}
