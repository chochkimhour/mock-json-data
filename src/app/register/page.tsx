"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Register() {
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    if (r.ok) router.push("/dashboard");
    else setError((await r.json()).error);
  }
  return (
    <main className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-md">
      <h1 className="text-center text-3xl font-bold">Create your account</h1>
      <p className="muted mt-2 text-center">Get a live mock endpoint in minutes.</p>
      <form onSubmit={submit} className="panel mt-8 grid gap-4 p-6">
        <input name="name" placeholder="Name (optional)" />
        <input name="username" placeholder="Username" required />
        <input
          name="password"
          type="password"
          minLength={4}
          placeholder="Password (4+ characters)"
          required
        />
        <button className="btn">Create account</button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
      </div>
    </main>
  );
}
