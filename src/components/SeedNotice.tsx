export function SeedNotice({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
      Live {label} data is unavailable right now — showing placeholder data, not real numbers.
    </div>
  );
}
