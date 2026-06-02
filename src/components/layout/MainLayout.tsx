import { Box, Divider } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import EditorPane from "../diary/EditorPane";
import PreviewPane from "../diary/PreviewPane";
import TemplateEditorPane from "../template/TemplateEditorPane";
import TemplatePreviewPane from "../template/TemplatePreviewPane";
import Sidebar from "./Sidebar";
import SettingsModal from "../settings/SettingsModal";
import CalendarModal from "../calendar/CalendarModal";
import MemoriesModal from "../memories/MemoriesModal";
import { useUiStore } from "../../store/uiStore";
import ResizeDivider, { DIVIDER_WIDTH } from "../ui/ResizeDivider";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// エディタ幅の最小・最大（ペイン領域＝コンテナ−ハンドル幅、に対する割合、%）
const EDITOR_WIDTH_MIN = 20;
const EDITOR_WIDTH_MAX = 80;

export default function MainLayout() {
  const mode = useUiStore((s) => s.mode);

  // エディタペインの幅（エディタ+プレビュー領域全体に対する割合、%）
  const [editorWidthPct, setEditorWidthPct] = useState(50);
  // エディタ+ハンドル+プレビューを囲むコンテナへの参照
  const panelsRef = useRef<HTMLDivElement>(null);

  // ── ドラッグ中の幅更新 ────────────────────────
  // ドラッグ開始時のみ window に登録し、終了時に解除するため dragging フラグ不要
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!panelsRef.current) return;
    const rect = panelsRef.current.getBoundingClientRect();
    // ゼロ幅・負の幅のときは NaN や Infinity の発生を防ぐため早期リターン
    const availableWidth = rect.width - DIVIDER_WIDTH;
    if (availableWidth <= 0) return;
    const relativeX = e.clientX - rect.left;
    // ペイン領域（ハンドル幅を除いた幅）でクランプし、コンテナ%に変換して保存
    const pct = Math.min(EDITOR_WIDTH_MAX, Math.max(EDITOR_WIDTH_MIN, (relativeX / availableWidth) * 100));
    setEditorWidthPct(pct * availableWidth / rect.width);
  }, []);

  // ── ドラッグ終了 ────────────────────────
  const handleMouseUp = useCallback(() => {
    // ドラッグ終了時にカーソルとテキスト選択を元に戻す
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  // ── アンマウント時のクリーンアップ ────────────────────────
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ── ドラッグ開始 ────────────────────────
  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    // ドラッグ中はカーソルとテキスト選択をウィンドウ全体でロックする
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    e.preventDefault();
  }, [handleMouseMove, handleMouseUp]);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* サイドバー */}
      <Sidebar />

      <SettingsModal />
      <CalendarModal />
      <MemoriesModal />

      <Divider orientation="vertical" flexItem />

      {/* エディタ + リサイズハンドル + プレビュー */}
      <Box ref={panelsRef} sx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

        {/* エディタペイン（幅を動的に制御） */}
        <Box data-editor-width={editorWidthPct} sx={{ flex: "none", width: `${editorWidthPct}%`, display: "flex", minHeight: 0 }}>
          {mode === "diary" ? <EditorPane /> : <TemplateEditorPane />}
        </Box>

        {/* ドラッグ可能なリサイズハンドル */}
        <ResizeDivider onMouseDown={handleDividerMouseDown} />

        {/* プレビューペイン（残りの幅を占める） */}
        <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
          {mode === "diary" ? <PreviewPane /> : <TemplatePreviewPane />}
        </Box>

      </Box>

    </Box>
  );
}
