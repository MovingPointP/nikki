import { useEffect, useRef } from "react";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useTemplateStore } from "../../store/templateStore";
import { useSettingsStore } from "../../store/settingsStore";
import { createEditorExtensions } from "../../lib/editor";
import PaneContainer from "../ui/PaneContainer";
import PaneHeader from "../ui/PaneHeader";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// ── エディタ拡張 ────────────────────────
const editorExtensions = createEditorExtensions(
  // Ctrl+S でテンプレートを保存する
  () => useTemplateStore.getState().saveTemplate(),
  (content) => useTemplateStore.getState().setContent(content),
);

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function TemplateEditorPane() {
  // content の更新で再レンダリングしないよう、isDirty だけを購読する
  const isDirty = useTemplateStore((s) => s.isDirty);
  const isSaving = useTemplateStore((s) => s.isSaving);
  const savePath = useSettingsStore((s) => s.savePath);

  // CodeMirror を差し込む DOM 要素への参照
  const containerRef = useRef<HTMLDivElement>(null);
  // CodeMirror インスタンスへの参照
  const viewRef = useRef<EditorView | null>(null);

  // ── エディタの初期化とテンプレートの読み込み ────────────────────────
  useEffect(() => {
    // loadTemplate() が解決する前にアンマウントされた場合にエディタ生成をキャンセルするフラグ
    let destroyed = false;
    const store = useTemplateStore.getState();
    // 未保存の変更がある場合はストアの content をそのまま使い、ファイルを再読み込みしない
    const ready = store.isDirty ? Promise.resolve() : store.loadTemplate();

    ready.then(() => {
      if (destroyed || !containerRef.current) return;

      const view = new EditorView({
        state: EditorState.create({
          doc: useTemplateStore.getState().content,
          extensions: editorExtensions,
        }),
        parent: containerRef.current,
      });
      viewRef.current = view;
    });

    return () => {
      destroyed = true;
      viewRef.current?.destroy();
    };
  }, []);

  return (
    <PaneContainer>
      {/* テンプレート編集ヘッダーバー */}
      <PaneHeader sx={{ justifyContent: "space-between" }}>

        {/* 左：ラベル + 未保存インジケーター */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
            テンプレート
          </Typography>
          {isDirty && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              未保存
            </Typography>
          )}
        </Box>

        {/* 右：保存ボタン */}
        <Tooltip title="保存 (Ctrl+S)">
          {/* span をインライン要素のまま使うと行ボックス高さが加算されるため flex にする */}
          <Box component="span" sx={{ display: "flex" }}>
            <IconButton
              size="small"
              disabled={isSaving || !savePath}
              onClick={() => useTemplateStore.getState().saveTemplate()}
              sx={{ p: 0 }}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          </Box>
        </Tooltip>

      </PaneHeader>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {/* containerRef は常にマウントしておくことで useEffect でのエディタ初期化を保証する */}
        <Box ref={containerRef} sx={{ height: "100%" }} />
      </Box>
    </PaneContainer>
  );
}
