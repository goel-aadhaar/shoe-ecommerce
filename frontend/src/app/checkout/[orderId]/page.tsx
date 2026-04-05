'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { CheckoutForm } from '@/components/features/checkout/checkout-form';

import { Stepper } from '@/components/common/stepper';

export default function CheckoutPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const amount = Number(searchParams.get('amount') ?? '0');

  return (
    <div className="container-inner py-8 lg:py-12">
      <h1 className="text-center font-serif text-3xl font-bold text-brown-900 mb-8">
        Secure Checkout
      </h1>
      <Stepper steps={['Cart', 'Payment', 'Confirmation']} currentStep={1} />
      <div className="mt-8">
        <CheckoutForm orderId={orderId} amount={amount} />
      </div>
    </div>
  );
}
