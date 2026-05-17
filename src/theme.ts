import { createTheme } from "@mui/material/styles";

// ────────────────────────────────────────────
// 型拡張
// ────────────────────────────────────────────

declare module "@mui/material/styles" {
  interface TypeText {
    // MUI デフォルトにない dark を追加（primary.dark 背景上の文字色として使用）
    dark: string;
  }
}

// ────────────────────────────────────────────
// フォント
// ────────────────────────────────────────────

// CodeMirror など MUI テーマを継承できない箇所で明示指定するためエクスポートする
export const uiFont = '"Noto Sans JP", sans-serif';
const notoSans = uiFont;

// ────────────────────────────────────────────
// テーマ定義
// ────────────────────────────────────────────

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#CA7842",
      dark: "#4B352A",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#8dcc5a",
      contrastText: "#4B352A",
    },
    background: {
      default: "#F0F2BD",
      paper: "#FAFAF3",
    },
    text: {
      primary: "#4B352A",
      secondary: "#7A5C47",
      dark: "#F0F2BD",
    },
  },
  typography: {
    fontFamily: notoSans,
    button: {
      textTransform: "none", // テキストが自動的に大文字になるのを無効化
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#4B352A",
          color: "#F0F2BD",
        },
      },
    },
  },
});

export default theme;
