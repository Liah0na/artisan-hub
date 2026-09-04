// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import MessagesTable from "@/components/layout/admin/MessagesTable";

const fetchMock = vi.fn();

const MESSAGES = [
  {
    id: "m1",
    name: "Maria Silva",
    email: "maria@example.com",
    message: "Olá, gostaria de saber mais sobre os produtos.",
    read: false,
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "m2",
    name: "João Souza",
    email: "joao@example.com",
    message: "Já lida.",
    read: true,
    createdAt: "2026-01-10T10:00:00.000Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock.mockResolvedValue({ ok: true }));
});

describe("MessagesTable", () => {
  it("shows an empty state when there are no messages", () => {
    render(<MessagesTable messages={[]} />);
    expect(screen.getByText("Nenhuma mensagem recebida ainda.")).toBeInTheDocument();
  });

  it("shows an 'Não lida' badge only for unread messages", () => {
    render(<MessagesTable messages={MESSAGES} />);

    expect(screen.getAllByText("Não lida")).toHaveLength(1);
  });

  it("renders the sender name, email, and message body", () => {
    render(<MessagesTable messages={MESSAGES} />);

    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();
    expect(
      screen.getByText("Olá, gostaria de saber mais sobre os produtos.")
    ).toBeInTheDocument();
  });

  it("marks an unread message as read and refreshes on click", async () => {
    const user = userEvent.setup();
    render(<MessagesTable messages={MESSAGES} />);

    await user.click(screen.getAllByRole("button", { name: "Marcar como lida" })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/messages/m1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it("marks a read message as unread when toggled", async () => {
    const user = userEvent.setup();
    render(<MessagesTable messages={MESSAGES} />);

    await user.click(screen.getByRole("button", { name: "Marcar como não lida" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/messages/m2",
      expect.objectContaining({ body: JSON.stringify({ read: false }) })
    );
  });

  it("does nothing when the delete confirmation is dismissed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<MessagesTable messages={MESSAGES} />);

    await user.click(screen.getAllByRole("button", { name: "Excluir" })[0]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deletes the message and refreshes on confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<MessagesTable messages={MESSAGES} />);

    await user.click(screen.getAllByRole("button", { name: "Excluir" })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/messages/m1", { method: "DELETE" });
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });
});
