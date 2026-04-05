import { Router } from 'express';

import {
    adminMiddleware,
    authMiddleware,
} from '../../../infrastructure/middlewares/auth.middleware.js';
import { validate } from '../../../infrastructure/middlewares/validate.middleware.js';
import { createReviewSchema } from '../../review/validators/review.validators.js';
import {
    addProductImage,
    addReview,
    createProduct,
    deleteProduct,
    getProductById,
    getProductDescriptions,
    getProductReviews,
    getProducts,
    getProductsByAttribute,
    getProductsByBrand,
    getProductsByCategory,
    getProductsByGender,
    getRelatedShoes,
    getSimilarShoes,
    updateProduct,
} from '../services/product.service.js';
import {
    createProductSchema,
    updateProductSchema,
} from '../validators/product.validators.js';

const router = Router();

router.get('/productDescriptions', getProductDescriptions);
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    validate(createProductSchema),
    createProduct,
);
router.get('/', getProducts);
router.get('/filter/attribute', getProductsByAttribute);
router.get('/filter/brand', getProductsByBrand);
router.get('/filter/gender', getProductsByGender);
router.get('/filter/category', getProductsByCategory);
router.get('/filter/related', getRelatedShoes);
router.get('/recommend/:shoe_id', getSimilarShoes);
router.get('/:id', getProductById);
router.put(
    '/:id',
    authMiddleware,
    adminMiddleware,
    validate(updateProductSchema),
    updateProduct,
);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

router.post('/images', authMiddleware, adminMiddleware, addProductImage);

router.post('/reviews', authMiddleware, validate(createReviewSchema), addReview);
router.get('/:id/reviews', getProductReviews);

export default router;
