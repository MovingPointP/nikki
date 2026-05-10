import { useEffect } from "react";
import { useSettingsStore } from "./store/settingsStore";
import LoadingScreen from "./components/LoadingScreen";
import SettingsPage from "./components/SettingsPage";
import MainLayout from "./components/MainLayout";

// 起動時のルーティング:
//   設定読み込み中 → LoadingScreen
//   savePath 未設定 → SettingsPage（初回セットアップ）
//   savePath 設定済み → MainLayout
function App() {
  const { savePath, isLoaded, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!savePath) {
    return <SettingsPage />;
  }

  return <MainLayout />;
}

export default App;
