import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TagInput from "./TagInput";

// ────────────────────────────────────────────
// タグ表示
// ────────────────────────────────────────────

describe("タグ表示", () => {
  it("渡したタグがチップとして表示される", () => {
    render(<TagInput tags={["foo", "bar"]} onTagsChange={vi.fn()} />);
    expect(screen.getByText("foo")).toBeInTheDocument();
    expect(screen.getByText("bar")).toBeInTheDocument();
  });

  it("タグが空のときプレースホルダーが表示される", () => {
    render(<TagInput tags={[]} onTagsChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("タグを追加...")).toBeInTheDocument();
  });

  it("タグがあるときプレースホルダーが表示されない", () => {
    render(<TagInput tags={["foo"]} onTagsChange={vi.fn()} />);
    expect(screen.queryByPlaceholderText("タグを追加...")).not.toBeInTheDocument();
  });
});

// ────────────────────────────────────────────
// タグ追加
// ────────────────────────────────────────────

describe("タグ追加", () => {
  it("Enter キーでタグが追加される", async () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={[]} onTagsChange={onTagsChange} />);
    await userEvent.type(screen.getByRole("textbox"), "foo{Enter}");
    expect(onTagsChange).toHaveBeenCalledWith(["foo"]);
  });

  it("カンマキーでタグが追加される", async () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={[]} onTagsChange={onTagsChange} />);
    await userEvent.type(screen.getByRole("textbox"), "foo,");
    expect(onTagsChange).toHaveBeenCalledWith(["foo"]);
  });

  it("空文字は追加されない", async () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={[]} onTagsChange={onTagsChange} />);
    await userEvent.type(screen.getByRole("textbox"), "{Enter}");
    expect(onTagsChange).not.toHaveBeenCalled();
  });

  it("重複するタグは追加されない", async () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={["foo"]} onTagsChange={onTagsChange} />);
    await userEvent.type(screen.getByRole("textbox"), "foo{Enter}");
    expect(onTagsChange).not.toHaveBeenCalled();
  });
});

// ────────────────────────────────────────────
// タグ削除
// ────────────────────────────────────────────

describe("タグ削除", () => {
  it("× ボタンでタグが削除される", async () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={["foo", "bar"]} onTagsChange={onTagsChange} />);
    // MUI Chip の × ボタンはラベルテキストの親要素内にある
    const fooChip = screen.getByText("foo").closest("[class*=MuiChip-root]") as HTMLElement;
    await userEvent.click(within(fooChip).getByTestId("CancelIcon"));
    expect(onTagsChange).toHaveBeenCalledWith(["bar"]);
  });

  it("入力欄が空のとき Backspace で最後のタグが削除される", async () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={["foo", "bar"]} onTagsChange={onTagsChange} />);
    await userEvent.type(screen.getByRole("textbox"), "{Backspace}");
    expect(onTagsChange).toHaveBeenCalledWith(["foo"]);
  });
});

// ────────────────────────────────────────────
// IME入力
// ────────────────────────────────────────────

describe("IME入力", () => {
  it("IME変換中の Enter ではタグが追加されない", async () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={[]} onTagsChange={onTagsChange} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "日本語");
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(onTagsChange).not.toHaveBeenCalled();
  });

  it("IME変換確定後の Enter ではタグが追加される", async () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={[]} onTagsChange={onTagsChange} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "日本語");
    fireEvent.keyDown(input, { key: "Enter", isComposing: false });
    expect(onTagsChange).toHaveBeenCalledWith(["日本語"]);
  });
});

// ────────────────────────────────────────────
// disabled 状態
// ────────────────────────────────────────────

describe("disabled 状態", () => {
  it("disabled のとき入力欄が無効になる", () => {
    render(<TagInput tags={[]} onTagsChange={vi.fn()} disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("disabled のとき × ボタンが表示されない", () => {
    render(<TagInput tags={["foo"]} onTagsChange={vi.fn()} disabled />);
    const fooChip = screen.getByText("foo").closest("[class*=MuiChip-root]") as HTMLElement;
    expect(within(fooChip).queryByTestId("CancelIcon")).not.toBeInTheDocument();
  });
});
