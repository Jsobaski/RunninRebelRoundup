export function Unavailable({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-foreground/60">
      {label} is unavailable right now. Check back later.
    </div>
  );
}
