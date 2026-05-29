import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TemplateEditorPane from "./TemplateEditorPane";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

// CodeMirror は jsdom 上でのDOM操作が想定外のためモックする
vi.mock("@codemirror/view", () => {
  class EditorView {
    destroy  = vi.fn();
    dispatch = vi.fn();
    state    = { doc: { toString: () => "" } };
    static theme          = vi.fn(() => ({}));
    static lineWrapping   = {};
    static updateListener = { of: vi.fn(() => ({})) };
  }
  return { EditorView, keymap: { of: vi.fn(() => ({})) } };
});

vi.mock("@codemirror/state", () => ({
  EditorState: { create: vi.fn(() => ({})) },
  Transaction: { remote: { of: vi.fn(() => ({})) } },
}));

vi.mock("@codemirror/lang-markdown", () => ({ markdown: vi.fn(() => ({})) }));

vi.mock("@codemirror/commands", () => ({
  defaultKeymap: [],
  history:       vi.fn(() => ({})),
  historyKeymap: [],
}));

vi.mock("../../store/templateStore", () => ({
  // Object.assign で getState を型に含める
  useTemplateStore: Object.assign(vi.fn(), { getState: vi.fn() }),
}));

vi.mock("../../store/settingsStore", () => ({
  useSettingsStore: vi.fn(),
}));

import { useTemplateStore } from "../../store/templateStore";
import { useSettingsStore } from "../../store/settingsStore";
const mockUseTemplateStore = vi.mocked(useTemplateStore);
const mockUseSettingsStore = vi.mocked(useSettingsStore);
const mockGetState         = vi.mocked((useTemplateStore as any).getState as () => unknown);

const mockSaveTemplate = vi.fn();
const mockLoadTemplate = vi.fn().mockResolvedValue(undefined);

function mockState(state: { isDirty?: boolean; isSaving?: boolean; content?: string; savePath?: string | null }) {
  const full = { isDirty: false, isSaving: false, isLoaded: false, content: "", savePath: "/test", ...state };
  mockUseTemplateStore.mockImplementation((selector) => selector(full as unknown as Parameters<typeof selector>[0]));
  mockUseSettingsStore.mockImplementation((selector) => selector({ savePath: full.savePath } as Parameters<typeof selector>[0]));
  mockGetState.mockReturnValue({
    isDirty: full.isDirty,
    isSaving: full.isSaving,
    content: full.content,
    loadTemplate: mockLoadTemplate,
    saveTemplate: mockSaveTemplate,
    setContent: vi.fn(),
  } as unknown as ReturnType<typeof mockGetState>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLoadTemplate.mockResolvedValue(undefined);
  mockState({ isDirty: false });
});

// ────────────────────────────────────────────
// ヘッダー表示
// ────────────────────────────────────────────

describe("ヘッダー表示", () => {
  it("「テンプレート」ラベルが常に表示される", () => {
    render(<TemplateEditorPane />);
    expect(screen.getByText("テンプレート")).toBeInTheDocument();
  });

  it("isDirty が true のとき「未保存」が表示される", () => {
    mockState({ isDirty: true });
    render(<TemplateEditorPane />);
    expect(screen.getByText("未保存")).toBeInTheDocument();
  });

  it("isDirty が false のとき「未保存」が表示されない", () => {
    render(<TemplateEditorPane />);
    expect(screen.queryByText("未保存")).not.toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// 保存ボタン
// ────────────────────────────────────────────

describe("保存ボタン", () => {
  it("savePath が設定されていれば保存ボタンが有効になっている", () => {
    render(<TemplateEditorPane />);
    expect(screen.getByTestId("SaveIcon").closest("button")).not.toBeDisabled();
  });

  it("savePath が未設定のとき保存ボタンが無効になっている", () => {
    mockState({ savePath: null });
    render(<TemplateEditorPane />);
    expect(screen.getByTestId("SaveIcon").closest("button")).toBeDisabled();
  });

  it("isSaving が true のとき保存ボタンが無効になっている", () => {
    mockState({ isSaving: true });
    render(<TemplateEditorPane />);
    expect(screen.getByTestId("SaveIcon").closest("button")).toBeDisabled();
  });

  it("保存ボタンをクリックすると saveTemplate が呼ばれる", async () => {
    render(<TemplateEditorPane />);
    await userEvent.click(screen.getByTestId("SaveIcon").closest("button")!);
    expect(mockSaveTemplate).toHaveBeenCalled();
  });
});

// ────────────────────────────────────────────
// 初期化
// ────────────────────────────────────────────

describe("初期化", () => {
  it("isDirty が false のときマウント時に loadTemplate が呼ばれる", () => {
    render(<TemplateEditorPane />);
    expect(mockLoadTemplate).toHaveBeenCalled();
  });

  it("isDirty が true のときマウント時に loadTemplate が呼ばれない", () => {
    mockState({ isDirty: true });
    render(<TemplateEditorPane />);
    expect(mockLoadTemplate).not.toHaveBeenCalled();
  });
});
