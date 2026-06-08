import { useEffect, useMemo, useRef, useState } from "react";
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
import { parseTags, hasFrontmatter } from "../../utils/frontmatter";

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
  const [saveError, setSaveError] = useState<string | null>(null);
  // TagInput に表示するタグ一覧（マウント時にストアの frontmatter からパースして初期化する）
  const [tags, setTags] = useState<string[]>(() => parseTags(useDailyStore.getState().frontmatter));
  // CodeMirror を差し込む DOM 要素への参照
  const containerRef = useRef<HTMLDivElement>(null);
  // CodeMirror インスタンスへの参照
  const viewRef = useRef<EditorView | null>(null);

  // ── 保存処理 ────────────────────────
  // setSaveError をクロージャで捕捉するため useMemo で安定化する
  const handleSave = useMemo(() => () => {
    const { content } = useDailyStore.getState();
    if (hasFrontmatter(content)) {
      setSaveError("本文にフロントマターを含めることはできません");
      return;
    }
    useDailyStore.getState().saveDiary();
  }, []);

  // ── エディタ拡張 ────────────────────────
  const editorExtensions = useMemo(() => createEditorExtensions(
    handleSave,
    (content) => useDailyStore.getState().setContent(content),
  ), [handleSave]);

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

  // ── 日記の日付切り替え時にエディタの内容とタグを同期する ────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    const { content, frontmatter } = useDailyStore.getState();

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
    // openDiary 後に frontmatter からタグを再初期化する
    setTags(parseTags(frontmatter));
  }, [currentDate]);

  // ── タグ変更時にストアの frontmatter を更新する ────────────────────────
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    useDailyStore.getState().setTags(newTags);
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
                onClick={handleSave}
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

      {/* ── フロントマター混入エラーダイアログ ──────────────────────── */}
      <Dialog open={saveError !== null} onClose={() => setSaveError(null)}>
        <DialogTitle>保存できません</DialogTitle>
        <DialogContent>
          <Typography>{saveError}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveError(null)}>閉じる</Button>
        </DialogActions>
      </Dialog>

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
