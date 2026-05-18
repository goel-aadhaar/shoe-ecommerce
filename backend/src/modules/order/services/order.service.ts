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
    const { items } = req.body ?? {};
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Prices and the order total are computed server-side from the
        // database — never trusted from the client.
        const pricedItems: (OrderItemInput & { price: number })[] = [];
        let computedTotal = 0;

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

            // Atomically decrement stock only if enough is available.
            // Guards against oversell under concurrent checkouts.
            const updated = await Product.updateOne(
                { _id: item.productId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { session },
            );
            if (updated.modifiedCount !== 1) {
                throw new ApiError(
                    400,
                    `Insufficient stock for ${product.name}`,
                );
            }

            const price = product.price;
            computedTotal += price * item.quantity;
            pricedItems.push({ ...item, price });
        }

        const orders = await Order.create(
            [{ userId: req.user?._id, totalAmount: computedTotal }],
            { session },
        );
        const order = orders[0]!;

        for (const item of pricedItems) {
            await OrderItem.create(
                [
                    {
                        orderId: order._id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        selectedColor: item.selectedColor,
                        selectedSize: item.selectedSize,
                    },
                ],
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
