import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SettingsPage from "./SettingsPage";

vi.mock("../settings/SettingsForm", () => ({ default: () => <div data-testid="settings-form" /> }));

describe("SettingsPage", () => {
  it("SettingsForm が描画される", () => {
    render(<SettingsPage />);
    expect(screen.getByTestId("settings-form")).toBeInTheDocument();
  });
});
