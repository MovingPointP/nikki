import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
// DIVIDER_WIDTH の named export を保持しつつ testid を付与
vi.mock("../ui/ResizeDivider", () => ({
  default: ({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) => (
    <div data-testid="resize-divider" onMouseDown={onMouseDown} />
  ),
  DIVIDER_WIDTH: 8,
}));

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

// ────────────────────────────────────────────
// リサイズ
// ────────────────────────────────────────────

describe("リサイズ", () => {
  afterEach(() => {
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    vi.restoreAllMocks();
  });

  it("ResizeDivider が描画される", () => {
    render(<MainLayout />);
    expect(screen.getByTestId("resize-divider")).toBeInTheDocument();
  });

  it("ハンドルを mousedown するとカーソルとテキスト選択がロックされる", () => {
    render(<MainLayout />);
    fireEvent.mouseDown(screen.getByTestId("resize-divider"));
    expect(document.body.style.cursor).toBe("col-resize");
    expect(document.body.style.userSelect).toBe("none");
  });

  it("mouseup するとカーソルとテキスト選択がリセットされる", () => {
    render(<MainLayout />);
    fireEvent.mouseDown(screen.getByTestId("resize-divider"));
    fireEvent.mouseUp(window);
    expect(document.body.style.cursor).toBe("");
    expect(document.body.style.userSelect).toBe("");
  });

  it("mousedown 前は mousemove リスナーが window に登録されていない", () => {
    render(<MainLayout />);
    // render + useEffect 完了後にスパイを張り、以降の呼び出しを監視
    const spy = vi.spyOn(window, "addEventListener");
    expect(spy).not.toHaveBeenCalledWith("mousemove", expect.any(Function));
  });

  it("mousedown 後に mousemove リスナーが window に登録される", () => {
    render(<MainLayout />);
    const spy = vi.spyOn(window, "addEventListener");
    fireEvent.mouseDown(screen.getByTestId("resize-divider"));
    expect(spy).toHaveBeenCalledWith("mousemove", expect.any(Function));
  });

  it("mouseup 後に mousemove リスナーが window から解除される", () => {
    render(<MainLayout />);
    fireEvent.mouseDown(screen.getByTestId("resize-divider"));
    const spy = vi.spyOn(window, "removeEventListener");
    fireEvent.mouseUp(window);
    expect(spy).toHaveBeenCalledWith("mousemove", expect.any(Function));
  });

  it("ドラッグでエディタ幅の割合が変化する", () => {
    // コンテナ幅 1000px、ハンドル幅 8px → ペイン領域 992px
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      left: 0, width: 1000, top: 0, right: 1000, bottom: 600, height: 600, x: 0, y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    render(<MainLayout />);
    const editorWrapper = screen.getByTestId("editor-pane").parentElement!;

    // 初期値は 50%（コンテナ比）
    expect(Number(editorWrapper.dataset.editorWidth)).toBeCloseTo(50, 0);

    // clientX=300 → ペイン領域比 (300/992)*100 ≈ 30.24% → コンテナ比 30.24*992/1000 ≈ 30.0%
    fireEvent.mouseDown(screen.getByTestId("resize-divider"));
    fireEvent.mouseMove(window, { clientX: 300 });

    expect(Number(editorWrapper.dataset.editorWidth)).toBeCloseTo(30, 0);
  });
});
