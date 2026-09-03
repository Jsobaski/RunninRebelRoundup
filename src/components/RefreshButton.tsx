"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const COOLDOWN_SECONDS = 20;

type Status = "idle" | "refreshing" | "cooldown" | "error";

export function RefreshButton() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  function startCooldown(seconds: number) {
    setStatus("cooldown");
    setSecondsLeft(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setStatus("idle");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function handleClick() {
    setStatus("refreshing");
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      if (res.status === 429) {
        const body = (await res.json()) as { retryAfterMs?: number };
        startCooldown(Math.ceil((body.retryAfterMs ?? COOLDOWN_SECONDS * 1000) / 1000));
        return;
      }
      if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
      router.refresh();
      startCooldown(COOLDOWN_SECONDS);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  const disabled = status === "refreshing" || status === "cooldown";
  const label =
    status === "refreshing"
      ? "Refreshing…"
      : status === "cooldown"
        ? `Refreshed (${secondsLeft}s)`
        : status === "error"
          ? "Refresh failed"
          : "Refresh";

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title="Refresh news, scores, and stats"
      className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-sm font-medium transition-colors ${
        disabled ? "cursor-not-allowed text-foreground/40" : "text-foreground/70 hover:bg-unlv-red/10 hover:text-foreground"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={`h-3.5 w-3.5 ${status === "refreshing" ? "animate-spin" : ""}`}
      >
        <path d="M21 12a9 9 0 1 1-2.64-6.36" strokeLinecap="round" />
        <path d="M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
