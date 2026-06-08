import { Box } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MARKDOWN_STYLES } from "../../constants/markdownStyles";
// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface Props {
  // レンダリングするMarkdownテキスト
  content: string;
}

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

// Markdownを整形表示するプレビュー領域。content が空の場合は何も表示しない
export default function MarkdownPreview({ content }: Props) {
  return (
    <Box
      sx={{
        flex: 1,
        overflow: "auto",
        px: 4,
        pt: 1,
        pb: 3,
        color: "text.primary",
        ...MARKDOWN_STYLES,
      }}
    >
      {content && (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      )}
    </Box>
  );
}
