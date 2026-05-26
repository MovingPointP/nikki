import { Box, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDailyStore } from "../store/dailyStore";
import PaneHeader from "./ui/PaneHeader";

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function PreviewPane() {
  const content = useDailyStore((s) => s.content);
  const currentDate = useDailyStore((s) => s.currentDate);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", bgcolor: "background.paper", overflow: "hidden" }}>

      {/* ヘッダーバー */}
      <PaneHeader>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
          プレビュー
        </Typography>
      </PaneHeader>

      {/* プレビュー本文 */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: 4,
          py: 3,
          color: "text.primary",
          ...MARKDOWN_STYLES,
        }}
      >
        {currentDate && (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {stripFrontmatter(content)}
          </ReactMarkdown>
        )}
      </Box>

    </Box>
  );
}
