"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/stats", label: "Stats & Rankings" },
  { href: "/roster", label: "Roster & Recruiting" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-unlv-red text-sm text-white">
            UR
          </span>
          <span className="hidden sm:inline">Runnin&apos; Rebel Roundup</span>
        </Link>
        <nav className="flex flex-1 gap-1 overflow-x-auto text-sm">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition-colors ${
                  active
                    ? "bg-unlv-red text-white"
                    : "text-foreground/70 hover:bg-unlv-red/10 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
