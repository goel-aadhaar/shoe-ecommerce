'use client';

import AppLayout from '@/components/layout/AppLayout';
import Checkout from '@/components/Checkout/checkout';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51S7kEwCuLYao8YIpCH25OI99AmSYXjXo2IGONh16L6cXsVzrh1KQSJacgVVAruytqMqI1K5dNPj9fkOaNT8igidM000UEOYn95');

export default function CheckoutPage() {
  return (
    <AppLayout>
      <Elements stripe={stripePromise}>
        <Checkout />
      </Elements>
    </AppLayout>
  );
}
