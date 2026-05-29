import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MainLayout from "./MainLayout";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

// 子コンポーネントを最小実装に差し替える
vi.mock("./Sidebar",                    () => ({ default: () => <div data-testid="sidebar" /> }));
vi.mock("../diary/EditorPane",          () => ({ default: () => <div data-testid="editor-pane" /> }));
vi.mock("../diary/PreviewPane",         () => ({ default: () => <div data-testid="preview-pane" /> }));
vi.mock("../template/TemplateEditorPane",  () => ({ default: () => <div data-testid="template-editor-pane" /> }));
vi.mock("../template/TemplatePreviewPane", () => ({ default: () => <div data-testid="template-preview-pane" /> }));
vi.mock("../settings/SettingsModal",    () => ({ default: () => <div data-testid="settings-modal" /> }));
vi.mock("../calendar/CalendarModal",    () => ({ default: () => <div data-testid="calendar-modal" /> }));

vi.mock("../../store/uiStore");

import { useUiStore } from "../../store/uiStore";
import type { AppMode } from "../../store/uiStore";
const mockUseUiStore = vi.mocked(useUiStore);

function mockMode(mode: AppMode) {
  mockUseUiStore.mockImplementation((selector) =>
    selector({ mode, setMode: vi.fn() } as Parameters<typeof selector>[0])
  );
}

beforeEach(() => {
  mockMode("diary");
});

// ────────────────────────────────────────────
// 共通
// ────────────────────────────────────────────

describe("共通", () => {
  it("Sidebar・SettingsModal・CalendarModal が常に描画される", () => {
    render(<MainLayout />);
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-modal")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// diary モード
// ────────────────────────────────────────────

describe("diary モード", () => {
  it("EditorPane・PreviewPane が描画される", () => {
    render(<MainLayout />);
    expect(screen.getByTestId("editor-pane")).toBeInTheDocument();
    expect(screen.getByTestId("preview-pane")).toBeInTheDocument();
  });

  it("TemplateEditorPane・TemplatePreviewPane が描画されない", () => {
    render(<MainLayout />);
    expect(screen.queryByTestId("template-editor-pane")).not.toBeInTheDocument();
    expect(screen.queryByTestId("template-preview-pane")).not.toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// template モード
// ────────────────────────────────────────────

describe("template モード", () => {
  it("TemplateEditorPane・TemplatePreviewPane が描画される", () => {
    mockMode("template");
    render(<MainLayout />);
    expect(screen.getByTestId("template-editor-pane")).toBeInTheDocument();
    expect(screen.getByTestId("template-preview-pane")).toBeInTheDocument();
  });

  it("EditorPane・PreviewPane が描画されない", () => {
    mockMode("template");
    render(<MainLayout />);
    expect(screen.queryByTestId("editor-pane")).not.toBeInTheDocument();
    expect(screen.queryByTestId("preview-pane")).not.toBeInTheDocument();
  });
});
