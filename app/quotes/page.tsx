"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  RefreshCw,
  Save,
  Search,
} from "lucide-react";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Toast, type ToastState } from "@/components/ui/toast";

// ── types ─────────────────────────────────────────────────────────────────────

type QuoteStatus = "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED";

type Quote = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  quantityKg: number;
  gsm?: number | null;
  printing: boolean;
  logoUrl?: string | null;
  message?: string | null;
  status: QuoteStatus;
  adminPricePerKg?: number | null;
  adminNote?: string | null;
  createdAt: string;
  product?: { id: string; title: string; slug: string };
  variant?: {
    id: string;
    size: string;
    color: string;
    shape: string;
    gsm?: number | null;
  } | null;
};

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_META: Record<
  QuoteStatus,
  { label: string; bg: string; text: string; dot: string; ring: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    ring: "ring-amber-200",
  },
  REVIEWED: {
    label: "Reviewed",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
    ring: "ring-blue-200",
  },
  APPROVED: {
    label: "Approved",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
    ring: "ring-green-200",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-400",
    ring: "ring-red-200",
  },
};

function StatusBadge({ status }: { status: QuoteStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${m.bg} ${m.text} ${m.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status: QuoteStatus;
}) {
  const m = STATUS_META[status];
  return (
    <div className={`relative overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-zinc-100`}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.bg} ring-1 ${m.ring}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${m.dot}`} />
      </div>
      <p className={`mt-4 text-3xl font-bold tracking-tight ${m.text}`}>{value}</p>
      <p className="mt-1 text-sm font-medium text-zinc-700">{label}</p>
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${m.dot}`} />
    </div>
  );
}

// ── QuoteCard ─────────────────────────────────────────────────────────────────

function QuoteCard({
  quote,
  onRefresh,
  onToast,
}: {
  quote: Quote;
  onRefresh: () => void;
  onToast: (t: ToastState) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<QuoteStatus>(quote.status);
  const [pricePerKg, setPricePerKg] = useState(
    quote.adminPricePerKg ? String(quote.adminPricePerKg) : "",
  );
  const [note, setNote] = useState(quote.adminNote ?? "");
  const [saving, setSaving] = useState(false);

  const hasChanges =
    status !== quote.status ||
    pricePerKg !== (quote.adminPricePerKg ? String(quote.adminPricePerKg) : "") ||
    note !== (quote.adminNote ?? "");

  async function save() {
    try {
      setSaving(true);
      const token = getAdminToken();
      await api.patch(
        `/admin/quotes/${quote.id}`,
        {
          status,
          adminPricePerKg: pricePerKg ? Number(pricePerKg) : undefined,
          adminNote: note || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onToast({ message: "Quote updated successfully.", type: "success" });
      onRefresh();
    } catch (err: any) {
      onToast({ message: err?.response?.data?.message || "Failed to update quote.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  const date = new Date(quote.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white transition hover:border-zinc-200 hover:shadow-sm">
      {/* Row */}
      <div className="px-4 py-4 sm:px-5">
        {/* Top: Customer + Status + Expand */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900">{quote.name}</p>
            <p className="text-xs text-zinc-400">{quote.phone}{quote.email ? ` · ${quote.email}` : ""}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={quote.status} />
            <button
              onClick={() => setExpanded((p) => !p)}
              className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                expanded ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{expanded ? "Close" : "Manage"}</span>
            </button>
          </div>
        </div>

        {/* Bottom: product + meta */}
        <div className="mt-2.5">
          <p className="text-sm font-medium text-zinc-800">{quote.product?.title ?? "—"}</p>
          {quote.variant && (
            <p className="mt-0.5 text-xs text-zinc-400">
              {quote.variant.size} · {quote.variant.color} · {quote.variant.shape}
              {quote.variant.gsm ? ` · ${quote.variant.gsm} GSM` : ""}
            </p>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500">
          <span className="font-semibold text-zinc-900">{quote.quantityKg} KG</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            quote.printing ? "bg-pink-50 text-pink-700 ring-1 ring-pink-200" : "bg-zinc-100 text-zinc-500"
          }`}>
            {quote.printing ? "Printing" : "No Print"}
          </span>
          {quote.adminPricePerKg && (
            <span className="font-semibold text-zinc-900">₹{quote.adminPricePerKg}/kg</span>
          )}
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{date}</span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-5">
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Customer details */}
            <div className="rounded-2xl bg-white p-5 ring-1 ring-zinc-100">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Customer Requirement
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Quote ID", value: quote.id },
                  { label: "GSM", value: String(quote.gsm ?? quote.variant?.gsm ?? "—") },
                  { label: "Quantity", value: `${quote.quantityKg} KG` },
                  { label: "Printing", value: quote.printing ? "Required" : "Not required" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-100">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      {label}
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-zinc-800">{value}</p>
                  </div>
                ))}
              </div>

              {quote.message && (
                <div className="mt-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-100">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Message
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-zinc-700">{quote.message}</p>
                </div>
              )}

              {quote.logoUrl && (
                <a
                  href={quote.logoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center gap-2 rounded-xl bg-pink-50 px-3 py-2.5 text-sm font-medium text-pink-700 ring-1 ring-pink-100 transition hover:bg-pink-100"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View uploaded logo / file
                </a>
              )}
            </div>

            {/* Admin response */}
            <div className="rounded-2xl bg-white p-5 ring-1 ring-zinc-100">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Admin Response
              </p>

              <div className="space-y-4">
                {/* Status select */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {/* Price per kg */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600">
                    Price Per KG
                  </label>
                  <div className="flex overflow-hidden rounded-2xl border border-zinc-200 bg-white transition focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100">
                    <span className="flex items-center border-r border-zinc-100 bg-zinc-50 px-3 text-sm font-semibold text-zinc-500 select-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value)}
                      placeholder="0.00 / kg"
                      className="flex-1 bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none"
                    />
                    <span className="flex items-center border-l border-zinc-100 bg-zinc-50 px-3 text-xs text-zinc-400 select-none">
                      /kg
                    </span>
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600">
                    Admin Note
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Delivery timeline, MOQ, printing spec, etc."
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  {!hasChanges ? (
                    <span className="text-xs text-zinc-400">No unsaved changes</span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
                  )}
                  <button
                    onClick={save}
                    disabled={saving || !hasChanges}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      hasChanges && !saving
                        ? "bg-zinc-900 text-white hover:bg-zinc-700"
                        : "cursor-not-allowed bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    {saving ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    {saving ? "Saving…" : "Save Update"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: QuoteStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Reviewed", value: "REVIEWED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "ALL">("ALL");
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => { loadQuotes(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function loadQuotes() {
    try {
      setLoading(true);
      const token = getAdminToken();
      const res = await api.get("/admin/quotes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuotes(res.data ?? []);
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || "Failed to load quotes.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return quotes.filter((qt) => {
      const matchSearch =
        qt.name.toLowerCase().includes(q) ||
        qt.phone.toLowerCase().includes(q) ||
        (qt.email ?? "").toLowerCase().includes(q) ||
        (qt.product?.title ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || qt.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [quotes, search, statusFilter]);

  const counts = {
    PENDING: quotes.filter((q) => q.status === "PENDING").length,
    REVIEWED: quotes.filter((q) => q.status === "REVIEWED").length,
    APPROVED: quotes.filter((q) => q.status === "APPROVED").length,
    REJECTED: quotes.filter((q) => q.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pending" value={counts.PENDING} status="PENDING" />
        <StatCard label="Reviewed" value={counts.REVIEWED} status="REVIEWED" />
        <StatCard label="Approved" value={counts.APPROVED} status="APPROVED" />
        <StatCard label="Rejected" value={counts.REJECTED} status="REJECTED" />
      </div>

      {/* Toolbar */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
              Enquiries
            </p>
            <h2 className="mt-1 text-lg font-bold text-zinc-900">
              Quote Requests
              {!loading && (
                <span className="ml-2 text-sm font-normal text-zinc-400">
                  ({filtered.length})
                </span>
              )}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name, phone, product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100 sm:w-64"
              />
            </div>

            <button
              onClick={loadQuotes}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-100 px-5 py-2">
          {STATUS_FILTERS.map(({ label, value }) => {
            const count =
              value === "ALL"
                ? quotes.length
                : counts[value as QuoteStatus];
            return (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  statusFilter === value
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    statusFilter === value ? "bg-white/20" : "bg-zinc-100"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No quotes found"
              description="New customer quote requests will appear here."
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((q) => (
                <QuoteCard
                  key={q.id}
                  quote={q}
                  onRefresh={loadQuotes}
                  onToast={setToast}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
