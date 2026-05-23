import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MainLayout from "./MainLayout";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

// 子コンポーネントを最小実装に差し替える
vi.mock("./Sidebar",       () => ({ default: () => <div data-testid="sidebar" /> }));
vi.mock("./EditorPane",    () => ({ default: () => <div data-testid="editor-pane" /> }));
vi.mock("./PreviewPane",   () => ({ default: () => <div data-testid="preview-pane" /> }));
vi.mock("./SettingsModal", () => ({ default: () => <div data-testid="settings-modal" /> }));
vi.mock("./CalendarModal", () => ({ default: () => <div data-testid="calendar-modal" /> }));

// ────────────────────────────────────────────
// テスト
// ────────────────────────────────────────────

describe("MainLayout", () => {
  it("Sidebar・EditorPane・PreviewPane が描画される", () => {
    render(<MainLayout />);
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("editor-pane")).toBeInTheDocument();
    expect(screen.getByTestId("preview-pane")).toBeInTheDocument();
  });

  it("SettingsModal・CalendarModal が描画される", () => {
    render(<MainLayout />);
    expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-modal")).toBeInTheDocument();
  });
});
