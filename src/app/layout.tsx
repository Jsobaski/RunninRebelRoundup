import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Runnin' Rebel Roundup",
  description: "News, schedule, stats, and rankings for UNLV Runnin' Rebels men's basketball.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NavBar />
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">{children}</div>
        <footer className="border-t border-border py-4 text-center text-xs text-foreground/50">
          Unofficial fan project. Not affiliated with UNLV Athletics. Stats from third-party sources may lag official records.
        </footer>
      </body>
    </html>
  );
}
