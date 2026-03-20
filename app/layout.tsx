"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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

  useEffect(() => {
    if (isLoginPage || isForgotPasswordPage) return;

    if (!isAdminLoggedIn()) {
      router.replace("/login");
    }
  }, [pathname, router, isLoginPage, isForgotPasswordPage]);

  if (isLoginPage || isForgotPasswordPage) {
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
