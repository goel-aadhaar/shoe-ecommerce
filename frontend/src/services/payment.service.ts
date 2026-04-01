import { apiPost } from '@/lib/api';
import type { Payment } from '@/types';

export const paymentService = {
  createIntent: (data: { orderId: string; amount: number }) =>
    apiPost<{ clientSecret: string; payment: Payment }>(
      '/payments/stripe',
      data,
    ),

  confirm: (data: { transactionId: string; status: string }) =>
    apiPost<Payment>('/payments/confirm', data),
};
