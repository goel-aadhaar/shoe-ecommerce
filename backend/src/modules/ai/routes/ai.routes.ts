import { Router } from 'express';

import {
    adminMiddleware,
    authMiddleware,
    optionalAuthMiddleware,
} from '../../../infrastructure/middlewares/auth.middleware.js';
import { validate } from '../../../infrastructure/middlewares/validate.middleware.js';
import {
    analyticsSummary,
    ask,
    chat,
    compareProducts,
    extractFilters,
    getBundles,
    getHome,
    getRecommendations,
    rerankProducts,
    semanticSearch,
    similarProducts,
    summarizeReviews,
    trackEvent,
} from '../services/ai.service.js';
import {
    askSchema,
    chatSchema,
    compareSchema,
    extractFiltersSchema,
    recommendSchema,
    rerankSchema,
    semanticSearchSchema,
    summarizeReviewsSchema,
    trackEventSchema,
} from '../validators/ai.validators.js';

const router = Router();

// Optional auth: a logged-in user gets personalized results; guests still work.
router.post(
    '/semantic-search',
    optionalAuthMiddleware,
    validate(semanticSearchSchema),
    semanticSearch,
);
router.get('/similar/:productId', similarProducts);

// Recommendations & personalization
router.post(
    '/recommend',
    optionalAuthMiddleware,
    validate(recommendSchema),
    getRecommendations,
);
router.get('/home', optionalAuthMiddleware, getHome);
router.get('/bundles/:productId', getBundles);
router.post('/rerank', optionalAuthMiddleware, validate(rerankSchema), rerankProducts);

// Conversational copilot
router.post('/chat', optionalAuthMiddleware, validate(chatSchema), chat);
router.post(
    '/extract-filters',
    optionalAuthMiddleware,
    validate(extractFiltersSchema),
    extractFilters,
);

// Knowledge, comparison, and review summarization
router.post('/ask', optionalAuthMiddleware, validate(askSchema), ask);
router.post(
    '/compare-products',
    optionalAuthMiddleware,
    validate(compareSchema),
    compareProducts,
);
router.post(
    '/summarize-reviews',
    optionalAuthMiddleware,
    validate(summarizeReviewsSchema),
    summarizeReviews,
);

// Behavioural event ingestion (feeds the recommenders & analytics)
router.post('/events', optionalAuthMiddleware, validate(trackEventSchema), trackEvent);

// Analytics dashboard — admin only (business metrics are not public).
router.get('/analytics/summary', authMiddleware, adminMiddleware, analyticsSummary);

export default router;
