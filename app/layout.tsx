import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Discipline Tracker",
  description: "Local-only 2026 discipline tracker"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <div className="mx-auto max-w-6xl p-4 md:p-8">
            <div className="grid gap-5 md:grid-cols-[280px_1fr]">
              <Sidebar />
              <main className="w-full">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
                  {children}
                </div>
              </main>
            </div>
            <footer className="mt-6 text-white/40 text-[13px]">
              Local-only. Export/Import available in Settings.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
