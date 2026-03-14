"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

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

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

  const previewBasePrice = useMemo(() => {
    if (!basePrice) return "₹0.00";
    const num = Number(basePrice);
    if (Number.isNaN(num)) return "₹0.00";
    return `₹${(num / 100).toFixed(2)}`;
  }, [basePrice]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setToast({ message: "Product title is required.", type: "error" });
      return;
    }

    if (!finalSlug) {
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
        message: "Product created successfully.",
        type: "success",
      });

      const createdId = res.data?.id;

      setTimeout(() => {
        if (createdId) {
          router.push(`/products/${createdId}`);
          return;
        } else {
          router.push("/products");
        }
      }, 700);
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
        subtitle="Add a premium non-woven bag product with clean catalog details and pricing."
      />

      <ToastInline toast={toast} />

      <div className="overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-zinc-900 via-zinc-900 to-pink-900 p-6 text-white shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pink-300">
              Catalog Builder
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Create a strong product listing
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300">
              Add the product title, slug, description and base price first.
              After creation, you can upload gallery images, add variants, GSM
              options and pricing tiers.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Badge variant="default">Step 1: Product Info</Badge>
              <Badge variant="default">Step 2: Images</Badge>
              <Badge variant="default">Step 3: Variants</Badge>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.5rem] bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">
                Slug Preview
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                /products/{finalSlug || "your-product-slug"}
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">
                Base Price Preview
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {previewBasePrice}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
                Product Details
              </p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900">
                Main information
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Start with the basic product identity that customers and admins
                will see across the platform.
              </p>
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Product Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (autoSlug) {
                      setSlug(makeSlug(e.target.value));
                    }
                  }}
                  placeholder="Enter product title"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-700">
                    Product Slug
                  </label>
                  <input
                    type="text"
                    value={autoSlug ? finalSlug : slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setSlug(e.target.value);
                    }}
                    placeholder="enter-product-slug"
                    className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAutoSlug(true);
                    setSlug(makeSlug(title));
                  }}
                  className="rounded-full border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  Auto Generate
                </button>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a short product description for admin and storefront clarity"
                  className="min-h-36 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
                Pricing & Visibility
              </p>
              <h2 className="mt-2 text-2xl font-bold text-zinc-900">
                Setup defaults
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Add the base price and decide whether the product should be live
                immediately after creation.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700">
                  Base Price (paise)
                </label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="Enter base price in paise"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  Preview: {previewBasePrice}
                </p>
              </div>

              <div className="rounded-[1.5rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      Product Visibility
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      Control whether this product should be active after
                      creation.
                    </p>
                  </div>

                  <Toggle
                    checked={isActive}
                    onChange={() => setIsActive((p) => !p)}
                  />
                </div>

                <div className="mt-4">
                  <Badge variant={isActive ? "success" : "danger"}>
                    {isActive ? "Active on creation" : "Inactive on creation"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
              Live Preview
            </p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-900">
              Product summary
            </h2>

            <div className="mt-5 overflow-hidden rounded-[1.75rem] bg-zinc-50 ring-1 ring-zinc-100">
              <div className="aspect-[4/3] bg-gradient-to-br from-zinc-200 via-zinc-100 to-white" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {title || "Your product title"}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      /products/{finalSlug || "your-product-slug"}
                    </p>
                  </div>

                  <Badge variant={isActive ? "success" : "danger"}>
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <p className="mt-4 line-clamp-4 text-sm leading-6 text-zinc-600">
                  {description || "Your product description will appear here."}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Base Price
                    </p>
                    <p className="mt-1 text-base font-semibold text-zinc-900">
                      {previewBasePrice}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Next Steps
                    </p>
                    <p className="mt-1 text-sm font-medium text-zinc-900">
                      Images, variants, tiers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
              Workflow
            </p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-900">
              What happens next
            </h2>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                <p className="text-sm font-semibold text-zinc-900">
                  1. Create the product
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Save the base product record first with title, slug and price.
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                <p className="text-sm font-semibold text-zinc-900">
                  2. Upload images
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Add gallery visuals to make the product look premium on the
                  website.
                </p>
              </div>

              <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                <p className="text-sm font-semibold text-zinc-900">
                  3. Add variants and pricing tiers
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Configure size, color, shape, GSM, stock and bulk price slabs.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Creating Product..." : "Create Product"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/products")}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
