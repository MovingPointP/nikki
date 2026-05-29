import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "./Sidebar";
import { useModalStore } from "../../store/modalStore";
import { useUiStore } from "../../store/uiStore";

beforeEach(() => {
  useModalStore.setState({ activeModal: null });
  useUiStore.setState({ mode: "diary" });
});

// ────────────────────────────────────────────
// モーダル
// ────────────────────────────────────────────

describe("モーダル", () => {
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

// ────────────────────────────────────────────
// モード切り替えボタン
// ────────────────────────────────────────────

describe("モード切り替えボタン", () => {
  it("diary モードのとき DashboardIcon が表示され BookIcon は表示されない", () => {
    render(<Sidebar />);
    expect(screen.getByTestId("DashboardIcon")).toBeInTheDocument();
    expect(screen.queryByTestId("BookIcon")).not.toBeInTheDocument();
  });

  it("template モードのとき BookIcon が表示され DashboardIcon は表示されない", () => {
    useUiStore.setState({ mode: "template" });
    render(<Sidebar />);
    expect(screen.getByTestId("BookIcon")).toBeInTheDocument();
    expect(screen.queryByTestId("DashboardIcon")).not.toBeInTheDocument();
  });

  it("DashboardIcon ボタンをクリックすると template モードになる", async () => {
    render(<Sidebar />);
    await userEvent.click(screen.getByTestId("DashboardIcon").closest("button")!);
    expect(useUiStore.getState().mode).toBe("template");
  });

  it("BookIcon ボタンをクリックすると diary モードになる", async () => {
    useUiStore.setState({ mode: "template" });
    render(<Sidebar />);
    await userEvent.click(screen.getByTestId("BookIcon").closest("button")!);
    expect(useUiStore.getState().mode).toBe("diary");
  });
});
