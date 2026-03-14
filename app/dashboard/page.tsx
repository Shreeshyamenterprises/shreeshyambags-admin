"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "success" | "danger";
}) {
  const valueClass =
    tone === "success"
      ? "text-green-600"
      : tone === "danger"
        ? "text-red-500"
        : "text-zinc-900";

  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-zinc-100">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${valueClass}`}>{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{hint}</p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  badge,
}: {
  title: string;
  description: string;
  href: string;
  badge?: string;
}) {
  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-zinc-100 transition hover:-translate-y-[2px] hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
        </div>

        {badge ? <Badge variant="default">{badge}</Badge> : null}
      </div>

      <div className="mt-5">
        <Link href={href}>
          <Button variant="secondary">Open</Button>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Header
        title="Dashboard"
        subtitle="Get a quick overview of products, orders, quotes and inventory operations."
      />

      <div className="overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-zinc-900 via-zinc-900 to-pink-900 p-6 text-white shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pink-300">
              Admin Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome to Shree Shyam Bags Admin
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
              Manage catalog, bulk quote requests, orders and product visibility
              from one premium dashboard built for your non-woven bag business.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/products">
                <Button className="bg-white text-zinc-900 hover:bg-zinc-100">
                  Manage Products
                </Button>
              </Link>

              <Link href="/quotes">
                <Button
                  variant="secondary"
                  className="border border-white/15 bg-white/10 text-white hover:bg-white/15"
                >
                  Review Quotes
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.5rem] bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">
                Today Focus
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                Review fresh quote enquiries and product stock updates.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">
                Quick Reminder
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                Keep pricing tiers, GSM values and product images up to date.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Products"
          value="—"
          hint="Track your active product catalog."
        />
        <StatCard
          label="Open Quotes"
          value="—"
          hint="Respond to bulk enquiries faster."
        />
        <StatCard
          label="Orders"
          value="—"
          hint="Monitor pending and delivered orders."
        />
        <StatCard
          label="Low Stock"
          value="—"
          hint="Watch variants that need refill."
          tone="danger"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
                Quick Actions
              </p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900">
                Manage business faster
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ActionCard
              title="Products"
              description="Manage bag catalog, variants, prices, stock and visibility."
              href="/products"
              badge="Catalog"
            />

            <ActionCard
              title="Create Product"
              description="Add a new product with images, variants, GSM and pricing tiers."
              href="/products/new"
              badge="New"
            />

            <ActionCard
              title="Quotes"
              description="Review customer quote requests and send admin pricing responses."
              href="/quotes"
              badge="CRM"
            />

            <ActionCard
              title="Orders"
              description="Track customer orders, status updates and fulfilment flow."
              href="/orders"
              badge="Sales"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
              Operations Snapshot
            </p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-900">
              What to monitor
            </h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                <p className="text-sm font-semibold text-zinc-900">
                  Product Visibility
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Ensure active products and variants are visible on the
                  website.
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                <p className="text-sm font-semibold text-zinc-900">
                  Quote Turnaround
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Reply quickly with price per KG, MOQ and delivery timelines.
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                <p className="text-sm font-semibold text-zinc-900">
                  Inventory Hygiene
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Keep stock, GSM, pricing tiers and images consistent.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
              Admin Notes
            </p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-900">
              Best practices
            </h2>

            <div className="mt-5 space-y-3 text-sm text-zinc-600">
              <p className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                Review product pages regularly so pricing slabs stay correct for
                200 KG, 500 KG and 1000 KG orders.
              </p>
              <p className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                Use clear admin notes on quotes and orders to improve team
                coordination.
              </p>
              <p className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                Keep gallery images premium so the frontend website looks strong
                for B2B buyers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
