// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ContactForm from "@/components/layout/contact/ContactForm";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nome"), "Maria Silva");
  await user.type(screen.getByLabelText("E-mail"), "maria@example.com");
  await user.type(screen.getByLabelText("Mensagem"), "Olá, gostaria de saber mais.");
}

describe("ContactForm", () => {
  it("renders the name, email, and message fields", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Mensagem")).toBeInTheDocument();
  });

  it("updates the character counter as the message is typed", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("Mensagem"), "Olá!");

    expect(screen.getByText("4/2000")).toBeInTheDocument();
  });

  it("submits the form data to /api/contact and shows a success message", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    await waitFor(() =>
      expect(screen.getByText("Mensagem enviada! Retornaremos em breve.")).toBeInTheDocument()
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Maria Silva",
          email: "maria@example.com",
          message: "Olá, gostaria de saber mais.",
          website: "",
        }),
      })
    );
  });

  it("clears the fields after a successful submission", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    await waitFor(() => expect(screen.getByLabelText("Nome")).toHaveValue(""));
    expect(screen.getByLabelText("E-mail")).toHaveValue("");
    expect(screen.getByLabelText("Mensagem")).toHaveValue("");
  });

  it("shows the server error message when the request fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Preencha nome, um e-mail válido e a mensagem." }),
    });
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    await waitFor(() =>
      expect(
        screen.getByText("Preencha nome, um e-mail válido e a mensagem.")
      ).toBeInTheDocument()
    );
    // the message shouldn't have been cleared, since it wasn't sent
    expect(screen.getByLabelText("Nome")).toHaveValue("Maria Silva");
  });

  it("shows a connection error message when fetch itself throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    await waitFor(() =>
      expect(
        screen.getByText("Não foi possível conectar ao servidor. Tente novamente.")
      ).toBeInTheDocument()
    );
  });

  it("disables the submit button and shows a loading label while submitting", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    fetchMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    const submitButton = screen.getByRole("button", { name: "Enviando..." });
    expect(submitButton).toBeDisabled();

    resolveFetch({ ok: true, json: async () => ({ ok: true }) });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Enviar mensagem" })).not.toBeDisabled()
    );
  });
});
