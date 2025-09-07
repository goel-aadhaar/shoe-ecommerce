import { Cart, CartItem } from "../models/model-export.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
        cart = await Cart.create({ userId: req.user.id });
    }
    const items = await CartItem.find({ cartId: cart._id }).populate("productId");
    res.json({ success: true, data: { cart, items } });
});

export const addToCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = await Cart.create({ userId: req.user.id });

    let item = await CartItem.findOne({ cartId: cart._id, productId: req.body.productId });
    if (item) {
        item.quantity += req.body.quantity || 1;
        await item.save();
    } else {
        item = await CartItem.create({
            cartId: cart._id,
            productId: req.body.productId,
            quantity: req.body.quantity || 1,
        });
    }
    res.status(201).json({ success: true, message: "Item added to cart", data: item });
});

export const removeFromCart = asyncHandler(async (req, res) => {
    await CartItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Item removed from cart" });
});
