import { useEffect, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState, Transaction } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { Box, Typography } from "@mui/material";
import { useDailyStore } from "../store/dailyStore";
import { uiFont } from "../theme";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// ── エディタテーマ ────────────────────────
const editorTheme = EditorView.theme({
  // .cm-editor 本体のCSS
  "&": { height: "100%", fontFamily: uiFont, fontSize: "1rem" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": { padding: "16px" },
  // フォーカス時のアウトラインを除去する（MUI の outline と二重にならないよう）
  ".cm-focused": { outline: "none" },
});

// ── エディタ拡張 ────────────────────────
const editorExtensions = [
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
  // Transaction.remote がマークされた書き換えは除外する
  EditorView.updateListener.of((update) => {
    if (update.docChanged && !update.transactions.some((t) => t.annotation(Transaction.remote))) {
      useDailyStore.getState().setContent(update.state.doc.toString());
    }
  }),
];

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function EditorPane() {
  // content の更新で再レンダリングしないよう、セレクタで currentDate と isDirty だけを購読する
  const currentDate = useDailyStore((s) => s.currentDate);
  const isDirty = useDailyStore((s) => s.isDirty);
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
        // プログラムによる書き換えとしてマークする
        annotations: Transaction.remote.of(true),
      });
    }
  }, [currentDate]);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", bgcolor: "background.paper", overflow: "hidden" }}>
      {/* 現在開いている日付を表示するヘッダーバー */}
      <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "text.secondary", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
          {currentDate ?? "—"}
        </Typography>
        {isDirty && (
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
            未保存
          </Typography>
        )}
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
