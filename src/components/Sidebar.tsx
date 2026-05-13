import { Box, IconButton } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// サイドバー内の IconButton に共通するスタイル
const iconButtonSx = {
  borderRadius: 0,
  color: "text.dark",
  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
} as const;

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function Sidebar() {
  return (
    <Box sx={{ width: 48, display: "flex", flexDirection: "column", bgcolor: "primary.dark", overflow: "hidden" }}>

      {/* カレンダーボタン（モーダルは未実装） */}
      <IconButton sx={iconButtonSx}>
        <CalendarMonthIcon sx={{ fontSize: 28 }} />
      </IconButton>

      {/* 設定ボタン（設定画面への遷移は未実装） */}
      <IconButton sx={{ ...iconButtonSx, mt: "auto" }}>
        <SettingsIcon sx={{ fontSize: 28 }} />
      </IconButton>

    </Box>
  );
}
