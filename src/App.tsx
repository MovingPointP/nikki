import { useEffect } from "react";
import { useSettingsStore } from "./store/settingsStore";
import { useDailyStore } from "./store/dailyStore";
import LoadingScreen from "./components/LoadingScreen";
import SettingsPage from "./components/SettingsPage";
import MainLayout from "./components/MainLayout";

// 起動時のルーティング:
//   設定読み込み中 → LoadingScreen
//   savePath 未設定 → SettingsPage（初回セットアップ）
//   savePath 設定済み → MainLayout
function App() {
  const { savePath, isLoaded, loadSettings } = useSettingsStore();
  const { scanDiaryFiles } = useDailyStore();

  // 起動時に設定ファイルから savePath を読み込む
  useEffect(() => {
    loadSettings();
  }, []);

  // savePath が確定したらファイルスキャンを実行する
  // 設定画面で savePath を新たに設定した場合にも再スキャンされる
  useEffect(() => {
    if (savePath) {
      scanDiaryFiles();
    }
  }, [savePath]);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!savePath) {
    return <SettingsPage />;
  }

  return <MainLayout />;
}

export default App;
