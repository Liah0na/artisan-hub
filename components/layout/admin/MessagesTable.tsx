"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function MessagesTable({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleRead(id: string, read: boolean) {
    setBusyId(id);
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function deleteMessage(id: string) {
    if (!window.confirm("Excluir esta mensagem? Esta ação não pode ser desfeita.")) return;
    setBusyId(id);
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  if (!messages.length) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
        Nenhuma mensagem recebida ainda.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`rounded-xl bg-white p-5 shadow-sm ring-1 ${msg.read ? "ring-gray-200" : "ring-gray-900/20"}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{msg.name}</p>
                {!msg.read && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    Não lida
                  </span>
                )}
              </div>
              <a href={`mailto:${msg.email}`} className="text-sm text-gray-500 hover:underline">
                {msg.email}
              </a>
            </div>
            <p className="text-xs text-gray-400">
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(msg.createdAt))}
            </p>
          </div>

          <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{msg.message}</p>

          <div className="mt-4 flex gap-4 text-sm">
            <button
              type="button"
              disabled={busyId === msg.id}
              onClick={() => toggleRead(msg.id, !msg.read)}
              className="font-medium text-gray-900 underline disabled:opacity-60"
            >
              {msg.read ? "Marcar como não lida" : "Marcar como lida"}
            </button>
            <button
              type="button"
              disabled={busyId === msg.id}
              onClick={() => deleteMessage(msg.id)}
              className="font-medium text-red-700 underline disabled:opacity-60"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
