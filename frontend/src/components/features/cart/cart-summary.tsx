"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
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
    <div className="sticky top-28 border border-ink/20 bg-ink p-7 text-bone">
      <h3 className="font-serif text-3xl uppercase">Order Summary</h3>
      <div className="mt-6 space-y-3 font-mono text-xs uppercase tracking-[0.12em]">
        <div className="flex justify-between text-bone/60">
          <span>Subtotal</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-bone/60">
          <span>Shipping</span>
          <span className="text-volt">Free</span>
        </div>
        <div className="my-3 h-px bg-bone/15" />
        <div className="flex items-end justify-between">
          <span className="font-serif text-2xl uppercase text-bone">Total</span>
          <span className="font-serif text-2xl text-volt">
            ₹{total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
      <button
        onClick={handleCheckout}
        disabled={items.length === 0 || creating}
        className="btn-primary mt-7 w-full disabled:opacity-50"
      >
        {creating ? "Creating Order…" : "Checkout"}
        {!creating && <ArrowRight className="h-4 w-4" />}
      </button>
      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-bone/30">
        Secure Payment · Authentic Only
      </p>
    </div>
  );
}
