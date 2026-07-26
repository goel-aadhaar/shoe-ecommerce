import { Router } from 'express';

import aiRoutes from './modules/ai/routes/ai.routes.js';
import authRoutes from './modules/auth/routes/auth.routes.js';
import cartRoutes from './modules/cart/routes/cart.routes.js';
import categoryRoutes from './modules/category/routes/category.routes.js';
import orderRoutes from './modules/order/routes/order.routes.js';
import paymentRoutes from './modules/payment/routes/payment.routes.js';
import productRoutes from './modules/product/routes/product.routes.js';
import productImageRoutes from './modules/product-image/routes/product-image.routes.js';
import reviewRoutes from './modules/review/routes/review.routes.js';
import userRoutes from './modules/user/routes/user.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/product-images', productImageRoutes);
router.use('/ai', aiRoutes);

export default router;
