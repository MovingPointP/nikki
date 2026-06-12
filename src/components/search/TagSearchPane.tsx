import { useMemo } from "react";
import { Box, Chip, List, ListItemButton, Typography } from "@mui/material";
import { useDailyStore } from "../../store/dailyStore";
import { useUiStore } from "../../store/uiStore";
import { useSearchStore } from "../../store/searchStore";
import PaneContainer from "../ui/PaneContainer";
import PaneHeader from "../ui/PaneHeader";

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

// タグ選択と検索結果の日付リストを表示するペイン
// 日付をクリックするとその日記を開いて diary モードに切り替える
export default function TagSearchPane() {
  const tagIndex   = useDailyStore((s) => s.tagIndex);
  const selectedTag = useSearchStore((s) => s.selectedTag);

  const allTags = useMemo(() => Object.keys(tagIndex).sort(), [tagIndex]);
  // 選択中タグに対応する日付一覧（新しい順）
  const matchedDates = useMemo(() => {
    return selectedTag ? [...(tagIndex[selectedTag] ?? [])].reverse() : [];
  }, [selectedTag, tagIndex]);

  // ── 日記を開く ────────────────────────
  const handleDateClick = (dateStr: string) => {
    useDailyStore.getState().openDiary(dateStr);
    useUiStore.getState().setMode("diary");
  };

  return (
    <PaneContainer>
      <PaneHeader>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
          タグ検索
        </Typography>
      </PaneHeader>

      {/* タグ一覧 */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        {allTags.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            タグがありません
          </Typography>
        ) : (
          allTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={() => useSearchStore.getState().setSelectedTag(tag === selectedTag ? null : tag)}
              sx={{
                backgroundColor: tag === selectedTag ? "primary.main" : "transparent",
                color: tag === selectedTag ? "primary.contrastText" : "text.primary",
                border: 1,
                borderColor: "primary.main",
                fontWeight: 600,
                cursor: "pointer",
              }}
            />
          ))
        )}
      </Box>

      {/* 検索結果 */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {selectedTag === null ? (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              タグを選択してください
            </Typography>
          </Box>
        ) : matchedDates.length === 0 ? (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              該当する日記がありません
            </Typography>
          </Box>
        ) : (
          <>
            <Typography
              variant="caption"
              sx={{ display: "block", px: 2, pt: 1.5, pb: 0.5, color: "text.secondary" }}
            >
              「{selectedTag}」の日記 {matchedDates.length}件
            </Typography>
            <List dense disablePadding>
              {matchedDates.map((date) => (
                <ListItemButton
                  key={date}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => useSearchStore.getState().setHoveredDate(date)}
                  onMouseLeave={() => useSearchStore.getState().setHoveredDate(null)}
                  sx={{ px: 2, py: 0.75 }}
                >
                  <Typography variant="body2">{date}</Typography>
                </ListItemButton>
              ))}
            </List>
          </>
        )}
      </Box>
    </PaneContainer>
  );
}
