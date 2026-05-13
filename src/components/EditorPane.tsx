import { useEffect, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { Box, Typography } from "@mui/material";
import { useDailyStore } from "../store/dailyStore";
import { contentFont } from "../theme";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

const editorTheme = EditorView.theme({
  // .cm-editor 本体のCSS
  "&": { height: "100%", fontFamily: contentFont, fontSize: "1rem" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": { padding: "16px" },
  // フォーカス時のアウトラインを除去する（MUI の outline と二重にならないよう）
  ".cm-focused": { outline: "none" },
});

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function EditorPane() {
  // content の更新で再レンダリングしないよう、セレクタで currentDate だけを購読する
  const currentDate = useDailyStore((s) => s.currentDate);
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
        extensions: [
          markdown(),
          EditorView.lineWrapping,
          editorTheme,
          // Ctrl+Z/Ctrl+Y での undo/redo を有効にする
          history(),
          keymap.of([
            // Ctrl+S で日記を保存する
            {
              key: "Mod-s",
              run: () => { useDailyStore.getState().saveDiary(); return true; },
            },
            // 履歴操作キー
            ...historyKeymap,
            // カーソル移動・選択・削除などの標準テキスト編集キー
            ...defaultKeymap,
          ]),
          // ドキュメントが変更されたときにストアの content を更新する
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              useDailyStore.getState().setContent(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    return () => view.destroy();
  }, []);

  // ── 日記の日付切り替え時にエディタの内容を同期する ────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const content = useDailyStore.getState().content;
    const currentDoc = view.state.doc.toString();
    // CodeMirror のドキュメントとストアの content が異なる場合に実行
    if (currentDoc !== content) {
      // CodeMirror のドキュメントを content に更新
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: content },
      });
    }
  }, [currentDate]);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", bgcolor: "background.paper", overflow: "hidden" }}>
      {/* 現在開いている日付を表示するヘッダーバー */}
      <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "text.secondary" }}>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
          {currentDate ?? "—"}
        </Typography>
      </Box>

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
    </Box>
  );
}
