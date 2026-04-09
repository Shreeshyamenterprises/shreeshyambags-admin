"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, ImageIcon, Info, Package, RefreshCw, Tag } from "lucide-react";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { Toggle } from "@/components/ui/toggle";
import { Toast, type ToastState } from "@/components/ui/toast";

function makeSlug(v: string) {
  return v.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
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

function inputCls(err?: string) {
  return `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition placeholder:text-zinc-300 ${
    err
      ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100"
      : "border-zinc-200 bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
  }`;
}

export default function NewProductPage() {
  const router = useRouter();

  const [title,       setTitle]       = useState("");
  const [slug,        setSlug]        = useState("");
  const [description, setDescription] = useState("");
  const [basePrice,   setBasePrice]   = useState("");
  const [isActive,    setIsActive]    = useState(true);
  const [autoSlug,    setAutoSlug]    = useState(true);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState<ToastState>(null);

  const finalSlug    = useMemo(() => autoSlug ? makeSlug(title) : makeSlug(slug), [title, slug, autoSlug]);
  const basePriceNum = useMemo(() => { const n = Number(basePrice); return isNaN(n) ? 0 : n; }, [basePrice]);
  const previewPrice = basePriceNum > 0 ? `₹${(basePriceNum / 100).toFixed(2)}` : "₹0.00";
  const isFormValid  = title.trim().length >= 3 && finalSlug.length > 0;

  function setErr(k: string, v: string) { setErrors(p => ({ ...p, [k]: v })); }

  function validateAll() {
    const e: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) e.title = "Min 3 characters required.";
    if (!finalSlug) e.slug = "Slug cannot be empty.";
    if (basePrice && (isNaN(Number(basePrice)) || Number(basePrice) < 0)) e.basePrice = "Enter a valid positive number.";
    return e;
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const errs = validateAll();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setSaving(true);
      const token = getAdminToken();
      const res = await api.post("/admin/products", {
        title: title.trim(), slug: finalSlug,
        description: description.trim() || undefined,
        basePrice: basePrice ? Number(basePrice) : 0,
        isActive,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setToast({ message: "Product created! Redirecting…", type: "success" });
      setTimeout(() => router.push(res.data?.id ? `/products/${res.data.id}` : "/products"), 800);
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || "Failed to create product.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/products")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">Catalog</p>
          <h1 className="text-xl font-bold text-zinc-900">Create Product</h1>
        </div>
      </div>

      {/* Main grid */}
      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_300px]">

        {/* LEFT — form */}
        <div className="space-y-4">

          {/* Section: Identity */}
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
            <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-50">
                <Tag className="h-3.5 w-3.5 text-pink-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-pink-500">Step 1</p>
                <h2 className="text-sm font-bold text-zinc-900">Product Identity</h2>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">

              {/* Title */}
              <Field label="Title" required error={errors.title}>
                <input
                  type="text"
                  value={title}
                  maxLength={120}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErr("title", e.target.value.trim().length >= 3 ? "" : "Min 3 characters required.");
                    if (autoSlug) setSlug(makeSlug(e.target.value));
                  }}
                  onBlur={(e) => setErr("title", e.target.value.trim().length >= 3 ? "" : "Min 3 characters required.")}
                  placeholder="Non-Woven D-Cut Bag"
                  className={inputCls(errors.title)}
                />
              </Field>

              {/* Slug */}
              <Field label="URL Slug" required error={errors.slug} hint={!errors.slug ? "Auto-generated from title" : undefined}>
                <div className={`flex overflow-hidden rounded-xl border transition focus-within:ring-2 ${
                  errors.slug
                    ? "border-red-400 bg-red-50 focus-within:ring-red-100"
                    : "border-zinc-200 focus-within:border-pink-400 focus-within:ring-pink-100"
                }`}>
                  <span className="flex shrink-0 items-center border-r border-zinc-100 bg-zinc-50 px-2.5 text-xs text-zinc-400 select-none">
                    /p/
                  </span>
                  <input
                    type="text"
                    value={autoSlug ? finalSlug : slug}
                    readOnly={autoSlug}
                    onChange={(e) => { setAutoSlug(false); setSlug(e.target.value); }}
                    onFocus={() => setAutoSlug(false)}
                    placeholder="product-slug"
                    className={`flex-1 bg-transparent px-3 py-2.5 text-sm outline-none ${autoSlug ? "text-zinc-400" : "text-zinc-900"}`}
                  />
                  {!autoSlug && (
                    <button
                      type="button"
                      onClick={() => { setAutoSlug(true); setSlug(makeSlug(title)); }}
                      className="border-l border-zinc-100 bg-zinc-50 px-2.5 text-xs text-zinc-400 hover:text-pink-500 transition"
                      title="Reset to auto"
                    >
                      Auto
                    </button>
                  )}
                </div>
              </Field>

              {/* Base price */}
              <Field label="Base Price (paise)" error={errors.basePrice} hint={!errors.basePrice ? `Display: ${previewPrice}` : undefined}>
                <div className={`flex overflow-hidden rounded-xl border transition focus-within:ring-2 ${
                  errors.basePrice
                    ? "border-red-400 bg-red-50 focus-within:ring-red-100"
                    : "border-zinc-200 focus-within:border-pink-400 focus-within:ring-pink-100"
                }`}>
                  <span className="flex shrink-0 items-center border-r border-zinc-100 bg-zinc-50 px-2.5 text-sm font-bold text-zinc-500 select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={basePrice}
                    onChange={(e) => { setBasePrice(e.target.value); if (errors.basePrice) setErr("basePrice", ""); }}
                    onBlur={(e) => {
                      if (e.target.value && (isNaN(Number(e.target.value)) || Number(e.target.value) < 0))
                        setErr("basePrice", "Enter a valid positive number.");
                    }}
                    placeholder="5000"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none"
                  />
                </div>
              </Field>

              {/* Visibility */}
              <Field label="Visibility">
                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {isActive ? "Active on save" : "Hidden on save"}
                    </p>
                    <p className="text-xs text-zinc-400">Storefront visibility</p>
                  </div>
                  <Toggle checked={isActive} onChange={() => setIsActive(p => !p)} />
                </div>
              </Field>

              {/* Description — full width */}
              <div className="sm:col-span-2">
                <Field label="Description" hint="Optional — shown on product page">
                  <textarea
                    value={description}
                    maxLength={600}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Material, sizes, print options, use case…"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm placeholder:text-zinc-300 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  />
                </Field>
              </div>

              {/* Actions — below description */}
              <div className="flex items-center gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving || !isFormValid}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                    isFormValid && !saving
                      ? "bg-zinc-900 text-white hover:bg-zinc-800"
                      : "cursor-not-allowed bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {saving ? <><RefreshCw className="h-4 w-4 animate-spin" /> Creating…</> : <><Package className="h-4 w-4" /> Create Product</>}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => router.push("/products")}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" /> Cancel
                </button>

                {!isFormValid && !saving && (
                  <p className="flex items-center gap-1 text-xs text-zinc-400">
                    <Info className="h-3 w-3 shrink-0" /> Enter a title first.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — preview + actions (sticky) */}
        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">

          {/* Live preview card */}
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
            <div className="flex items-center gap-2.5 border-b border-zinc-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-50">
                <Eye className="h-3.5 w-3.5 text-pink-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-pink-500">Preview</p>
                <h2 className="text-sm font-bold text-zinc-900">Product card</h2>
              </div>
            </div>

            <div className="p-4">
              <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50">
                {/* Image placeholder */}
                <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-zinc-100 to-pink-50">
                  <div className="flex flex-col items-center gap-1 text-zinc-300">
                    <ImageIcon className="h-7 w-7" />
                    <p className="text-xs">Add images after creation</p>
                  </div>
                  <span className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive ? "bg-green-100 text-green-700" : "bg-zinc-200 text-zinc-500"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-zinc-400"}`} />
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="p-3">
                  <p className="truncate text-sm font-bold text-zinc-900">
                    {title || <span className="font-normal text-zinc-400">Product title</span>}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-400">
                    /products/<span className="text-pink-400">{finalSlug || "slug"}</span>
                  </p>
                  {description && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500">{description}</p>
                  )}
                  <p className="mt-2 border-t border-zinc-100 pt-2 text-base font-bold text-zinc-900">
                    {previewPrice}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="rounded-[2rem] bg-white px-5 py-4 shadow-sm ring-1 ring-zinc-100">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">After creation</p>
            <div className="space-y-2">
              {[
                { n: 1, label: "Upload product images",    active: false },
                { n: 2, label: "Add size / color variants",active: false },
                { n: 3, label: "Set bulk pricing tiers",   active: false },
              ].map(({ n, label }) => (
                <div key={n} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-[10px] font-bold text-zinc-500">
                    {n}
                  </div>
                  <p className="text-xs text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
