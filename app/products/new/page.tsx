"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Eye,
  ImageIcon,
  Info,
  Layers,
  Lock,
  Package,
  RefreshCw,
  Tag,
  ToggleRight,
  Unlock,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { Toggle } from "@/components/ui/toggle";
import { Toast, type ToastState } from "@/components/ui/toast";

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const TITLE_MAX = 120;
const DESC_MAX = 600;

export default function NewProductPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [autoSlug, setAutoSlug] = useState(true);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const finalSlug = useMemo(() => {
    if (autoSlug) return makeSlug(title);
    return makeSlug(slug);
  }, [title, slug, autoSlug]);

  const basePriceNum = useMemo(() => {
    const n = Number(basePrice);
    return isNaN(n) ? 0 : n;
  }, [basePrice]);

  const previewBasePrice = useMemo(() => {
    if (!basePrice || basePriceNum === 0) return "₹0.00";
    return `₹${(basePriceNum / 100).toFixed(2)}`;
  }, [basePrice, basePriceNum]);

  const isTitleValid = title.trim().length > 0;
  const isSlugValid = finalSlug.length > 0;
  const isFormValid = isTitleValid && isSlugValid;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isTitleValid) {
      setToast({ message: "Product title is required.", type: "error" });
      return;
    }

    if (!isSlugValid) {
      setToast({ message: "Valid slug is required.", type: "error" });
      return;
    }

    try {
      setSaving(true);
      setToast(null);

      const token = getAdminToken();

      const res = await api.post(
        "/admin/products",
        {
          title: title.trim(),
          slug: finalSlug,
          description: description.trim() || undefined,
          basePrice: basePrice ? Number(basePrice) : 0,
          isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setToast({
        message: "Product created successfully! Redirecting…",
        type: "success",
      });

      const createdId = res.data?.id;

      setTimeout(() => {
        router.push(createdId ? `/products/${createdId}` : "/products");
      }, 800);
    } catch (error: any) {
      console.error(error);
      setToast({
        message: error?.response?.data?.message || "Failed to create product.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Header
        title="Create Product"
        subtitle="Add a premium non-woven bag product to your catalog."
      />

      {/* ── Toast ── */}
      {toast && (
        <Toast toast={toast} onClose={() => setToast(null)} />
      )}

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-pink-950 p-7 text-white shadow-sm">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-pink-500/10" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-56 w-56 rounded-full bg-pink-500/8" />

        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-pink-500/15 px-3 py-1.5 ring-1 ring-pink-400/20">
              <Package className="h-3.5 w-3.5 text-pink-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-pink-300">
                Catalog Builder
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Create a new product
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
              Set up the product identity first — title, slug, description and
              base price. After saving you can add images, variants, GSM options
              and bulk pricing tiers.
            </p>

            {/* Step progress */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {[
                { icon: Tag, label: "Product Info", active: true },
                { icon: ImageIcon, label: "Images", active: false },
                { icon: Layers, label: "Variants", active: false },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
                      step.active
                        ? "bg-pink-500/20 text-pink-200 ring-pink-400/30"
                        : "bg-white/5 text-zinc-500 ring-white/10"
                    }`}
                  >
                    <step.icon className="h-3 w-3" />
                    <span>
                      {i + 1}. {step.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live stat cards */}
          <div className="grid gap-3">
            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <CircleDot className="h-3.5 w-3.5" />
                <p className="text-xs font-medium uppercase tracking-widest">
                  Slug Preview
                </p>
              </div>
              <p className="mt-2 break-all text-sm font-semibold text-white">
                /products/
                <span className="text-pink-300">
                  {finalSlug || "your-product-slug"}
                </span>
              </p>
            </div>

            <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Tag className="h-3.5 w-3.5" />
                <p className="text-xs font-medium uppercase tracking-widest">
                  Base Price
                </p>
              </div>
              <p className="mt-2 text-xl font-bold text-white">
                {previewBasePrice}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Form ── */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"
      >
        {/* Left column */}
        <div className="space-y-5">
          {/* Product Details card */}
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
            <div className="border-b border-zinc-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50">
                  <Tag className="h-4 w-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                    Step 1
                  </p>
                  <h2 className="text-base font-bold text-zinc-900">
                    Product Details
                  </h2>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              {/* Title */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700">
                    Product Title{" "}
                    <span className="text-pink-500">*</span>
                  </label>
                  <span
                    className={`text-xs ${
                      title.length > TITLE_MAX * 0.85
                        ? "text-amber-500"
                        : "text-zinc-400"
                    }`}
                  >
                    {title.length}/{TITLE_MAX}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    maxLength={TITLE_MAX}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (autoSlug) setSlug(makeSlug(e.target.value));
                    }}
                    placeholder="e.g. Premium Non-Woven D-Cut Bag"
                    className={`w-full rounded-2xl border bg-white px-4 py-3 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 ${
                      title.length > 0
                        ? "border-zinc-200"
                        : "border-zinc-200"
                    }`}
                  />
                  {title.length > 0 && (
                    <CheckCircle2 className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>

              {/* Slug */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700">
                    URL Slug{" "}
                    <span className="text-pink-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoSlug(!autoSlug);
                      if (!autoSlug) setSlug(makeSlug(title));
                    }}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    {autoSlug ? (
                      <>
                        <Lock className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Auto-generating</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3 w-3 text-amber-500" />
                        <span className="text-amber-600">Manual mode</span>
                      </>
                    )}
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex overflow-hidden rounded-2xl border border-zinc-200 bg-white transition focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100">
                  <span className="flex items-center border-r border-zinc-100 bg-zinc-50 px-3 py-3 text-xs font-medium text-zinc-400 select-none">
                    /products/
                  </span>
                  <input
                    type="text"
                    value={autoSlug ? finalSlug : slug}
                    readOnly={autoSlug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setSlug(e.target.value);
                    }}
                    placeholder="your-product-slug"
                    className={`flex-1 bg-transparent px-3 py-3 text-sm outline-none ${
                      autoSlug
                        ? "cursor-not-allowed text-zinc-400"
                        : "text-zinc-900"
                    }`}
                  />
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-zinc-400">
                  <Info className="h-3 w-3" />
                  Only lowercase letters, numbers and hyphens allowed.
                </p>
              </div>

              {/* Description */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700">
                    Description
                    <span className="ml-2 rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
                      Optional
                    </span>
                  </label>
                  <span
                    className={`text-xs ${
                      description.length > DESC_MAX * 0.85
                        ? "text-amber-500"
                        : "text-zinc-400"
                    }`}
                  >
                    {description.length}/{DESC_MAX}
                  </span>
                </div>
                <textarea
                  value={description}
                  maxLength={DESC_MAX}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product for admin reference and storefront display…"
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Visibility card */}
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
            <div className="border-b border-zinc-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50">
                  <Tag className="h-4 w-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                    Step 1b
                  </p>
                  <h2 className="text-base font-bold text-zinc-900">
                    Pricing &amp; Visibility
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Base price input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Base Price
                    <span className="ml-2 rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
                      in paise
                    </span>
                  </label>
                  <div className="flex overflow-hidden rounded-2xl border border-zinc-200 bg-white transition focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100">
                    <span className="flex items-center border-r border-zinc-100 bg-zinc-50 px-3 py-3 text-sm font-semibold text-zinc-500 select-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      placeholder="0"
                      className="flex-1 bg-transparent px-3 py-3 text-sm text-zinc-900 outline-none"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-zinc-50 px-3 py-2 ring-1 ring-zinc-100">
                    <Eye className="h-3.5 w-3.5 text-zinc-400" />
                    <p className="text-xs text-zinc-500">
                      Display price:{" "}
                      <span className="font-semibold text-zinc-700">
                        {previewBasePrice}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Visibility toggle */}
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                          isActive ? "bg-green-100" : "bg-zinc-200"
                        }`}
                      >
                        <ToggleRight
                          className={`h-4 w-4 ${
                            isActive ? "text-green-600" : "text-zinc-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          Visibility
                        </p>
                        <p className="text-xs text-zinc-500">
                          {isActive
                            ? "Goes live on save"
                            : "Hidden after save"}
                        </p>
                      </div>
                    </div>
                    <Toggle
                      checked={isActive}
                      onChange={() => setIsActive((p) => !p)}
                    />
                  </div>

                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-200 text-zinc-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive ? "bg-green-500" : "bg-zinc-400"
                        }`}
                      />
                      {isActive ? "Active on creation" : "Inactive on creation"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          {/* Live Preview card */}
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
            <div className="border-b border-zinc-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50">
                  <Eye className="h-4 w-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                    Live Preview
                  </p>
                  <h2 className="text-base font-bold text-zinc-900">
                    Product card
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="overflow-hidden rounded-[1.5rem] border border-zinc-100 bg-zinc-50">
                {/* Product image placeholder */}
                <div className="relative flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-50 to-pink-50">
                  <div className="flex flex-col items-center gap-2 text-zinc-300">
                    <ImageIcon className="h-10 w-10" />
                    <p className="text-xs font-medium">
                      Images added after creation
                    </p>
                  </div>
                  {/* status badge overlay */}
                  <div className="absolute right-3 top-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                        isActive
                          ? "bg-green-100 text-green-700 ring-1 ring-green-200"
                          : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive ? "bg-green-500" : "bg-zinc-400"
                        }`}
                      />
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-semibold text-zinc-900 line-clamp-2">
                    {title || (
                      <span className="text-zinc-400">Your product title</span>
                    )}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    /products/
                    <span className="text-pink-400">
                      {finalSlug || "your-product-slug"}
                    </span>
                  </p>

                  <p className="mt-3 line-clamp-3 text-xs leading-5 text-zinc-500">
                    {description || (
                      <span className="text-zinc-300">
                        Product description will appear here once added.
                      </span>
                    )}
                  </p>

                  <div className="mt-4 flex items-end justify-between border-t border-zinc-100 pt-3">
                    <div>
                      <p className="text-xs text-zinc-400">Base price</p>
                      <p className="mt-0.5 text-lg font-bold text-zinc-900">
                        {previewBasePrice}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-400">Next steps</p>
                      <p className="mt-0.5 text-xs font-medium text-zinc-700">
                        Images · Variants · Tiers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow steps card */}
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-zinc-100">
            <div className="border-b border-zinc-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50">
                  <Layers className="h-4 w-4 text-pink-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-pink-500">
                    Workflow
                  </p>
                  <h2 className="text-base font-bold text-zinc-900">
                    What happens next
                  </h2>
                </div>
              </div>
            </div>

            <div className="divide-y divide-zinc-50 px-6">
              {[
                {
                  step: 1,
                  icon: Tag,
                  title: "Create product record",
                  desc: "Save title, slug, description and base price.",
                  active: true,
                },
                {
                  step: 2,
                  icon: ImageIcon,
                  title: "Upload gallery images",
                  desc: "Add visuals to make the product look premium.",
                  active: false,
                },
                {
                  step: 3,
                  icon: Layers,
                  title: "Add variants &amp; tiers",
                  desc: "Configure size, color, GSM, stock and bulk pricing.",
                  active: false,
                },
              ].map(({ step, icon: Icon, title: t, desc, active }) => (
                <div key={step} className="flex items-start gap-4 py-4">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      active
                        ? "bg-pink-500 text-white"
                        : "bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    {step}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p
                      className={`text-sm font-semibold ${
                        active ? "text-zinc-900" : "text-zinc-500"
                      }`}
                      dangerouslySetInnerHTML={{ __html: t }}
                    />
                    <p className="mt-0.5 text-xs leading-5 text-zinc-400">
                      {desc}
                    </p>
                  </div>
                  <Icon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      active ? "text-pink-400" : "text-zinc-300"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions card */}
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <div className="space-y-3">
              <button
                type="submit"
                disabled={saving || !isFormValid}
                className={`flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-semibold transition ${
                  isFormValid && !saving
                    ? "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]"
                    : "cursor-not-allowed bg-zinc-100 text-zinc-400"
                }`}
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Creating product…
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4" />
                    Create Product
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => router.push("/products")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-50 px-5 py-3 text-sm font-medium text-zinc-600 ring-1 ring-zinc-100 transition hover:bg-zinc-100 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Products
              </button>
            </div>

            {!isFormValid && !saving && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
                <Info className="h-3 w-3" />
                Fill in a product title to enable creation.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
