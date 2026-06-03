import { Box, Chip } from "@mui/material";

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface Props {
  // 表示するタグの配列
  tags: string[];
}

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

// タグをバッジ（Chip）として横並びに表示する。タグが空の場合は何も表示しない
export default function TagBadges({ tags }: Props) {
  if (tags.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, px: 4, py: 1 }}>
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          size="small"
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 600,
          }}
        />
      ))}
    </Box>
  );
}
