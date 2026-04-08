"use client";

import { Menu, Search, LogOut, ChevronDown, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { removeAdminToken } from "@/lib/auth";

type HeaderProps = {
  title: string;
  subtitle?: string;
  onOpenSidebar?: () => void;
};

export function Header({ title, subtitle, onOpenSidebar }: HeaderProps) {
  const router = useRouter();
  const [openProfile, setOpenProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLogout() {
    removeAdminToken();
    router.push("/login");
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-zinc-100 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={onOpenSidebar}
            className="mt-1 rounded-full p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 xl:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
              Admin Workspace
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search admin..."
              className="w-full rounded-full border border-zinc-300 bg-zinc-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-pink-400 sm:w-72"
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpenProfile((prev) => !prev)}
              className="flex items-center gap-3 rounded-full bg-zinc-50 px-3 py-2 ring-1 ring-zinc-100 transition hover:bg-zinc-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-sm font-bold text-pink-600">
                A
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-zinc-900">Admin</p>
                <p className="text-xs text-zinc-500">Shreeshyam Packaging Admin</p>
              </div>

              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </button>

            {openProfile ? (
              <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
                <div className="border-b border-zinc-100 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-50 text-pink-600">
                      <UserCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Admin
                      </p>
                      <p className="text-xs text-zinc-500">
                        admin@shreeshyampackaging.in
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
