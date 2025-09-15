import { Payment } from "../models/payment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { stripe } from "../utils/stripe.js";

import { createStripePayment as createStripePaymentService } from "../services/stripe.service.js";

export const createStripePayment = asyncHandler(async (req, res) => {
    const { orderId, amount } = req.body;

    // Use the service function to create the PaymentIntent
    const paymentIntent = await createStripePaymentService(amount * 100);

    const payment = await Payment.create({
        orderId,
        amount,
        paymentMethod: "stripe",
        paymentStatus: "pending",
        transactionId: paymentIntent.id,
    });

    res.status(201).json(
        new ApiResponse(201, "Stripe PaymentIntent created", {
            clientSecret: paymentIntent.client_secret,
            payment,
        })
    );
});


export const confirmPayment = asyncHandler(async (req, res) => {
import { Payment } from "../models/model-export.js";
import { OrderStatusHistory, Order } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const confirmPayment = asyncHandler(async (req, res) => {
    const { transactionId, status } = req.body;

    const payment = await Payment.findOneAndUpdate(
        { transactionId },
        { paymentStatus: status },
        { new: true }
    );

    if (!payment) {
        return res.status(404).json(new ApiResponse(404, "Payment not found"));
    }

    if (status === "success") {
        // Update order status
        await Order.findByIdAndUpdate(payment.orderId, { status: "paid" });
        await OrderStatusHistory.create({
            orderId: payment.orderId,
            status: "paid",
        });
    }

    res.status(200).json(
        new ApiResponse(200, "Payment updated successfully", payment)
    );
});

