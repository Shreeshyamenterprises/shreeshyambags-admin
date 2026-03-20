"use client";

import { useState } from "react";
import { PlusSquare, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import type { ToastState } from "@/components/ui/toast";

export function AddVariantForm({
  productId,
  onSuccess,
  onToast,
}: {
  productId: string;
  onSuccess?: () => void;
  onToast?: (toast: ToastState) => void;
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!size.trim() || !color.trim() || !shape.trim()) {
      onToast?.({ message: "Size, color and shape are required.", type: "error" });
      return;
    }

    try {
      setLoading(true);

      const token = getAdminToken();
      const pricingTiers = [
        price200Kg ? { minQtyKg: 200, pricePerKg: Number(price200Kg) } : null,
        price500Kg ? { minQtyKg: 500, pricePerKg: Number(price500Kg) } : null,
        price1000Kg ? { minQtyKg: 1000, pricePerKg: Number(price1000Kg) } : null,
      ].filter(Boolean);

      await api.post(
        `/admin/products/${productId}/variants`,
        {
          size,
          color,
          shape,
          price: Number(price || 0),
          stock: Number(stock || 0),
          sku: sku || undefined,
          gsm: gsm ? Number(gsm) : undefined,
          pricePerKg: pricePerKg ? Number(pricePerKg) : undefined,
          pricingTiers,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      onToast?.({ message: "Variant added successfully.", type: "success" });

      setSize(""); setColor(""); setShape(""); setPrice("");
      setStock(""); setSku(""); setGsm(""); setPricePerKg("");
      setPrice200Kg(""); setPrice500Kg(""); setPrice1000Kg("");

      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      onToast?.({
        message: error?.response?.data?.message || "Failed to add variant.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Core fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600">
            Size <span className="text-pink-500">*</span>
          </label>
          <input className={inputCls} value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 40x50 cm" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600">
            Color <span className="text-pink-500">*</span>
          </label>
          <input className={inputCls} value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. White" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600">
            Shape <span className="text-pink-500">*</span>
          </label>
          <input className={inputCls} value={shape} onChange={(e) => setShape(e.target.value)} placeholder="e.g. D-Cut" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600">SKU</label>
          <input className={inputCls} value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600">Stock</label>
          <input type="number" className={inputCls} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600">GSM</label>
          <input type="number" className={inputCls} value={gsm} onChange={(e) => setGsm(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600">Base Price</label>
          <input type="number" className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600">Default Price / KG</label>
          <input type="number" className={inputCls} value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} placeholder="Optional" />
        </div>
      </div>

      {/* Bulk pricing */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Bulk Pricing Slabs
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">200 KG price/kg</label>
            <input type="number" className={inputCls} value={price200Kg} onChange={(e) => setPrice200Kg(e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">500 KG price/kg</label>
            <input type="number" className={inputCls} value={price500Kg} onChange={(e) => setPrice500Kg(e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">1000 KG price/kg</label>
            <input type="number" className={inputCls} value={price1000Kg} onChange={(e) => setPrice1000Kg(e.target.value)} placeholder="Optional" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
          loading
            ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
            : "bg-zinc-900 text-white hover:bg-zinc-700"
        }`}
      >
        {loading ? (
          <><RefreshCw className="h-4 w-4 animate-spin" /> Adding…</>
        ) : (
          <><PlusSquare className="h-4 w-4" /> Add Variant</>
        )}
      </button>
    </form>
  );
}
