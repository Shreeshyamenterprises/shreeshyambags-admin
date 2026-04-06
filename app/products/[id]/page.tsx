"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { AddVariantForm } from "@/components/products/add-variant-form";
import { UploadProductImageForm } from "@/components/products/upload-product-image-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { Toast } from "@/components/ui/toast";

type ProductImage = {
  id: string;
  url: string;
  productId: string;
};

type PricingTier = {
  id: string;
  minQtyKg: number;
  pricePerKg: number;
};

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

type ToastState = {
  message: string;
  type: "success" | "error" | "info" | "warning";
} | null;


function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-zinc-900 break-all">
        {value}
      </p>
    </div>
  );
}

function VariantCard({
  variant,
  onSaved,
  onDeleteRequest,
  onToast,
}: {
  variant: Variant;
  onSaved: () => void;
  onDeleteRequest: (variant: Variant) => void;
  onToast: (toast: ToastState) => void;
}) {
  const [price, setPrice] = useState(variant.price);
  const [pricePerKg, setPricePerKg] = useState(
    variant.pricePerKg ? String(variant.pricePerKg) : "",
  );
  const [stock, setStock] = useState(variant.stock);
  const [isActive, setIsActive] = useState(variant.isActive);
  const [saving, setSaving] = useState(false);

  const hasChanges =
    price !== variant.price ||
    stock !== variant.stock ||
    isActive !== variant.isActive ||
    pricePerKg !== (variant.pricePerKg ? String(variant.pricePerKg) : "");

  async function saveVariant() {
    try {
      setSaving(true);
      const token = getAdminToken();

      await api.patch(
        `/admin/variants/${variant.id}`,
        {
          price,
          stock,
          isActive,
          pricePerKg: pricePerKg ? Number(pricePerKg) : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      onToast({
        message: "Variant updated successfully.",
        type: "success",
      });
      onSaved();
    } catch (error: any) {
      console.error(error);
      onToast({
        message: error?.response?.data?.message || "Failed to update variant.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-zinc-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-base font-semibold text-zinc-900">
              {variant.size} / {variant.color} / {variant.shape}
            </p>

            <Badge variant={isActive ? "success" : "danger"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
            <span>Variant ID: {variant.id}</span>
            {variant.sku ? <span>SKU: {variant.sku}</span> : null}
            {variant.gsm ? <span>GSM: {variant.gsm}</span> : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Toggle checked={isActive} onChange={() => setIsActive((p) => !p)} />
          <Button variant="danger" onClick={() => onDeleteRequest(variant)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Price
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Price Per KG
          </label>
          <input
            type="number"
            value={pricePerKg}
            onChange={(e) => setPricePerKg(e.target.value)}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">
            Stock
          </label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400"
          />
        </div>

        <div className="flex items-end">
          <Button
            onClick={saveVariant}
            disabled={saving || !hasChanges}
            className="w-full"
          >
            {saving ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-sm font-semibold text-zinc-900">Pricing Tiers</h4>

        {!variant.pricingTiers || variant.pricingTiers.length === 0 ? (
          <div className="mt-3 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500 ring-1 ring-zinc-100">
            No pricing tiers added.
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {variant.pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                  Minimum Qty
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  {tier.minQtyKg} KG
                </p>

                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-zinc-400">
                  Rate
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  ₹{tier.pricePerKg}/kg
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductEditorPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [deleteVariantTarget, setDeleteVariantTarget] =
    useState<Variant | null>(null);
  const [deletingImage, setDeletingImage] = useState(false);
  const [deletingVariant, setDeletingVariant] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function loadProduct() {
    try {
      setLoading(true);
      const token = getAdminToken();

      const res = await api.get(`/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProduct(res.data);
      setTitle(res.data.title ?? "");
      setSlug(res.data.slug ?? "");
      setDescription(res.data.description ?? "");
      setBasePrice(String(res.data.basePrice ?? 0));
      setIsActive(res.data.isActive !== false);
    } catch (error: any) {
      console.error(error);
      setToast({
        message: error?.response?.data?.message || "Failed to load product.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteImage() {
    if (!deleteImageId) return;

    try {
      setDeletingImage(true);
      const token = getAdminToken();

      await api.delete(`/admin/images/${deleteImageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setToast({
        message: "Image deleted successfully.",
        type: "success",
      });
      setDeleteImageId(null);
      loadProduct();
    } catch (error: any) {
      console.error(error);
      setToast({
        message: error?.response?.data?.message || "Failed to delete image.",
        type: "error",
      });
    } finally {
      setDeletingImage(false);
    }
  }

  async function deleteVariant() {
    if (!deleteVariantTarget) return;

    try {
      setDeletingVariant(true);
      const token = getAdminToken();

      await api.delete(`/admin/variants/${deleteVariantTarget.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setToast({
        message: "Variant deleted successfully.",
        type: "success",
      });
      setDeleteVariantTarget(null);
      loadProduct();
    } catch (error: any) {
      console.error(error);
      setToast({
        message: error?.response?.data?.message || "Failed to delete variant.",
        type: "error",
      });
    } finally {
      setDeletingVariant(false);
    }
  }

  async function saveProductDetails() {
    try {
      setSavingProduct(true);
      const token = getAdminToken();

      await api.patch(
        `/admin/products/${id}`,
        {
          title: title.trim(),
          slug: slug.trim(),
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
        message: "Product details updated successfully.",
        type: "success",
      });

      loadProduct();
    } catch (error: any) {
      console.error(error);
      setToast({
        message:
          error?.response?.data?.message || "Failed to update product details.",
        type: "error",
      });
    } finally {
      setSavingProduct(false);
    }
  }

  const totalImages = useMemo(() => product?.images?.length ?? 0, [product]);
  const totalVariants = useMemo(
    () => product?.variants?.length ?? 0,
    [product],
  );

  return (
    <div className="space-y-6">
      <Header
        title="Product Editor"
        subtitle="Manage product details, upload images, update variants and review pricing tiers."
      />

      <Toast toast={toast} onClose={() => setToast(null)} />

      {loading ? (
        <div className="space-y-4">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <Skeleton className="h-8 w-56" />
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : !product ? (
        <EmptyState
          title="Product not found"
          description="We could not load this product. Please go back and try again."
          actionLabel="Back to Products"
          actionHref="/products"
        />
      ) : (
        <>
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
                    {product.title}
                  </h2>

                  <Badge
                    variant={product.isActive === false ? "danger" : "success"}
                  >
                    {product.isActive === false ? "Inactive" : "Active"}
                  </Badge>
                </div>

                <p className="mt-2 text-sm text-zinc-500">{product.slug}</p>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600">
                  {product.description ||
                    "No description added for this product yet."}
                </p>
              </div>

              <div className="w-full max-w-xl grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                <InfoCard label="Product ID" value={product.id} />
                <InfoCard
                  label="Base Price"
                  value={`₹${((product.basePrice ?? 0) / 100).toFixed(2)}`}
                />
                <InfoCard label="Images" value={String(totalImages)} />
                <InfoCard label="Variants" value={String(totalVariants)} />
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
                    Upload Images
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-zinc-900">
                    Add product visuals
                  </h3>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                <UploadProductImageForm
                  productId={id}
                  onSuccess={loadProduct}
                  onToast={setToast}
                />
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
                    Add Variant
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-zinc-900">
                    Create new variant
                  </h3>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] bg-zinc-50 p-5 ring-1 ring-zinc-100">
                <AddVariantForm productId={id} onSuccess={loadProduct} onToast={setToast} />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
                  Product Images
                </p>
                <h3 className="mt-2 text-2xl font-bold text-zinc-900">
                  Gallery
                </h3>
              </div>
            </div>

            {!product.images || product.images.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  title="No images uploaded"
                  description="Upload product images to improve product presentation."
                />
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {product.images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative overflow-hidden rounded-[1.5rem] bg-zinc-100 ring-1 ring-zinc-100"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={img.url}
                        alt={product.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="absolute inset-x-3 bottom-3 flex justify-end opacity-0 transition group-hover:opacity-100">
                      <Button
                        variant="danger"
                        onClick={() => setDeleteImageId(img.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
                  Variants
                </p>
                <h3 className="mt-2 text-2xl font-bold text-zinc-900">
                  Manage product variants
                </h3>
              </div>
            </div>

            {!product.variants || product.variants.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  title="No variants added"
                  description="Create a variant with size, color, shape, price and stock."
                />
              </div>
            ) : (
              <div className="mt-5 space-y-4">
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
            ? `This will permanently delete ${deleteVariantTarget.size} / ${deleteVariantTarget.color} / ${deleteVariantTarget.shape}.`
            : ""
        }
        onCancel={() => setDeleteVariantTarget(null)}
        onConfirm={deleteVariant}
      />

      {deletingImage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <div className="rounded-2xl bg-white px-5 py-4 text-sm font-medium text-zinc-700 shadow-xl">
            Deleting image...
          </div>
        </div>
      )}

      {deletingVariant && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <div className="rounded-2xl bg-white px-5 py-4 text-sm font-medium text-zinc-700 shadow-xl">
            Deleting variant...
          </div>
        </div>
      )}
    </div>
  );
}
