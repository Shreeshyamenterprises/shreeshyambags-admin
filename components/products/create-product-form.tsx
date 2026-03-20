"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

export function CreateProductForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState(0);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const token = getAdminToken();

      const res = await api.post(
        "/admin/products",
        {
          title,
          description,
          basePrice: Number(basePrice),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const product = res.data;

      alert("Product created successfully");

      // redirect to edit page
      router.push(`/products/${product.id}`);
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100"
    >
      <h2 className="text-lg font-semibold mb-4">Create Product</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">
            Base Price (paise)
          </label>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-zinc-900 px-4 py-3 text-sm text-white disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </div>
    </form>
  );
}
