"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { orderService } from "@/services/order.service";
import type { Product } from "@/types";

export function CartSummary() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { items, total } = useCart();
  const [creating, setCreating] = useState(false);

  async function handleCheckout() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setCreating(true);
    try {
      const orderItems = items.map((i) => {
        const product = i.productId as Product;
        return {
          productId: product._id,
          quantity: i.quantity,
          price: product.price,
          selectedColor: i.selectedColor,
          selectedSize: i.selectedSize,
        };
      });

      const res = await orderService.create({
        items: orderItems,
        totalAmount: total,
      });

      router.push(`/checkout/${res.data.order._id}?amount=${total}`);
    } catch {
      toast.error("Failed to create order");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="rounded-lg border border-brown-200 bg-white p-6">
      <h3 className="font-serif text-lg font-bold text-brown-800">
        Order Summary
      </h3>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-brown-600">
          <span>Subtotal</span>
          <span>&#8377;{total.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-brown-600">
          <span>Shipping</span>
          <span className="text-green-700">Free</span>
        </div>
        <hr className="border-brown-200" />
        <div className="flex justify-between font-serif text-lg font-bold text-brown-900">
          <span>Total</span>
          <span>&#8377;{total.toLocaleString("en-IN")}</span>
        </div>
      </div>
      <button
        onClick={handleCheckout}
        disabled={items.length === 0 || creating}
        className="btn-primary mt-6 w-full disabled:opacity-50"
      >
        {creating ? "Creating Order..." : "Proceed to Checkout"}
      </button>
    </div>
  );
}
