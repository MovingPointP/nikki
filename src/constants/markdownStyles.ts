import type { SxProps, Theme } from "@mui/material";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// ReactMarkdown が生成する HTML 要素へ適用する MUI sx スタイル
export const MARKDOWN_STYLES: SxProps<Theme> = {
  "& h1": { fontSize: "1.8rem", fontWeight: 700, mt: 3, mb: 1.5, borderBottom: "1px solid", borderColor: "divider", pb: 0.5 },
  "& h2": { fontSize: "1.4rem", fontWeight: 700, mt: 2.5, mb: 1 },
  "& h3": { fontSize: "1.1rem", fontWeight: 700, mt: 2, mb: 0.75 },
  "& p":  { lineHeight: 1.9, mb: 1.5 },
  "& ul, & ol": { pl: 3, mb: 1.5 },
  "& li": { lineHeight: 1.9, mb: 0.25 },
  "& blockquote": {
    borderLeft: "4px solid",
    borderColor: "primary.main",
    pl: 2,
    ml: 0,
    my: 1.5,
    color: "text.secondary",
    fontStyle: "italic",
  },
  "& code": {
    fontFamily: "monospace",
    bgcolor: "action.hover",
    px: 0.75,
    py: 0.25,
    borderRadius: 1,
    fontSize: "0.875em",
  },
  "& pre": {
    bgcolor: "action.hover",
    p: 2,
    borderRadius: 2,
    overflow: "auto",
    mb: 1.5,
    "& code": { bgcolor: "transparent", p: 0 },
  },
  "& table": { borderCollapse: "collapse", width: "100%", mb: 1.5 },
  "& th, & td": { border: "1px solid", borderColor: "divider", px: 1.5, py: 0.75, textAlign: "left" },
  "& th": { bgcolor: "action.hover", fontWeight: 700 },
  "& hr": { border: "none", borderTop: "1px solid", borderColor: "divider", my: 2 },
  "& a": { color: "primary.main", textDecoration: "underline" },
  "& img": { maxWidth: "100%" },
  "& del": { textDecoration: "line-through", color: "text.secondary" },
};
