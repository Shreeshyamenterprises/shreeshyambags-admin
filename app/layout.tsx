"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { isAdminLoggedIn } from "@/lib/auth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === "/login";
  const isForgotPasswordPage = pathname === "/forgot-password";
  const isResetPasswordPage = pathname === "/reset-password";
  const isPublicPage = isLoginPage || isForgotPasswordPage || isResetPasswordPage;

  useEffect(() => {
    if (isPublicPage) return;

    if (!isAdminLoggedIn()) {
      router.replace("/login");
    }
  }, [pathname, router, isPublicPage]);

  if (isPublicPage) {
    return (
      <html lang="en">
        <body className="bg-[#f6f7fb] text-zinc-900 antialiased">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="bg-[#f6f7fb] text-zinc-900 antialiased">
        <div className="min-h-screen xl:pl-[290px]">
          <Sidebar
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />

          {/* Mobile / tablet top bar */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white px-4 shadow-sm xl:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 active:scale-95"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-pink-500">Admin Panel</p>
              <p className="truncate text-sm font-bold text-zinc-900">Shreeshyam Packaging</p>
            </div>
          </header>

          <main className="min-w-0">
            <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
