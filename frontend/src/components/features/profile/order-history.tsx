'use client';

import { useEffect, useState } from 'react';
import { orderService } from '@/services/order.service';
import type { Order } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getAll()
      .then((res) => setOrders(res.data.items))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded bg-brown-100" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-brown-500">
        No orders yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order._id}
          className="flex items-center justify-between rounded-lg border border-brown-200 bg-white p-4"
        >
          <div>
            <p className="text-sm font-medium text-brown-800">
              Order #{order._id.slice(-8)}
            </p>
            <p className="text-xs text-brown-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-brown-800">
              &#8377;{order.totalAmount.toLocaleString('en-IN')}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                STATUS_COLORS[order.currentStatus] ?? 'bg-gray-100 text-gray-800'
              }`}
            >
              {order.currentStatus}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
