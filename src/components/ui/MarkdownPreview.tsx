import { Box } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MARKDOWN_STYLES } from "../../constants/markdownStyles";

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// フロントマターを除いた本文を返す
function stripFrontmatter(raw: string): string {
  return raw.replace(/^---\r?\n[\s\S]*?\n---\r?\n?/, "");
}

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface Props {
  // レンダリングするMarkdownテキスト（フロントマター含む可）
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
        py: 3,
        color: "text.primary",
        ...MARKDOWN_STYLES,
      }}
    >
      {content && (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {stripFrontmatter(content)}
        </ReactMarkdown>
      )}
    </Box>
  );
}
