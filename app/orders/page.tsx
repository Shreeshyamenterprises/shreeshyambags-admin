"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Toast, type ToastState } from "@/components/ui/toast";

// ── types ─────────────────────────────────────────────────────────────────────

type OrderItem = {
  id: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  customText?: string | null;
  size: string;
  color: string;
  shape: string;
};

type Order = {
  id: string;
  status: string;
  subtotal: number;
  total: number;
  shipName: string;
  shipPhone: string;
  shipCity: string;
  shipState: string;
  shipPincode: string;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string; name?: string | null; email: string };
};

// ── helpers ───────────────────────────────────────────────────────────────────

function orderStatusMeta(status: string) {
  const s = status.toUpperCase();
  if (s === "DELIVERED")
    return { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", ring: "ring-green-200" };
  if (s === "SHIPPED" || s === "PROCESSING")
    return { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", ring: "ring-blue-200" };
  if (s === "CANCELLED" || s === "FAILED")
    return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400", ring: "ring-red-200" };
  // PENDING / default
  return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", ring: "ring-amber-200" };
}

function StatusBadge({ status }: { status: string }) {
  const m = orderStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${m.bg} ${m.text} ${m.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {status}
    </span>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-zinc-100">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-zinc-700">{label}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}

// ── OrderCard ─────────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white transition hover:border-zinc-200 hover:shadow-sm">
      {/* Summary row */}
      <div className="px-4 py-4 sm:px-5">
        {/* Top: Customer + Status + Expand */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
              <User className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">{order.shipName}</p>
              <p className="truncate text-xs text-zinc-400">{order.user?.email ?? "No email"}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={order.status} />
            <button
              onClick={() => setExpanded((p) => !p)}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                expanded ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{expanded ? "Close" : "Details"}</span>
            </button>
          </div>
        </div>

        {/* Bottom: meta info */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" />{order.shipCity}, {order.shipState}</span>
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{order.shipPhone}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{date}</span>
          <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
          <span className="font-semibold text-zinc-900">₹{(order.total / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-5">
          <div className="grid gap-5 lg:grid-cols-[0.6fr_1fr]">
            {/* Order meta */}
            <div className="rounded-2xl bg-white p-5 ring-1 ring-zinc-100">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Order Info
              </p>
              <div className="space-y-3">
                {[
                  { label: "Order ID", value: order.id },
                  { label: "Status", value: order.status },
                  { label: "Subtotal", value: `₹${(order.subtotal / 100).toFixed(2)}` },
                  { label: "Total", value: `₹${(order.total / 100).toFixed(2)}` },
                  { label: "Date", value: date },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-3">
                    <p className="text-xs text-zinc-400 shrink-0">{label}</p>
                    <p className="text-xs font-semibold text-zinc-800 text-right break-all">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-zinc-100 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Shipping Address
                </p>
                <p className="text-sm text-zinc-700 leading-6">
                  {order.shipName}<br />
                  {order.shipCity}, {order.shipState}<br />
                  {order.shipPincode}<br />
                  <span className="text-zinc-500">{order.shipPhone}</span>
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="rounded-2xl bg-white p-5 ring-1 ring-zinc-100">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Order Items ({order.items.length})
              </p>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-100"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-200 text-xs font-bold text-zinc-600">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">
                        {item.productTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {item.size} · {item.color} · {item.shape}
                      </p>
                      {item.customText && (
                        <p className="mt-1 text-xs text-zinc-600">
                          Custom: <span className="font-medium">{item.customText}</span>
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-zinc-900">
                        ₹{(item.unitPrice / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-zinc-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-3">
                <p className="text-sm font-medium text-zinc-300">Order Total</p>
                <p className="text-base font-bold text-white">
                  ₹{(order.total / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const token = getAdminToken();
      const res = await api.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data ?? []);
    } catch (err: any) {
      setToast({ message: "Failed to load orders.", type: "error" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.shipName.toLowerCase().includes(q) ||
        o.shipCity.toLowerCase().includes(q) ||
        o.shipState.toLowerCase().includes(q) ||
        (o.user?.email ?? "").toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q),
    );
  }, [orders, search]);

  const totalRevenue = orders.reduce((a, o) => a + o.total, 0);
  const uniqueStatuses = [...new Set(orders.map((o) => o.status))];
  const pendingCount = orders.filter(
    (o) => o.status.toUpperCase() === "PENDING",
  ).length;

  return (
    <div className="space-y-6">

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={ShoppingCart}
          iconBg="bg-violet-50"
          iconColor="text-violet-500"
          label="Total Orders"
          value={orders.length}
          sub={`${uniqueStatuses.join(" · ") || "—"}`}
        />
        <StatCard
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          label="Pending Orders"
          value={pendingCount}
          sub="Awaiting processing"
        />
        <StatCard
          icon={Package}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Total Items"
          value={orders.reduce((a, o) => a + o.items.length, 0)}
          sub="Across all orders"
        />
        <StatCard
          icon={CheckCircle2}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          label="Total Revenue"
          value={parseFloat((totalRevenue / 100).toFixed(0))}
          sub={`₹${(totalRevenue / 100).toLocaleString("en-IN")} collected`}
        />
      </div>

      {/* Toolbar + List */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
              Fulfilment
            </p>
            <h2 className="mt-1 text-lg font-bold text-zinc-900">
              All Orders
              {!loading && (
                <span className="ml-2 text-sm font-normal text-zinc-400">
                  ({filtered.length})
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name, city, email, status…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100 sm:w-64"
              />
            </div>

            <button
              onClick={loadOrders}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={search ? "No orders match your search" : "No orders yet"}
              description={search ? "Try a different search." : "Customer orders will appear here once placed."}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
