import { useEffect } from "react";
import { useSettingsStore } from "../store/settingsStore";

// ────────────────────────────────────────────
// ズームキーボードショートカット
// ────────────────────────────────────────────

// Ctrl/Cmd+=/+: 拡大  Ctrl/Cmd+-: 縮小  Ctrl/Cmd+0: リセット
export function useZoomKeys() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      const { zoomIn, zoomOut, zoomReset } = useSettingsStore.getState();
      if (e.key === "=" || e.key === "+") { e.preventDefault(); zoomIn(); }
      if (e.key === "-")                  { e.preventDefault(); zoomOut(); }
      if (e.key === "0")                  { e.preventDefault(); zoomReset(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
