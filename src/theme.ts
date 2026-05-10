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

const notoSans = '"Noto Sans JP", sans-serif';
// CodeMirror など 特定の箇所で使うためエクスポートする
export const contentFont = '"Playfair Display", "Noto Serif JP", serif';

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
      main: "#B2CD9C",
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
