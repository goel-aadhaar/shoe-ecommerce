import { Order, OrderItem, OrderStatusHistory } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendOrderEmail } from "../utils/email.js";
import { ApiResponse } from "../utils/ApiResponse.js"; // This import was missing

export const createOrder = asyncHandler(async (req, res) => {
    const { items, totalAmount } = req.body;

    const order = await Order.create({
        userId: req.user.id,
        totalAmount,
    });

    const orderItems = await Promise.all(
        items.map((item) =>
            OrderItem.create({ ...item, orderId: order._id })
        )
    );

    await OrderStatusHistory.create({
        orderId: order._id,
        status: "pending",
    });

    // Fetch the full product details for each item before sending the email
    const populatedOrderItems = await OrderItem.find({ orderId: order._id }).populate({
        path: 'productId',
        select: 'name brand price' // Select the fields you need for the email
    });

    const fullOrder = {
        _id: order._id,
        items: populatedOrderItems,
        totalAmount,
    };

    await sendOrderEmail(req.user.email, fullOrder);

    res.status(201).json(
        new ApiResponse(201, "Order created successfully", {
            order,
            items: populatedOrderItems,
        })
    );
});

export const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ userId: req.user.id });
    res.status(200).json(
        new ApiResponse(
            200,
            "Orders fetched successfully",
            orders
        )
    );
});