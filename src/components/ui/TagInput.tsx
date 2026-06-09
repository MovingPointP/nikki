import { useMemo, useState } from "react";
import { Box, Chip, InputBase, List, ListItemButton, Paper } from "@mui/material";

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

interface Props {
  // 現在のタグ一覧
  tags: string[];
  // タグが追加・削除されたときに呼ばれるコールバック
  onTagsChange: (tags: string[]) => void;
  // 候補として表示するタグ一覧（省略時は []）
  allTags?: string[];
  // 日記が未選択のとき true
  disabled?: boolean;
}

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

// チップ形式でタグを表示・追加・削除できる入力欄
// Enter またはカンマキーでタグを追加する。空文字・重複は無視する
// allTags を渡すと入力に前方一致する候補をドロップダウンで表示する
export default function TagInput({ tags, onTagsChange, allTags = [], disabled }: Props) {
  const [inputValue, setInputValue] = useState("");
  // ドロップダウンでキーボードハイライトされている候補のインデックス（-1 は未選択）
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  // 入力欄がフォーカスされている間だけドロップダウンを表示する
  const [isFocused, setIsFocused] = useState(false);

  // inputValue に前方一致し、未追加のタグを最大 10 件抽出する
  const suggestions = useMemo(
    () =>
      inputValue
        ? allTags
            .filter(
              (t) =>
                t.toLowerCase().startsWith(inputValue.toLowerCase()) &&
                !tags.includes(t)
            )
            .slice(0, 10)
        : [],
    [allTags, inputValue, tags]
  );

  const isOpen = isFocused && suggestions.length > 0;

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
    setHighlightedIndex(-1);
  };

  // ── タグの削除 ────────────────────────
  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // IME変換中（日本語などの確定 Enter）は無視する
    if (e.nativeEvent.isComposing) return;

    if (isOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, -1));
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setHighlightedIndex(-1);
        setInputValue("");
        return;
      }
    }
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      // ハイライトされた候補があればそのタグを追加し、なければ入力値でタグを追加する
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        addTag(suggestions[highlightedIndex]);
      } else {
        addTag(inputValue);
      }
      return;
    }
    // 入力欄が空のとき Backspace で最後のタグを削除する
    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
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
          onChange={(e) => {
            setInputValue(e.target.value);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setHighlightedIndex(-1);
          }}
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

      {isOpen && (
        <Paper
          elevation={4}
          // blur を防いで onClick が確実に発火するようにする（スクロールバー含む全域）
          onMouseDown={(e) => e.preventDefault()}
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          <List dense disablePadding>
            {suggestions.map((tag, index) => (
              <ListItemButton
                key={tag}
                selected={index === highlightedIndex}
                onClick={() => addTag(tag)}
                sx={{ fontSize: "0.85rem", py: 0.5 }}
              >
                {tag}
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
