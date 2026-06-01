import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useModalStore } from "../../store/modalStore";
import { useMemoriesStore } from "../../store/memoriesStore";
import { useDailyStore } from "../../store/dailyStore";
import { useUiStore } from "../../store/uiStore";
import MarkdownPreview from "../ui/MarkdownPreview";

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function MemoriesModal() {
  const open           = useModalStore((s) => s.activeModal === "memories");
  const tabs           = useMemoriesStore((s) => s.tabs);
  const activeTabIndex = useMemoriesStore((s) => s.activeTabIndex);

  const activeTab = tabs[activeTabIndex];

  // ── ハンドラ ────────────────────────
  const handleClose = () => useModalStore.getState().closeModal();

  const handleOpenDiary = () => {
    if (!activeTab?.date) return;
    useDailyStore.getState().openDiary(activeTab.date);
    useUiStore.getState().setMode("diary");
    useModalStore.getState().closeModal();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { maxHeight: "80vh" } } }}
    >
      {/* ── タイトルバー ────────────────────────── */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 0,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Memories
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── コンテンツ ────────────────────────── */}
      <DialogContent
        sx={{ p: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* タブ */}
        <Tabs
          value={activeTabIndex}
          onChange={(_, i) => useMemoriesStore.getState().setActiveTabIndex(i)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          {tabs.map((tab, i) => (
            <Tab key={i} label={tab.label} disabled={!tab.isActive} />
          ))}
        </Tabs>

        {/* プレビュー */}
        <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          <MarkdownPreview content={activeTab?.content ?? ""} />
        </Box>
      </DialogContent>

      {/* ── アクション ────────────────────────── */}
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined">
          閉じる
        </Button>
        <Button
          onClick={handleOpenDiary}
          variant="contained"
          disabled={!activeTab?.isActive}
        >
          この日記を開く
        </Button>
      </DialogActions>
    </Dialog>
  );
}
