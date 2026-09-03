"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    twttr?: { widgets?: { load?: (el?: HTMLElement) => void } };
  }
}

const SCRIPT_SRC = "https://platform.twitter.com/widgets.js";

/**
 * Embeds X's native timeline widget scoped to a curated list of UNLV MBB
 * accounts. Free, client-side, no API key/rate limits — just loads
 * platform.twitter.com's widget script once and lets it render the iframe.
 *
 * Configure NEXT_PUBLIC_X_LIST_URL to point at an X List (Lists → curate
 * @UNLVMBB, beat writers, conference accounts → copy the list URL).
 */
export function XTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const listUrl = process.env.NEXT_PUBLIC_X_LIST_URL;

  useEffect(() => {
    if (!listUrl) return;

    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    const timeout = setTimeout(() => setFailed(true), 8000);

    function renderWidget() {
      clearTimeout(timeout);
      window.twttr?.widgets?.load?.(containerRef.current ?? undefined);
    }

    if (existing) {
      renderWidget();
    } else {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = renderWidget;
      script.onerror = () => {
        clearTimeout(timeout);
        setFailed(true);
      };
      document.body.appendChild(script);
    }

    return () => clearTimeout(timeout);
  }, [listUrl]);

  if (!listUrl) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-foreground/60">
        Set <code className="rounded bg-foreground/10 px-1">NEXT_PUBLIC_X_LIST_URL</code> to an X List URL to embed
        the social timeline.
      </div>
    );
  }

  if (failed) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-foreground/60">
        Social timeline is unavailable right now.{" "}
        <a href={listUrl} target="_blank" rel="noopener noreferrer" className="text-unlv-red hover:underline">
          View the list on X →
        </a>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-40 overflow-hidden rounded-lg border border-border">
      <a
        className="twitter-timeline"
        data-height="800"
        data-theme="light"
        data-chrome="noheader nofooter noborders"
        href={listUrl}
      >
        UNLV MBB timeline
      </a>
    </div>
  );
}
