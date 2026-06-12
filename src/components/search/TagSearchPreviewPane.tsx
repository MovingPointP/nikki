import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { useSearchStore } from "../../store/searchStore";
import { useSettingsStore } from "../../store/settingsStore";
import { splitFrontmatter, parseTags } from "../../utils/frontmatter";
import { DIARY_DIR } from "../../constants/diary";
import PaneContainer from "../ui/PaneContainer";
import PaneHeader from "../ui/PaneHeader";
import MarkdownPreview from "../ui/MarkdownPreview";
import TagBadges from "../ui/TagBadges";

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

// ホバー中の日付の日記をプレビュー表示するペイン
export default function TagSearchPreviewPane() {
  const hoveredDate = useSearchStore((s) => s.hoveredDate);
  const savePath    = useSettingsStore((s) => s.savePath);

  // ホバー中の日記の本文とタグ（ファイルから読み込む）
  const [previewContent, setPreviewContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // ── ホバー時のファイル読み込み ────────────────────────
  useEffect(() => {
    // active フラグでレースコンディションを防ぐ
    // hoveredDate が素早く切り替わった場合に古い非同期結果を無視する
    let active = true;
    if (!hoveredDate || !savePath) {
      setTags([]);
      setPreviewContent("");
      return;
    }
    const load = async () => {
      try {
        const filePath = await join(savePath, DIARY_DIR, `${hoveredDate}.md`);
        const raw = await readTextFile(filePath);
        if (!active) return;
        const { frontmatter, content } = splitFrontmatter(raw);
        setTags(parseTags(frontmatter));
        setPreviewContent(content);
      } catch {
        if (!active) return;
        setTags([]);
        setPreviewContent("");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [hoveredDate, savePath]);

  return (
    <PaneContainer>
      <PaneHeader>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
          {hoveredDate ?? "プレビュー"}
        </Typography>
      </PaneHeader>
      <TagBadges tags={tags} />
      <MarkdownPreview content={previewContent} />
    </PaneContainer>
  );
}
