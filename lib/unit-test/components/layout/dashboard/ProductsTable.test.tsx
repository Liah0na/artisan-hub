// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock, push: vi.fn(), back: vi.fn() }),
}));

import ProductsTable from "@/components/layout/dashboard/ProductsTable";

const fetchMock = vi.fn();

const PRODUCTS = [
  { id: "p1", name: "Vaso de cerâmica", price: 120, stock: 3 },
  { id: "p2", name: "Cesto de vime", price: 80.5, stock: 0 },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

describe("ProductsTable", () => {
  it("shows an empty state when there are no products", () => {
    render(<ProductsTable products={[]} />);
    expect(screen.getByText("Você ainda não criou nenhum produto.")).toBeInTheDocument();
  });

  it("renders each product's name, formatted price, and stock", () => {
    render(<ProductsTable products={PRODUCTS} />);

    expect(screen.getByText("Vaso de cerâmica")).toBeInTheDocument();
    expect(screen.getByText("Cesto de vime")).toBeInTheDocument();
    expect(screen.getByText("R$ 120,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 80,50")).toBeInTheDocument();
  });

  it("links each row's 'Editar' to the product's edit page", () => {
    render(<ProductsTable products={PRODUCTS} />);

    const editLinks = screen.getAllByRole("link", { name: "Editar" });
    expect(editLinks[0]).toHaveAttribute("href", "/dashboard/products/p1/edit");
    expect(editLinks[1]).toHaveAttribute("href", "/dashboard/products/p2/edit");
  });

  it("does nothing when the delete confirmation is dismissed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<ProductsTable products={PRODUCTS} />);

    await user.click(screen.getAllByRole("button", { name: "Excluir" })[0]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deletes the product and refreshes the router on confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchMock.mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();
    render(<ProductsTable products={PRODUCTS} />);

    await user.click(screen.getAllByRole("button", { name: "Excluir" })[0]);

    expect(fetchMock).toHaveBeenCalledWith("/api/dashboard/products/p1", { method: "DELETE" });
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it("does not refresh the router when the delete request fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    fetchMock.mockResolvedValueOnce({ ok: false });
    const user = userEvent.setup();
    render(<ProductsTable products={PRODUCTS} />);

    await user.click(screen.getAllByRole("button", { name: "Excluir" })[0]);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
