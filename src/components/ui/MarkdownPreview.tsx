import { Box } from "@mui/material";
import { convertFileSrc } from "@tauri-apps/api/core";
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
// ユーティリティ
// ────────────────────────────────────────────

// ローカルパスを Tauri の asset:// URL に変換する。
// http(s):// はそのまま返す。
function resolveImageSrc(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  // file:///C:/... (Windows) → C:/...
  // file:///home/... (Unix) → /home/...
  if (src.startsWith("file://")) {
    let path = src.slice("file://".length);
    // Windows: /C:/... → C:/...
    if (/^\/[A-Za-z]:/.test(path)) path = path.slice(1);
    return convertFileSrc(decodeURIComponent(path));
  }
  // 絶対パス（Unix / Windows どちらも）
  if (src.startsWith("/") || /^[A-Za-z]:[\\/]/.test(src)) {
    return convertFileSrc(src);
  }
  return src;
}

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

// img タグのカスタムレンダラー。ローカルパスを asset:// に変換して表示する
function ImageRenderer({
  src,
  alt,
  style,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const resolvedSrc = src ? resolveImageSrc(src) : undefined;
  return (
    <img
      src={resolvedSrc}
      alt={alt}
      style={{ maxWidth: "100%", ...style }}
      {...props}
    />
  );
}

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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ img: ImageRenderer }}
          // 許可するスキームをホワイトリストで管理する
          urlTransform={(url) => {
            if (/^https?:\/\//.test(url)) return url;       // Web URL
            if (url.startsWith("file://")) return url;       // file:// URL
            if (url.startsWith("/") || /^[A-Za-z]:[\\/]/.test(url)) return url; // 絶対パス
            if (!url.includes(":")) return url;              // 相対パス
            return "";
          }}
        >
          {content}
        </ReactMarkdown>
      )}
    </Box>
  );
}
