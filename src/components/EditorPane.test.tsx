import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditorPane from "./EditorPane";

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

vi.mock("../store/dailyStore", () => ({
  // Object.assign で getState を型に含める
  useDailyStore: Object.assign(vi.fn(), { getState: vi.fn() }),
}));

import { useDailyStore } from "../store/dailyStore";
const mockUseDailyStore = vi.mocked(useDailyStore);
const mockGetState      = vi.mocked((useDailyStore as any).getState as () => unknown);

const mockSaveDiary   = vi.fn();
const mockDeleteDiary = vi.fn();

function mockState(state: { currentDate: string | null; isDirty?: boolean; dateList?: string[] }) {
  const full = { isDirty: false, dateList: [], content: "", ...state };
  mockUseDailyStore.mockImplementation((selector) => selector(full as Parameters<typeof selector>[0]));
  mockGetState.mockReturnValue({
    content: "",
    saveDiary: mockSaveDiary,
    deleteDiary: mockDeleteDiary,
    setContent: vi.fn(),
  } as unknown as ReturnType<typeof mockGetState>);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockState({ currentDate: null });
});

// ────────────────────────────────────────────
// ヘッダー表示
// ────────────────────────────────────────────

describe("ヘッダー表示", () => {
  it("currentDate が null のとき「—」が表示される", () => {
    render(<EditorPane />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("currentDate が設定されているとき日付が表示される", () => {
    mockState({ currentDate: "2024-01-01" });
    render(<EditorPane />);
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
  });

  it("isDirty が true のとき「未保存」が表示される", () => {
    mockState({ currentDate: "2024-01-01", isDirty: true });
    render(<EditorPane />);
    expect(screen.getByText("未保存")).toBeInTheDocument();
  });

  it("isDirty が false のとき「未保存」が表示されない", () => {
    mockState({ currentDate: "2024-01-01", isDirty: false });
    render(<EditorPane />);
    expect(screen.queryByText("未保存")).not.toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// ボタンの disabled 状態
// ────────────────────────────────────────────

describe("ボタンの disabled 状態", () => {
  it("currentDate が null のとき保存ボタンが disabled になる", () => {
    render(<EditorPane />);
    expect(screen.getByTestId("SaveIcon").closest("button")).toBeDisabled();
  });

  it("currentDate が設定されているとき保存ボタンが有効になる", () => {
    mockState({ currentDate: "2024-01-01" });
    render(<EditorPane />);
    expect(screen.getByTestId("SaveIcon").closest("button")).not.toBeDisabled();
  });

  it("dateList に currentDate がないとき削除ボタンが disabled になる", () => {
    mockState({ currentDate: "2024-01-01", dateList: [] });
    render(<EditorPane />);
    expect(screen.getByTestId("DeleteIcon").closest("button")).toBeDisabled();
  });

  it("dateList に currentDate があるとき削除ボタンが有効になる", () => {
    mockState({ currentDate: "2024-01-01", dateList: ["2024-01-01"] });
    render(<EditorPane />);
    expect(screen.getByTestId("DeleteIcon").closest("button")).not.toBeDisabled();
  });
});

// ────────────────────────────────────────────
// プレースホルダー
// ────────────────────────────────────────────

describe("プレースホルダー", () => {
  it("currentDate が null のとき案内文が表示される", () => {
    render(<EditorPane />);
    expect(screen.getByText("カレンダーから日付を選んでください")).toBeInTheDocument();
  });

  it("currentDate が設定されているとき案内文が表示されない", () => {
    mockState({ currentDate: "2024-01-01" });
    render(<EditorPane />);
    expect(screen.queryByText("カレンダーから日付を選んでください")).not.toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// 削除ダイアログ
// ────────────────────────────────────────────

describe("削除ダイアログ", () => {
  it("削除ボタンをクリックするとダイアログが開く", async () => {
    mockState({ currentDate: "2024-01-01", dateList: ["2024-01-01"] });
    render(<EditorPane />);
    await userEvent.click(screen.getByTestId("DeleteIcon").closest("button")!);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("キャンセルボタンでダイアログが閉じる", async () => {
    mockState({ currentDate: "2024-01-01", dateList: ["2024-01-01"] });
    render(<EditorPane />);
    await userEvent.click(screen.getByTestId("DeleteIcon").closest("button")!);
    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    // MUI Dialog は閉じるアニメーション中もDOMに残るため waitFor で待機する
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("削除ボタンで deleteDiary が呼ばれる", async () => {
    mockState({ currentDate: "2024-01-01", dateList: ["2024-01-01"] });
    render(<EditorPane />);
    await userEvent.click(screen.getByTestId("DeleteIcon").closest("button")!);
    await userEvent.click(screen.getByRole("button", { name: "削除" }));
    expect(mockDeleteDiary).toHaveBeenCalledWith("2024-01-01");
  });
});
