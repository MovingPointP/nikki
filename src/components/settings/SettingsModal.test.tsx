import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsModal from "./SettingsModal";
import { useModalStore } from "../../store/modalStore";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("./SettingsForm", () => ({ default: () => <div data-testid="settings-form" /> }));

beforeEach(() => {
  useModalStore.setState({ activeModal: null });
});

// ────────────────────────────────────────────
// テスト
// ────────────────────────────────────────────

describe("SettingsModal", () => {
  it("activeModal が settings のときダイアログが開く", () => {
    useModalStore.setState({ activeModal: "settings" });
    render(<SettingsModal />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("activeModal が settings でないときダイアログが閉じている", () => {
    render(<SettingsModal />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("閉じるボタンをクリックすると activeModal が null になる", async () => {
    useModalStore.setState({ activeModal: "settings" });
    render(<SettingsModal />);
    await userEvent.click(screen.getByTestId("CloseIcon").closest("button")!);
    expect(useModalStore.getState().activeModal).toBeNull();
  });
});
