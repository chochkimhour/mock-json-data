export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div
        className="muted flex items-center gap-3 text-sm"
        role="status"
        aria-live="polite"
      >
        <span className="size-4 animate-spin rounded-full border-2 border-indigo-400/30 border-t-indigo-400" />
        Loading…
      </div>
    </main>
  );
}
