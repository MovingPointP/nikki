import { useEffect } from "react";
import { useSettingsStore } from "./store/settingsStore";
import LoadingScreen from "./components/LoadingScreen";
import SettingsPage from "./components/SettingsPage";
import MainLayout from "./components/MainLayout";

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
