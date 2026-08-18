import Link from "next/link";
import ThemeToggle from "../theme-toggle";
import BackToTop from "../back-to-top";
import {
  ArrowLeft,
  Braces,
  Globe2,
  KeyRound,
  ListChecks,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const steps = [
  ["01", "Create an API", "Open the dashboard and give your API a clear name."],
  [
    "02",
    "Add a GET resource",
    "Create a route such as GET /users or GET /users/:id and add custom JSON.",
  ],
  [
    "03",
    "Call the protected URL",
    "Use the highlighted /api/{your-api}/... URL with your X-API-Key header.",
  ],
];

export default function Docs() {
  return (
    <main className="dashboard-frame relative mx-auto flex min-h-screen w-full max-w-5xl flex-col border-x border-zinc-800/80 px-4 pb-2 pt-20 sm:px-8 sm:pb-3 sm:pt-24">
      <BackToTop />
      <header className="fixed left-1/2 top-2 z-50 flex w-[calc(100%-1rem)] max-w-[60rem] -translate-x-1/2 items-center justify-between gap-2 rounded-2xl border border-zinc-800/90 bg-zinc-950/75 px-3 py-2.5 backdrop-blur sm:top-4 sm:w-[calc(100%-4rem)] sm:px-4 sm:py-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 truncate text-base font-semibold tracking-tight sm:text-lg"
        >
          <img
            src="/mock-json-logo.svg"
            alt=""
            className="size-7 shrink-0 rounded-md object-contain sm:size-8"
          />
          <span className="truncate">Mock JSON Data</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/"
            className="back-home rounded-md border border-zinc-700 px-2.5 py-1.5 text-[11px] transition sm:px-3 sm:py-2 sm:text-xs"
          >
            <span className="inline-flex items-center gap-1.5">
              <ArrowLeft size={13} aria-hidden="true" />
              Back home
            </span>
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-3xl flex-1 py-8 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
          Documentation
        </p>
        <h1 className="mt-3 max-w-2xl text-[2.1rem] font-bold leading-tight tracking-tight sm:text-[2.75rem]">
          Build your first mock API.
        </h1>
        <p className="muted mt-4 max-w-2xl text-[13px] leading-6 sm:mt-5 sm:text-[15px] sm:leading-7">
          Create realistic GET endpoints for frontend development, testing,
          demos, and integrations—without waiting for a backend.
        </p>

        <div className="mt-12 grid gap-3">
          {steps.map(([number, title, text]) => (
            <article key={number} className="panel flex gap-4 p-5">
              <span className="text-sm font-bold text-indigo-400">
                {number}
              </span>
              <div>
                <h2 className="flex items-center gap-2 font-semibold">
                  <ListChecks
                    size={16}
                    className="text-indigo-300"
                    aria-hidden="true"
                  />
                  {title}
                </h2>
                <p className="muted mt-1 text-sm leading-6">{text}</p>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Route size={19} className="text-indigo-300" aria-hidden="true" />A
            simple request
          </h2>
          <p className="muted mt-2 text-sm leading-6">
            Your endpoint URL follows this format:
          </p>
          <pre className="panel mt-4 overflow-hidden whitespace-pre-wrap break-words p-5 text-sm leading-7 text-emerald-300">{`GET /api/sms-a9dhds/users

X-API-Key: mjd_your_api_key

{
  "status": 200,
  "success": true,
  "message": "Request successful",
  "data": {},
  "timestamp": "{{datetime}}"
}`}</pre>
        </section>

        <section className="panel mt-10 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
            Fast, secure, easy
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold">
            <KeyRound
              size={19}
              className="text-indigo-300"
              aria-hidden="true"
            />
            Use your API key on every request
          </h2>
          <p className="muted mt-2 text-sm leading-6">
            Generate one key from the dashboard workspace panel. The same key
            protects every API you create, so unknown users cannot access your
            mock data. Send it with every public request.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs leading-6 text-emerald-300">{`curl https://your-domain.com/api/sms-a9dhds/users \\\n  -H "X-API-Key: mjd_your_api_key"`}</pre>
          <p className="muted mt-3 text-xs leading-5">
            You can also use <code>Authorization: Bearer mjd_your_api_key</code>
            . Header names are case-insensitive, but the API-key value is
            case-sensitive. Requests without a valid key return <code>401</code>.
          </p>
        </section>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <section className="panel p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <Braces
                size={16}
                className="text-indigo-300"
                aria-hidden="true"
              />
              Scenarios
            </h2>
            <p className="muted mt-2 text-sm leading-6">
              Switch responses with <code>?scenario=empty</code> or the{" "}
              <code>X-Mock-Scenario</code> header. Mock responses can include
              dynamic values such as UUIDs, dates, request fields, route
              parameters, and query values.
            </p>
          </section>
          <section className="panel p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShieldCheck
                size={16}
                className="text-emerald-300"
                aria-hidden="true"
              />
              API key security
            </h2>
            <p className="muted mt-2 text-sm leading-6">
              Generate one key per user and send it with every public request
              using X-API-Key or Bearer authentication.
            </p>
          </section>
          <section className="panel p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <Sparkles
                size={16}
                className="text-amber-300"
                aria-hidden="true"
              />
              Dynamic values
            </h2>
            <p className="muted mt-2 text-sm leading-6">
              Use templates such as <code>{"{{uuid}}"}</code>,{" "}
              <code>{"{{request.name}}"}</code>, and{" "}
              <code>{"{{params.id}}"}</code>.
            </p>
          </section>
          <section className="panel p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <Globe2 size={16} className="text-sky-300" aria-hidden="true" />
              Browser-ready
            </h2>
            <p className="muted mt-2 text-sm leading-6">
              Public mocks include CORS support and safe request logging.
            </p>
          </section>
          <section className="panel p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShieldCheck
                size={16}
                className="text-orange-300"
                aria-hidden="true"
              />
              30-day retention
            </h2>
            <p className="muted mt-2 text-sm leading-6">
              Mock APIs are automatically deleted 30 days after creation.
            </p>
          </section>
          <section className="panel p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <ListChecks
                size={16}
                className="text-violet-300"
                aria-hidden="true"
              />
              Request logs
            </h2>
            <p className="muted mt-2 text-sm leading-6">
              Review recent requests, response statuses, latency, and the
              endpoint that was called from your dashboard.
            </p>
          </section>
        </div>
      </div>
      <footer className="mt-auto flex items-center justify-center border-t border-zinc-800 pb-2 pt-3 text-center text-xs text-zinc-500">
        Copyright © 2026&nbsp;&nbsp;·&nbsp;&nbsp;All rights
        reserved&nbsp;&nbsp;·&nbsp;&nbsp;V1.0.0
      </footer>
    </main>
  );
}
