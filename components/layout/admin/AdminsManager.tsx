"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Admin = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

function EditRow({ admin, onCancel, onSaved }: { admin: Admin; onCancel: () => void; onSaved: () => void }) {
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: password || undefined }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Não foi possível salvar as alterações.");
        return;
      }

      onSaved();
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr className="bg-gray-50">
      <td colSpan={4} className="px-5 py-4">
        <form onSubmit={handleSave} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="rounded-md border px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-md border px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Nova senha (opcional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              placeholder="Deixe em branco para manter"
              className="rounded-md border px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button disabled={loading} className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60">
              {loading ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={onCancel} className="rounded-md border px-3 py-1.5 text-sm font-medium">
              Cancelar
            </button>
          </div>
        </form>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </td>
    </tr>
  );
}

export default function AdminsManager({ admins }: { admins: Admin[] }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Não foi possível criar o administrador.");
        return;
      }

      setName("");
      setEmail("");
      setPassword("");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, adminName: string) {
    if (!window.confirm(`Remover o administrador "${adminName}"? Esta ação não pode ser desfeita.`)) return;
    setBusyId(id);
    await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.5fr]">
      <form onSubmit={handleCreate} className="h-fit space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="text-lg font-semibold">Novo administrador</h2>

        <div>
          <label htmlFor="admin-name" className="mb-1 block text-sm font-medium">Nome</label>
          <input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label htmlFor="admin-email" className="mb-1 block text-sm font-medium">E-mail</label>
          <input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label htmlFor="admin-password" className="mb-1 block text-sm font-medium">Senha</label>
          <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full rounded-md border px-3 py-2" />
          <p className="mt-1 text-xs text-gray-500">Mínimo de 8 caracteres.</p>
        </div>

        {error && <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button disabled={loading} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {loading ? "Criando..." : "Criar administrador"}
        </button>
      </form>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">E-mail</th>
              <th className="px-5 py-3 font-medium">Desde</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                  Nenhum outro administrador cadastrado ainda.
                </td>
              </tr>
            ) : (
              admins.map((admin) =>
                editingId === admin.id ? (
                  <EditRow
                    key={admin.id}
                    admin={admin}
                    onCancel={() => setEditingId(null)}
                    onSaved={() => {
                      setEditingId(null);
                      router.refresh();
                    }}
                  />
                ) : (
                  <tr key={admin.id}>
                    <td className="px-5 py-4 font-medium text-gray-900">{admin.name}</td>
                    <td className="px-5 py-4">{admin.email}</td>
                    <td className="px-5 py-4">
                      {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(admin.createdAt))}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => setEditingId(admin.id)} className="font-medium text-gray-900 underline">
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={busyId === admin.id}
                          onClick={() => handleDelete(admin.id, admin.name)}
                          className="font-medium text-red-700 underline disabled:opacity-60"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
