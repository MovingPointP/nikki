import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Alert,
  Button,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SaveIcon from "@mui/icons-material/Save";
import { useSettingsStore } from "../../store/settingsStore";

export default function SettingsForm() {
  // isLoaded の更新で再レンダリングしないよう、セレクタで savePath を購読する
  const savePath = useSettingsStore((s) => s.savePath);
  // setSavePath は getState で取得する
  const { setSavePath } = useSettingsStore.getState();
  // フォルダ選択後の一時保存パス
  const [selectedPath, setSelectedPath] = useState<string>(savePath ?? "");
  // フォルダ選択ダイアログ表示中
  const [isSelecting, setIsSelecting] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; severity: "success" | "error"; message: string }>({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
    setSelectedPath(savePath ?? "");
  }, [savePath]);

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  // フォルダ選択ダイアログを表示
  // フォルダを選択した場合、一時保存パスに登録
  const handleSelectFolder = async () => {
    setIsSelecting(true);
    try {
      const result = await open({ directory: true, multiple: false });
      if (result) setSelectedPath(result);
    } catch {
      setSnackbar({ open: true, severity: "error", message: "フォルダの選択に失敗しました" });
    } finally {
      setIsSelecting(false);
    }
  };

  // 一時保存パスを設定ファイルの保存パスとして登録
  const handleSave = async () => {
    if (!selectedPath) return;
    try {
      await setSavePath(selectedPath);
      setSnackbar({ open: true, severity: "success", message: "保存しました" });
    } catch {
      setSnackbar({ open: true, severity: "error", message: "保存に失敗しました" });
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          保存フォルダの設定
        </Typography>
        <Typography variant="body2" color="text.secondary">
          日記ファイルを保存するフォルダを選択してください。
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <TextField
            value={selectedPath}
            size="small"
            fullWidth
            placeholder="フォルダが選択されていません"
            slotProps={{ input: { readOnly: true } }}
          />
          <Button
            variant="outlined"
            startIcon={<FolderOpenIcon />}
            onClick={handleSelectFolder}
            disabled={isSelecting}
            sx={{ whiteSpace: "nowrap" }}
          >
            選択
          </Button>
        </Stack>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!selectedPath || selectedPath === savePath}
        >
          {savePath ? "変更を保存" : "保存して開始"}
        </Button>
      </Stack>

      <Snackbar
        open={snackbar.open}
        // 3秒後に自動的に非表示
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
