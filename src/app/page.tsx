import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Layers3,
  ListTree,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import ThemeToggle from "./theme-toggle";
import Typewriter from "./typewriter";
import BackToTop from "./back-to-top";
export default function Home() {
  return (
    <main className="dashboard-frame relative mx-auto flex min-h-screen w-full max-w-5xl flex-col border-x border-zinc-800/80 px-5 pb-2 pt-24 sm:px-8 sm:pb-3 sm:pt-24">
      <BackToTop />
      <nav className="fixed left-1/2 top-3 z-50 flex w-[calc(100%-1.5rem)] max-w-[60rem] -translate-x-1/2 items-center justify-between rounded-2xl border border-indigo-300/40 bg-zinc-900/45 px-4 py-3 shadow-xl shadow-black/20 backdrop-blur-lg sm:top-4 sm:w-[calc(100%-4rem)]">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src="/mock-json-logo.svg"
            alt="Mock JSON Data"
            className="logo-mark size-8 shrink-0 rounded-lg object-contain"
          />
          <span className="cursor-pointer truncate text-sm tracking-tight transition-colors hover:text-indigo-300 sm:text-lg">
            <b>Mock JSON Data</b>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            className="btn inline-flex shrink-0 items-center gap-1.5 px-3 text-xs sm:px-4 sm:text-sm"
            href="/login"
          >
            <LogIn size={14} aria-hidden="true" />
            Login
          </Link>
        </div>
      </nav>
      <section className="grid flex-1 items-center gap-8 py-8 sm:gap-10 sm:py-14 lg:grid-cols-[.92fr_1.08fr] lg:gap-12 lg:py-20">
        <div>
          <p className="mb-4 text-sm font-semibold text-indigo-400">
            Developer-first mock APIs
          </p>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
            <Typewriter />
          </h1>
          <p className="muted mt-5 max-w-lg text-base leading-7 sm:text-lg">
            Design, test, and share realistic GET API mocks in seconds—with
            custom JSON responses, scenarios, templates, and a live URL.
          </p>
          <div className="mt-5 flex max-w-lg items-start gap-2.5 border-l-2 border-orange-400/70 pl-3 text-xs leading-5 text-zinc-400">
            <Clock3
              className="mt-0.5 shrink-0 text-orange-300"
              size={15}
              aria-hidden="true"
            />
            <p>
              <span className="retention-label font-semibold text-zinc-200">
                30-day retention.
              </span>{" "}
              Mock APIs are automatically deleted after 30 days.
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="btn inline-flex items-center gap-1.5"
              href="/login"
            >
              <ArrowRight size={15} aria-hidden="true" />
              Let&apos;s start
            </Link>
            <Link
              className="docs-link rounded-md border border-zinc-700 px-4 py-2 text-sm transition"
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="inline-flex items-center gap-1.5">
                <BookOpen size={15} aria-hidden="true" />
                Documentation
              </span>
            </Link>
          </div>
        </div>
        <div className="panel overflow-hidden">
          <div className="border-b border-zinc-800 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Request → response
          </div>
          <pre className="max-w-full overflow-x-auto whitespace-pre p-6 text-sm leading-6 text-emerald-300">{`GET https://mock-json-data.vercel.app/api/demo-123456\nX-API-Key: mjd_your_api_key\n\n{\n  "status": 200,\n  "success": true,\n  "message": "Request successful",\n  "data": {},\n  "timestamp": "{{datetime}}"\n}`}</pre>
        </div>
      </section>
      <section className="home-security-card mb-12 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
          Fast · secure · easy to use
        </p>
        <h2 className="mt-2 flex items-center gap-2 text-xl font-bold tracking-tight">
          <ShieldCheck
            size={19}
            className="text-emerald-300"
            aria-hidden="true"
          />
          Call your mock API in seconds.
        </h2>
        <p className="muted mt-2 max-w-2xl text-sm leading-6">
          Generate one API key in your dashboard and send it with every public
          request. Your key protects all of your APIs and keeps unknown users
          from accessing your mock data.
        </p>
        <code className="home-security-code mt-4 block overflow-x-auto rounded-lg bg-zinc-950 p-3 text-xs text-emerald-300">
          X-API-Key: mjd_your_api_key
        </code>
      </section>
      <section className="grid gap-4 pb-12 md:grid-cols-3">
        {[
          ["Real endpoints", "Call your mocks from any HTTP client."],
          ["Scenarios", "Switch behaviour with a header or query parameter."],
          [
            "Dynamic responses",
            "Use templates for UUIDs, dates, request fields, and query values.",
          ],
        ].map(([title, text]) => (
          <article className="panel p-5" key={title}>
            <h2 className="flex items-center gap-2 font-semibold">
              {title === "Real endpoints" ? (
                <ListTree
                  size={16}
                  className="text-indigo-300"
                  aria-hidden="true"
                />
              ) : (
                <Layers3
                  size={16}
                  className="text-indigo-300"
                  aria-hidden="true"
                />
              )}
              {title}
            </h2>
            <p className="muted mt-2 text-sm">{text}</p>
          </article>
        ))}
      </section>
      <footer className="mt-auto flex items-center justify-center border-t border-zinc-800 pb-2 pt-3 text-center text-xs text-zinc-500">
        Copyright © 2026&nbsp;&nbsp;·&nbsp;&nbsp;All rights
        reserved&nbsp;&nbsp;·&nbsp;&nbsp;V1.0.0
      </footer>
    </main>
  );
}
