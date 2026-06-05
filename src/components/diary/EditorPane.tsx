import { useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState, Transaction } from "@codemirror/state";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDailyStore } from "../../store/dailyStore";
import { useSettingsStore } from "../../store/settingsStore";
import { createEditorExtensions } from "../../lib/editor";
import PaneContainer from "../ui/PaneContainer";
import PaneHeader from "../ui/PaneHeader";
import TagInput from "../ui/TagInput";
import { FRONTMATTER_RE, parseTags, setTagsInFrontmatter } from "../../utils/frontmatter";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// ── エディタ拡張 ────────────────────────
const editorExtensions = createEditorExtensions(
  // Ctrl+S で日記を保存する
  () => useDailyStore.getState().saveDiary(),
  (content) => useDailyStore.getState().setContent(content),
);

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function EditorPane() {
  // content の更新で再レンダリングしないよう、セレクタで currentDate と isDirty だけを購読する
  const currentDate = useDailyStore((s) => s.currentDate);
  const isDirty     = useDailyStore((s) => s.isDirty);
  const isSaving    = useDailyStore((s) => s.isSaving);
  const dateList    = useDailyStore((s) => s.dateList);
  const savePath    = useSettingsStore((s) => s.savePath);
  // ディスク上に日記ファイルが存在する場合のみ削除ボタンを有効にする
  const diaryExists = currentDate !== null && dateList.includes(currentDate);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // TagInput に表示するタグ一覧（日記を開いたときに content からパースして同期する）
  const [tags, setTags] = useState<string[]>([]);
  // CodeMirror を差し込む DOM 要素への参照
  const containerRef = useRef<HTMLDivElement>(null);
  // CodeMirror インスタンスへの参照
  const viewRef = useRef<EditorView | null>(null);

  // ── エディタの初期化 ────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: useDailyStore.getState().content,
        extensions: editorExtensions,
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    return () => view.destroy();
  }, []);

  // ── ストアのコンテンツ変更を監視してタグを同期する ────────────────────────
  // エディタで直接 frontmatter を編集したときも TagInput に反映される
  useEffect(() => {
    const unsubscribe = useDailyStore.subscribe((state) => {
      const newTags = parseTags(state.content);
      setTags((prev) => {
        // 配列の内容が同じなら再レンダリングを防ぐために更新しない
        if (prev.length === newTags.length && prev.every((t, i) => t === newTags[i])) {
          return prev;
        }
        return newTags;
      });
    });
    return unsubscribe;
  }, []);

  // ── 日記の日付切り替え時にエディタの内容を同期する ────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    const content = useDailyStore.getState().content;

    if (!view) return;
    const currentDoc = view.state.doc.toString();
    // CodeMirror のドキュメントとストアの content が異なる場合に実行
    if (currentDoc !== content) {
      // CodeMirror のドキュメントを content に更新
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: content },
        // プログラムによる書き換えとしてマークする
        annotations: Transaction.remote.of(true),
      });
    }
  }, [currentDate]);

  // ── タグ変更時に frontmatter・ストア・CodeMirror を同期する ────────────────────────
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    const currentContent = useDailyStore.getState().content;
    const newContent = setTagsInFrontmatter(currentContent, newTags);
    useDailyStore.getState().setContent(newContent);
    const view = viewRef.current;
    if (!view) return;

    // フロントマター部分のみ置換することでカーソル位置・選択状態を維持する
    const currentDoc = view.state.doc.toString();
    const oldMatch = currentDoc.match(FRONTMATTER_RE);
    const oldLen = oldMatch ? oldMatch[0].length : 0;
    const newMatch = newContent.match(FRONTMATTER_RE);
    const newFrontmatter = newMatch ? newMatch[0] : "";

    view.dispatch({
      changes: { from: 0, to: oldLen, insert: newFrontmatter },
      annotations: Transaction.remote.of(true),
    });
  };

  return (
    <PaneContainer>
      {/* 現在開いている日付を表示するヘッダーバー */}
      <PaneHeader sx={{ justifyContent: "space-between" }}>

        {/* 左：日付 + 未保存インジケーター */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
            {currentDate ?? "—"}
          </Typography>
          {isDirty && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              未保存
            </Typography>
          )}
        </Box>

        {/* 右：保存・削除ボタン */}
        <Box sx={{ display: "flex", gap: 1 }}>

          <Tooltip title="保存 (Ctrl+S)">
            {/* span をインライン要素のまま使うと行ボックス高さが加算されるため flex にする */}
            <Box component="span" sx={{ display: "flex" }}>
              <IconButton
                size="small"
                disabled={!currentDate || isSaving || !savePath}
                onClick={() => useDailyStore.getState().saveDiary()}
                sx={{ p: 0 }}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>

          <Tooltip title="削除">
            <Box component="span" sx={{ display: "flex" }}>
              <IconButton
                size="small"
                disabled={!diaryExists}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ p: 0 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>

        </Box>

      </PaneHeader>

      {/* タグ入力欄 */}
      <TagInput
        tags={tags}
        onTagsChange={handleTagsChange}
        disabled={!currentDate}
      />

      {/* ── 削除確認ダイアログ ──────────────────────── */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>日記を削除しますか？</DialogTitle>
        <DialogContent>
          <Typography>{currentDate} の日記を削除します。この操作は取り消せません。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button
            onClick={() => {
              if (currentDate) useDailyStore.getState().deleteDiary(currentDate);
              setDeleteDialogOpen(false);
            }}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
        {/* currentDate が null の間だけプレースホルダーをオーバーレイで表示する */}
        {!currentDate && (
          <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
            <Typography>
              カレンダーから日付を選んでください
            </Typography>
          </Box>
        )}
        {/* containerRef は常にマウントしておくことで useEffect でのエディタ初期化を保証する */}
        <Box ref={containerRef} sx={{ height: "100%" }} />
      </Box>
    </PaneContainer>
  );
}
