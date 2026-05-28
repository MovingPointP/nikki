import { EditorView, keymap } from "@codemirror/view";
import { Transaction } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { uiFont } from "../theme";

// ────────────────────────────────────────────
// テーマ
// ────────────────────────────────────────────

// EditorPane・TemplateEditorPane で共通のエディタ外観
export const editorTheme = EditorView.theme({
  // .cm-editor 本体のCSS
  "&": { height: "100%", fontFamily: uiFont, fontSize: "1rem" },
  ".cm-scroller": { overflow: "auto" },
  ".cm-content": { padding: "16px" },
  // フォーカス時のアウトラインを除去する（MUI の outline と二重にならないよう）
  ".cm-focused": { outline: "none" },
});

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

// onSave・onContentChange だけが異なるエディタ拡張を生成する
export function createEditorExtensions(
  // Ctrl+S 押下時の保存処理
  onSave: () => void,
  // ドキュメント変更時の content 更新処理
  onContentChange: (content: string) => void,
) {
  return [
    markdown(),
    EditorView.lineWrapping,
    editorTheme,
    // Ctrl+Z/Ctrl+Y での undo/redo を有効にする
    history(),
    keymap.of([
      // Ctrl+S で保存する
      {
        key: "Mod-s",
        run: () => { onSave(); return true; },
      },
      // 履歴操作キー
      ...historyKeymap,
      // カーソル移動・選択・削除などの標準テキスト編集キー
      ...defaultKeymap,
    ]),
    // ドキュメントが変更されたときに content を更新する
    // Transaction.remote がマークされた書き換えは除外する
    EditorView.updateListener.of((update) => {
      if (update.docChanged && !update.transactions.some((t) => t.annotation(Transaction.remote))) {
        onContentChange(update.state.doc.toString());
      }
    }),
  ];
}
