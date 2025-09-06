import { Order, OrderItem, OrderStatusHistory } from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
    const { items, totalAmount } = req.body;

    const order = await Order.create({ userId: req.user.id, totalAmount });
    await Promise.all(
        items.map(item =>
            OrderItem.create({ ...item, orderId: order._id })
        )
    );

    await OrderStatusHistory.create({ orderId: order._id, status: "pending" });

    res.status(201).json({ success: true, message: "Order created", data: order });
});

export const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ userId: req.user.id });
    res.json({ success: true, data: orders });
});
