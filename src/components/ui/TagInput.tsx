import { useState } from "react";
import { Box, Chip, InputBase } from "@mui/material";

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface Props {
  // 現在のタグ一覧
  tags: string[];
  // タグが追加・削除されたときに呼ばれるコールバック
  onTagsChange: (tags: string[]) => void;
  // 日記が未選択のとき true
  disabled?: boolean;
}

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

// チップ形式でタグを表示・追加・削除できる入力欄
// Enter またはカンマキーでタグを追加する。空文字・重複は無視する
export default function TagInput({ tags, onTagsChange, disabled }: Props) {
  const [inputValue, setInputValue] = useState("");

  // ── タグの追加 ────────────────────────
  const addTag = (value: string) => {
    // カンマ（半角・全角・読点）で分割して複数タグを一括追加する
    // ペーストで "react, typescript" のように入力されてもデータの不整合を防ぐ
    const newTags = value
      .split(/[,，、]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (newTags.length === 0) return;

    const uniqueNewTags = newTags.filter((t) => !tags.includes(t));
    if (uniqueNewTags.length > 0) {
      onTagsChange([...tags, ...uniqueNewTags]);
    }
    setInputValue("");
  };

  // ── タグの削除 ────────────────────────
  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // IME変換中（日本語などの確定 Enter）は無視する
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
    // 入力欄が空のとき Backspace で最後のタグを削除する
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 0.5,
        px: 2,
        py: 0.75,
        borderBottom: 1,
        borderColor: "divider",
        minHeight: 36,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {tags.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          size="small"
          onDelete={disabled ? undefined : () => removeTag(tag)}
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 600,
            "& .MuiChip-deleteIcon": { color: "primary.contrastText" },
          }}
        />
      ))}
      <InputBase
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={tags.length === 0 ? "タグを追加..." : ""}
        sx={{
          flex: 1,
          minWidth: 80,
          fontSize: "0.8rem",
          color: "text.secondary",
          "& input": { p: 0 },
        }}
      />
    </Box>
  );
}
