import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useSettingsStore } from "./store/settingsStore";
import SettingsPage from "./components/SettingsPage";

function App() {
  const { vaultPath, isLoaded, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  if (!isLoaded) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!vaultPath) {
    return <SettingsPage />;
  }

  return <div>メイン画面（今後実装）</div>;
}

export default App;
