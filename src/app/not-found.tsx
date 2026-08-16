import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10 text-center">
      <div className="panel w-full max-w-md p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
          404 · Not found
        </p>
        <h1 className="mt-3 text-3xl font-bold">This page does not exist.</h1>
        <p className="muted mt-3 leading-7">
          The link may be outdated or the mock API may have expired.
        </p>
        <Link href="/" className="btn mt-6 inline-flex">
          Back home
        </Link>
      </div>
    </main>
  );
}
