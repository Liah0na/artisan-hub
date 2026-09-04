// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const signOutMock = vi.fn();

vi.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

import SignOutButton from "@/components/auth/SignOutButton";

describe("auth/SignOutButton", () => {
  it("renders a 'Sair' button", () => {
    render(<SignOutButton />);
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });

  it("calls signOut with callbackUrl '/' when clicked", async () => {
    const user = userEvent.setup();
    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: "Sair" }));

    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/" });
  });
});
