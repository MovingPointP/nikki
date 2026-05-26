import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { ReactNode } from "react";

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface Props {
  // ヘッダーバー内部のコンテンツ
  children: ReactNode;
  // 追加・上書きするスタイル（例: justifyContent: "space-between"）
  sx?: SxProps<Theme>;
}

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

// エディタ・プレビュー各ペインの上部ヘッダーバー
export default function PaneHeader({ children, sx }: Props) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        borderBottom: 1,
        borderColor: "text.secondary",
        display: "flex",
        alignItems: "center",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
