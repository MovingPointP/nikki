import { useEffect } from "react";
import { useSettingsStore } from "./store/settingsStore";
import LoadingScreen from "./components/LoadingScreen";
import SettingsPage from "./components/SettingsPage";
import MainLayout from "./components/MainLayout";

function App() {
  const { vaultPath, isLoaded, loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!vaultPath) {
    return <SettingsPage />;
  }

  return <MainLayout />;
}

export default App;
