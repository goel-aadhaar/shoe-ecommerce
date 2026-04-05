import type { Request, Response } from 'express';

import { ApiResponse } from '../../../shared/responses/api-response.builder.js';
import { asyncHandler } from '../../../shared/utils/async-handler.util.js';
import { Cart } from '../repositories/cart.model.js';
import { CartItem } from '../repositories/cart-item.model.js';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId });

    const items = await CartItem.find({ cartId: cart._id }).populate({
        path: 'productId',
        populate: {
            path: 'imageSet',
            model: 'ProductImage',
            select: 'thumbnail',
        },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, 'Cart fetched Successfully', { cart, items }),
        );
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId });

    const { productId, quantity, selectedColor, selectedSize } = req.body ?? {};

    let item = await CartItem.findOne({
        cartId: cart._id,
        productId,
        selectedColor: selectedColor ?? null,
        selectedSize: selectedSize ?? null,
    });

    if (item) {
        item.quantity += quantity || 1;
        await item.save();
    } else {
        item = await CartItem.create({
            cartId: cart._id,
            productId,
            quantity: quantity || 1,
            selectedColor,
            selectedSize,
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, 'Item Added To Cart', item));
});

export const removeFromCart = asyncHandler(
    async (req: Request, res: Response) => {
        const cart = await Cart.findOne({ userId: req.user?._id });
        if (!cart) {
            return res
                .status(404)
                .json(new ApiResponse(404, 'Cart not found', null));
        }

        const item = await CartItem.findOneAndDelete({
            _id: req.params.id,
            cartId: cart._id,
        });
        if (!item) {
            return res
                .status(404)
                .json(
                    new ApiResponse(404, 'Item not found in your cart', null),
                );
        }

        return res
            .status(200)
            .json(new ApiResponse(200, 'Item Removed from the Cart', null));
    },
);

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        return res
            .status(404)
            .json(new ApiResponse(404, 'Cart not found', null));
    }

    await CartItem.deleteMany({ cartId: cart._id });
    return res.status(200).json(
        new ApiResponse(200, 'Cart cleared successfully', {
            cartId: cart._id,
        }),
    );
});
