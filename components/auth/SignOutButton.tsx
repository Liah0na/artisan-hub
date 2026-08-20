"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md border border-white/30 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
    >
      Sair
    </button>
  );
}
