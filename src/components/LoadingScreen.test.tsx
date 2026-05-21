import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingScreen from "./LoadingScreen";

describe("LoadingScreen", () => {
  it("スピナーが表示される", () => {
    render(<LoadingScreen />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
