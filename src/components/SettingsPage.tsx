import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SaveIcon from "@mui/icons-material/Save";
import { useSettingsStore } from "../store/settingsStore";

export default function SettingsPage() {
  // 設定ファイルのvaultPath
  const { vaultPath, setVaultPath } = useSettingsStore();
  // フォルダ選択後の一時保存パス
  const [selectedPath, setSelectedPath] = useState<string>(vaultPath ?? "");

  const [snackbar, setSnackbar] = useState<{ open: boolean; severity: "success" | "error"; message: string }>({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
    setSelectedPath(vaultPath ?? "");
  }, [vaultPath]);

  // フォルダ選択ダイアログを表示
  // フォルダを選択した場合、一時保存パスに登録
  const handleSelectFolder = async () => {
    try {
      const result = await open({ directory: true, multiple: false });
      if (result) setSelectedPath(result);
    } catch {
      setSnackbar({ open: true, severity: "error", message: "フォルダの選択に失敗しました" });
    }
  };

  // 一時保存パスを設定ファイルのvaultPathとして登録
  const handleSave = async () => {
    if (!selectedPath) return;
    try {
      await setVaultPath(selectedPath);
      setSnackbar({ open: true, severity: "success", message: "保存しました" });
    } catch {
      setSnackbar({ open: true, severity: "error", message: "保存に失敗しました" });
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper sx={{ p: 4, width: 480 }} elevation={2}>
        <Stack spacing={3}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Vault フォルダの設定
          </Typography>
          <Typography variant="body2" color="text.secondary">
            日記ファイルを保存する Obsidian の Vault
            フォルダを選択してください。
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
              sx={{ whiteSpace: "nowrap" }}
            >
              選択
            </Button>
          </Stack>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!selectedPath || selectedPath === vaultPath}
          >
            {vaultPath ? "変更を保存" : "保存して開始"}
          </Button>
        </Stack>
      </Paper>
      <Snackbar
        open={snackbar.open}
        // 3秒後に自動的に非表示
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}

        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
