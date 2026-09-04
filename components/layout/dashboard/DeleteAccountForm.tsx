"use client";

import { FormEvent, useState } from "react";
import { signOut } from "next-auth/react";

export default function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!confirmed) {
      setError("Confirme que você entende que esta ação não pode ser desfeita.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/dashboard/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Não foi possível excluir a conta.");
        return;
      }

      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <section className="mt-8 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">Excluir conta</h2>
        <p className="mt-1 text-sm text-red-800">
          Isso remove permanentemente sua conta, todos os seus produtos e as imagens enviadas. Não pode ser desfeito.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700"
        >
          Quero excluir minha conta
        </button>
      </section>
    );
  }

  return (
    <section className="mt-8 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6">
      <h2 className="text-lg font-semibold text-red-900">Confirmar exclusão da conta</h2>
      <p className="mt-1 text-sm text-red-800">
        Esta ação é permanente: sua conta, produtos e imagens serão excluídos e não podem ser recuperados.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="delete-password" className="mb-2 block text-sm font-medium text-red-900">
            Confirme sua senha
          </label>
          <input
            id="delete-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-red-900">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="mt-0.5"
          />
          Entendo que esta ação é permanente e não pode ser desfeita.
        </label>

        {error && <p className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button
            disabled={loading}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Excluindo..." : "Excluir minha conta definitivamente"}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setError("");
              setPassword("");
              setConfirmed(false);
            }}
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
