import type { Request, Response } from 'express';
import mongoose from 'mongoose';

import { ApiError } from '../../../shared/errors/api-error.class.js';
import { ApiResponse } from '../../../shared/responses/api-response.builder.js';
import { asyncHandler } from '../../../shared/utils/async-handler.util.js';
import {
    getPaginationMeta,
    getPaginationParams,
} from '../../../shared/utils/pagination.util.js';
import { Product } from '../../product/repositories/product.model.js';
import { Order } from '../repositories/order.model.js';
import { OrderItem } from '../repositories/order-item.model.js';
import { OrderStatusHistory } from '../repositories/order-status-history.model.js';

interface OrderItemInput {
    productId: string;
    quantity: number;
    price: number;
    selectedColor?: string;
    selectedSize?: string;
}

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
    const { items, totalAmount } = req.body ?? {};
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Validate stock
        for (const item of (items ?? []) as OrderItemInput[]) {
            const product = await Product.findById(item.productId).session(
                session,
            );
            if (!product) {
                throw new ApiError(
                    400,
                    `Product ${item.productId} not found`,
                );
            }
            if (product.stock < item.quantity) {
                throw new ApiError(
                    400,
                    `Insufficient stock for ${product.name}`,
                );
            }
        }

        const orders = await Order.create(
            [{ userId: req.user?._id, totalAmount }],
            { session },
        );
        const order = orders[0]!;

        // Create order items and decrement stock
        for (const item of (items ?? []) as OrderItemInput[]) {
            await OrderItem.create(
                [{ ...item, orderId: order._id }],
                { session },
            );
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } },
                { session },
            );
        }

        await OrderStatusHistory.create(
            [{ orderId: order._id, status: 'pending' }],
            { session },
        );

        await session.commitTransaction();

        const populatedOrderItems = await OrderItem.find({
            orderId: order._id,
        }).populate({
            path: 'productId',
            select: 'name brand price',
        });

        res.status(201).json(
            new ApiResponse(201, 'Order created successfully', {
                order,
                items: populatedOrderItems,
            }),
        );
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = getPaginationParams(
        (req.query as Record<string, unknown>) ?? {},
        { limit: 10, maxLimit: 50 },
    );

    const filter = { userId: req.user?._id };
    const [items, totalItems] = await Promise.all([
        Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Order.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, 'Orders fetched successfully', {
            items,
            pagination: getPaginationMeta(page, limit, totalItems),
        }),
    );
});
