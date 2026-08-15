"use client";

import { useEffect, useState } from "react";

const phrases = [
  "Mock APIs without waiting for the backend.",
  "Build realistic APIs before the backend is ready.",
  "Ship frontend features with confidence.",
];

export default function Typewriter() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    const finished = text === phrase;
    const empty = text.length === 0;
    const delay = finished ? 2200 : deleting && empty ? 500 : deleting ? 32 : 58;
    const timer = window.setTimeout(() => {
      if (finished) {
        setDeleting(true);
      } else if (deleting && empty) {
        setDeleting(false);
        setPhraseIndex((current) => (current + 1) % phrases.length);
      } else {
        setText(deleting ? phrase.slice(0, text.length - 1) : phrase.slice(0, text.length + 1));
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [deleting, phraseIndex, text]);

  return <>{text}<span className="ml-1 inline-block animate-pulse text-indigo-400">|</span></>;
}
