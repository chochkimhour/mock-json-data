import Link from "next/link";

const steps = [
  ["01", "Create an API", "Open the dashboard, name your API, and choose its visibility."],
  ["02", "Add a resource", "Create routes such as GET /users or POST /users."],
  ["03", "Call the URL", "Use the highlighted /api/{your-api}/... URL from the dashboard."],
];

export default function Docs() {
  return (
    <main className="dashboard-frame relative mx-auto flex min-h-screen w-full max-w-5xl flex-col border-x border-zinc-800/80 px-5 pb-2 pt-6 sm:px-8 sm:pb-3 sm:pt-8">
      <header className="flex items-center justify-between rounded-2xl border border-zinc-800/90 bg-zinc-950/75 px-4 py-3 backdrop-blur">
        <Link href="/" className="font-semibold tracking-tight">Mock JSON Data</Link>
        <Link href="/" className="back-home rounded-md border border-zinc-700 px-3 py-2 text-xs transition">← Back home</Link>
      </header>
      <div className="mx-auto w-full max-w-3xl flex-1 py-14 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Documentation</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Build your first mock API.</h1>
        <p className="muted mt-5 max-w-2xl leading-7">Create realistic REST endpoints for frontend development, testing, demos, and integrations—without waiting for a backend.</p>

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
          <pre className="panel mt-4 overflow-hidden whitespace-pre-wrap break-words p-5 text-sm leading-7 text-emerald-300">GET /api/your-api/users{"\n"}{"\n"}{"{"}{"\n"}  "status": 200,{"\n"}  "success": true,{"\n"}  "message": "Request successful",{"\n"}  "data": {"{"}{"}"},{"\n"}  "timestamp": "2026-08-15T12:58:00.000Z"{"\n"}{"}"}</pre>
        </section>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <section className="panel p-5"><h2 className="font-semibold">Scenarios</h2><p className="muted mt-2 text-sm leading-6">Switch responses with <code>?scenario=empty</code> or the <code>X-Mock-Scenario</code> header.</p></section>
          <section className="panel p-5"><h2 className="font-semibold">Stateful CRUD</h2><p className="muted mt-2 text-sm leading-6">Use stateful mode to let POST, GET, PUT, PATCH, and DELETE operate on mock records.</p></section>
          <section className="panel p-5"><h2 className="font-semibold">Dynamic values</h2><p className="muted mt-2 text-sm leading-6">Use templates such as <code>{"{{uuid}}"}</code>, <code>{"{{request.name}}"}</code>, and <code>{"{{params.id}}"}</code>.</p></section>
          <section className="panel p-5"><h2 className="font-semibold">Browser-ready</h2><p className="muted mt-2 text-sm leading-6">Public mocks include CORS support and safe request logging.</p></section>
        </div>
      </div>
      <footer className="mt-auto flex items-center justify-center border-t border-zinc-800 pb-2 pt-3 text-center text-xs text-zinc-500">Copyright © 2026&nbsp;&nbsp;·&nbsp;&nbsp;All rights reserved&nbsp;&nbsp;·&nbsp;&nbsp;V1.0.0</footer>
    </main>
  );
}
