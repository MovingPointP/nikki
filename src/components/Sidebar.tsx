import { Box, IconButton } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";
import BookIcon from "@mui/icons-material/Book";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useModalStore } from "../store/modalStore";
import { useUiStore } from "../store/uiStore";

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
  const mode = useUiStore((s) => s.mode);

  return (
    <Box sx={{ width: 48, display: "flex", flexDirection: "column", bgcolor: "primary.dark", overflow: "hidden" }}>

      {/* カレンダーボタン */}
      <IconButton sx={iconButtonSx} onClick={() => useModalStore.getState().openModal("calendar")}>
        <CalendarMonthIcon sx={{ fontSize: 28 }} />
      </IconButton>

      {/* 日記モード切り替えボタン（template モード時のみ表示） */}
      {mode === "template" && (
        <IconButton sx={iconButtonSx} onClick={() => useUiStore.getState().setMode("diary")}>
          <BookIcon sx={{ fontSize: 28 }} />
        </IconButton>
      )}

      {/* テンプレートモード切り替えボタン（diary モード時のみ表示） */}
      {mode === "diary" && (
        <IconButton sx={iconButtonSx} onClick={() => useUiStore.getState().setMode("template")}>
          <DashboardIcon sx={{ fontSize: 28 }} />
        </IconButton>
      )}

      {/* 設定ボタン */}
      <IconButton sx={{ ...iconButtonSx, mt: "auto" }} onClick={() => useModalStore.getState().openModal("settings")}>
        <SettingsIcon sx={{ fontSize: 28 }} />
      </IconButton>

    </Box>
  );
}
