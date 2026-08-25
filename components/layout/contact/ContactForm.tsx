"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Não foi possível enviar sua mensagem.");
        return;
      }

      setName("");
      setEmail("");
      setMessage("");
      setSuccess(true);
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">Nome</label>
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={120}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">Mensagem</label>
        <textarea
          id="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          rows={5}
          maxLength={2000}
          placeholder="Como podemos ajudar?"
          className="w-full rounded-md border px-3 py-2"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{message.length}/2000</p>
      </div>

      {error && <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && !error && (
        <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
          Mensagem enviada! Retornaremos em breve.
        </p>
      )}

      <button
        disabled={loading}
        className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
