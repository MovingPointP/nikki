import { useState } from "react";
import { Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
  // 常に6行（42セル）になるよう末尾を null で埋めてグリッドの高さを固定する
  while (days.length < 42) days.push(null);
  return days;
}

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function CalendarModal() {
  const open = useModalStore((s) => s.activeModal === "calendar");

  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  const days = buildCalendarDays(viewYear, viewMonth);

  // ── 月移動 ────────────────────────
  const goToPrevMonth = () => {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12); }
    else                 { setViewMonth((m) => m - 1); }
  };

  const goToNextMonth = () => {
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1); }
    else                  { setViewMonth((m) => m + 1); }
  };

  return (
    <Dialog
      open={open}
      onClose={() => useModalStore.getState().closeModal()}
      maxWidth="xs"
      fullWidth
    >
      <DialogContent>

        {/* ── ヘッダー ────────────────────────── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <IconButton onClick={goToPrevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
            {viewYear}年 {viewMonth}月
          </Typography>

          <IconButton onClick={goToNextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* ── カレンダーグリッド ────────────────── */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "2rem", textAlign: "center" }}>

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
