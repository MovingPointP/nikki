import { useState } from "react";
import { Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useModalStore } from "../store/modalStore";
import { useDailyStore } from "../store/dailyStore";
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

// ピッカーの表示モード。null = カレンダー表示, "year" = 年選択, "month" = 月選択
type PickerMode = null | "year" | "month";

export default function CalendarModal() {
  const open     = useModalStore((s) => s.activeModal === "calendar");
  const dateList = useDailyStore((s) => s.dateList);

  const today = new Date();
  const [viewYear,    setViewYear]    = useState(today.getFullYear());
  const [viewMonth,   setViewMonth]   = useState(today.getMonth() + 1);
  const [pickerMode,  setPickerMode]  = useState<PickerMode>(null);

  const days = buildCalendarDays(viewYear, viewMonth);

  // 表示中の月に日記が存在する日の集合
  const monthPrefix = `${viewYear}-${String(viewMonth).padStart(2, "0")}-`;
  const daysWithDiary = new Set(
    dateList
      .filter((d) => d.startsWith(monthPrefix))
      .map((d) => parseInt(d.slice(8), 10))
  );

  // ── 月移動 ────────────────────────
  const goToPrevMonth = () => {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12); }
    else                 { setViewMonth((m) => m - 1); }
  };

  const goToNextMonth = () => {
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1); }
    else                  { setViewMonth((m) => m + 1); }
  };

  // ── 年選択グリッド用の年リスト（今年+1 〜 過去10年、新しい順）
  const yearList  = Array.from({ length: 11 }, (_, i) => today.getFullYear() + 1 - i);
  // ── 月選択グリッド用の月リスト（1〜12月）
  const monthList = Array.from({ length: 12 }, (_, i) => i + 1);

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
          {/* ピッカー表示中は矢印を非表示にし、カレンダー表示中のみ月移動を提供する */}
          <IconButton onClick={goToPrevMonth} size="small" sx={{ visibility: pickerMode ? "hidden" : "visible" }}>
            <ChevronLeftIcon />
          </IconButton>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            {/* 年ラベル：クリックで年ピッカーをトグル */}
            <Typography
              variant="h6"
              onClick={() => setPickerMode((m) => m === "year" ? null : "year")}
              sx={{
                fontWeight: "bold",
                color: pickerMode === "year" ? "primary.main" : "text.primary",
                cursor: "pointer",
                borderRadius: 1,
                px: 0.5,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {viewYear}年
            </Typography>

            {/* 月ラベル：クリックで月ピッカーをトグル */}
            <Typography
              variant="h6"
              onClick={() => setPickerMode((m) => m === "month" ? null : "month")}
              sx={{
                fontWeight: "bold",
                color: pickerMode === "month" ? "primary.main" : "text.primary",
                cursor: "pointer",
                borderRadius: 1,
                px: 0.5,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {viewMonth}月
            </Typography>
          </Box>

          <IconButton onClick={goToNextMonth} size="small" sx={{ visibility: pickerMode ? "hidden" : "visible" }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* ── 年ピッカー ────────────────────────── */}
        {pickerMode === "year" && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.5 }}>
            {yearList.map((y) => (
              <Box
                key={y}
                onClick={() => { setViewYear(y); setPickerMode(null); }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "2.5rem",
                  borderRadius: 1,
                  cursor: "pointer",
                  bgcolor: y === viewYear ? "primary.main" : "transparent",
                  "&:hover": { bgcolor: y === viewYear ? "primary.dark" : "action.hover" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: y === viewYear ? "bold" : "normal", color: y === viewYear ? "white" : "text.primary" }}
                >
                  {y}年
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* ── 月ピッカー ────────────────────────── */}
        {pickerMode === "month" && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.5 }}>
            {monthList.map((m) => (
              <Box
                key={m}
                onClick={() => { setViewMonth(m); setPickerMode(null); }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "2.5rem",
                  borderRadius: 1,
                  cursor: "pointer",
                  bgcolor: m === viewMonth ? "primary.main" : "transparent",
                  "&:hover": { bgcolor: m === viewMonth ? "primary.dark" : "action.hover" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: m === viewMonth ? "bold" : "normal", color: m === viewMonth ? "white" : "text.primary" }}
                >
                  {m}月
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* ── カレンダーグリッド ────────────────── */}
        {pickerMode === null && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "2rem", textAlign: "center" }}>

            {/* 曜日ヘッダー */}
            {WEEKDAY_NAMES.map((day, i) => (
              <Typography
                key={day}
                variant="caption"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                <Box
                  key={idx}
                  onClick={() => {
                    if (!day) return;
                    const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    useDailyStore.getState().openDiary(dateStr);
                    useModalStore.getState().closeModal();
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                    cursor: day ? "pointer" : "default",
                    "&:hover": day ? { bgcolor: "action.hover" } : undefined,
                  }}
                >
                  {day && (
                    <>
                      {/* 日付 */}
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
                      {/* 日記が存在する日付のドット */}
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          bgcolor: daysWithDiary.has(day) ? "primary.main" : "transparent",
                        }}
                      />
                    </>
                  )}
                </Box>
              );
            })}

          </Box>
        )}

      </DialogContent>
    </Dialog>
  );
}
