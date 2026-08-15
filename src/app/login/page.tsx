"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Login() {
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(f)),
      });
    if (r.ok) router.push("/dashboard");
    else setError((await r.json()).error);
  }
  return (
    <main className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-md">
      <h1 className="text-center text-3xl font-bold">Welcome back</h1>
      <p className="muted mt-2 text-center">Sign in to manage your mock APIs.</p>
      <form onSubmit={submit} className="panel mt-8 grid gap-4 p-6">
        <input name="username" placeholder="Username" required />
        <input
          name="password"
          type="password"
          minLength={4}
          placeholder="Password"
          required
        />
        <button className="btn">Sign in</button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
      <p className="muted mt-4 text-sm">
        <a className="text-indigo-400" href="/reset-password">Forgot password?</a>
      </p>
      <p className="muted mt-2 text-sm">
        Need an account?{" "}
        <a className="text-indigo-400" href="/register">
          Register
        </a>
      </p>
      </div>
    </main>
  );
}
