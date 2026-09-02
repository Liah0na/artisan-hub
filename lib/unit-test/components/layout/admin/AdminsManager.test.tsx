// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import AdminsManager from "@/components/layout/admin/AdminsManager";

const fetchMock = vi.fn();

const ADMINS = [
  { id: "a1", name: "Ana Admin", email: "ana@example.com", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "a2", name: "Beto Admin", email: "beto@example.com", createdAt: "2026-02-01T00:00:00.000Z" },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

describe("AdminsManager — listing", () => {
  it("shows an empty state row when there are no other admins", () => {
    render(<AdminsManager admins={[]} />);
    expect(
      screen.getByText("Nenhum outro administrador cadastrado ainda.")
    ).toBeInTheDocument();
  });

  it("renders each admin's name and email", () => {
    render(<AdminsManager admins={ADMINS} />);

    expect(screen.getByText("Ana Admin")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText("Beto Admin")).toBeInTheDocument();
  });
});

describe("AdminsManager — create form", () => {
  async function fillCreateForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText("Nome"), "Novo Admin");
    await user.type(screen.getByLabelText("E-mail"), "novo@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha1234");
  }

  it("creates an admin, clears the form, and refreshes on success", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ id: "new" }) });
    const user = userEvent.setup();
    render(<AdminsManager admins={ADMINS} />);

    await fillCreateForm(user);
    await user.click(screen.getByRole("button", { name: "Criar administrador" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/admins",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Novo Admin", email: "novo@example.com", password: "senha1234" }),
      })
    );
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
    expect(screen.getByLabelText("Nome")).toHaveValue("");
  });

  it("shows the server error and keeps the entered values when creation fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Já existe uma conta com este e-mail." }),
    });
    const user = userEvent.setup();
    render(<AdminsManager admins={ADMINS} />);

    await fillCreateForm(user);
    await user.click(screen.getByRole("button", { name: "Criar administrador" }));

    await waitFor(() =>
      expect(screen.getByText("Já existe uma conta com este e-mail.")).toBeInTheDocument()
    );
    expect(screen.getByLabelText("Nome")).toHaveValue("Novo Admin");
    expect(refreshMock).not.toHaveBeenCalled();
  });
});

describe("AdminsManager — inline edit", () => {
  it("shows an edit form when 'Editar' is clicked, and hides the row's action buttons", async () => {
    const user = userEvent.setup();
    render(<AdminsManager admins={ADMINS} />);

    await user.click(screen.getAllByRole("button", { name: "Editar" })[0]);

    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("cancels editing without making a request", async () => {
    const user = userEvent.setup();
    render(<AdminsManager admins={ADMINS} />);

    await user.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("button", { name: "Salvar" })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("saves edits with the new name/email and an undefined password when left blank", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const user = userEvent.setup();
    render(<AdminsManager admins={ADMINS} />);

    await user.click(screen.getAllByRole("button", { name: "Editar" })[0]);

    const nameInput = screen.getByDisplayValue("Ana Admin");
    await user.clear(nameInput);
    await user.type(nameInput, "Ana Editada");

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/admins/a1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ name: "Ana Editada", email: "ana@example.com", password: undefined }),
      })
    );
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it("shows an error and stays in edit mode when saving fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "A nova senha deve ter ao menos 8 caracteres." }),
    });
    const user = userEvent.setup();
    render(<AdminsManager admins={ADMINS} />);

    await user.click(screen.getAllByRole("button", { name: "Editar" })[0]);
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(
        screen.getByText("A nova senha deve ter ao menos 8 caracteres.")
      ).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
    expect(refreshMock).not.toHaveBeenCalled();
  });
});

describe("AdminsManager — delete", () => {
  it("does nothing when the delete confirmation is dismissed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<AdminsManager admins={ADMINS} />);

    await user.click(screen.getAllByRole("button", { name: "Remover" })[0]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("confirms with the admin's name, deletes, and refreshes", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchMock.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();
    render(<AdminsManager admins={ADMINS} />);

    await user.click(screen.getAllByRole("button", { name: "Remover" })[0]);

    expect(confirmSpy).toHaveBeenCalledWith(
      'Remover o administrador "Ana Admin"? Esta ação não pode ser desfeita.'
    );
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/admins/a1", { method: "DELETE" });
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });
});
