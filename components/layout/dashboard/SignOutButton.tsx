"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/signin" })}
      className="w-full rounded border border-gray-600 px-3 py-2 text-left text-sm transition hover:bg-gray-800"
    >
      Sair da conta
    </button>
  );
}
