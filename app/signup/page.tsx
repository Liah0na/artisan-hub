"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      setError("Digite seu nome.");
      return;
    }

    if (!normalizedEmail) {
      setError("Digite seu e-mail.");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (!/[A-Za-z]/.test(password)) {
      setError("A senha deve conter pelo menos uma letra.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("A senha deve conter pelo menos um número.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Não foi possível criar sua conta."
        );
        return;
      }

      setSuccess(
        "Conta criada com sucesso! Agora você já pode entrar."
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError(
        "Não foi possível conectar ao servidor. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 py-16"
      style={{ backgroundColor: "var(--color-white)" }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-xl border bg-white px-8 py-10 shadow-sm sm:px-10"
          style={{ borderColor: "rgba(2, 2, 2, 0.08)" }}
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <Link href="/" className="mb-6">
              <Image
                src="/artisanHub.svg"
                alt="ArtisanHub"
                width={150}
                height={38}
                priority
              />
            </Link>

            <div
              className="mb-4 h-px w-12"
              style={{ backgroundColor: "var(--color-navbar)" }}
            />

            <h1 className="text-2xl font-semibold tracking-tight">
              Crie sua conta
            </h1>

            <p className="mt-2 text-sm" style={{ color: "var(--color-dark)" }}>
              Comece sua jornada como artesão no Artisan Hub.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Nome
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
                className="w-full rounded-md border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2"
                style={{ ["--tw-ring-color" as string]: "var(--color-dark)" }}
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                E-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-md border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2"
                style={{ ["--tw-ring-color" as string]: "var(--color-dark)" }}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Senha
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-md border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2"
                style={{ ["--tw-ring-color" as string]: "var(--color-dark)" }}
                placeholder="Mínimo de 8 caracteres"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Confirmar senha
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-md border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2"
                style={{ ["--tw-ring-color" as string]: "var(--color-dark)" }}
                placeholder="Repita sua senha"
              />
            </div>

            {error && (
              <p className="rounded-md border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-md border border-green-500/30 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md px-4 py-3 text-sm font-medium tracking-wide text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "var(--color-black)" }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "var(--color-dark)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-black)";
              }}
            >
              {loading ? "Criando sua conta..." : "Criar conta"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm">
          <span style={{ color: "var(--color-dark)" }}>
            Já possui uma conta?
          </span>{" "}
          <Link
            href="/signin"
            className="font-medium underline underline-offset-2"
          >
            Conecte-se
          </Link>
        </div>
      </div>
    </main>
  );
}