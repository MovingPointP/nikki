import { useSettingsStore } from "./store/settingsStore";
import { useAppInit } from "./hooks/useAppInit";
import { useZoomKeys } from "./hooks/useZoomKeys";
import LoadingScreen from "./components/layout/LoadingScreen";
import SettingsPage from "./components/layout/SettingsPage";
import MainLayout from "./components/layout/MainLayout";

// 起動時のルーティング:
//   設定読み込み中 → LoadingScreen
//   savePath 未設定 → SettingsPage（初回セットアップ）
//   savePath 設定済み → MainLayout
function App() {
  useAppInit();
  useZoomKeys();

  const isLoaded = useSettingsStore((s) => s.isLoaded);
  const savePath = useSettingsStore((s) => s.savePath);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!savePath) {
    return <SettingsPage />;
  }

  return <MainLayout />;
}

export default App;
