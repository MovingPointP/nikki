import { Box, Divider, Typography } from "@mui/material";
import EditorPane from "./EditorPane";
import Sidebar from "./Sidebar";
import SettingsModal from "./SettingsModal";
import CalendarModal from "./CalendarModal";

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* サイドバー */}
      <Sidebar />

      <SettingsModal />
      <CalendarModal />

      <Divider orientation="vertical" flexItem />

      {/* エディタペイン */}
      <EditorPane />

      <Divider orientation="vertical" flexItem />

      {/* プレビューペイン */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          overflow: "auto",
        }}
      >
        <Typography variant="subtitle2" sx={{ p: 2, color: "text.secondary" }}>
          プレビュー（未実装）
        </Typography>
      </Box>

    </Box>
  );
}
