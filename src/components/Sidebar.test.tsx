import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "./Sidebar";
import { useModalStore } from "../store/modalStore";

beforeEach(() => {
  useModalStore.setState({ activeModal: null });
});

describe("Sidebar", () => {
  it("カレンダーボタンをクリックすると calendar モーダルが開く", async () => {
    render(<Sidebar />);
    await userEvent.click(screen.getByTestId("CalendarMonthIcon").closest("button")!);
    expect(useModalStore.getState().activeModal).toBe("calendar");
  });

  it("設定ボタンをクリックすると settings モーダルが開く", async () => {
    render(<Sidebar />);
    await userEvent.click(screen.getByTestId("SettingsIcon").closest("button")!);
    expect(useModalStore.getState().activeModal).toBe("settings");
  });
});
