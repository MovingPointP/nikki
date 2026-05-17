import { Box, Divider } from "@mui/material";
import EditorPane from "./EditorPane";
import PreviewPane from "./PreviewPane";
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
      <PreviewPane />

    </Box>
  );
}
