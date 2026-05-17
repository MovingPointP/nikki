import { useEffect } from "react";
import { useSettingsStore } from "./store/settingsStore";
import { useDailyStore } from "./store/dailyStore";
import { toDateString } from "./utils/date";
import LoadingScreen from "./components/LoadingScreen";
import SettingsPage from "./components/SettingsPage";
import MainLayout from "./components/MainLayout";

// 起動時のルーティング:
//   設定読み込み中 → LoadingScreen
//   savePath 未設定 → SettingsPage（初回セットアップ）
//   savePath 設定済み → MainLayout
function App() {
  const isLoaded = useSettingsStore((s) => s.isLoaded);
  const savePath = useSettingsStore((s) => s.savePath);
  const { scanDiaryFiles, openDiary } = useDailyStore.getState();

  // 起動時に設定ファイルから savePath を読み込む
  useEffect(() => {
    useSettingsStore.getState().loadSettings();
  }, []);

// savePath が確定したらファイルスキャンを実行し、今日の日記を開く
  // 設定画面で savePath を新たに設定した場合にも再スキャン・再オープンされる
  useEffect(() => {
    if (savePath) {
      // 本日の日付を YYYY-MM-DD 形式で初期化
      const dateStr = toDateString(new Date());
      scanDiaryFiles().then(() => openDiary(dateStr));
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
