"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
export default function Register() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="grid min-h-screen place-items-center px-4 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold">Create your account</h1>
        <p className="muted mt-2 text-center">
          Get a live mock endpoint in minutes.
        </p>
        <form
          onSubmit={submit}
          className="panel mt-6 grid gap-4 p-4 sm:mt-8 sm:p-6"
        >
          <input name="name" placeholder="Name (optional)" />
          <input name="username" placeholder="Username" required />
          <div className="relative">
            <input
              className="w-full pr-10"
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={4}
              placeholder="Password (4+ characters)"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="password-toggle absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/80 p-0 text-zinc-200 hover:bg-zinc-700 hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button className="btn">Create account</button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
        <p className="muted mt-4 text-center text-sm">
          Already have an account?{" "}
          <a className="text-indigo-400" href="/login">
            Back to login
          </a>
        </p>
      </div>
    </main>
  );
}
