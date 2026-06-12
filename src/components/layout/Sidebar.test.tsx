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
  it("全モードのアイコンが常に表示される", () => {
    render(<Sidebar />);
    expect(screen.getByTestId("BookIcon")).toBeInTheDocument();
    expect(screen.getByTestId("DashboardIcon")).toBeInTheDocument();
    expect(screen.getByTestId("SearchIcon")).toBeInTheDocument();
  });

  it("diary モードのとき BookIcon ボタンが disabled になる", () => {
    render(<Sidebar />);
    expect(screen.getByTestId("BookIcon").closest("button")).toBeDisabled();
  });

  it("template モードのとき DashboardIcon ボタンが disabled になる", () => {
    useUiStore.setState({ mode: "template" });
    render(<Sidebar />);
    expect(screen.getByTestId("DashboardIcon").closest("button")).toBeDisabled();
  });

  it("search モードのとき SearchIcon ボタンが disabled になる", () => {
    useUiStore.setState({ mode: "search" });
    render(<Sidebar />);
    expect(screen.getByTestId("SearchIcon").closest("button")).toBeDisabled();
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

  it("SearchIcon ボタンをクリックすると search モードになる", async () => {
    render(<Sidebar />);
    await userEvent.click(screen.getByTestId("SearchIcon").closest("button")!);
    expect(useUiStore.getState().mode).toBe("search");
  });
});
