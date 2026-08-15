"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const isLight = window.localStorage.getItem("mock-json-theme") === "light";
    setLight(isLight);
    document.body.classList.toggle("light", isLight);
  }, []);
  function toggle() {
    const next = !light;
    setLight(next);
    document.body.classList.toggle("light", next);
    window.localStorage.setItem("mock-json-theme", next ? "light" : "dark");
  }
  return (
    <button
      type="button"
      onClick={toggle}
      title={light ? "Switch to dark mode" : "Switch to light mode"}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      className="rounded-full border border-zinc-700 p-2"
    >
      {light ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
