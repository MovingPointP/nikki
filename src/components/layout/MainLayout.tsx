import { Box, Divider } from "@mui/material";
import EditorPane from "../diary/EditorPane";
import PreviewPane from "../diary/PreviewPane";
import TemplateEditorPane from "../template/TemplateEditorPane";
import TemplatePreviewPane from "../template/TemplatePreviewPane";
import Sidebar from "./Sidebar";
import SettingsModal from "../settings/SettingsModal";
import CalendarModal from "../calendar/CalendarModal";
import { useUiStore } from "../../store/uiStore";

export default function MainLayout() {
  const mode = useUiStore((s) => s.mode);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* サイドバー */}
      <Sidebar />

      <SettingsModal />
      <CalendarModal />

      <Divider orientation="vertical" flexItem />

      {/* エディタペイン */}
      {mode === "diary" ? <EditorPane /> : <TemplateEditorPane />}

      <Divider orientation="vertical" flexItem />

      {/* プレビューペイン */}
      {mode === "diary" ? <PreviewPane /> : <TemplatePreviewPane />}

    </Box>
  );
}
