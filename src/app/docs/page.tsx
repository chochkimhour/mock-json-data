import Link from "next/link";
import ThemeToggle from "../theme-toggle";

const steps = [
  ["01", "Create an API", "Open the dashboard, name your API, and choose its visibility."],
  ["02", "Add a GET resource", "Create a route such as GET /users or GET /users/:id and add custom JSON."],
  ["03", "Call the protected URL", "Use the highlighted /api/{your-api}/... URL with your X-API-Key header."],
];

export default function Docs() {
  return (
    <main className="dashboard-frame relative mx-auto flex min-h-screen w-full max-w-5xl flex-col border-x border-zinc-800/80 px-5 pb-2 pt-6 sm:px-8 sm:pb-3 sm:pt-8">
      <header className="flex items-center justify-between rounded-2xl border border-zinc-800/90 bg-zinc-950/75 px-4 py-3 backdrop-blur">
        <Link href="/" className="font-semibold tracking-tight">Mock JSON Data</Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/" className="back-home rounded-md border border-zinc-700 px-3 py-2 text-xs transition">← Back home</Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-3xl flex-1 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Documentation</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Build your first mock API.</h1>
        <p className="muted mt-5 max-w-2xl leading-7">Create realistic GET endpoints for frontend development, testing, demos, and integrations—without waiting for a backend.</p>

        <div className="mt-12 grid gap-3">
          {steps.map(([number, title, text]) => (
            <article key={number} className="panel flex gap-4 p-5">
              <span className="text-sm font-bold text-indigo-400">{number}</span>
              <div><h2 className="font-semibold">{title}</h2><p className="muted mt-1 text-sm leading-6">{text}</p></div>
            </article>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">A simple request</h2>
          <p className="muted mt-2 text-sm leading-6">Your endpoint URL follows this format:</p>
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

        <section className="panel mt-10 p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Fast, secure, easy</p><h2 className="mt-2 text-xl font-semibold">Use your API key on every request</h2><p className="muted mt-2 text-sm leading-6">Generate one key from the dashboard workspace panel. The same key protects every API you create, so unknown users cannot access your mock data.</p><pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs leading-6 text-emerald-300">{`curl https://your-domain.com/api/sms-a9dhds/users \\\n  -H "X-API-Key: mjd_your_api_key"`}</pre><p className="muted mt-3 text-xs leading-5">You can also use <code>Authorization: Bearer mjd_your_api_key</code>. Requests without a valid key return <code>401</code>.</p></section>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <section className="panel p-5"><h2 className="font-semibold">Scenarios</h2><p className="muted mt-2 text-sm leading-6">Switch responses with <code>?scenario=empty</code> or the <code>X-Mock-Scenario</code> header.</p></section>
          <section className="panel p-5"><h2 className="font-semibold">API key security</h2><p className="muted mt-2 text-sm leading-6">Generate one key per user and send it with every request using X-API-Key or Bearer authentication.</p></section>
          <section className="panel p-5"><h2 className="font-semibold">Dynamic values</h2><p className="muted mt-2 text-sm leading-6">Use templates such as <code>{"{{uuid}}"}</code>, <code>{"{{request.name}}"}</code>, and <code>{"{{params.id}}"}</code>.</p></section>
          <section className="panel p-5"><h2 className="font-semibold">Browser-ready</h2><p className="muted mt-2 text-sm leading-6">Public mocks include CORS support and safe request logging.</p></section>
          <section className="panel p-5"><h2 className="font-semibold">30-day retention</h2><p className="muted mt-2 text-sm leading-6">Mock APIs are automatically deleted 30 days after creation.</p></section>
        </div>
      </div>
      <footer className="mt-auto flex items-center justify-center border-t border-zinc-800 pb-2 pt-3 text-center text-xs text-zinc-500">Copyright © 2026&nbsp;&nbsp;·&nbsp;&nbsp;All rights reserved&nbsp;&nbsp;·&nbsp;&nbsp;V1.0.0</footer>
    </main>
  );
}
