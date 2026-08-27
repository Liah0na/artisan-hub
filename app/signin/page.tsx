"use client";

import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("E-mail ou senha inválidos.");
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;

      router.replace(role === "admin" || role === "superadmin" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setError("Não foi possível entrar. Tente novamente.");
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
              Conecte-se à sua conta
            </h1>

            <p className="mt-2 text-sm" style={{ color: "var(--color-dark)" }}>
              Acesse sua conta no Artisan Hub.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
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
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-md border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2"
                style={{ ["--tw-ring-color" as string]: "var(--color-dark)" }}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Senha
                </label>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-md border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2"
                style={{ ["--tw-ring-color" as string]: "var(--color-dark)" }}
              />
            </div>

            {error && (
              <p className="rounded-md border border-red-500/30 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md p-3 text-sm font-medium tracking-wide text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "var(--color-black)" }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "var(--color-dark)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-black)";
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm">
          <span style={{ color: "var(--color-dark)" }}>
            Ainda não tem uma conta?
          </span>{" "}
          <Link
            href="/signup"
            className="font-medium underline underline-offset-2"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </main>
  );
}
