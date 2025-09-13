import { Order, OrderItem, OrderStatusHistory } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendOrderEmail } from "../utils/email.js";

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

    const fullOrder = {
        _id: order._id,
        items: orderItems,
        totalAmount,
    };

    await sendOrderEmail(req.user.email, fullOrder);

    res.status(201).json(
        new ApiResponse(201, "Order created successfully", {
            order,
            items: orderItems,
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
