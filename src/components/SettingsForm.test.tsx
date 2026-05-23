import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsForm from "./SettingsForm";
import { useSettingsStore } from "../store/settingsStore";

// ────────────────────────────────────────────
// モック
// ────────────────────────────────────────────

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn(),
}));

import { open } from "@tauri-apps/plugin-dialog";
import { load } from "@tauri-apps/plugin-store";
const mockOpen = vi.mocked(open);
const mockLoad = vi.mocked(load);

function createMockStore() {
  return {
    get: vi.fn().mockResolvedValue(undefined),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
  } as unknown as Awaited<ReturnType<typeof load>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  useSettingsStore.setState({ savePath: null, isLoaded: true });
  mockLoad.mockResolvedValue(createMockStore());
});

// ────────────────────────────────────────────
// 初期表示
// ────────────────────────────────────────────

describe("初期表示", () => {
  it("savePath が null のとき TextField が空になる", () => {
    render(<SettingsForm />);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("savePath が設定されているとき TextField にパスが表示される", () => {
    useSettingsStore.setState({ savePath: "/home/user/diary" });
    render(<SettingsForm />);
    expect(screen.getByRole("textbox")).toHaveValue("/home/user/diary");
  });

  it("savePath が null のとき「保存して開始」ボタンが表示される", () => {
    render(<SettingsForm />);
    expect(screen.getByRole("button", { name: /保存して開始/ })).toBeInTheDocument();
  });

  it("savePath が設定されているとき「変更を保存」ボタンが表示される", () => {
    useSettingsStore.setState({ savePath: "/home/user/diary" });
    render(<SettingsForm />);
    expect(screen.getByRole("button", { name: /変更を保存/ })).toBeInTheDocument();
  });

  it("selectedPath が空のとき保存ボタンが disabled になる", () => {
    render(<SettingsForm />);
    expect(screen.getByRole("button", { name: /保存して開始/ })).toBeDisabled();
  });

  it("selectedPath と savePath が同じとき保存ボタンが disabled になる", () => {
    useSettingsStore.setState({ savePath: "/home/user/diary" });
    render(<SettingsForm />);
    expect(screen.getByRole("button", { name: /変更を保存/ })).toBeDisabled();
  });
});

// ────────────────────────────────────────────
// フォルダ選択
// ────────────────────────────────────────────

describe("フォルダ選択", () => {
  it("フォルダを選択すると TextField にパスが表示される", async () => {
    mockOpen.mockResolvedValue("/new/path");
    render(<SettingsForm />);
    await userEvent.click(screen.getByRole("button", { name: /選択/ }));
    expect(screen.getByRole("textbox")).toHaveValue("/new/path");
  });

  it("キャンセルしても TextField が変わらない", async () => {
    mockOpen.mockResolvedValue(null);
    render(<SettingsForm />);
    await userEvent.click(screen.getByRole("button", { name: /選択/ }));
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("エラー時にエラーメッセージが表示される", async () => {
    mockOpen.mockRejectedValue(new Error("dialog error"));
    render(<SettingsForm />);
    await userEvent.click(screen.getByRole("button", { name: /選択/ }));
    expect(await screen.findByText("フォルダの選択に失敗しました")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// 保存
// ────────────────────────────────────────────

describe("保存", () => {
  it("保存成功時に「保存しました」が表示される", async () => {
    mockOpen.mockResolvedValue("/new/path");
    render(<SettingsForm />);
    await userEvent.click(screen.getByRole("button", { name: /選択/ }));
    await userEvent.click(screen.getByRole("button", { name: /保存して開始/ }));
    expect(await screen.findByText("保存しました")).toBeInTheDocument();
  });

  it("保存失敗時に「保存に失敗しました」が表示される", async () => {
    mockOpen.mockResolvedValue("/new/path");
    mockLoad.mockRejectedValue(new Error("save error"));
    render(<SettingsForm />);
    await userEvent.click(screen.getByRole("button", { name: /選択/ }));
    await userEvent.click(screen.getByRole("button", { name: /保存して開始/ }));
    expect(await screen.findByText("保存に失敗しました")).toBeInTheDocument();
  });
});
