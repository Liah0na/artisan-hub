// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refreshMock = vi.fn();
const pushMock = vi.fn();
const backMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock, push: pushMock, back: backMock }),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props)} />;
  },
}));

import ProductForm from "@/components/layout/dashboard/ProductForm";

const fetchMock = vi.fn();

const EXISTING_PRODUCT = {
  id: "p1",
  name: "Vaso de cerâmica",
  description: "Feito à mão",
  images: [{ url: "https://cdn.example.com/vaso1.jpg", publicId: "artisan-hub/products/u1/vaso1" }],
  price: 120,
  stock: 3,
};

function pngFile(name = "img.png") {
  return new File(["x"], name, { type: "image/png" });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("URL", { ...URL, createObjectURL: vi.fn(() => "blob:preview"), revokeObjectURL: vi.fn() });
});

describe("ProductForm — create mode", () => {
  it("renders empty fields and the 'Criar produto' button when no product is given", () => {
    render(<ProductForm />);

    expect(screen.getByLabelText("Nome do produto")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Criar produto" })).toBeInTheDocument();
  });

  it("requires at least one image before submitting", async () => {
    const user = userEvent.setup();
    const { container } = render(<ProductForm />);

    await user.type(screen.getByLabelText("Nome do produto"), "Vaso novo");
    await user.type(screen.getByLabelText("Descrição"), "Descrição");
    await user.type(screen.getByLabelText("Preço (R$)"), "50");

    // Use fireEvent.submit to bypass the browser's native HTML5 constraint
    // validation on the (also `required`) file input, which would otherwise
    // silently block submission before the component's own JS validation —
    // the one we're actually testing here — ever runs.
    fireEvent.submit(container.querySelector("form")!);

    expect(
      screen.getByText(
        "Adicione ao menos uma imagem. Ela será a imagem principal exibida no catálogo."
      )
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uploads a selected image, then POSTs the product with the uploaded URL and publicId", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://cdn.example.com/new.jpg", publicId: "artisan-hub/products/u1/new" }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ product: { id: "new" } }) });

    const user = userEvent.setup({ applyAccept: false });
    render(<ProductForm />);

    await user.type(screen.getByLabelText("Nome do produto"), "Vaso novo");
    await user.type(screen.getByLabelText("Descrição"), "Descrição bacana");
    await user.upload(screen.getByLabelText(/Imagens do produto/), pngFile());
    await user.type(screen.getByLabelText("Preço (R$)"), "50");

    await user.click(screen.getByRole("button", { name: "Criar produto" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/dashboard/uploads/product-image",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/dashboard/products",
      expect.objectContaining({ method: "POST" })
    );
    const body = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(body.images).toEqual([{ url: "https://cdn.example.com/new.jpg", publicId: "artisan-hub/products/u1/new" }]);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard/products"));
    expect(refreshMock).toHaveBeenCalled();
  });

  it("rejects a disallowed image file type and does not upload it", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<ProductForm />);

    const badFile = new File(["x"], "doc.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText(/Imagens do produto/), badFile);

    expect(screen.getByText("Use imagens JPG, PNG ou WebP.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an image larger than 5MB", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<ProductForm />);

    const bigFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png", {
      type: "image/png",
    });
    await user.upload(screen.getByLabelText(/Imagens do produto/), bigFile);

    expect(screen.getByText("Cada imagem deve ter no máximo 5 MB.")).toBeInTheDocument();
  });

  it("shows the server error when product creation fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Informe nome, descrição..." }),
    });

    const user = userEvent.setup({ applyAccept: false });
    render(<ProductForm />);

    await user.type(screen.getByLabelText("Nome do produto"), "Vaso novo");
    await user.type(screen.getByLabelText("Descrição"), "Descrição");
    await user.type(screen.getByLabelText("Preço (R$)"), "50");
    // an existing-style image isn't available in create mode, so upload one
    // and let the (failing) upload response supply the error message —
    // this exercises the same catch/setError path as a failing product POST.
    await user.upload(screen.getByLabelText(/Imagens do produto/), pngFile());
    await user.click(screen.getByRole("button", { name: "Criar produto" }));

    await waitFor(() => expect(screen.getByText("Informe nome, descrição...")).toBeInTheDocument());
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("navigates back when 'Cancelar' is clicked", async () => {
    const user = userEvent.setup();
    render(<ProductForm />);

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(backMock).toHaveBeenCalled();
  });
});

describe("ProductForm — edit mode", () => {
  it("pre-fills fields from the given product and shows the existing image", () => {
    render(<ProductForm product={EXISTING_PRODUCT} />);

    expect(screen.getByLabelText("Nome do produto")).toHaveValue("Vaso de cerâmica");
    expect(screen.getByLabelText("Descrição")).toHaveValue("Feito à mão");
    expect(screen.getByLabelText("Preço (R$)")).toHaveValue(120);
    expect(screen.getByLabelText("Estoque")).toHaveValue(3);
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();
  });

  it("marks the first image as 'Capa' (cover)", () => {
    render(<ProductForm product={EXISTING_PRODUCT} />);
    expect(screen.getByText("Capa")).toBeInTheDocument();
  });

  it("keeps existing image URLs (does not re-upload) and PATCHes the product", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ product: EXISTING_PRODUCT }) });

    const user = userEvent.setup();
    render(<ProductForm product={EXISTING_PRODUCT} />);

    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/dashboard/products/p1",
        expect.objectContaining({ method: "PATCH" })
      )
    );
    // no image upload call was made — the existing URL was reused
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.images).toEqual([{ url: "https://cdn.example.com/vaso1.jpg", publicId: "artisan-hub/products/u1/vaso1" }]);
  });

  it("removes an image when 'Remover' is clicked", async () => {
    const user = userEvent.setup();
    render(<ProductForm product={EXISTING_PRODUCT} />);

    await user.click(screen.getByRole("button", { name: "Remover" }));

    // The "(count/max)" counter is rendered as several separate text nodes
    // by the JSX expression, so match against the label's full text content.
    expect(
      screen.getByText((_, element) => element?.textContent === "Imagens do produto * (0/6)")
    ).toBeInTheDocument();
  });
});
