"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
export default function Login() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        <p className="muted mt-2 text-center">
          Sign in to manage your mock APIs.
        </p>
        <form onSubmit={submit} className="panel mt-8 grid gap-4 p-6">
          <input name="username" placeholder="Username" required />
          <div className="relative">
            <input
              className="w-full pr-10"
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={4}
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button className="btn">Sign in</button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
        <p className="muted mt-4 text-sm">
          <a className="text-indigo-400" href="/reset-password">
            Forgot password?
          </a>
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
