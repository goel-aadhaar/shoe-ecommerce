import { Payment, OrderStatusHistory, Order } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getStripe } from "../utils/stripe.js"; // This import is used by createStripePayment

export const createStripePayment = asyncHandler(async (req, res) => {
    const stripe = getStripe();
    const { orderId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Stripe works in cents
        currency: "usd",
        payment_method_types: ["card"],
    });

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
       
        await Order.findByIdAndUpdate(payment.orderId, { currentStatus: "paid" });
        await OrderStatusHistory.create({
            orderId: payment.orderId,
            status: "paid",
        });

    }

    res.status(200).json(
        new ApiResponse(200, "Payment updated successfully", payment)
    );
});