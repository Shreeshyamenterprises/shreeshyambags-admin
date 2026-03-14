"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

export function AddVariantForm({
  productId,
  onSuccess,
}: {
  productId: string;
  onSuccess?: () => void;
}) {
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [shape, setShape] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");

  const [gsm, setGsm] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [price200Kg, setPrice200Kg] = useState("");
  const [price500Kg, setPrice500Kg] = useState("");
  const [price1000Kg, setPrice1000Kg] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const token = getAdminToken();

      const pricingTiers = [
        price200Kg ? { minQtyKg: 200, pricePerKg: Number(price200Kg) } : null,
        price500Kg ? { minQtyKg: 500, pricePerKg: Number(price500Kg) } : null,
        price1000Kg
          ? { minQtyKg: 1000, pricePerKg: Number(price1000Kg) }
          : null,
      ].filter(Boolean);

      await api.post(
        `/admin/products/${productId}/variants`,
        {
          size,
          color,
          shape,
          price: Number(price || 0),
          stock: Number(stock || 0),
          sku,
          gsm: gsm ? Number(gsm) : undefined,
          pricePerKg: pricePerKg ? Number(pricePerKg) : undefined,
          pricingTiers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Variant added successfully");

      setSize("");
      setColor("");
      setShape("");
      setPrice("");
      setStock("");
      setSku("");
      setGsm("");
      setPricePerKg("");
      setPrice200Kg("");
      setPrice500Kg("");
      setPrice1000Kg("");

      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to add variant");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100"
    >
      <h3 className="mb-4 text-lg font-semibold">Add Variant</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="Size"
        />

        <input
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="Color"
        />

        <input
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
          value={shape}
          onChange={(e) => setShape(e.target.value)}
          placeholder="Shape"
        />

        <input
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="SKU"
        />

        <input
          type="number"
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
        />

        <input
          type="number"
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
          value={gsm}
          onChange={(e) => setGsm(e.target.value)}
          placeholder="GSM"
        />

        <input
          type="number"
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Base Price (optional old retail price)"
        />

        <input
          type="number"
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
          value={pricePerKg}
          onChange={(e) => setPricePerKg(e.target.value)}
          placeholder="Default Price Per Kg"
        />
      </div>

      <div className="mt-6">
        <h4 className="mb-3 text-sm font-semibold text-zinc-700">
          Bulk Pricing Slabs
        </h4>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="number"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
            value={price200Kg}
            onChange={(e) => setPrice200Kg(e.target.value)}
            placeholder="200 kg price/kg"
          />

          <input
            type="number"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
            value={price500Kg}
            onChange={(e) => setPrice500Kg(e.target.value)}
            placeholder="500 kg price/kg"
          />

          <input
            type="number"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
            value={price1000Kg}
            onChange={(e) => setPrice1000Kg(e.target.value)}
            placeholder="1000 kg price/kg"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add Variant"}
      </button>
    </form>
  );
}
