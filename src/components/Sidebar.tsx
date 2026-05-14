import { Box, IconButton } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";
import { useModalStore } from "../store/modalStore";

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

      {/* カレンダーボタン */}
      <IconButton sx={iconButtonSx} onClick={() => useModalStore.getState().openModal("calendar")}>
        <CalendarMonthIcon sx={{ fontSize: 28 }} />
      </IconButton>

      {/* 設定ボタン */}
      <IconButton sx={{ ...iconButtonSx, mt: "auto" }} onClick={() => useModalStore.getState().openModal("settings")}>
        <SettingsIcon sx={{ fontSize: 28 }} />
      </IconButton>

    </Box>
  );
}
