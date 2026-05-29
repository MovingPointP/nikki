import { Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SettingsForm from "./SettingsForm";
import { useModalStore } from "../../store/modalStore";

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function SettingsModal() {
  const open = useModalStore((s) => s.activeModal === "settings");

  return (
    <Dialog open={open} onClose={() => useModalStore.getState().closeModal()} maxWidth="xs" fullWidth>
      <IconButton
        onClick={() => useModalStore.getState().closeModal()}
        size="small"
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <DialogContent>
        <SettingsForm />
      </DialogContent>
    </Dialog>
  );
}
