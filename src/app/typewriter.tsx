"use client";

import { useEffect, useState } from "react";

const phrase = "Mock APIs without waiting for the backend.";

export default function Typewriter() {
  const [text, setText] = useState("");

  useEffect(() => {
    const finished = text === phrase;
    const delay = finished ? 5000 : 58;
    const timer = window.setTimeout(() => {
      setText(finished ? "" : phrase.slice(0, text.length + 1));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [text]);

  return <>{text}</>;
}
