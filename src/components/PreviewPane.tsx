import { Typography } from "@mui/material";
import { useDailyStore } from "../store/dailyStore";
import PaneContainer from "./ui/PaneContainer";
import PaneHeader from "./ui/PaneHeader";
import MarkdownPreview from "./ui/MarkdownPreview";

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function PreviewPane() {
  const content = useDailyStore((s) => s.content);
  const currentDate = useDailyStore((s) => s.currentDate);

  return (
    <PaneContainer>

      {/* ヘッダーバー */}
      <PaneHeader>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
          プレビュー
        </Typography>
      </PaneHeader>

      {/* プレビュー本文 */}
      <MarkdownPreview content={currentDate ? content : ""} />

    </PaneContainer>
  );
}
