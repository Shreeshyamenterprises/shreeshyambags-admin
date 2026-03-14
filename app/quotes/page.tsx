"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  product?: {
    id: string;
    title: string;
    slug: string;
  };
  variant?: {
    id: string;
    size: string;
    color: string;
    shape: string;
    gsm?: number | null;
  } | null;
};

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

function StatsCard({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value: number;
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
        {title}
      </p>
      <p className={`mt-2 text-3xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function ToastInline({ toast }: { toast: ToastState }) {
  if (!toast) return null;

  return (
    <div
      className={`rounded-2xl px-4 py-3 text-sm font-medium ${
        toast.type === "success"
          ? "bg-green-50 text-green-700 ring-1 ring-green-100"
          : "bg-red-50 text-red-700 ring-1 ring-red-100"
      }`}
    >
      {toast.message}
    </div>
  );
}

function getBadgeVariant(
  status: QuoteStatus,
): "default" | "success" | "danger" {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  return "default";
}

function QuoteDetailsRow({
  quote,
  onRefresh,
  onToast,
}: {
  quote: Quote;
  onRefresh: () => void;
  onToast: (toast: ToastState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<QuoteStatus>(quote.status);
  const [adminPricePerKg, setAdminPricePerKg] = useState(
    quote.adminPricePerKg ? String(quote.adminPricePerKg) : "",
  );
  const [adminNote, setAdminNote] = useState(quote.adminNote ?? "");
  const [saving, setSaving] = useState(false);

  async function saveQuote() {
    try {
      setSaving(true);
      const token = getAdminToken();

      await api.patch(
        `/admin/quotes/${quote.id}`,
        {
          status,
          adminPricePerKg: adminPricePerKg
            ? Number(adminPricePerKg)
            : undefined,
          adminNote: adminNote || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      onToast({
        message: "Quote updated successfully.",
        type: "success",
      });
      onRefresh();
    } catch (error: any) {
      console.error(error);
      onToast({
        message: error?.response?.data?.message || "Failed to update quote.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  const hasChanges =
    status !== quote.status ||
    adminPricePerKg !==
      (quote.adminPricePerKg ? String(quote.adminPricePerKg) : "") ||
    adminNote !== (quote.adminNote ?? "");

  return (
    <>
      <TableRow>
        <TableCell>
          <div>
            <p className="font-semibold text-zinc-900">{quote.name}</p>
            <p className="mt-1 text-xs text-zinc-500">{quote.phone}</p>
            {quote.email ? (
              <p className="mt-1 text-xs text-zinc-500">{quote.email}</p>
            ) : null}
          </div>
        </TableCell>

        <TableCell>
          <div>
            <p className="font-medium text-zinc-900">
              {quote.product?.title ?? "Product"}
            </p>
            {quote.variant ? (
              <p className="mt-1 text-xs text-zinc-500">
                {quote.variant.size} / {quote.variant.color} /{" "}
                {quote.variant.shape}
                {quote.variant.gsm ? ` / ${quote.variant.gsm} GSM` : ""}
              </p>
            ) : null}
          </div>
        </TableCell>

        <TableCell>{quote.quantityKg} KG</TableCell>

        <TableCell>
          <Badge variant={quote.printing ? "success" : "default"}>
            {quote.printing ? "Yes" : "No"}
          </Badge>
        </TableCell>

        <TableCell>
          <Badge variant={getBadgeVariant(quote.status)}>{quote.status}</Badge>
        </TableCell>

        <TableCell>
          {quote.adminPricePerKg ? `₹${quote.adminPricePerKg}/kg` : "—"}
        </TableCell>

        <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>

        <TableCell>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={() => setOpen((prev) => !prev)}
            >
              {open ? "Hide" : "Manage"}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {open && (
        <tr className="border-b border-zinc-100 bg-zinc-50/60">
          <td colSpan={8} className="px-4 py-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-[1.5rem] bg-white p-5 ring-1 ring-zinc-100">
                <h4 className="text-sm font-semibold text-zinc-900">
                  Customer Requirement
                </h4>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Quote ID
                    </p>
                    <p className="mt-2 break-all text-sm font-medium text-zinc-900">
                      {quote.id}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      GSM
                    </p>
                    <p className="mt-2 text-sm font-medium text-zinc-900">
                      {quote.gsm ?? quote.variant?.gsm ?? "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Quantity
                    </p>
                    <p className="mt-2 text-sm font-medium text-zinc-900">
                      {quote.quantityKg} KG
                    </p>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Printing Required
                    </p>
                    <p className="mt-2 text-sm font-medium text-zinc-900">
                      {quote.printing ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                    Customer Message
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">
                    {quote.message || "No message added."}
                  </p>
                </div>

                {quote.logoUrl ? (
                  <div className="mt-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Logo / File
                    </p>
                    <a
                      href={quote.logoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-sm font-medium text-pink-600 hover:text-pink-700"
                    >
                      Open uploaded file
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[1.5rem] bg-white p-5 ring-1 ring-zinc-100">
                <h4 className="text-sm font-semibold text-zinc-900">
                  Admin Response
                </h4>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                      className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="REVIEWED">REVIEWED</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                      Admin Price Per KG
                    </label>
                    <input
                      type="number"
                      value={adminPricePerKg}
                      onChange={(e) => setAdminPricePerKg(e.target.value)}
                      placeholder="Enter quoted price per kg"
                      className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                      Admin Note
                    </label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Add delivery timeline, MOQ, printing note, etc."
                      className="min-h-32 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3">
                    {!hasChanges ? (
                      <span className="text-xs text-zinc-400">
                        No unsaved changes
                      </span>
                    ) : null}

                    <Button
                      onClick={saveQuote}
                      disabled={saving || !hasChanges}
                    >
                      {saving ? "Saving..." : "Save Update"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "ALL">("ALL");
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2500);

    return () => clearTimeout(timer);
  }, [toast]);

  async function loadQuotes() {
    try {
      setLoading(true);
      const token = getAdminToken();

      const res = await api.get("/admin/quotes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuotes(res.data ?? []);
    } catch (error: any) {
      console.error(error);
      setToast({
        message: error?.response?.data?.message || "Failed to load quotes.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        quote.name.toLowerCase().includes(searchValue) ||
        quote.phone.toLowerCase().includes(searchValue) ||
        (quote.email ?? "").toLowerCase().includes(searchValue) ||
        (quote.product?.title ?? "").toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ? true : quote.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotes, search, statusFilter]);

  const pendingCount = quotes.filter((q) => q.status === "PENDING").length;
  const reviewedCount = quotes.filter((q) => q.status === "REVIEWED").length;
  const approvedCount = quotes.filter((q) => q.status === "APPROVED").length;
  const rejectedCount = quotes.filter((q) => q.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      <Header
        title="Quotes"
        subtitle="Review, respond and manage bulk quote requests from customers."
      />

      <ToastInline toast={toast} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Pending Quotes" value={pendingCount} />
        <StatsCard title="Reviewed Quotes" value={reviewedCount} />
        <StatsCard
          title="Approved Quotes"
          value={approvedCount}
          tone="success"
        />
        <StatsCard
          title="Rejected Quotes"
          value={rejectedCount}
          tone="danger"
        />
      </div>

      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-zinc-100 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
            Quote Requests
          </p>
          <h2 className="mt-2 text-2xl font-bold text-zinc-900">
            Customer Enquiries
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Search and manage bulk quote requests, status and pricing responses.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by customer, phone, email or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-5 py-3 text-sm outline-none transition focus:border-pink-400 sm:w-80"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as QuoteStatus | "ALL")
            }
            className="rounded-full border border-zinc-300 bg-zinc-50 px-5 py-3 text-sm outline-none transition focus:border-pink-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-zinc-100">
          <Skeleton className="h-8 w-52" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <EmptyState
          title="No quote requests found"
          description="New customer quote requests will appear here."
        />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Customer</TableHeader>
              <TableHeader>Product</TableHeader>
              <TableHeader>Quantity</TableHeader>
              <TableHeader>Printing</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Price / KG</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>
                <div className="text-right">Actions</div>
              </TableHeader>
            </tr>
          </TableHead>

          <tbody>
            {filteredQuotes.map((quote) => (
              <QuoteDetailsRow
                key={quote.id}
                quote={quote}
                onRefresh={loadQuotes}
                onToast={setToast}
              />
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
