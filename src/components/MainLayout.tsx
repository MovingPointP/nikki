import { Box, Divider, Typography } from "@mui/material";

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* サイドバー */}
      <Box
        sx={{
          width: 240,
          display: "flex",
          flexDirection: "column",
          bgcolor: "primary.dark",
          overflow: "auto",
        }}
      >
        <Typography variant="subtitle2" sx={{ p: 2, color: "text.dark"}}>
          サイドバー（未実装）
        </Typography>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* エディタペイン */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <Typography variant="subtitle2" sx={{ p: 2, color: "text.secondary" }}>
          エディタ（未実装）
        </Typography>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* プレビューペイン */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
          overflow: "auto",
        }}
      >
        <Typography variant="subtitle2" sx={{ p: 2, color: "text.secondary" }}>
          プレビュー（未実装）
        </Typography>
      </Box>

    </Box>
  );
}
