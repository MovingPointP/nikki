import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalendarModal from "./CalendarModal";
import { useModalStore } from "../store/modalStore";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("../store/dailyStore", () => ({
  useDailyStore: Object.assign(vi.fn(), { getState: vi.fn() }),
}));

import { useDailyStore } from "../store/dailyStore";
const mockUseDailyStore = vi.mocked(useDailyStore);
const mockGetState      = vi.mocked((useDailyStore as any).getState as () => unknown);

const mockOpenDiary = vi.fn();

function mockState(dateList: string[] = []) {
  mockUseDailyStore.mockImplementation((selector) =>
    selector({ dateList } as Parameters<typeof selector>[0])
  );
  mockGetState.mockReturnValue({
    openDiary: mockOpenDiary,
  } as unknown as ReturnType<typeof mockGetState>);
}

beforeEach(() => {
  vi.clearAllMocks();
  useModalStore.setState({ activeModal: null });
  mockState();
});

// ────────────────────────────────────────────
// 開閉
// ────────────────────────────────────────────

describe("開閉", () => {
  it("activeModal が calendar のときダイアログが開く", () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("activeModal が calendar でないときダイアログが閉じている", () => {
    render(<CalendarModal />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// カレンダー表示
// ────────────────────────────────────────────

describe("カレンダー表示", () => {
  it("曜日ヘッダーが表示される", () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    ["日", "月", "火", "水", "木", "金", "土"].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it("年月ラベルが表示される", () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    expect(screen.getByText(/^\d+年$/)).toBeInTheDocument();
    expect(screen.getByText(/^\d+月$/)).toBeInTheDocument();
  });

  it("日記が存在する日付のドットが表示され、存在しない日付のドットは非表示になる", () => {
    const today = new Date();
    const year  = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    mockState([`${year}-${month}-05`, `${year}-${month}-10`]);
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);

    expect(screen.getByTestId("diary-dot-5")).toHaveAttribute("data-has-diary", "true");
    expect(screen.getByTestId("diary-dot-10")).toHaveAttribute("data-has-diary", "true");
    expect(screen.getByTestId("diary-dot-1")).toHaveAttribute("data-has-diary", "false");
  });

  it("1〜28日が表示される", () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    // 全月に必ず存在する1〜28日が描画されていることを確認する
    for (let d = 1; d <= 28; d++) {
      expect(screen.getAllByText(String(d)).length).toBeGreaterThan(0);
    }
  });
});

// ────────────────────────────────────────────
// 月移動
// ────────────────────────────────────────────

describe("月移動", () => {
  it("前月ボタンで月が変わる", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    const currentMonth = parseInt(screen.getByText(/^\d+月$/).textContent!);
    const expected = currentMonth === 1 ? 12 : currentMonth - 1;
    await userEvent.click(screen.getByTestId("ChevronLeftIcon").closest("button")!);
    expect(screen.getByText(`${expected}月`)).toBeInTheDocument();
  });

  it("次月ボタンで月が変わる", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    const currentMonth = parseInt(screen.getByText(/^\d+月$/).textContent!);
    const expected = currentMonth === 12 ? 1 : currentMonth + 1;
    await userEvent.click(screen.getByTestId("ChevronRightIcon").closest("button")!);
    expect(screen.getByText(`${expected}月`)).toBeInTheDocument();
  });

  it("1月から前月へ移動すると12月・前年になる", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    const currentYear = parseInt(screen.getByText(/^\d+年$/).textContent!);

    // 月ピッカーで1月に移動する
    await userEvent.click(screen.getByText(/^\d+月$/));
    await userEvent.click(screen.getByText("1月"));

    // 前月へ
    await userEvent.click(screen.getByTestId("ChevronLeftIcon").closest("button")!);
    expect(screen.getByText("12月")).toBeInTheDocument();
    expect(screen.getByText(`${currentYear - 1}年`)).toBeInTheDocument();
  });

  it("12月から次月へ移動すると1月・翌年になる", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    const currentYear = parseInt(screen.getByText(/^\d+年$/).textContent!);

    // 月ピッカーで12月に移動する
    await userEvent.click(screen.getByText(/^\d+月$/));
    await userEvent.click(screen.getByText("12月"));

    // 次月へ
    await userEvent.click(screen.getByTestId("ChevronRightIcon").closest("button")!);
    expect(screen.getByText("1月")).toBeInTheDocument();
    expect(screen.getByText(`${currentYear + 1}年`)).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// 年・月ピッカー
// ────────────────────────────────────────────

describe("年・月ピッカー", () => {
  it("年ラベルをクリックすると年ピッカーが表示される", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    await userEvent.click(screen.getByText(/^\d+年$/));
    // 年ピッカーには複数の年が並ぶ
    expect(screen.getAllByText(/^\d+年$/).length).toBeGreaterThan(1);
  });

  it("年ラベルを再クリックすると年ピッカーが閉じる", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    await userEvent.click(screen.getByText(/^\d+年$/));
    await userEvent.click(screen.getAllByText(/^\d+年$/)[0]);
    // ピッカーが閉じると年ラベルが1つだけになる
    expect(screen.getAllByText(/^\d+年$/).length).toBe(1);
  });

  it("年ピッカーで年を選ぶと年が変わりピッカーが閉じる", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    const currentYear = parseInt(screen.getByText(/^\d+年$/).textContent!);
    const targetYear  = currentYear - 1;

    await userEvent.click(screen.getByText(/^\d+年$/));
    await userEvent.click(screen.getByText(`${targetYear}年`));

    expect(screen.getByText(`${targetYear}年`)).toBeInTheDocument();
    // ピッカーが閉じると年ラベルが1つだけになる
    expect(screen.getAllByText(/^\d+年$/).length).toBe(1);
  });

  it("年ピッカー表示中に月ラベルをクリックすると月ピッカーに切り替わる", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    await userEvent.click(screen.getByText(/^\d+年$/));
    // 年ピッカーが開いている
    expect(screen.getAllByText(/^\d+年$/).length).toBeGreaterThan(1);

    await userEvent.click(screen.getAllByText(/^\d+月$/)[0]);
    // 月ピッカーの12ヶ月 + ヘッダーの月ラベル = 13
    expect(screen.getAllByText(/^\d+月$/).length).toBe(13);
    // 年ピッカーは閉じている
    expect(screen.getAllByText(/^\d+年$/).length).toBe(1);
  });

  it("月ラベルをクリックすると月ピッカーが表示される", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    await userEvent.click(screen.getByText(/^\d+月$/));
    // 月ピッカーの12ヶ月 + ヘッダーの月ラベル = 13
    expect(screen.getAllByText(/^\d+月$/).length).toBe(13);
  });

  it("月ピッカー表示中に年ラベルをクリックすると年ピッカーに切り替わる", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    await userEvent.click(screen.getByText(/^\d+月$/));
    // 月ピッカーが開いている
    expect(screen.getAllByText(/^\d+月$/).length).toBe(13);

    await userEvent.click(screen.getByText(/^\d+年$/));
    // 年ピッカーには複数の年が並ぶ
    expect(screen.getAllByText(/^\d+年$/).length).toBeGreaterThan(1);
    // 月ピッカーは閉じている
    expect(screen.getAllByText(/^\d+月$/).length).toBe(1);
  });

  it("月ラベルを再クリックすると月ピッカーが閉じる", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    await userEvent.click(screen.getByText(/^\d+月$/));
    await userEvent.click(screen.getAllByText(/^\d+月$/)[0]);
    // ピッカーが閉じると月ラベルが1つだけになる
    expect(screen.getAllByText(/^\d+月$/).length).toBe(1);
  });

  it("月ピッカーで月を選ぶと月が変わりピッカーが閉じる", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    await userEvent.click(screen.getByText(/^\d+月$/));
    await userEvent.click(screen.getByText("3月"));
    expect(screen.getByText("3月")).toBeInTheDocument();
    // ピッカーが閉じると月ラベルが1つだけになる
    expect(screen.getAllByText(/^\d+月$/).length).toBe(1);
  });
});

// ────────────────────────────────────────────
// 日付クリック
// ────────────────────────────────────────────

describe("日付クリック", () => {
  it("日付をクリックすると openDiary が呼ばれる", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    const yearText  = screen.getByText(/^\d+年$/).textContent!;
    const monthText = screen.getByText(/^\d+月$/).textContent!;
    const year  = yearText.replace("年", "");
    const month = monthText.replace("月", "").padStart(2, "0");

    await userEvent.click(screen.getAllByText("1")[0]);
    expect(mockOpenDiary).toHaveBeenCalledWith(`${year}-${month}-01`);
  });

  it("日付をクリックするとモーダルが閉じる", async () => {
    useModalStore.setState({ activeModal: "calendar" });
    render(<CalendarModal />);
    await userEvent.click(screen.getAllByText("1")[0]);
    expect(useModalStore.getState().activeModal).toBeNull();
  });
});
