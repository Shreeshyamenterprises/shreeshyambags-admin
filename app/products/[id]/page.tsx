"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ImageIcon,
  Layers,
  Package,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { AddVariantForm } from "@/components/products/add-variant-form";
import { UploadProductImageForm } from "@/components/products/upload-product-image-form";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { Toast } from "@/components/ui/toast";

// ── Types ──────────────────────────────────────────────────────────────────────

type ProductImage = { id: string; url: string; productId: string };
type PricingTier = { id: string; minQtyKg: number; pricePerKg: number };
type Variant = {
  id: string;
  size: string;
  color: string;
  shape: string;
  gsm?: number | null;
  price: number;
  pricePerKg?: number | null;
  stock: number;
  sku?: string | null;
  isActive: boolean;
  pricingTiers?: PricingTier[];
};
type Product = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  basePrice?: number | null;
  isActive?: boolean;
  createdAt?: string;
  images: ProductImage[];
  variants: Variant[];
};
type ToastState = { message: string; type: "success" | "error" | "info" | "warning" } | null;

// ── Field component ────────────────────────────────────────────────────────────

function Field({ label, error, required, hint, children }: {
  label: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {label}{required && <span className="text-pink-500">*</span>}
      </label>
      {children}
      {error
        ? <p className="mt-1 text-xs text-red-500">{error}</p>
        : hint
        ? <p className="mt-1 text-xs text-zinc-400">{hint}</p>
        : null}
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition placeholder:text-zinc-300 ${
    error
      ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
      : "border-zinc-200 bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
  }`;
}

// ── Stat chip ──────────────────────────────────────────────────────────────────

function StatChip({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-100">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

// ── VariantCard ────────────────────────────────────────────────────────────────

function VariantCard({
  variant,
  onSaved,
  onDeleteRequest,
  onToast,
}: {
  variant: Variant;
  onSaved: () => void;
  onDeleteRequest: (v: Variant) => void;
  onToast: (t: ToastState) => void;
}) {
  const [price, setPrice] = useState(String(variant.price));
  const [pricePerKg, setPricePerKg] = useState(
    variant.pricePerKg != null ? String(variant.pricePerKg) : "",
  );
  const [stock, setStock] = useState(String(variant.stock));
  const [isActive, setIsActive] = useState(variant.isActive);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const hasChanges =
    Number(price) !== variant.price ||
    Number(stock) !== variant.stock ||
    isActive !== variant.isActive ||
    pricePerKg !== (variant.pricePerKg != null ? String(variant.pricePerKg) : "");

  function validate() {
    const e: Record<string, string> = {};
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      e.price = "Price must be greater than 0.";
    if (pricePerKg && (isNaN(Number(pricePerKg)) || Number(pricePerKg) <= 0))
      e.pricePerKg = "Price per kg must be greater than 0.";
    if (stock === "" || isNaN(Number(stock)) || Number(stock) < 0)
      e.stock = "Stock cannot be negative.";
    return e;
  }

  async function saveVariant() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      setSaving(true);
      const token = getAdminToken();
      await api.patch(
        `/admin/variants/${variant.id}`,
        {
          price: Number(price),
          stock: Number(stock),
          isActive,
          pricePerKg: pricePerKg ? Number(pricePerKg) : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onToast({ message: "Variant updated.", type: "success" });
      onSaved();
    } catch (err: any) {
      onToast({ message: err?.response?.data?.message || "Failed to update variant.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-zinc-100 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-zinc-900">
              {variant.size} · {variant.color} · {variant.shape}
            </p>
            <Badge variant={isActive ? "success" : "danger"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-400">
            {variant.sku && <span>SKU: {variant.sku}</span>}
            {variant.gsm && <span>GSM: {variant.gsm}</span>}
            <span className="break-all">ID: {variant.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Toggle checked={isActive} onChange={() => setIsActive((p) => !p)} />
          <button
            onClick={() => onDeleteRequest(variant)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-4 p-5 sm:grid-cols-3">
        <Field label="Retail Price (paise)" error={errors.price} required>
          <input
            type="number"
            value={price}
            min={1}
            onChange={(e) => { setPrice(e.target.value); setErrors((p) => ({ ...p, price: "" })); }}
            placeholder="e.g. 5000"
            className={inputCls(errors.price)}
          />
        </Field>

        <Field label="Price Per KG (paise)" error={errors.pricePerKg} hint="Optional — used for B2B pricing">
          <input
            type="number"
            value={pricePerKg}
            min={1}
            onChange={(e) => { setPricePerKg(e.target.value); setErrors((p) => ({ ...p, pricePerKg: "" })); }}
            placeholder="Optional"
            className={inputCls(errors.pricePerKg)}
          />
        </Field>

        <Field label="Stock (units)" error={errors.stock} required>
          <input
            type="number"
            value={stock}
            min={0}
            onChange={(e) => { setStock(e.target.value); setErrors((p) => ({ ...p, stock: "" })); }}
            placeholder="e.g. 100"
            className={inputCls(errors.stock)}
          />
        </Field>
      </div>

      {/* Pricing Tiers */}
      {variant.pricingTiers && variant.pricingTiers.length > 0 && (
        <div className="border-t border-zinc-100 px-5 pb-5">
          <p className="mb-3 pt-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Pricing Tiers
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {variant.pricingTiers.map((tier) => (
              <div key={tier.id} className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Min Qty
                </p>
                <p className="mt-1 text-sm font-bold text-zinc-900">{tier.minQtyKg} KG</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Rate
                </p>
                <p className="mt-1 text-sm font-bold text-zinc-900">₹{tier.pricePerKg}/kg</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save */}
      <div className="border-t border-zinc-100 px-5 py-3">
        <button
          onClick={saveVariant}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saving ? "Saving…" : hasChanges ? "Save Changes" : "No Changes"}
        </button>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

function validate(fields: {
  title: string;
  slug: string;
  basePrice: string;
}) {
  const e: Record<string, string> = {};
  if (!fields.title.trim()) e.title = "Title is required.";
  else if (fields.title.trim().length < 3) e.title = "Title must be at least 3 characters.";

  if (!fields.slug.trim()) e.slug = "Slug is required.";
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug.trim()))
    e.slug = "Slug must be lowercase letters, numbers and hyphens only.";

  if (!fields.basePrice) e.basePrice = "Base price is required.";
  else if (isNaN(Number(fields.basePrice)) || Number(fields.basePrice) < 0)
    e.basePrice = "Enter a valid price (0 or above).";

  return e;
}

export default function ProductEditorPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingProduct, setSavingProduct] = useState(false);

  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [deleteVariantTarget, setDeleteVariantTarget] = useState<Variant | null>(null);
  const [deletingImage, setDeletingImage] = useState(false);
  const [deletingVariant, setDeletingVariant] = useState(false);

  useEffect(() => { loadProduct(); }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function loadProduct() {
    try {
      setLoading(true);
      const token = getAdminToken();
      const res = await api.get(`/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Product = res.data;
      setProduct(data);
      setTitle(data.title ?? "");
      setSlug(data.slug ?? "");
      setDescription(data.description ?? "");
      setBasePrice(String(data.basePrice ?? 0));
      setIsActive(data.isActive !== false);
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || "Failed to load product.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function saveProductDetails() {
    const e = validate({ title, slug, basePrice });
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      setSavingProduct(true);
      const token = getAdminToken();
      await api.patch(
        `/admin/products/${id}`,
        {
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          basePrice: Number(basePrice),
          isActive,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setToast({ message: "Product updated successfully.", type: "success" });
      loadProduct();
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || "Failed to update product.", type: "error" });
    } finally {
      setSavingProduct(false);
    }
  }

  async function deleteImage() {
    if (!deleteImageId) return;
    const targetId = deleteImageId;
    setDeleteImageId(null);
    try {
      setDeletingImage(true);
      const token = getAdminToken();
      await api.delete(`/admin/images/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProduct((prev) =>
        prev ? { ...prev, images: prev.images.filter((img) => img.id !== targetId) } : prev,
      );
      setToast({ message: "Image deleted.", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || "Failed to delete image.", type: "error" });
      loadProduct();
    } finally {
      setDeletingImage(false);
    }
  }

  async function deleteVariant() {
    if (!deleteVariantTarget) return;
    const target = deleteVariantTarget;
    setDeleteVariantTarget(null);
    try {
      setDeletingVariant(true);
      const token = getAdminToken();
      await api.delete(`/admin/variants/${target.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProduct((prev) =>
        prev ? { ...prev, variants: prev.variants.filter((v) => v.id !== target.id) } : prev,
      );
      setToast({ message: "Variant deleted.", type: "success" });
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || "Failed to delete variant.", type: "error" });
      loadProduct();
    } finally {
      setDeletingVariant(false);
    }
  }

  const totalImages = useMemo(() => product?.images?.length ?? 0, [product]);
  const totalVariants = useMemo(() => product?.variants?.length ?? 0, [product]);
  const activeVariants = useMemo(
    () => product?.variants?.filter((v) => v.isActive).length ?? 0,
    [product],
  );

  return (
    <div className="space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-48 rounded-2xl" />
          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <Skeleton className="h-96 w-full rounded-[2rem]" />
            <Skeleton className="h-96 w-full rounded-[2rem]" />
          </div>
        </div>
      ) : !product ? (
        <EmptyState
          title="Product not found"
          description="We could not load this product. Go back and try again."
          actionLabel="Back to Products"
          actionHref="/products"
        />
      ) : (
        <>
          {/* ── Page header ── */}
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
                Product Editor
              </p>
              <h1 className="truncate text-2xl font-bold tracking-tight text-zinc-900">
                {product.title}
              </h1>
            </div>
            <Badge
              variant={product.isActive === false ? "danger" : "success"}
            >
              {product.isActive === false ? "Inactive" : "Active"}
            </Badge>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatChip
              icon={Package}
              label="Product ID"
              value={product.id.slice(-8)}
              color="bg-blue-50 text-blue-500"
            />
            <StatChip
              icon={Package}
              label="Base Price"
              value={`₹${((product.basePrice ?? 0) / 100).toFixed(2)}`}
              color="bg-pink-50 text-pink-500"
            />
            <StatChip
              icon={ImageIcon}
              label="Images"
              value={totalImages}
              color="bg-violet-50 text-violet-500"
            />
            <StatChip
              icon={Layers}
              label="Variants"
              value={`${activeVariants} / ${totalVariants} active`}
              color="bg-green-50 text-green-500"
            />
          </div>

          {/* ── Main 2-column layout ── */}
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

            {/* LEFT — Product details form */}
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-pink-500">Product Details</p>
                  <h2 className="text-sm font-bold text-zinc-900">Edit information</h2>
                </div>
                <button
                  onClick={saveProductDetails}
                  disabled={savingProduct}
                  className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
                >
                  {savingProduct ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {savingProduct ? "Saving…" : "Save"}
                </button>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <Field label="Title" error={errors.title} required>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                    onBlur={() => {
                      if (!title.trim()) setErrors((p) => ({ ...p, title: "Required." }));
                      else if (title.trim().length < 3) setErrors((p) => ({ ...p, title: "Min 3 characters." }));
                    }}
                    placeholder="Non-Woven W-Cut Bag"
                    className={inputCls(errors.title)}
                  />
                </Field>

                <Field label="Slug" error={errors.slug} required hint={!errors.slug ? "Lowercase, numbers, hyphens" : undefined}>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => { setSlug(e.target.value.toLowerCase()); setErrors((p) => ({ ...p, slug: "" })); }}
                    onBlur={() => {
                      if (!slug.trim()) setErrors((p) => ({ ...p, slug: "Required." }));
                      else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim()))
                        setErrors((p) => ({ ...p, slug: "Only a-z, 0-9, hyphens." }));
                    }}
                    placeholder="non-woven-w-cut-bag"
                    className={inputCls(errors.slug)}
                  />
                </Field>

                <Field label="Base Price (paise)" error={errors.basePrice} required hint={!errors.basePrice ? `Display: ₹${(Number(basePrice || 0) / 100).toFixed(2)}` : undefined}>
                  <input
                    type="number"
                    value={basePrice}
                    min={0}
                    onChange={(e) => { setBasePrice(e.target.value); setErrors((p) => ({ ...p, basePrice: "" })); }}
                    onBlur={() => {
                      if (!basePrice) setErrors((p) => ({ ...p, basePrice: "Required." }));
                      else if (isNaN(Number(basePrice)) || Number(basePrice) < 0)
                        setErrors((p) => ({ ...p, basePrice: "Enter a valid price." }));
                    }}
                    placeholder="5000"
                    className={inputCls(errors.basePrice)}
                  />
                </Field>

                <Field label="Visibility">
                  <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-zinc-800">{isActive ? "Active" : "Inactive"}</p>
                      <p className="text-xs text-zinc-400">{isActive ? "Visible on storefront" : "Hidden"}</p>
                    </div>
                    <Toggle checked={isActive} onChange={() => setIsActive((p) => !p)} />
                  </div>
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Description" hint="Optional">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Material, sizes, print options, use case…"
                      className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm placeholder:text-zinc-300 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* RIGHT — Images */}
            <div className="space-y-6">
              {/* Upload */}
              <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
                <div className="border-b border-zinc-100 px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                    Images
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-zinc-900">Upload photos</h2>
                </div>
                <div className="p-5">
                  <UploadProductImageForm
                    productId={id}
                    onSuccess={loadProduct}
                    onToast={setToast}
                  />
                </div>
              </div>

              {/* Gallery */}
              {product.images && product.images.length > 0 && (
                <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
                  <div className="border-b border-zinc-100 px-6 py-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                      Gallery
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-zinc-900">
                      {totalImages} photo{totalImages !== 1 ? "s" : ""}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-5">
                    {product.images.map((img) => (
                      <div
                        key={img.id}
                        className="group relative overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-100"
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={img.url}
                            alt={product.title}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                          <button
                            onClick={() => setDeleteImageId(img.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white opacity-0 shadow transition group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Add Variant ── */}
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
            <div className="border-b border-zinc-100 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                Variants
              </p>
              <h2 className="mt-1 text-lg font-bold text-zinc-900">Add new variant</h2>
            </div>
            <div className="p-6">
              <AddVariantForm productId={id} onSuccess={loadProduct} onToast={setToast} />
            </div>
          </div>

          {/* ── Variants list ── */}
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
            <div className="border-b border-zinc-100 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                Manage Variants
              </p>
              <h2 className="mt-1 text-lg font-bold text-zinc-900">
                {totalVariants} variant{totalVariants !== 1 ? "s" : ""}
              </h2>
            </div>

            {!product.variants || product.variants.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No variants added"
                  description="Create a variant with size, color, shape, price and stock."
                />
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {product.variants.map((variant) => (
                  <VariantCard
                    key={variant.id}
                    variant={variant}
                    onSaved={loadProduct}
                    onDeleteRequest={setDeleteVariantTarget}
                    onToast={setToast}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={!!deleteImageId}
        title="Delete image?"
        description="This image will be permanently removed from the product gallery."
        onCancel={() => setDeleteImageId(null)}
        onConfirm={deleteImage}
      />
      <ConfirmDialog
        open={!!deleteVariantTarget}
        title="Delete variant?"
        description={
          deleteVariantTarget
            ? `Permanently delete ${deleteVariantTarget.size} / ${deleteVariantTarget.color} / ${deleteVariantTarget.shape}?`
            : ""
        }
        onCancel={() => setDeleteVariantTarget(null)}
        onConfirm={deleteVariant}
      />

      {(deletingImage || deletingVariant) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-medium text-zinc-700 shadow-xl ring-1 ring-zinc-100">
            <RefreshCw className="h-4 w-4 animate-spin text-pink-500" />
            {deletingImage ? "Deleting image…" : "Deleting variant…"}
          </div>
        </div>
      )}
    </div>
  );
}
