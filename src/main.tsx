import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// UIフォント（Noto Sans JP）と コンテンツフォント（Noto Serif JP / Playfair Display）を読み込む
// 使用するウェイトだけインポートしてバンドルサイズを抑える
import "@fontsource/noto-sans-jp/400.css";
import "@fontsource/noto-sans-jp/500.css";
import "@fontsource/noto-sans-jp/700.css";
import "@fontsource/noto-serif-jp/400.css";
import "@fontsource/noto-serif-jp/700.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/700.css";
import theme from "./theme";
import "./index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* ブラウザのデフォルトスタイルをリセットし、MUI のベーススタイルを適用する */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
