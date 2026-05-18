import type { Request, Response } from 'express';
import type Stripe from 'stripe';

import { config } from '../../../config.js';
import { ApiError } from '../../../shared/errors/api-error.class.js';
import { ApiResponse } from '../../../shared/responses/api-response.builder.js';
import { asyncHandler } from '../../../shared/utils/async-handler.util.js';
import { getStripe } from '../../../shared/utils/stripe.util.js';
import { Order } from '../../order/repositories/order.model.js';
import { OrderStatusHistory } from '../../order/repositories/order-status-history.model.js';
import { Payment } from '../repositories/payment.model.js';

export const createStripePayment = asyncHandler(
    async (req: Request, res: Response) => {
        const stripe = getStripe();
        const { orderId } = req.body ?? {};

        // The charge amount is taken from the order on the server — never
        // from the client — and the order must belong to the caller.
        const order = await Order.findById(orderId);
        if (!order) throw new ApiError(404, 'Order not found');
        if (String(order.userId) !== String(req.user?._id)) {
            throw new ApiError(403, 'Not authorized to pay for this order');
        }
        if (order.currentStatus === 'paid') {
            throw new ApiError(400, 'Order is already paid');
        }

        const amount = order.totalAmount;

        try {
            const paymentIntent = await stripe.paymentIntents.create(
                {
                    amount: Math.round(amount * 100),
                    currency: 'inr',
                    payment_method_types: ['card'],
                    metadata: { orderId: String(order._id) },
                },
                { idempotencyKey: `order_${String(order._id)}` },
            );

            const payment = await Payment.create({
                orderId,
                amount,
                paymentMethod: 'stripe',
                paymentStatus: 'pending',
                transactionId: paymentIntent.id,
            });

            return res.status(201).json(
                new ApiResponse(201, 'Stripe PaymentIntent created', {
                    clientSecret: paymentIntent.client_secret,
                    payment,
                }),
            );
        } catch (error) {
            throw new ApiError(
                402,
                error instanceof Error
                    ? error.message
                    : 'Payment processing failed',
            );
        }
    },
);

export const confirmPayment = asyncHandler(
    async (req: Request, res: Response) => {
        const { transactionId } = req.body ?? {};

        const payment = await Payment.findOne({ transactionId });

        if (!payment) {
            return res
                .status(404)
                .json(new ApiResponse(404, 'Payment not found', null));
        }

        // Verify the order belongs to the requesting user
        const order = await Order.findById(payment.orderId);
        if (!order || String(order.userId) !== String(req.user?._id)) {
            throw new ApiError(403, 'Not authorized to confirm this payment');
        }

        // The real payment status is read from Stripe, NOT trusted from the
        // client. This prevents marking an order paid without paying.
        const stripe = getStripe();
        const intent = await stripe.paymentIntents.retrieve(transactionId);

        const resolvedStatus: 'pending' | 'success' | 'failed' =
            intent.status === 'succeeded'
                ? 'success'
                : intent.status === 'processing' ||
                    intent.status === 'requires_action' ||
                    intent.status === 'requires_confirmation'
                  ? 'pending'
                  : 'failed';

        payment.paymentStatus = resolvedStatus;
        await payment.save();

        if (resolvedStatus === 'success' && order.currentStatus !== 'paid') {
            await Order.findByIdAndUpdate(payment.orderId, {
                currentStatus: 'paid',
            });
            await OrderStatusHistory.create({
                orderId: payment.orderId,
                status: 'paid',
            });
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, 'Payment updated successfully', payment),
            );
    },
);

async function applyIntentToOrder(intent: Stripe.PaymentIntent) {
    const payment = await Payment.findOne({ transactionId: intent.id });
    if (!payment) return;

    const succeeded = intent.status === 'succeeded';
    payment.paymentStatus = succeeded ? 'success' : 'failed';
    await payment.save();

    if (succeeded) {
        const order = await Order.findById(payment.orderId);
        if (order && order.currentStatus !== 'paid') {
            order.currentStatus = 'paid';
            await order.save();
            await OrderStatusHistory.create({
                orderId: payment.orderId,
                status: 'paid',
            });
        }
    }
}

/**
 * Stripe-signed webhook. This is the authoritative source of payment truth:
 * it is verified by signature (not auth middleware) and is immune to client
 * tampering. Mounted with a raw body in app.ts BEFORE express.json().
 */
export const stripeWebhook = async (req: Request, res: Response) => {
    const secret = config.stripeWebhookSecret;
    const signature = req.headers['stripe-signature'];

    if (!secret || !signature) {
        return res
            .status(400)
            .json(new ApiResponse(400, 'Webhook not configured', null));
    }

    let event: Stripe.Event;
    try {
        event = getStripe().webhooks.constructEvent(
            req.body as Buffer,
            signature,
            secret,
        );
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Invalid signature';
        return res
            .status(400)
            .json(new ApiResponse(400, `Webhook signature failed: ${msg}`, null));
    }

    try {
        if (
            event.type === 'payment_intent.succeeded' ||
            event.type === 'payment_intent.payment_failed'
        ) {
            await applyIntentToOrder(
                event.data.object as Stripe.PaymentIntent,
            );
        }
    } catch (err) {
        // Log but still 200 so Stripe doesn't hammer retries on a transient
        // DB blip; reconciliation can replay events if needed.
        console.error('[stripe webhook] handler error', err);
    }

    return res.status(200).json(new ApiResponse(200, 'received', null));
};
