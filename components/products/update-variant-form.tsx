"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

export function UpdateVariantForm() {
  const [variantId, setVariantId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const token = getAdminToken();

      await api.patch(
        `/admin/variants/${variantId}`,
        {
          price: price ? Number(price) : undefined,
          stock: stock ? Number(stock) : undefined,
          isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Variant updated successfully");

      setVariantId("");
      setPrice("");
      setStock("");
      setIsActive(true);
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to update variant");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100"
    >
      <h2 className="mb-4 text-xl font-semibold">Update Variant</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Variant ID</label>
          <input
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            placeholder="Paste variant ID"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            New Price (in paise)
          </label>
          <input
            type="number"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="19900"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">New Stock</label>
          <input
            type="number"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="100"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Variant is active
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-zinc-900 px-6 py-3 text-white disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Variant"}
        </button>
      </div>
    </form>
  );
}
