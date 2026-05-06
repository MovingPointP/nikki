import { createTheme } from "@mui/material/styles";

const notoSans = '"Noto Sans JP", sans-serif';
const contentFont = '"Playfair Display", "Noto Serif JP", serif';

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
    },
  },
  typography: {
    fontFamily: notoSans,
    body1: {
      fontFamily: contentFont,
    },
    body2: {
      fontFamily: contentFont,
    },
    button: {
      textTransform: "none", // テキストが自動的に大文字になるのを無効化
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#F0F2BD",
        },
      },
    },
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
