import { Payment } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createPayment = asyncHandler(async (req, res) => {
    const { orderId, amount, method } = req.body;

    const payment = await Payment.create({
        orderId,
        amount,
        paymentMethod: method || "stripe",
        paymentStatus: "success",
        transactionId: "txn_" + Date.now(),
    });

    res.status(201).json(
        new ApiResponse(
            201,
            "Payment processed successfully",
            payment
        )
    );
});
