// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock, push: vi.fn(), back: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

import ProfileForm from "@/components/layout/dashboard/ProfileForm";

const fetchMock = vi.fn();

const PROFILE = {
  name: "Maria Silva",
  email: "maria@example.com",
  avatar: null,
  bio: "Ceramista",
  phone: "11999999999",
  instagram: "@maria.ceramica",
  location: "São Paulo, SP",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("URL", { ...URL, createObjectURL: vi.fn(() => "blob:preview-url") });
});

describe("ProfileForm", () => {
  it("pre-fills the form fields from the given profile", () => {
    render(<ProfileForm profile={PROFILE} />);

    expect(screen.getByLabelText("Nome completo")).toHaveValue("Maria Silva");
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();
    expect(screen.getByLabelText("Biografia")).toHaveValue("Ceramista");
    expect(screen.getByLabelText("Instagram")).toHaveValue("@maria.ceramica");
  });

  it("shows 'Sem foto' placeholder when there is no avatar", () => {
    render(<ProfileForm profile={PROFILE} />);
    expect(screen.getByText("Sem foto")).toBeInTheDocument();
  });

  it("saves the profile (without touching the avatar) when no new file is selected", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const user = userEvent.setup();
    render(<ProfileForm profile={PROFILE} />);

    await user.clear(screen.getByLabelText("Nome completo"));
    await user.type(screen.getByLabelText("Nome completo"), "Maria Editada");
    await user.click(screen.getByRole("button", { name: "Salvar perfil" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/dashboard/profile",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            name: "Maria Editada",
            bio: "Ceramista",
            phone: "11999999999",
            instagram: "@maria.ceramica",
            location: "São Paulo, SP",
            avatar: "",
          }),
        })
      )
    );
    // only one fetch call: no avatar upload request was made
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Perfil atualizado com sucesso.")).toBeInTheDocument();
  });

  it("uploads the avatar first, then saves the profile with the returned URL", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://cdn.example.com/avatar.png" }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const user = userEvent.setup();
    render(<ProfileForm profile={PROFILE} />);

    const file = new File(["x"], "avatar.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Foto de perfil"), file);
    await user.click(screen.getByRole("button", { name: "Salvar perfil" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/dashboard/uploads/avatar",
      expect.objectContaining({ method: "POST" })
    );
    const profileCallBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(profileCallBody.avatar).toBe("https://cdn.example.com/avatar.png");
  });

  it("rejects a disallowed avatar file type without uploading", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<ProfileForm profile={PROFILE} />);

    const file = new File(["x"], "avatar.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("Foto de perfil"), file);

    expect(screen.getByText("Use uma imagem JPG, PNG ou WebP.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an avatar file larger than 5MB without uploading", async () => {
    const user = userEvent.setup();
    render(<ProfileForm profile={PROFILE} />);

    const bigFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "avatar.png", {
      type: "image/png",
    });
    await user.upload(screen.getByLabelText("Foto de perfil"), bigFile);

    expect(screen.getByText("A imagem deve ter no máximo 5 MB.")).toBeInTheDocument();
  });

  it("shows the server error when saving the profile fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Informe ao menos o nome completo." }),
    });
    const user = userEvent.setup();
    render(<ProfileForm profile={PROFILE} />);

    await user.click(screen.getByRole("button", { name: "Salvar perfil" }));

    await waitFor(() =>
      expect(screen.getByText("Informe ao menos o nome completo.")).toBeInTheDocument()
    );
    expect(screen.queryByText("Perfil atualizado com sucesso.")).not.toBeInTheDocument();
  });

  it("surfaces the avatar upload error and never calls the profile endpoint", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Não foi possível enviar a foto." }),
    });
    const user = userEvent.setup();
    render(<ProfileForm profile={PROFILE} />);

    const file = new File(["x"], "avatar.png", { type: "image/png" });
    await user.upload(screen.getByLabelText("Foto de perfil"), file);
    await user.click(screen.getByRole("button", { name: "Salvar perfil" }));

    await waitFor(() =>
      expect(screen.getByText("Não foi possível enviar a foto.")).toBeInTheDocument()
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
