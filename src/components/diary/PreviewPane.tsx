import { Typography } from "@mui/material";
import { useDailyStore } from "../../store/dailyStore";
import PaneContainer from "../ui/PaneContainer";
import PaneHeader from "../ui/PaneHeader";
import MarkdownPreview from "../ui/MarkdownPreview";
import TagBadges from "../ui/TagBadges";
import { parseTags } from "../../utils/frontmatter";

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function PreviewPane() {
  const content = useDailyStore((s) => s.content);
  const currentDate = useDailyStore((s) => s.currentDate);

  const tags = currentDate ? parseTags(content) : [];

  return (
    <PaneContainer>

      {/* ヘッダーバー */}
      <PaneHeader>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
          プレビュー
        </Typography>
      </PaneHeader>

      {/* タグバッジ */}
      <TagBadges tags={tags} />

      {/* プレビュー本文 */}
      <MarkdownPreview content={currentDate ? content : ""} />

    </PaneContainer>
  );
}
