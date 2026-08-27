"use client";

import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold">
            Conecte-se
          </h1>

          <p className="text-sm text-gray-500">
            Acesse sua conta no Artisan Hub.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-5"
        >

          <input
            id="email"
            name="email"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            autoComplete="email"
            className="w-full border rounded-md p-3"
          />

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            autoComplete="current-password"
            className="w-full border rounded-md p-3"
          />

          {error && (
            <p className="rounded-md border border-red-500/30 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md p-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">
            Ainda não tem uma conta?
          </span>{" "}
          <a
            href="/signup"
            className="font-medium underline"
          >
            Cadastre-se
          </a>
        </div>
      </div>
    </main>
  );
}
