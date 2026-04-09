"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Layers,
  Package,
  PlusSquare,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { Toggle } from "@/components/ui/toggle";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Toast, type ToastState } from "@/components/ui/toast";

// ── types ─────────────────────────────────────────────────────────────────────

type ProductImage = { id: string; url: string; productId: string };
type Variant = {
  id: string;
  size: string;
  color: string;
  shape: string;
  price: number;
  stock: number;
  isActive: boolean;
};
type Product = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  basePrice?: number | null;
  isActive: boolean;
  variants: Variant[];
  images?: ProductImage[];
};

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  sub?: string;
  accent?: "success" | "danger";
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-zinc-100">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p
        className={`mt-4 text-3xl font-bold tracking-tight ${
          accent === "success"
            ? "text-green-600"
            : accent === "danger"
              ? "text-red-600"
              : "text-zinc-900"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-zinc-700">{label}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
      {accent && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-0.5 ${
            accent === "success" ? "bg-green-400" : "bg-red-400"
          }`}
        />
      )}
    </div>
  );
}

// ── MobileProductCard ─────────────────────────────────────────────────────────

function MobileProductCard({
  product,
  selected,
  onSelect,
  onToggle,
  onDeleteRequest,
  onToast,
}: {
  product: Product;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onDeleteRequest: (p: Product) => void;
  onToast: (t: ToastState) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const imageUrl = product.images?.[0]?.url;

  async function toggleProduct() {
    const newState = !product.isActive;
    onToggle(product.id, newState);
    try {
      setToggling(true);
      const token = getAdminToken();
      await api.patch(
        `/admin/products/${product.id}`,
        { isActive: newState },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onToast({ message: `Product ${newState ? "activated" : "deactivated"}.`, type: newState ? "success" : "error" });
    } catch (err: any) {
      onToggle(product.id, !newState);
      onToast({ message: err?.response?.data?.message || "Failed to update.", type: "error" });
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className={`overflow-hidden rounded-2xl border transition ${selected ? "border-pink-200 bg-pink-50/30" : "border-zinc-100 bg-white hover:border-zinc-200"}`}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(product.id, e.target.checked)}
          className="h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 accent-pink-500"
        />
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-4 w-4 text-zinc-300" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/products/${product.id}`}
            className="block truncate text-sm font-semibold text-zinc-900 hover:text-pink-600"
          >
            {product.title}
          </Link>
          <p className="truncate text-xs text-zinc-400">{product.slug}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          product.isActive ? "bg-green-50 text-green-700 ring-1 ring-green-200" : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${product.isActive ? "bg-green-500" : "bg-zinc-400"}`} />
          {product.isActive ? "Active" : "Off"}
        </span>
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between gap-3 border-t border-zinc-50 px-4 py-2.5">
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="font-semibold text-zinc-900">₹{((product.basePrice ?? 0) / 100).toFixed(2)}</span>
          <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{product.variants.length} variants</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Toggle checked={product.isActive} onChange={toggleProduct} />
            {toggling && <RefreshCw className="h-3 w-3 animate-spin text-zinc-400" />}
          </div>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Less" : "More"}
          </button>
          <Link href={`/products/${product.id}`}>
            <button className="rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-700">Edit</button>
          </Link>
          <button
            onClick={() => onDeleteRequest(product)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 px-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Product ID", value: product.id.slice(-8) },
              { label: "Images", value: String(product.images?.length ?? 0) },
              { label: "Base Price", value: `₹${((product.basePrice ?? 0) / 100).toFixed(2)}` },
              { label: "Status", value: product.isActive ? "Live" : "Hidden" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white p-3 ring-1 ring-zinc-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
                <p className="mt-0.5 truncate text-sm font-medium text-zinc-800">{value}</p>
              </div>
            ))}
          </div>
          {product.variants.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Variants</p>
              {product.variants.slice(0, 3).map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 ring-1 ring-zinc-100">
                  <p className="text-xs font-medium text-zinc-700">{v.size} · {v.color} · {v.shape}</p>
                  <span className={`text-[10px] font-semibold ${v.isActive ? "text-green-600" : "text-zinc-400"}`}>
                    {v.isActive ? "Active" : "Off"}
                  </span>
                </div>
              ))}
              {product.variants.length > 3 && (
                <p className="text-center text-xs text-zinc-400">+{product.variants.length - 3} more</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ProductRow ────────────────────────────────────────────────────────────────

function ProductRow({
  product,
  selected,
  onSelect,
  onToggle,
  onDeleteRequest,
  onToast,
}: {
  product: Product;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onDeleteRequest: (p: Product) => void;
  onToast: (t: ToastState) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const imageUrl = product.images?.[0]?.url;

  async function toggleProduct() {
    const newState = !product.isActive;
    onToggle(product.id, newState);
    try {
      setToggling(true);
      const token = getAdminToken();
      await api.patch(
        `/admin/products/${product.id}`,
        { isActive: newState },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onToast({
        message: `Product ${newState ? "activated" : "deactivated"}.`,
        type: newState ? "success" : "error",
      });
    } catch (err: any) {
      onToggle(product.id, !newState);
      onToast({ message: err?.response?.data?.message || "Failed to update.", type: "error" });
    } finally {
      setToggling(false);
    }
  }

  return (
    <>
      <tr
        className={`border-b border-zinc-50 transition hover:bg-zinc-50/60 ${
          selected ? "bg-pink-50/40" : ""
        }`}
      >
        {/* Checkbox */}
        <td className="pl-5 pr-2 py-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(product.id, e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-zinc-300 accent-pink-500"
          />
        </td>

        {/* Product */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-zinc-300" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <Link
                href={`/products/${product.id}`}
                className="truncate text-sm font-semibold text-zinc-900 transition hover:text-pink-600"
              >
                {product.title}
              </Link>
              <p className="mt-0.5 truncate text-xs text-zinc-400">{product.slug}</p>
            </div>
          </div>
        </td>

        {/* Price */}
        <td className="px-5 py-4">
          <p className="text-sm font-semibold text-zinc-900">
            ₹{((product.basePrice ?? 0) / 100).toFixed(2)}
          </p>
        </td>

        {/* Variants */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-sm text-zinc-700">{product.variants.length}</span>
          </div>
        </td>

        {/* Status */}
        <td className="px-5 py-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              product.isActive
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                product.isActive ? "bg-green-500" : "bg-zinc-400"
              }`}
            />
            {product.isActive ? "Active" : "Inactive"}
          </span>
        </td>

        {/* Toggle */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Toggle checked={product.isActive} onChange={toggleProduct} />
            <span className="flex h-4 w-4 items-center justify-center">
              {toggling && <RefreshCw className="h-3.5 w-3.5 animate-spin text-zinc-400" />}
            </span>
          </div>
        </td>

        {/* Actions */}
        <td className="px-5 py-4">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setExpanded((p) => !p)}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" /> Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> Details
                </>
              )}
            </button>
            <Link href={`/products/${product.id}`}>
              <button className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-700">
                Edit
              </button>
            </Link>
            <button
              onClick={() => onDeleteRequest(product)}
              className="flex h-7 w-7 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-zinc-50/70">
          <td colSpan={7} className="px-5 py-5">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Info */}
              <div className="rounded-2xl bg-white p-5 ring-1 ring-zinc-100">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Product Info
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Product ID", value: product.id },
                    { label: "Images", value: String(product.images?.length ?? 0) },
                    { label: "Base Price", value: `₹${((product.basePrice ?? 0) / 100).toFixed(2)}` },
                    { label: "Status", value: product.isActive ? "Live" : "Hidden" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-100">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                        {label}
                      </p>
                      <p className="mt-1 truncate text-sm font-medium text-zinc-800">{value}</p>
                    </div>
                  ))}
                </div>
                {product.description && (
                  <div className="mt-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-100">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      Description
                    </p>
                    <p className="mt-1 text-sm leading-5 text-zinc-700 line-clamp-3">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Variants */}
              <div className="rounded-2xl bg-white p-5 ring-1 ring-zinc-100">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Variants ({product.variants.length})
                </p>
                {product.variants.length === 0 ? (
                  <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-400 ring-1 ring-zinc-100">
                    No variants added yet.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {product.variants.map((v) => (
                      <div key={v.id} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-100">
                        <div>
                          <p className="text-sm font-medium text-zinc-800">
                            {v.size} · {v.color} · {v.shape}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-400">
                            Stock: {v.stock} · ₹{(v.price / 100).toFixed(2)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            v.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-zinc-200 text-zinc-500"
                          }`}
                        >
                          {v.isActive ? "Active" : "Off"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkAction, setBulkAction] = useState<"delete" | "activate" | "deactivate" | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function loadProducts() {
    try {
      setLoading(true);
      const token = getAdminToken();
      const res = await api.get("/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data ?? []);
      setSelected(new Set());
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || "Failed to load products.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      setDeleting(true);
      const token = getAdminToken();
      await api.delete(`/admin/products/${target.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== target.id));
      setSelected((prev) => { const s = new Set(prev); s.delete(target.id); return s; });
      setToast({ message: "Product deleted.", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || "Failed to delete.", type: "error" });
      loadProducts();
    } finally {
      setDeleting(false);
    }
  }

  async function executeBulkAction() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setBulkAction(null);

    try {
      setBulkProcessing(true);
      const token = getAdminToken();
      const headers = { Authorization: `Bearer ${token}` };

      if (bulkAction === "delete") {
        await api.post("/admin/products/bulk-delete", { ids }, { headers });
        setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
        setSelected(new Set());
        setToast({ message: `${ids.length} product${ids.length > 1 ? "s" : ""} deleted.`, type: "success" });
      } else {
        const isActive = bulkAction === "activate";
        await api.patch("/admin/products/bulk-status", { ids, isActive }, { headers });
        setProducts((prev) =>
          prev.map((p) => ids.includes(p.id) ? { ...p, isActive } : p)
        );
        setSelected(new Set());
        setToast({
          message: `${ids.length} product${ids.length > 1 ? "s" : ""} ${isActive ? "activated" : "deactivated"}.`,
          type: isActive ? "success" : "error",
        });
      }
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || "Bulk action failed.", type: "error" });
      loadProducts();
    } finally {
      setBulkProcessing(false);
    }
  }

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.slug.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  );

  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const someSelected = filtered.some((p) => selected.has(p.id));

  function toggleSelectAll(checked: boolean) {
    setSelected((prev) => {
      const s = new Set(prev);
      filtered.forEach((p) => checked ? s.add(p.id) : s.delete(p.id));
      return s;
    });
  }

  function handleSelect(id: string, checked: boolean) {
    setSelected((prev) => {
      const s = new Set(prev);
      checked ? s.add(id) : s.delete(id);
      return s;
    });
  }

  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;
  const variantCount = products.reduce((a, p) => a + p.variants.length, 0);
  const lowStock = products
    .flatMap((p) => p.variants)
    .filter((v) => v.stock <= 10).length;

  const selectedCount = selected.size;

  return (
    <div className="space-y-6">

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Fixed bulk action bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-pink-200 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-white/60 backdrop-blur-xl sm:top-4 sm:bottom-auto sm:w-auto sm:flex-nowrap sm:gap-3 sm:px-5">
          <span className="text-sm font-semibold text-pink-600">
            {selectedCount} selected
          </span>
          <div className="hidden h-4 w-px bg-zinc-200 sm:block" />
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setBulkAction("activate")}
              disabled={bulkProcessing}
              className="rounded-xl bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600 disabled:opacity-50 sm:px-4 sm:py-2"
            >
              Activate
            </button>
            <button
              onClick={() => setBulkAction("deactivate")}
              disabled={bulkProcessing}
              className="rounded-xl bg-zinc-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-600 disabled:opacity-50 sm:px-4 sm:py-2"
            >
              Deactivate
            </button>
            <button
              onClick={() => setBulkAction("delete")}
              disabled={bulkProcessing}
              className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 sm:px-4 sm:py-2"
            >
              Delete
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 sm:px-4 sm:py-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Package}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Total Products"
          value={products.length}
          sub={`${activeCount} active · ${inactiveCount} inactive`}
        />
        <StatCard
          icon={CheckCircle2}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          label="Active Products"
          value={activeCount}
          sub="Visible on storefront"
          accent="success"
        />
        <StatCard
          icon={Layers}
          iconBg="bg-violet-50"
          iconColor="text-violet-500"
          label="Total Variants"
          value={variantCount}
          sub="Across all products"
        />
        <StatCard
          icon={AlertTriangle}
          iconBg={lowStock > 0 ? "bg-red-50" : "bg-green-50"}
          iconColor={lowStock > 0 ? "text-red-500" : "text-green-500"}
          label="Low Stock"
          value={lowStock}
          sub="Variants at ≤10 units"
          accent={lowStock > 0 ? "danger" : "success"}
        />
      </div>

      {/* Toolbar */}
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
              Catalog
            </p>
            <h2 className="mt-1 text-lg font-bold text-zinc-900">
              All Products
              {!loading && (
                <span className="ml-2 text-sm font-normal text-zinc-400">
                  ({filtered.length})
                </span>
              )}
            </h2>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100 sm:w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadProducts}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 disabled:opacity-40"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>

              <Link href="/products/new">
                <button className="flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700">
                  <PlusSquare className="h-4 w-4" />
                  New Product
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile cards / Desktop table */}
        {loading ? (
          <div className="space-y-3 p-4 sm:p-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 sm:p-6">
            <EmptyState
              title={search ? "No products match your search" : "No products yet"}
              description={search ? "Try a different search term." : "Create your first product to get started."}
              actionLabel="Create Product"
              actionHref="/products/new"
            />
          </div>
        ) : (
          <>
            {/* Mobile card list (< md) */}
            <div className="space-y-2 p-4 md:hidden">
              {filtered.map((p) => (
                <MobileProductCard
                  key={p.id}
                  product={p}
                  selected={selected.has(p.id)}
                  onSelect={handleSelect}
                  onToggle={(id, isActive) =>
                    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, isActive } : x)))
                  }
                  onDeleteRequest={setDeleteTarget}
                  onToast={setToast}
                />
              ))}
            </div>

            {/* Desktop table (md+) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[740px]">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="pl-5 pr-2 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded border-zinc-300 accent-pink-500"
                      />
                    </th>
                    {["Product", "Base Price", "Variants", "Status", "Visibility", "Actions"].map((h) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-400 ${
                          h === "Actions" ? "text-right" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      selected={selected.has(p.id)}
                      onSelect={handleSelect}
                      onToggle={(id, isActive) =>
                        setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, isActive } : x)))
                      }
                      onDeleteRequest={setDeleteTarget}
                      onToast={setToast}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Single delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete product?"
        description={
          deleteTarget
            ? `Permanently delete "${deleteTarget.title}"? This cannot be undone.`
            : ""
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteProduct}
      />

      {/* Bulk action confirm */}
      <ConfirmDialog
        open={!!bulkAction}
        title={
          bulkAction === "delete"
            ? `Delete ${selectedCount} product${selectedCount > 1 ? "s" : ""}?`
            : bulkAction === "activate"
            ? `Activate ${selectedCount} product${selectedCount > 1 ? "s" : ""}?`
            : `Deactivate ${selectedCount} product${selectedCount > 1 ? "s" : ""}?`
        }
        description={
          bulkAction === "delete"
            ? "This will permanently delete all selected products and their variants. This cannot be undone."
            : bulkAction === "activate"
            ? "All selected products will be made visible on the storefront."
            : "All selected products will be hidden from the storefront."
        }
        onCancel={() => setBulkAction(null)}
        onConfirm={executeBulkAction}
      />

      {(deleting || bulkProcessing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-medium text-zinc-700 shadow-xl ring-1 ring-zinc-100">
            <RefreshCw className="h-4 w-4 animate-spin text-pink-500" />
            {bulkProcessing ? "Processing…" : "Deleting product…"}
          </div>
        </div>
      )}
    </div>
  );
}
