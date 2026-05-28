import { Box, Divider } from "@mui/material";
import EditorPane from "./EditorPane";
import PreviewPane from "./PreviewPane";
import TemplateEditorPane from "./TemplateEditorPane";
import TemplatePreviewPane from "./TemplatePreviewPane";
import Sidebar from "./Sidebar";
import SettingsModal from "./SettingsModal";
import CalendarModal from "./CalendarModal";
import { useUiStore } from "../store/uiStore";

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
