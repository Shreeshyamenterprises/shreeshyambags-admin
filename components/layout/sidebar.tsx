"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusSquare,
  ShoppingCart,
  FileText,
  X,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/products",
    icon: Package,
  },
  {
    label: "Create Product",
    href: "/products/new",
    icon: PlusSquare,
  },
  {
    label: "Quotes",
    href: "/quotes",
    icon: FileText,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  if (href === "/products") {
    return pathname === "/products";
  }

  if (href === "/products/new") {
    return pathname === "/products/new";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/30 xl:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[290px] flex-col border-r border-zinc-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-transform duration-300 xl:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-pink-500">
              Admin Panel
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-900">
              PieBags
            </h1>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 xl:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition ${
                      active
                        ? "text-white"
                        : "text-zinc-500 group-hover:text-zinc-900"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[1.75rem] bg-gradient-to-br from-pink-50 to-rose-50 p-5 ring-1 ring-pink-100">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-500">
              Business Focus
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              Manage premium non-woven bags, pricing tiers, quotes, orders and
              custom printing from one clean workspace.
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-200 px-5 py-4">
          <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
              Workspace
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-900">
              Production Admin
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
