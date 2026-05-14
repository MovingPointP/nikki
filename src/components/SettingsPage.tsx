import { Box, Paper } from "@mui/material";
import SettingsForm from "./SettingsForm";

export default function SettingsPage() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper sx={{ p: 4, width: 480 }} elevation={2}>
        <SettingsForm />
      </Paper>
    </Box>
  );
}
