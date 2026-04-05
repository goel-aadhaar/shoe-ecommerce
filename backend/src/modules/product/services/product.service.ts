import type { Request, Response } from 'express';

import { ApiError } from '../../../shared/errors/api-error.class.js';
import { ApiResponse } from '../../../shared/responses/api-response.builder.js';
import { asyncHandler } from '../../../shared/utils/async-handler.util.js';
import { Category } from '../../category/repositories/category.model.js';
import { CartItem } from '../../cart/repositories/cart-item.model.js';
import { Favourite } from '../../user/repositories/favourite.model.js';
import { ProductImage } from '../../product-image/repositories/product-image.model.js';
import { Review } from '../../review/repositories/review.model.js';
import { Product } from '../repositories/product.model.js';
import { ProductDescription } from '../repositories/product-description.model.js';
import { generateAndStoreEmbedding } from './embedding.service.js';
import {
    getPaginationMeta,
    getPaginationParams,
} from '../../../shared/utils/pagination.util.js';

export const createProduct = asyncHandler(
    async (req: Request, res: Response) => {
        const product = await Product.create(req.body);

        if (req.body?.description) {
            generateAndStoreEmbedding(
                String(product._id),
                req.body.description,
            ).catch(() => undefined);
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, 'Product created successfully', product),
            );
    },
);

export const getSimilarShoes = asyncHandler(
    async (req: Request, res: Response) => {
        const { shoe_id } = req.params;
        const sourceDoc = await ProductDescription.findOne({ shoe_id });
        if (!sourceDoc)
            return res
                .status(404)
                .json(
                    new ApiResponse(
                        404,
                        'Embedding not found for this product',
                        null,
                    ),
                );

        const recommendations = await ProductDescription.aggregate([
            {
                $vectorSearch: {
                    index: 'vector_index',
                    path: 'embedding_description',
                    queryVector: sourceDoc.embedding_description,
                    numCandidates: 50,
                    limit: 6,
                },
            },
            { $match: { shoe_id: { $ne: sourceDoc.shoe_id } } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: 'shoe_id',
                    foreignField: '_id',
                    as: 'fullProductInfo',
                },
            },
            { $unwind: '$fullProductInfo' },
            {
                $project: {
                    _id: '$fullProductInfo._id',
                    name: '$fullProductInfo.name',
                    brand: '$fullProductInfo.brand',
                    for: '$fullProductInfo.for',
                    color: '$fullProductInfo.color',
                    category: '$fullProductInfo.category',
                    rating: '$fullProductInfo.rating',
                    price: '$fullProductInfo.price',
                    image: '$fullProductInfo.image',
                    matchScore: { $meta: 'vectorSearchScore' },
                },
            },
        ]);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    'Similar shoes fetched successfully',
                    recommendations,
                ),
            );
    },
);

export const getProductDescriptions = asyncHandler(
    async (_req: Request, res: Response) => {
        const { page, limit, skip } = getPaginationParams(
            (_req.query as Record<string, unknown>) ?? {},
            { limit: 20, maxLimit: 100 },
        );

        const [items, totalItems] = await Promise.all([
            ProductDescription.find().skip(skip).limit(limit),
            ProductDescription.countDocuments(),
        ]);

        return res.status(200).json(
            new ApiResponse(200, 'Product descriptions fetched successfully', {
                items,
                pagination: getPaginationMeta(page, limit, totalItems),
            }),
        );
    },
);

export const getProducts = asyncHandler(
    async (_req: Request, res: Response) => {
        const { page, limit, skip } = getPaginationParams(
            (_req.query as Record<string, unknown>) ?? {},
            { limit: 12, maxLimit: 60 },
        );

        const [items, totalItems] = await Promise.all([
            Product.find()
                .skip(skip)
                .limit(limit)
                .populate('category')
                .populate('imageSet'),
            Product.countDocuments(),
        ]);

        return res.status(200).json(
            new ApiResponse(200, 'Products fetched successfully', {
                items,
                pagination: getPaginationMeta(page, limit, totalItems),
            }),
        );
    },
);

export const getProductById = asyncHandler(
    async (req: Request, res: Response) => {
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('imageSet');

        if (!product) throw new ApiError(404, 'Product not found');

        return res
            .status(200)
            .json(
                new ApiResponse(200, 'Product fetched successfully', product),
            );
    },
);

export const getProductsByAttribute = asyncHandler(
    async (req: Request, res: Response) => {
        const attribute = (req.query.attribute as string) || 'trending';
        const max = Number(req.query.limit) || 10;

        const products = await Product.find({ attributes: attribute })
            .limit(max)
            .populate('category')
            .populate({ path: 'imageSet', select: 'thumbnail hover' });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    `Products with attribute '${attribute}' fetched successfully`,
                    products,
                ),
            );
    },
);

export const getProductsByBrand = asyncHandler(
    async (req: Request, res: Response) => {
        const brand = (req.query.brand as string) || 'Puma';
        const max = Number(req.query.limit) || 10;

        const products = await Product.find({ brand })
            .limit(max)
            .populate('category')
            .populate({ path: 'imageSet', select: 'thumbnail hover' });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    `Products with brand '${brand}' fetched successfully`,
                    products,
                ),
            );
    },
);

export const getRelatedShoes = asyncHandler(
    async (req: Request, res: Response) => {
        const gender = (req.query.gender as string) || 'Male';
        const price = Number(req.query.price) || 10000;
        const categoryName = (req.query.category as string) || 'shoes';

        const categoryDoc = await Category.findOne({ name: categoryName });
        if (!categoryDoc)
            return res
                .status(404)
                .json(new ApiResponse(404, 'Category not found', null));

        const product = await Product.find({
            for: gender,
            price: { $gte: price - 1000, $lte: price + 1000 },
            category: categoryDoc._id,
        })
            .limit(4)
            .populate('imageSet', 'thumbnail hover');

        return res
            .status(200)
            .json(new ApiResponse(200, 'Shoes fetched successfully', product));
    },
);

export const getProductsByGender = asyncHandler(
    async (req: Request, res: Response) => {
        const gender = (req.query.gender as string) || 'Male';
        const max = Number(req.query.limit) || 10;

        const products = await Product.find({ for: gender })
            .limit(max)
            .populate('category')
            .populate({ path: 'imageSet', select: 'thumbnail hover' });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    `Products for gender '${gender}' fetched successfully`,
                    products,
                ),
            );
    },
);

export const getProductsByCategory = asyncHandler(
    async (req: Request, res: Response) => {
        const categoryName = (req.query.category as string) || 'shoes';
        const max = Number(req.query.limit) || 10;

        const categoryDoc = await Category.findOne({ name: categoryName });
        if (!categoryDoc)
            return res
                .status(404)
                .json(
                    new ApiResponse(
                        404,
                        `Category '${categoryName}' not found`,
                        null,
                    ),
                );

        const products = await Product.find({
            category: categoryDoc._id,
        })
            .limit(max)
            .populate({ path: 'imageSet', select: 'thumbnail hover' });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    `Products in category '${categoryName}' fetched successfully`,
                    products,
                ),
            );
    },
);

export const updateProduct = asyncHandler(
    async (req: Request, res: Response) => {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true },
        );

        if (!product) throw new ApiError(404, 'Product not found');

        return res
            .status(200)
            .json(
                new ApiResponse(200, 'Product updated successfully', product),
            );
    },
);

export const deleteProduct = asyncHandler(
    async (req: Request, res: Response) => {
        const productId = req.params.id;
        const product = await Product.findByIdAndDelete(productId);

        if (!product) throw new ApiError(404, 'Product not found');

        // Cascade delete related documents (preserve OrderItems for history)
        await Promise.all([
            ProductImage.deleteMany({ productId }),
            ProductDescription.deleteMany({ shoe_id: productId }),
            Review.deleteMany({ productId }),
            CartItem.deleteMany({ productId }),
            Favourite.deleteMany({ productId }),
        ]);

        return res
            .status(200)
            .json(new ApiResponse(200, 'Product deleted successfully', null));
    },
);

export const addProductImage = asyncHandler(
    async (req: Request, res: Response) => {
        const image = await ProductImage.create(req.body);
        return res
            .status(201)
            .json(
                new ApiResponse(201, 'Product image added successfully', image),
            );
    },
);

export const addReview = asyncHandler(async (req: Request, res: Response) => {
    const review = await Review.create({
        userId: req.user?._id,
        productId: req.body?.productId,
        rating: req.body?.rating,
        reviewText: req.body?.reviewText,
    });
    return res
        .status(201)
        .json(new ApiResponse(201, 'Review added successfully', review));
});

export const getProductReviews = asyncHandler(
    async (req: Request, res: Response) => {
        const reviews = await Review.find({
            productId: req.params.id,
        }).populate('userId');

        const avgRating =
            reviews.length > 0
                ? (
                      reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0) /
                      reviews.length
                  ).toFixed(1)
                : '0';

        return res.status(200).json(
            new ApiResponse(200, 'Product reviews fetched successfully', {
                avgRating,
                count: reviews.length,
                reviews,
            }),
        );
    },
);
