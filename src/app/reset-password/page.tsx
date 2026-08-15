"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPassword() {
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });
    if (response.ok) router.push("/login?reset=success");
    else setError((await response.json()).error);
  }
  return (
    <main className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold">Reset password</h1>
        <p className="muted mt-2 text-center">Choose a new password for your account.</p>
        <form onSubmit={submit} className="panel mt-8 grid gap-4 p-6">
          <input name="username" placeholder="Username" required />
          <input name="password" type="password" minLength={4} placeholder="New password" required />
          <button className="btn">Update password</button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
        <p className="muted mt-4 text-center text-sm"><Link className="text-indigo-400" href="/login">← Back to login</Link></p>
      </div>
    </main>
  );
}
