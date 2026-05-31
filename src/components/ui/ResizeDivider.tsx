import { Box } from "@mui/material";
import type { MouseEvent } from "react";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// ハンドルの固定幅（px）— 親がペイン幅計算に使用するためエクスポート
export const DIVIDER_WIDTH = 8;

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface Props {
  // ドラッグ開始時のイベントハンドラ
  onMouseDown: (e: MouseEvent) => void;
}

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

// ペイン間のリサイズハンドル
// デフォルトは 1px の区切り線、ホバー時にグラブアイコンを表示する
export default function ResizeDivider({ onMouseDown }: Props) {
  return (
    <Box
      onMouseDown={onMouseDown}
      sx={{
        width: `${DIVIDER_WIDTH}px`,
        flexShrink: 0,
        cursor: "col-resize",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        position: "relative",
        // ホバー時：線を消してドットを表示
        "&:hover .resize-line": { opacity: 0 },
        "&:hover .resize-dots": { opacity: 1 },
      }}
    >
      {/* デフォルト：1px の区切り線 */}
      <Box
        className="resize-line"
        sx={{
          position: "absolute",
          width: "1px",
          height: "100%",
          bgcolor: "divider",
          transition: "opacity 0.15s",
        }}
      />

      {/* ホバー時：グラブアイコン（⠿ を2列で再現） */}
      <Box
        className="resize-dots"
        sx={{
          opacity: 0,
          transition: "opacity 0.15s",
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <Box key={i} sx={{ display: "flex", gap: "2px" }}>
            <Box sx={{ width: "2px", height: "2px", borderRadius: "50%", bgcolor: "text.secondary" }} />
            <Box sx={{ width: "2px", height: "2px", borderRadius: "50%", bgcolor: "text.secondary" }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
