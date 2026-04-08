"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Layers,
  Package,
  PlusSquare,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

// ── types ─────────────────────────────────────────────────────────────────────

type Variant = { stock: number; isActive: boolean };
type Product = { isActive: boolean; variants: Variant[] };
type Quote = { status: "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED" };
type Order = { status: string };

type Stats = {
  totalProducts: number;
  activeProducts: number;
  openQuotes: number;
  pendingQuotes: number;
  totalOrders: number;
  lowStockVariants: number;
  totalVariants: number;
  activeVariants: number;
};

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  accent,
  loading,
  href,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent?: "warning" | "danger" | "success";
  loading: boolean;
  href?: string;
}) {
  const valueColor =
    accent === "danger"
      ? "text-red-600"
      : accent === "warning"
        ? "text-amber-600"
        : accent === "success"
          ? "text-green-600"
          : "text-zinc-900";

  const inner = (
    <div
      className={`group relative overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-zinc-100 transition ${
        href ? "hover:-translate-y-0.5 hover:shadow-md cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        {href && (
          <ArrowRight className="h-4 w-4 text-zinc-300 transition group-hover:text-zinc-500 group-hover:translate-x-0.5" />
        )}
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-16 animate-pulse rounded-lg bg-zinc-100" />
        ) : (
          <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>
            {value}
          </p>
        )}
        <p className="mt-1 text-sm font-medium text-zinc-700">{label}</p>
      </div>

      <p className="mt-2 text-xs text-zinc-400">{sub}</p>

      {/* accent bar */}
      {accent && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-0.5 ${
            accent === "danger"
              ? "bg-red-400"
              : accent === "warning"
                ? "bg-amber-400"
                : "bg-green-400"
          }`}
        />
      )}
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

// ── QuickAction ───────────────────────────────────────────────────────────────

function QuickAction({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  href,
  badge,
  badgeColor,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <Link href={href}>
      <div className="group flex items-center gap-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100 transition hover:bg-white hover:shadow-sm hover:-translate-y-0.5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-zinc-900">{title}</p>
            {badge && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeColor ?? "bg-zinc-200 text-zinc-600"}`}
              >
                {badge}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{description}</p>
        </div>

        <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300 transition group-hover:text-zinc-500 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

// ── InventoryBar ──────────────────────────────────────────────────────────────

function InventoryBar({
  label,
  value,
  total,
  color,
  loading,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  loading: boolean;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-600">{label}</p>
        {loading ? (
          <div className="h-3 w-10 animate-pulse rounded bg-zinc-100" />
        ) : (
          <p className="text-xs font-semibold text-zinc-900">
            {value}
            <span className="font-normal text-zinc-400"> / {total}</span>
          </p>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
        {!loading && (
          <div
            className={`h-full rounded-full transition-all duration-700 ${color}`}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      setError(null);

      const token = getAdminToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [productsRes, quotesRes, ordersRes] = await Promise.allSettled([
        api.get<Product[]>("/admin/products", { headers }),
        api.get<Quote[]>("/admin/quotes", { headers }),
        api.get<Order[]>("/admin/orders", { headers }),
      ]);

      const products: Product[] =
        productsRes.status === "fulfilled"
          ? (productsRes.value.data ?? [])
          : [];
      const quotes: Quote[] =
        quotesRes.status === "fulfilled" ? (quotesRes.value.data ?? []) : [];
      const orders: Order[] =
        ordersRes.status === "fulfilled" ? (ordersRes.value.data ?? []) : [];

      const allVariants = products.flatMap((p) => p.variants ?? []);

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.isActive).length,
        openQuotes: quotes.filter(
          (q) => q.status === "PENDING" || q.status === "REVIEWED",
        ).length,
        pendingQuotes: quotes.filter((q) => q.status === "PENDING").length,
        totalOrders: orders.length,
        lowStockVariants: allVariants.filter((v) => v.stock <= 10).length,
        totalVariants: allVariants.length,
        activeVariants: allVariants.filter((v) => v.isActive).length,
      });

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error(err);
      setError("Could not load dashboard data. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const timeAgo = lastUpdated
    ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : null;

  return (
    <div className="space-y-6">

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-red-50 px-5 py-4 ring-1 ring-red-200">
          <div className="flex items-center gap-2.5 text-sm text-red-700">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
          <button
            onClick={loadStats}
            className="flex items-center gap-1.5 rounded-xl bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-pink-950 p-7 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-pink-500/10" />
        <div className="pointer-events-none absolute -bottom-16 right-32 h-52 w-52 rounded-full bg-pink-400/8" />

        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-pink-500/15 px-3.5 py-1.5 ring-1 ring-pink-400/20">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-pink-300">
                Admin Workspace
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Shreeshyam Packaging Admin
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-7 text-zinc-400">
              Manage your product catalog, bulk quote requests, order fulfilment
              and inventory — all from one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 active:scale-95"
              >
                <Package className="h-4 w-4" />
                Manage Products
              </Link>
              <Link
                href="/quotes"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 active:scale-95"
              >
                <FileText className="h-4 w-4" />
                Review Quotes
                {stats && stats.openQuotes > 0 && (
                  <span className="rounded-full bg-pink-500 px-2 py-0.5 text-xs font-bold">
                    {stats.openQuotes}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Right side — live mini stats */}
          <div className="grid gap-3">
            <div className="rounded-2xl bg-white/6 px-4 py-3.5 ring-1 ring-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                  Catalog health
                </p>
                {loading ? (
                  <div className="h-3 w-14 animate-pulse rounded bg-white/10" />
                ) : (
                  <span className="text-xs font-semibold text-white">
                    {stats?.activeProducts ?? 0} active
                  </span>
                )}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                {!loading && stats && (
                  <div
                    className="h-full rounded-full bg-green-400 transition-all duration-700"
                    style={{
                      width:
                        stats.totalProducts > 0
                          ? `${(stats.activeProducts / stats.totalProducts) * 100}%`
                          : "0%",
                    }}
                  />
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white/6 px-4 py-3.5 ring-1 ring-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                  Open quotes
                </p>
                {loading ? (
                  <div className="h-3 w-8 animate-pulse rounded bg-white/10" />
                ) : (
                  <span
                    className={`text-xs font-semibold ${
                      (stats?.openQuotes ?? 0) > 0
                        ? "text-amber-300"
                        : "text-zinc-300"
                    }`}
                  >
                    {stats?.openQuotes ?? 0} pending
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Awaiting admin response
              </p>
            </div>

            {timeAgo && (
              <p className="text-center text-[10px] text-zinc-600">{timeAgo}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Package}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          sub={`${stats?.activeProducts ?? 0} active · ${(stats?.totalProducts ?? 0) - (stats?.activeProducts ?? 0)} inactive`}
          loading={loading}
          href="/products"
        />
        <StatCard
          icon={FileText}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          label="Open Quotes"
          value={stats?.openQuotes ?? 0}
          sub={`${stats?.pendingQuotes ?? 0} pending · needs response`}
          accent={stats && stats.openQuotes > 0 ? "warning" : undefined}
          loading={loading}
          href="/quotes"
        />
        <StatCard
          icon={ShoppingCart}
          iconBg="bg-violet-50"
          iconColor="text-violet-500"
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          sub="All orders across all statuses"
          loading={loading}
          href="/orders"
        />
        <StatCard
          icon={AlertTriangle}
          iconBg={
            stats && stats.lowStockVariants > 0 ? "bg-red-50" : "bg-green-50"
          }
          iconColor={
            stats && stats.lowStockVariants > 0
              ? "text-red-500"
              : "text-green-500"
          }
          label="Low Stock"
          value={stats?.lowStockVariants ?? 0}
          sub="Variants at 10 units or fewer"
          accent={
            stats
              ? stats.lowStockVariants > 0
                ? "danger"
                : "success"
              : undefined
          }
          loading={loading}
        />
      </div>

      {/* ── Body Grid ── */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Quick Actions */}
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                Navigation
              </p>
              <h2 className="mt-1 text-lg font-bold text-zinc-900">
                Quick Actions
              </h2>
            </div>
            <button
              onClick={loadStats}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-40"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          <div className="space-y-2.5 p-5">
            <QuickAction
              icon={Package}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
              title="Products"
              description="Manage catalog, variants, stock and visibility"
              href="/products"
              badge="Catalog"
              badgeColor="bg-blue-100 text-blue-600"
            />
            <QuickAction
              icon={PlusSquare}
              iconBg="bg-pink-50"
              iconColor="text-pink-500"
              title="Create Product"
              description="Add new product with images, variants and pricing tiers"
              href="/products/new"
              badge="New"
              badgeColor="bg-pink-100 text-pink-600"
            />
            <QuickAction
              icon={FileText}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              title="Quotes"
              description="Review and respond to bulk enquiry requests"
              href="/quotes"
              badge={
                stats && stats.openQuotes > 0
                  ? `${stats.openQuotes} open`
                  : "CRM"
              }
              badgeColor={
                stats && stats.openQuotes > 0
                  ? "bg-amber-100 text-amber-700"
                  : "bg-zinc-200 text-zinc-600"
              }
            />
            <QuickAction
              icon={ShoppingCart}
              iconBg="bg-violet-50"
              iconColor="text-violet-500"
              title="Orders"
              description="Track order status and fulfilment progress"
              href="/orders"
              badge="Sales"
              badgeColor="bg-violet-100 text-violet-600"
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Inventory overview */}
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
            <div className="border-b border-zinc-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50">
                  <TrendingUp className="h-4 w-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                    Inventory
                  </p>
                  <h2 className="text-base font-bold text-zinc-900">
                    Catalog overview
                  </h2>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <InventoryBar
                label="Active products"
                value={stats?.activeProducts ?? 0}
                total={stats?.totalProducts ?? 0}
                color="bg-green-400"
                loading={loading}
              />
              <InventoryBar
                label="Active variants"
                value={stats?.activeVariants ?? 0}
                total={stats?.totalVariants ?? 0}
                color="bg-blue-400"
                loading={loading}
              />
              <InventoryBar
                label="Low stock variants"
                value={stats?.lowStockVariants ?? 0}
                total={stats?.totalVariants ?? 0}
                color="bg-red-400"
                loading={loading}
              />

              <div className="mt-1 grid grid-cols-3 gap-3 border-t border-zinc-50 pt-4">
                {[
                  {
                    label: "Products",
                    value: stats?.totalProducts,
                    color: "text-zinc-900",
                  },
                  {
                    label: "Variants",
                    value: stats?.totalVariants,
                    color: "text-zinc-900",
                  },
                  {
                    label: "Low Stock",
                    value: stats?.lowStockVariants,
                    color:
                      stats && stats.lowStockVariants > 0
                        ? "text-red-600"
                        : "text-green-600",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-2xl bg-zinc-50 p-3 text-center ring-1 ring-zinc-100">
                    {loading ? (
                      <div className="mx-auto h-6 w-8 animate-pulse rounded bg-zinc-200" />
                    ) : (
                      <p className={`text-xl font-bold ${color}`}>{value ?? 0}</p>
                    )}
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Health checklist */}
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
            <div className="border-b border-zinc-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50">
                  <Layers className="h-4 w-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                    Checklist
                  </p>
                  <h2 className="text-base font-bold text-zinc-900">
                    Operations health
                  </h2>
                </div>
              </div>
            </div>

            <div className="divide-y divide-zinc-50 px-6">
              {[
                {
                  icon: CheckCircle2,
                  iconColor:
                    stats && stats.activeProducts > 0
                      ? "text-green-500"
                      : "text-zinc-300",
                  title: "Products visible on storefront",
                  sub: `${stats?.activeProducts ?? 0} active products`,
                },
                {
                  icon:
                    stats && stats.openQuotes > 0
                      ? AlertTriangle
                      : CheckCircle2,
                  iconColor:
                    stats && stats.openQuotes > 0
                      ? "text-amber-500"
                      : "text-green-500",
                  title: "Quotes inbox",
                  sub:
                    stats && stats.openQuotes > 0
                      ? `${stats.openQuotes} quote${stats.openQuotes > 1 ? "s" : ""} awaiting response`
                      : "All quotes responded",
                },
                {
                  icon:
                    stats && stats.lowStockVariants > 0
                      ? AlertTriangle
                      : CheckCircle2,
                  iconColor:
                    stats && stats.lowStockVariants > 0
                      ? "text-red-500"
                      : "text-green-500",
                  title: "Stock levels",
                  sub:
                    stats && stats.lowStockVariants > 0
                      ? `${stats.lowStockVariants} variant${stats.lowStockVariants > 1 ? "s" : ""} running low`
                      : "All variants stocked",
                },
              ].map(({ icon: Icon, iconColor, title, sub }) => (
                <div key={title} className="flex items-center gap-4 py-4">
                  <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-800">{title}</p>
                    <p className="text-xs text-zinc-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
