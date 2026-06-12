import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TagSearchPane from "./TagSearchPane";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("../../store/dailyStore", () => ({
  useDailyStore: Object.assign(vi.fn(), { getState: vi.fn() }),
}));
vi.mock("../../store/uiStore", () => ({
  useUiStore: Object.assign(vi.fn(), { getState: vi.fn() }),
}));
vi.mock("../../store/searchStore", () => ({
  useSearchStore: Object.assign(vi.fn(), { getState: vi.fn() }),
}));

import { useDailyStore } from "../../store/dailyStore";
import { useUiStore } from "../../store/uiStore";
import { useSearchStore } from "../../store/searchStore";

const mockUseDailyStore  = vi.mocked(useDailyStore);
const mockUseSearchStore = vi.mocked(useSearchStore);

const mockOpenDiary      = vi.fn();
const mockSetMode        = vi.fn();
const mockSetSelectedTag = vi.fn();
const mockSetHoveredDate = vi.fn();

function setup(tagIndex: Record<string, string[]>, selectedTag: string | null = null) {
  mockUseDailyStore.mockImplementation((selector: any) => selector({ tagIndex }));
  mockUseSearchStore.mockImplementation((selector: any) => selector({ selectedTag }));
  vi.mocked((useDailyStore  as any).getState).mockReturnValue({ openDiary: mockOpenDiary });
  vi.mocked((useUiStore     as any).getState).mockReturnValue({ setMode: mockSetMode });
  vi.mocked((useSearchStore as any).getState).mockReturnValue({ setSelectedTag: mockSetSelectedTag, setHoveredDate: mockSetHoveredDate });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ────────────────────────────────────────────
// タグ一覧
// ────────────────────────────────────────────

describe("タグ一覧", () => {
  it("tagIndex が空のとき「タグがありません」が表示される", () => {
    setup({});
    render(<TagSearchPane />);
    expect(screen.getByText("タグがありません")).toBeInTheDocument();
  });

  it("tagIndex のキーがチップとして表示される", () => {
    setup({ 旅行: ["2024-01-01"], 映画: ["2024-02-01"] });
    render(<TagSearchPane />);
    expect(screen.getByText("旅行")).toBeInTheDocument();
    expect(screen.getByText("映画")).toBeInTheDocument();
  });

  it("タグをクリックすると setSelectedTag が呼ばれる", async () => {
    setup({ 旅行: ["2024-01-01"] });
    render(<TagSearchPane />);
    await userEvent.click(screen.getByText("旅行"));
    expect(mockSetSelectedTag).toHaveBeenCalledWith("旅行");
  });

  it("選択中のタグを再クリックすると null で setSelectedTag が呼ばれる", async () => {
    setup({ 旅行: ["2024-01-01"] }, "旅行");
    render(<TagSearchPane />);
    await userEvent.click(screen.getByText("旅行"));
    expect(mockSetSelectedTag).toHaveBeenCalledWith(null);
  });
});

// ────────────────────────────────────────────
// 検索結果
// ────────────────────────────────────────────

describe("検索結果", () => {
  it("タグ未選択のとき「タグを選択してください」が表示される", () => {
    setup({ 旅行: ["2024-01-01"] }, null);
    render(<TagSearchPane />);
    expect(screen.getByText("タグを選択してください")).toBeInTheDocument();
  });

  it("タグを選択すると一致する日付が表示される", () => {
    setup({ 旅行: ["2024-01-01", "2024-02-01"] }, "旅行");
    render(<TagSearchPane />);
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
    expect(screen.getByText("2024-02-01")).toBeInTheDocument();
  });

  it("日付は新しい順に表示される", () => {
    // tagIndex の日付は dailyStore で昇順ソートされて保存される
    setup({ 旅行: ["2024-01-01", "2024-02-01", "2024-03-01"] }, "旅行");
    render(<TagSearchPane />);
    const items = screen.getAllByRole("button").filter((el) => /^\d{4}-\d{2}-\d{2}$/.test(el.textContent ?? ""));
    expect(items[0]).toHaveTextContent("2024-03-01");
    expect(items[2]).toHaveTextContent("2024-01-01");
  });

  it("日付をクリックすると openDiary と setMode が呼ばれる", async () => {
    setup({ 旅行: ["2024-01-01"] }, "旅行");
    render(<TagSearchPane />);
    await userEvent.click(screen.getByText("2024-01-01"));
    expect(mockOpenDiary).toHaveBeenCalledWith("2024-01-01");
    expect(mockSetMode).toHaveBeenCalledWith("diary");
  });

  it("日付にホバーすると setHoveredDate が呼ばれる", () => {
    setup({ 旅行: ["2024-01-01"] }, "旅行");
    render(<TagSearchPane />);
    fireEvent.mouseEnter(screen.getByText("2024-01-01"));
    expect(mockSetHoveredDate).toHaveBeenCalledWith("2024-01-01");
  });

  it("日付からホバーが外れると setHoveredDate(null) が呼ばれる", () => {
    setup({ 旅行: ["2024-01-01"] }, "旅行");
    render(<TagSearchPane />);
    fireEvent.mouseLeave(screen.getByText("2024-01-01"));
    expect(mockSetHoveredDate).toHaveBeenCalledWith(null);
  });
});
