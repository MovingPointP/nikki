import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MemoriesModal from "./MemoriesModal";
import { useModalStore } from "../../store/modalStore";
import { useMemoriesStore } from "../../store/memoriesStore";
import { useUiStore } from "../../store/uiStore";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("../ui/MarkdownPreview", () => ({
  default: ({ content }: { content: string }) => (
    <div data-testid="markdown-preview">{content}</div>
  ),
}));

vi.mock("../ui/TagBadges", () => ({
  default: () => <div data-testid="tag-badges" />,
}));

vi.mock("../../utils/frontmatter", () => ({
  parseTags: vi.fn(() => []),
}));

vi.mock("../../store/dailyStore", () => ({
  useDailyStore: Object.assign(vi.fn(), { getState: vi.fn() }),
}));

import { useDailyStore } from "../../store/dailyStore";
const mockDailyGetState = vi.mocked((useDailyStore as any).getState as () => unknown);

const mockOpenDiary = vi.fn();

// ────────────────────────────────────────────
// テストデータ
// ────────────────────────────────────────────

const TABS_ACTIVE = [
  { label: "1か月前",  date: "2026-05-03", frontmatter: "",   content: "1か月前の日記",  isActive: true  },
  { label: "1年前",    date: "2025-06-03", frontmatter: null, content: null,              isActive: false },
  { label: "ランダム", date: "2026-01-01", frontmatter: "",   content: "ランダムの日記",  isActive: true  },
];

const TABS_NONE_ACTIVE = [
  { label: "1か月前",  date: null, frontmatter: null, content: null, isActive: false },
  { label: "1年前",    date: null, frontmatter: null, content: null, isActive: false },
  { label: "ランダム", date: null, frontmatter: null, content: null, isActive: false },
];

beforeEach(() => {
  vi.clearAllMocks();
  useModalStore.setState({ activeModal: null });
  useMemoriesStore.setState({ tabs: TABS_ACTIVE, activeTabIndex: 0 });
  useUiStore.setState({ mode: "diary" });
  mockDailyGetState.mockReturnValue({ openDiary: mockOpenDiary });
});

// ────────────────────────────────────────────
// 開閉
// ────────────────────────────────────────────

describe("開閉", () => {
  it("activeModal が memories のときダイアログが開く", () => {
    useModalStore.setState({ activeModal: "memories" });
    render(<MemoriesModal />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("activeModal が memories でないときダイアログが閉じている", () => {
    render(<MemoriesModal />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// タブ
// ────────────────────────────────────────────

describe("タブ", () => {
  it("tabs のラベルがすべて表示される", () => {
    useModalStore.setState({ activeModal: "memories" });
    render(<MemoriesModal />);
    expect(screen.getByRole("tab", { name: "1か月前" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "1年前" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "ランダム" })).toBeInTheDocument();
  });

  it("isActive が false のタブは disabled になる", () => {
    useModalStore.setState({ activeModal: "memories" });
    render(<MemoriesModal />);
    expect(screen.getByRole("tab", { name: "1年前" })).toBeDisabled();
  });

  it("isActive が true のタブは disabled にならない", () => {
    useModalStore.setState({ activeModal: "memories" });
    render(<MemoriesModal />);
    expect(screen.getByRole("tab", { name: "1か月前" })).not.toBeDisabled();
  });

  it("アクティブなタブをクリックすると activeTabIndex が変わる", async () => {
    useModalStore.setState({ activeModal: "memories" });
    render(<MemoriesModal />);
    await userEvent.click(screen.getByRole("tab", { name: "ランダム" }));
    expect(useMemoriesStore.getState().activeTabIndex).toBe(2);
  });
});

// ────────────────────────────────────────────
// コンテンツ表示
// ────────────────────────────────────────────

describe("コンテンツ表示", () => {
  it("アクティブタブのコンテンツが表示される", () => {
    useModalStore.setState({ activeModal: "memories" });
    render(<MemoriesModal />);
    expect(screen.getByTestId("markdown-preview")).toHaveTextContent("1か月前の日記");
  });
});

// ────────────────────────────────────────────
// 閉じる操作
// ────────────────────────────────────────────

describe("閉じる操作", () => {
  it("×ボタンをクリックすると activeModal が null になる", async () => {
    useModalStore.setState({ activeModal: "memories" });
    render(<MemoriesModal />);
    await userEvent.click(screen.getByTestId("CloseIcon").closest("button")!);
    expect(useModalStore.getState().activeModal).toBeNull();
  });

  it("閉じるボタンをクリックすると activeModal が null になる", async () => {
    useModalStore.setState({ activeModal: "memories" });
    render(<MemoriesModal />);
    await userEvent.click(screen.getByRole("button", { name: "閉じる" }));
    expect(useModalStore.getState().activeModal).toBeNull();
  });
});

// ────────────────────────────────────────────
// この日記を開く
// ────────────────────────────────────────────

describe("この日記を開く", () => {
  it("アクティブなタブがない場合はボタンが disabled になる", () => {
    useMemoriesStore.setState({ tabs: TABS_NONE_ACTIVE, activeTabIndex: 0 });
    useModalStore.setState({ activeModal: "memories" });
    render(<MemoriesModal />);
    expect(screen.getByRole("button", { name: "この日記を開く" })).toBeDisabled();
  });

  it("クリックすると openDiary が呼ばれる", async () => {
    useModalStore.setState({ activeModal: "memories" });
    render(<MemoriesModal />);
    await userEvent.click(screen.getByRole("button", { name: "この日記を開く" }));
    expect(mockOpenDiary).toHaveBeenCalledWith("2026-05-03");
  });

  it("クリックするとモーダルが閉じる", async () => {
    useModalStore.setState({ activeModal: "memories" });
    render(<MemoriesModal />);
    await userEvent.click(screen.getByRole("button", { name: "この日記を開く" }));
    expect(useModalStore.getState().activeModal).toBeNull();
  });

  it("クリックすると diary モードになる", async () => {
    useUiStore.setState({ mode: "template" });
    useModalStore.setState({ activeModal: "memories" });
    render(<MemoriesModal />);
    await userEvent.click(screen.getByRole("button", { name: "この日記を開く" }));
    expect(useUiStore.getState().mode).toBe("diary");
  });
});
