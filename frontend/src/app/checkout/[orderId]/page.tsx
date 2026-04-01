'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { CheckoutForm } from '@/components/features/checkout/checkout-form';

export default function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const amount = Number(searchParams.get('amount') ?? '0');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-center font-serif text-3xl font-bold text-brown-900">
        Checkout
      </h1>
      <div className="mt-8">
        <CheckoutForm orderId={orderId} amount={amount} />
      </div>
    </div>
  );
}
