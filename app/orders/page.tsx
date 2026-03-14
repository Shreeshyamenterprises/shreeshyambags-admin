"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { api } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";

type OrderItem = {
  id: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  customText?: string | null;
  size: string;
  color: string;
  shape: string;
};

type Order = {
  id: string;
  status: string;
  subtotal: number;
  total: number;
  shipName: string;
  shipPhone: string;
  shipCity: string;
  shipState: string;
  shipPincode: string;
  createdAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    name?: string | null;
    email: string;
  };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const token = getAdminToken();

        const res = await api.get("/admin/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(res.data ?? []);
      } catch (error) {
        console.error(error);
        alert("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <main className="flex-1 p-8">
        <Header title="Orders" />

        {loading ? (
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100">
            No orders found.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-lg font-semibold">
                      {order.shipName}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {order.user?.email || "No email"}
                    </div>
                    <div className="mt-2 text-sm text-zinc-600">
                      {order.shipCity}, {order.shipState} - {order.shipPincode}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">
                      Phone: {order.shipPhone}
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <div className="text-sm font-medium">{order.status}</div>
                    <div className="mt-1 text-sm text-zinc-500">
                      Order ID: {order.id}
                    </div>
                    <div className="mt-2 font-semibold">
                      ₹{(order.total / 100).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-zinc-50 p-4 text-sm"
                    >
                      <div className="font-medium">{item.productTitle}</div>
                      <div className="mt-1 text-zinc-600">
                        {item.size} / {item.color} / {item.shape}
                      </div>
                      <div className="mt-1 text-zinc-600">
                        Qty: {item.quantity} · Price: ₹
                        {(item.unitPrice / 100).toFixed(2)}
                      </div>
                      {item.customText && (
                        <div className="mt-2 text-zinc-700">
                          Custom Text:{" "}
                          <span className="font-medium">{item.customText}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
