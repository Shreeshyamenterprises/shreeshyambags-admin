"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dropdown } from "@/components/ui/dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProductImage = {
  id: string;
  url: string;
  productId: string;
};

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

function ProductDetailsRow({
  product,
  onRefresh,
  onDeleteRequest,
  onToast,
}: {
  product: Product;
  onRefresh: () => void;
  onDeleteRequest: (product: Product) => void;
  onToast: (toast: ToastState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function toggleProduct() {
    try {
      setToggling(true);
      const token = getAdminToken();

      await api.patch(
        `/admin/products/${product.id}`,
        { isActive: !product.isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      onToast({
        message: `Product ${!product.isActive ? "activated" : "deactivated"} successfully.`,
        type: "success",
      });
      onRefresh();
    } catch (error: any) {
      console.error(error);
      onToast({
        message:
          error?.response?.data?.message || "Failed to update product status.",
        type: "error",
      });
    } finally {
      setToggling(false);
    }
  }

  const imageUrl = product.images?.[0]?.url;

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                  No Image
                </div>
              )}
            </div>

            <div>
              <p className="font-semibold text-zinc-900">{product.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{product.slug}</p>
            </div>
          </div>
        </TableCell>

        <TableCell>
          <div className="max-w-[260px]">
            <p className="line-clamp-2 text-sm text-zinc-600">
              {product.description || "No description added yet."}
            </p>
          </div>
        </TableCell>

        <TableCell>₹{((product.basePrice ?? 0) / 100).toFixed(2)}</TableCell>

        <TableCell>{product.variants.length}</TableCell>

        <TableCell>
          <Badge variant={product.isActive ? "success" : "danger"}>
            {product.isActive ? "Active" : "Inactive"}
          </Badge>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-3">
            <Toggle checked={product.isActive} onChange={toggleProduct} />
            <span className="text-xs text-zinc-500">
              {toggling ? "Updating..." : product.isActive ? "Live" : "Hidden"}
            </span>
          </div>
        </TableCell>

        <TableCell>
          <div className="flex justify-end">
            <Dropdown
              items={[
                {
                  label: open ? "Hide details" : "View details",
                  onClick: () => setOpen((prev) => !prev),
                },
                {
                  label: "Edit product",
                  onClick: () => {
                    window.location.href = `/products/${product.id}`;
                  },
                },
                {
                  label: product.isActive ? "Deactivate" : "Activate",
                  onClick: toggleProduct,
                },
                {
                  label: "Delete product",
                  onClick: () => onDeleteRequest(product),
                },
              ]}
            />
          </div>
        </TableCell>
      </TableRow>

      {open && (
        <tr className="border-b border-zinc-100 bg-zinc-50/60">
          <td colSpan={7} className="px-4 py-5">
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.5rem] bg-white p-5 ring-1 ring-zinc-100">
                <h4 className="text-sm font-semibold text-zinc-900">
                  Product Overview
                </h4>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Product ID
                    </p>
                    <p className="mt-2 break-all text-sm font-medium text-zinc-900">
                      {product.id}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Images
                    </p>
                    <p className="mt-2 text-sm font-medium text-zinc-900">
                      {product.images?.length ?? 0}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                      Status
                    </p>
                    <p className="mt-2 text-sm font-medium text-zinc-900">
                      {product.isActive
                        ? "Visible on website"
                        : "Hidden from website"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-white p-5 ring-1 ring-zinc-100">
                <h4 className="text-sm font-semibold text-zinc-900">
                  Variants
                </h4>

                {product.variants.length === 0 ? (
                  <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-500 ring-1 ring-zinc-100">
                    No variants added yet.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">
                              {variant.size} / {variant.color} / {variant.shape}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              Variant ID: {variant.id}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge
                              variant={variant.isActive ? "success" : "danger"}
                            >
                              {variant.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-sm font-medium text-zinc-700">
                              ₹{(variant.price / 100).toFixed(2)}
                            </span>
                            <span className="text-sm text-zinc-500">
                              Stock: {variant.stock}
                            </span>
                          </div>
                        </div>
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2500);

    return () => clearTimeout(timer);
  }, [toast]);

  async function loadProducts() {
    try {
      setLoading(true);
      const token = getAdminToken();

      const res = await api.get("/admin/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data ?? []);
    } catch (error: any) {
      console.error(error);
      setToast({
        message: error?.response?.data?.message || "Failed to load products.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const token = getAdminToken();

      await api.delete(`/admin/products/${deleteTarget.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setToast({
        message: "Product deleted successfully.",
        type: "success",
      });
      setDeleteTarget(null);
      loadProducts();
    } catch (error: any) {
      console.error(error);
      setToast({
        message: error?.response?.data?.message || "Failed to delete product.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.slug.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  );

  const activeProducts = products.filter((p) => p.isActive).length;
  const inactiveProducts = products.filter((p) => !p.isActive).length;
  const totalVariants = products.reduce((acc, p) => acc + p.variants.length, 0);

  return (
    <div className="space-y-6">
      <ToastInline toast={toast} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Products" value={products.length} />
        <StatsCard
          title="Active Products"
          value={activeProducts}
          tone="success"
        />
        <StatsCard
          title="Inactive Products"
          value={inactiveProducts}
          tone="danger"
        />
        <StatsCard title="Total Variants" value={totalVariants} />
      </div>

      <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-zinc-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-500">
            Products
          </p>
          <h2 className="mt-2 text-2xl font-bold text-zinc-900">
            Manage your catalog
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Search, review and manage products, visibility and variants.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search products by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-5 py-3 text-sm outline-none transition focus:border-pink-400 sm:w-80"
          />

          <Link href="/products/new">
            <Button>Create Product</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-zinc-100">
            <Skeleton className="h-8 w-52" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try another search or create your first product."
          actionLabel="Create Product"
          actionHref="/products/new"
        />
      ) : (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Product</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader>Base Price</TableHeader>
              <TableHeader>Variants</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Visibility</TableHeader>
              <TableHeader>
                <div className="text-right">Actions</div>
              </TableHeader>
            </tr>
          </TableHead>

          <tbody>
            {filteredProducts.map((product) => (
              <ProductDetailsRow
                key={product.id}
                product={product}
                onRefresh={loadProducts}
                onDeleteRequest={setDeleteTarget}
                onToast={setToast}
              />
            ))}
          </tbody>
        </Table>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete product?"
        description={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.title}". This action cannot be undone.`
            : ""
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteProduct}
      />

      {deleting && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <div className="rounded-2xl bg-white px-5 py-4 text-sm font-medium text-zinc-700 shadow-xl">
            Deleting product...
          </div>
        </div>
      )}
    </div>
  );
}
