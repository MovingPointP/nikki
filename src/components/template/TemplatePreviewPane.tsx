import { Typography } from "@mui/material";
import { useTemplateStore } from "../../store/templateStore";
import PaneContainer from "../ui/PaneContainer";
import PaneHeader from "../ui/PaneHeader";
import MarkdownPreview from "../ui/MarkdownPreview";

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function TemplatePreviewPane() {
  const content = useTemplateStore((s) => s.content);

  return (
    <PaneContainer>

      {/* ヘッダーバー */}
      <PaneHeader>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
          テンプレートプレビュー
        </Typography>
      </PaneHeader>

      {/* プレビュー本文 */}
      <MarkdownPreview content={content} />

    </PaneContainer>
  );
}
