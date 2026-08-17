"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Scroll to top"
      aria-label="Scroll to top"
      className="back-to-top fixed bottom-4 right-4 z-50 p-2 font-mono text-[11px] uppercase tracking-widest text-zinc-300 transition duration-200 hover:-translate-y-1 hover:text-indigo-300 sm:bottom-6 sm:right-6 sm:p-0"
    >
      ↑<span className="ml-1">Top</span>
    </button>
  );
}
