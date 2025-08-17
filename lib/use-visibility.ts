// lib/use-visibility.ts
"use client";
import { useEffect, useRef, useState } from "react";
export function useVisibility<T extends HTMLElement>() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}
