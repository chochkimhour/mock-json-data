import Link from "next/link";
import ThemeToggle from "./theme-toggle";
import Typewriter from "./typewriter";
export default function Home() {
  return (
    <main className="dashboard-frame relative mx-auto flex min-h-screen w-full max-w-5xl flex-col border-x border-zinc-800/80 px-5 pb-2 pt-6 sm:px-8 sm:pb-3 sm:pt-8">
      <nav className="flex items-center justify-between rounded-2xl border border-indigo-300/40 bg-zinc-900/45 px-4 py-3 shadow-xl shadow-black/20 backdrop-blur-lg">
        <div className="flex items-center gap-2"><img src="/json-png.png" alt="" className="size-8 rounded bg-white object-contain" /><span className="text-lg tracking-tight transition-colors hover:text-indigo-300 sm:text-xl"><b>Mock JSON Data</b></span></div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link className="btn" href="/login">Open dashboard</Link>
        </div>
      </nav>
      <section className="grid flex-1 items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
        <div>
          <p className="mb-4 text-sm font-semibold text-indigo-400">
            Developer-first mock APIs
          </p>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
            <Typewriter />
          </h1>
          <p className="muted mt-5 max-w-lg text-base leading-7 sm:text-lg">
            Design, test, and share realistic REST API mocks in seconds. Static
            responses, stateful CRUD, scenarios, validation, and a real URL.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="btn" href="/login">
              Create a Mock API
            </Link>
            <Link
              className="docs-link rounded-md border border-zinc-700 px-4 py-2 text-sm transition"
              href="/docs"
            >
              Explore documentation
            </Link>
          </div>
        </div>
        <div className="panel overflow-hidden">
          <div className="border-b border-zinc-800 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-indigo-300">Request → response</div>
          <pre className="max-w-full overflow-hidden whitespace-pre-wrap break-words p-6 text-sm leading-6 text-emerald-300">{`GET /api/my-api/users\n\n200 OK\n{\n  "status": 200,\n  "success": true,\n  "message": "Request successful",\n  "data": {},\n  "timestamp": "2026-08-15T12:58:00.000Z"\n}`}</pre>
        </div>
      </section>
      <section className="grid gap-4 pb-12 md:grid-cols-3">
        {[
          ["Real endpoints", "Call your mocks from any HTTP client."],
          ["Scenarios", "Switch behaviour with a header or query parameter."],
          [
            "Stateful data",
            "Build believable CRUD flows with resettable data.",
          ],
        ].map(([title, text]) => (
          <article className="panel p-5" key={title}>
            <h2 className="font-semibold">{title}</h2>
            <p className="muted mt-2 text-sm">{text}</p>
          </article>
        ))}
      </section>
      <footer className="mt-auto flex items-center justify-center border-t border-zinc-800 pb-2 pt-3 text-center text-xs text-zinc-500">
        Copyright © 2026&nbsp;&nbsp;·&nbsp;&nbsp;All rights reserved&nbsp;&nbsp;·&nbsp;&nbsp;V1.0.0
      </footer>
    </main>
  );
}
