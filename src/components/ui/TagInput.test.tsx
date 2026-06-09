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

  it("重複するタグを入力して Enter を押すと入力欄がクリアされる", async () => {
    render(<TagInput tags={["foo"]} onTagsChange={vi.fn()} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "foo{Enter}");
    expect(input).toHaveValue("");
  });

  it("カンマを含む値を Enter で確定すると複数タグに分割して追加される", () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={[]} onTagsChange={onTagsChange} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "react, typescript" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: false });
    expect(onTagsChange).toHaveBeenCalledWith(["react", "typescript"]);
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

// ────────────────────────────────────────────
// 候補表示
// ────────────────────────────────────────────

describe("候補表示", () => {
  it("入力に前方一致する候補が表示される", async () => {
    render(<TagInput tags={[]} onTagsChange={vi.fn()} allTags={["旅行", "映画", "旅館"]} />);
    await userEvent.type(screen.getByRole("textbox"), "旅");
    expect(screen.getByText("旅行")).toBeInTheDocument();
    expect(screen.getByText("旅館")).toBeInTheDocument();
    expect(screen.queryByText("映画")).not.toBeInTheDocument();
  });

  it("入力が空のとき候補が表示されない", () => {
    render(<TagInput tags={[]} onTagsChange={vi.fn()} allTags={["旅行", "映画"]} />);
    fireEvent.focus(screen.getByRole("textbox"));
    expect(screen.queryByText("旅行")).not.toBeInTheDocument();
    expect(screen.queryByText("映画")).not.toBeInTheDocument();
  });

  it("すでに追加済みのタグは候補に表示されない", async () => {
    render(<TagInput tags={["旅行"]} onTagsChange={vi.fn()} allTags={["旅行", "旅館"]} />);
    await userEvent.type(screen.getByRole("textbox"), "旅");
    // ドロップダウンリスト内に絞って確認する（チップとして表示中の「旅行」と混同しないため）
    const dropdown = screen.getByRole("list");
    expect(within(dropdown).queryByText("旅行")).not.toBeInTheDocument();
    expect(within(dropdown).getByText("旅館")).toBeInTheDocument();
  });

  it("候補をクリックするとタグが追加される", async () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={[]} onTagsChange={onTagsChange} allTags={["旅行"]} />);
    await userEvent.type(screen.getByRole("textbox"), "旅");
    await userEvent.click(screen.getByText("旅行"));
    expect(onTagsChange).toHaveBeenCalledWith(["旅行"]);
  });

  it("ArrowDown + Enter でキーボード選択できる", async () => {
    const onTagsChange = vi.fn();
    render(<TagInput tags={[]} onTagsChange={onTagsChange} allTags={["旅行", "旅館"]} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "旅");
    fireEvent.keyDown(input, { key: "ArrowDown", isComposing: false });
    fireEvent.keyDown(input, { key: "Enter", isComposing: false });
    expect(onTagsChange).toHaveBeenCalledWith(["旅行"]);
  });

  it("Escape で候補リストが閉じる", async () => {
    render(<TagInput tags={[]} onTagsChange={vi.fn()} allTags={["旅行"]} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "旅");
    expect(screen.getByText("旅行")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Escape", isComposing: false });
    expect(screen.queryByText("旅行")).not.toBeInTheDocument();
  });
});
