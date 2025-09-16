import { Cart, CartItem } from "../models/model-export.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCart = asyncHandler(async (req, res) => {
    console.log("Request for getCart");
    
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
        cart = await Cart.create({ userId: req.user.id });
    }
   const items = await CartItem.find({ cartId: cart._id })
        .populate({
            path: "productId",          
            populate: {
                path: "imageSet",           
                model: "ProductImage",
                select: "thumbnail"
            }
        });
    res.status(200)
    .json(
        new ApiResponse(
            200, 
            "Cart fetched Successfully",
            {cart , items}
        )
    )
});

export const addToCart = asyncHandler(async (req, res) => {
    console.log('request for add to cart..');
    
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
            quantity:  req.body.quantity || 1,
        });
    }
    res.status(200)
    .json(
        new ApiResponse(
            200,
            "Item Added To Cart",
            item
        )
    )
});

export const removeFromCart = asyncHandler(async (req, res) => {
    console.log('request for removing from the cart.... ');
    await CartItem.findByIdAndDelete(req.params.id);
    res.status(200)
    .json(
        new ApiResponse(
            200,
            "Item Removed from the Cart",
            null
        )
    )
});

export const clearCart = asyncHandler(async (req, res) => {
    console.log("Request for clearCart for : ", req.user);
    console.log("Request for clearCart for the user with id : ", req.user.id);

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
        return res.status(404).json(
            new ApiResponse(404, "Cart not found", null)
        );
    }

    await CartItem.deleteMany({ cartId: cart._id });

    res.status(200).json(
        new ApiResponse(
            200,
            "Cart cleared successfully",
            { cartId: cart._id }
        )
    );
});


