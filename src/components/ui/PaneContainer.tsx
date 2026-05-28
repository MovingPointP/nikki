import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { ReactNode } from "react";

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface Props {
  // ペイン内部のコンテンツ
  children: ReactNode;
  // 追加・上書きするスタイル
  sx?: SxProps<Theme>;
}

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

// エディタ・プレビュー各ペインの外枠レイアウトコンテナ
export default function PaneContainer({ children, sx }: Props) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        overflow: "hidden",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
