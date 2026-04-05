'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { paymentService } from '@/services/payment.service';
import { useCart } from '@/hooks/use-cart';

interface CheckoutFormProps {
  orderId: string;
  amount: number;
}

export function CheckoutForm({ orderId, amount }: CheckoutFormProps) {
  const router = useRouter();
  const { clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  async function handlePay() {
    setProcessing(true);
    try {
      const intentRes = await paymentService.createIntent({
        orderId,
        amount,
      });

      // Simulate payment confirmation (in production, use Stripe Elements)
      await paymentService.confirm({
        transactionId: intentRes.data.payment.transactionId ?? '',
        status: 'success',
      });

      await clearCart();
      setPaid(true);
      toast.success('Payment successful!');
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  if (paid) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mt-4 font-serif text-2xl font-bold text-brown-900">
          Order Confirmed!
        </h2>
        <p className="mt-2 text-sm text-brown-500">
          Order #{orderId.slice(-8)} has been placed successfully.
        </p>
        <button
          onClick={() => router.push('/profile?tab=orders')}
          className="mt-6 rounded-md bg-copper px-6 py-2.5 text-sm font-semibold text-white hover:bg-sienna transition-colors"
        >
          View Orders
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-lg border border-brown-200 bg-white p-6">
        <h2 className="font-serif text-xl font-bold text-brown-900">
          Payment
        </h2>
        <div className="mt-4 rounded border border-brown-100 bg-brown-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-brown-600">Order Total</span>
            <span className="font-bold text-brown-800">
              &#8377;{amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-brown-500">
          Your payment will be processed securely via Stripe.
        </p>

        <button
          onClick={handlePay}
          disabled={processing}
          className="btn-primary mt-6 w-full disabled:opacity-50"
        >
          {processing ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
        </button>
      </div>
    </div>
  );
}
