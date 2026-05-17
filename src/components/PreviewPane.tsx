import { Box, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDailyStore } from "../store/dailyStore";
import { MARKDOWN_STYLES } from "../constants/markdownStyles";


// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// フロントマターを除いた本文を返す
function stripFrontmatter(raw: string): string {
  return raw.replace(/^---\r?\n[\s\S]*?\n---\r?\n?/, "");
}

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function PreviewPane() {
  const content = useDailyStore((s) => s.content);
  const currentDate = useDailyStore((s) => s.currentDate);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", bgcolor: "background.paper", overflow: "hidden" }}>

      {/* ヘッダーバー */}
      <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "text.secondary", display: "flex", alignItems: "center" }}>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
          プレビュー
        </Typography>
      </Box>

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
