import type { Request, Response } from 'express';

import { ApiResponse } from '../../../shared/responses/api-response.builder.js';
import { asyncHandler } from '../../../shared/utils/async-handler.util.js';
import { Product } from '../../product/repositories/product.model.js';
import { callAiService } from '../ai.client.js';
import type { SemanticSearchBody } from '../validators/ai.validators.js';

interface AiScoredResult {
    id: string;
    score: number;
    reason?: string | null;
}

interface AiSearchResponse {
    query: string;
    results: AiScoredResult[];
    count: number;
}

/**
 * The catalog holds two document shapes: the one this Mongoose model declares
 * (`rating`, `ratedBy`, `attributes[]`) and the one the CSV importer actually
 * wrote (`averageRating`, `totalReviews`, `isTrending`/`isNewArrival` booleans).
 *
 * `.lean()` skips Mongoose schema defaults, so an imported doc reaches the UI
 * with `attributes === undefined` — and `ProductCard` calls
 * `product.attributes.includes(...)` unconditionally. Normalising here keeps
 * every AI-sourced product identical in shape to the rest of the storefront,
 * and makes the Sale/New badges reflect the boolean flags.
 */
type RawProductDoc = Record<string, unknown> & { _id: unknown };

function normalizeProduct(doc: RawProductDoc) {
    const attributes = new Set<string>(
        Array.isArray(doc.attributes) ? (doc.attributes as string[]) : [],
    );
    if (doc.isTrending) attributes.add('trending');
    if (doc.isNewArrival) attributes.add('newArrival');
    if (doc.isFeatured) attributes.add('bestSeller');
    if (doc.isOnSale) attributes.add('onSale');

    return {
        ...doc,
        attributes: [...attributes],
        rating: doc.rating ?? doc.averageRating ?? 0,
        ratedBy: doc.ratedBy ?? doc.totalReviews ?? 0,
        price: doc.price ?? 0,
        images: Array.isArray(doc.images) ? doc.images : [],
        colors: Array.isArray(doc.colors) ? doc.colors : [],
        sizes: Array.isArray(doc.sizes) ? doc.sizes : [],
    };
}

/**
 * Hydrate the AI service's ranked, lightweight hits into full product documents
 * (with images), preserving the semantic ranking order and attaching the score
 * and the "why" so the storefront can render its normal product cards.
 */
async function hydrateRanked(results: AiScoredResult[]) {
    const ids = results.map((r) => r.id);
    if (ids.length === 0) return [];

    const docs = await Product.find({ _id: { $in: ids } })
        .populate('imageSet')
        .lean();

    const byId = new Map(docs.map((d) => [String(d._id), d as RawProductDoc]));
    return results
        .map((r) => {
            const doc = byId.get(r.id);
            if (!doc) return null;
            return { ...normalizeProduct(doc), _score: r.score, _reason: r.reason ?? null };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
}

export const semanticSearch = asyncHandler(
    async (req: Request, res: Response) => {
        const { query, filters, limit } = req.body as SemanticSearchBody;

        const ai = await callAiService<AiSearchResponse>('/v1/semantic-search', {
            query,
            filters,
            userId: req.user?._id ? String(req.user._id) : undefined,
            limit: limit ?? 12,
        });

        const results = await hydrateRanked(ai.results);

        return res.status(200).json(
            new ApiResponse(200, 'Semantic search results', {
                query: ai.query,
                count: results.length,
                results,
            }),
        );
    },
);

export const similarProducts = asyncHandler(
    async (req: Request, res: Response) => {
        const { productId } = req.params;

        const ai = await callAiService<AiSearchResponse>('/v1/similar-products', {
            productId,
            limit: 8,
        });

        const results = await hydrateRanked(ai.results);

        return res
            .status(200)
            .json(new ApiResponse(200, 'Similar products', { productId, results }));
    },
);

function userIdOf(req: Request): string | undefined {
    return req.user?._id ? String(req.user._id) : undefined;
}

/**
 * Generation-backed endpoints need a much larger budget than plain proxying:
 * the reasoning model emits hidden thinking tokens, then a tool call, then a
 * final answer. Must stay below the browser client's own timeout.
 */
const LLM_TIMEOUT_MS = 75000;

export const getRecommendations = asyncHandler(
    async (req: Request, res: Response) => {
        const { section, limit, context } = req.body as {
            section?: string;
            limit?: number;
            context?: Record<string, unknown>;
        };
        const ai = await callAiService<{
            section: string;
            items: AiScoredResult[];
            modelVersion: string;
        }>('/v1/recommend', {
            userId: userIdOf(req),
            section: section ?? 'recommended_for_you',
            context: context ?? {},
            limit: limit ?? 12,
        });
        const items = await hydrateRanked(ai.items);
        return res.status(200).json(
            new ApiResponse(200, 'Recommendations', {
                section: ai.section,
                modelVersion: ai.modelVersion,
                items,
            }),
        );
    },
);

export const getHome = asyncHandler(async (req: Request, res: Response) => {
    const userId = userIdOf(req) ?? 'anon';
    const ai = await callAiService<{
        sections: Array<{ section: string; title: string; items: AiScoredResult[] }>;
    }>(`/v1/home/${userId}`, undefined, { method: 'GET' });

    const sections = await Promise.all(
        ai.sections.map(async (s) => ({
            section: s.section,
            title: s.title,
            items: await hydrateRanked(s.items),
        })),
    );
    return res
        .status(200)
        .json(new ApiResponse(200, 'Personalized homepage', { sections }));
});

export const getBundles = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const ai = await callAiService<{
        anchorProductId: string;
        complements: AiScoredResult[];
    }>('/v1/bundles', { productId, limit: 6 });

    const complements = await hydrateRanked(ai.complements);
    return res
        .status(200)
        .json(new ApiResponse(200, 'Frequently bought together', { productId, complements }));
});

export const rerankProducts = asyncHandler(async (req: Request, res: Response) => {
    const { productIds } = req.body as { productIds: string[] };
    const ai = await callAiService<{ items: AiScoredResult[] }>('/v1/rerank', {
        userId: userIdOf(req),
        productIds,
    });
    const items = await hydrateRanked(ai.items);
    return res.status(200).json(new ApiResponse(200, 'Reranked', { items }));
});

export const trackEvent = asyncHandler(async (req: Request, res: Response) => {
    const { type, productId, query, sessionId, metadata } = req.body as {
        type: string;
        productId?: string;
        query?: string;
        sessionId?: string;
        metadata?: Record<string, unknown>;
    };
    // Fire-and-forget: analytics must never block or fail the user's action.
    await callAiService(
        '/v1/events',
        { userId: userIdOf(req), sessionId, type, productId, query, metadata: metadata ?? {} },
        { timeoutMs: 5000 },
    ).catch(() => undefined);

    return res.status(202).json(new ApiResponse(202, 'Event accepted', { accepted: true }));
});

interface AiChatResponse {
    reply: string;
    products: AiScoredResult[];
    why: string[];
    followUp: string | null;
    sessionId: string;
}

export const chat = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId, message } = req.body as { sessionId: string; message: string };
    const userId = userIdOf(req);

    // Namespace the client-supplied sessionId with the server-derived identity.
    // Without this, anyone who guesses or replays another user's sessionId
    // inherits their conversation history and remembered preferences.
    const scopedSessionId = `${userId ?? 'guest'}:${sessionId}`;

    const ai = await callAiService<AiChatResponse>(
        '/v1/chat',
        { sessionId: scopedSessionId, userId, message },
        // A copilot turn is multiple model round-trips; the default 20s budget
        // aborts it mid-answer.
        { timeoutMs: LLM_TIMEOUT_MS },
    );

    // Hydrate the AI's product refs into full product documents so the frontend
    // can render them with your existing product cards, preserving rank order.
    const hydrated = await hydrateRanked(ai.products);

    return res.status(200).json(
        new ApiResponse(200, 'Chat reply', {
            reply: ai.reply,
            products: hydrated,
            why: ai.why,
            followUp: ai.followUp,
            // Echo the client's own id back; the scoping prefix is internal.
            sessionId,
        }),
    );
});

export const extractFilters = asyncHandler(
    async (req: Request, res: Response) => {
        const { query } = req.body as { query: string };
        const ai = await callAiService<{
            category?: string;
            brand?: string;
            colour?: string;
            gender?: string;
            minPrice?: number;
            maxPrice?: number;
            size?: string;
            keywords: string[];
        }>('/v1/extract-filters', { query });
        return res.status(200).json(new ApiResponse(200, 'Extracted filters', ai));
    },
);

interface AiAskResponse {
    answer: string;
    citations: Array<{ source: string; title: string | null; productId: string | null }>;
    grounded: boolean;
}

export const ask = asyncHandler(async (req: Request, res: Response) => {
    const { question, productId } = req.body as { question: string; productId?: string };
    const ai = await callAiService<AiAskResponse>(
        '/v1/ask',
        { question, productId },
        { timeoutMs: LLM_TIMEOUT_MS },
    );
    return res.status(200).json(new ApiResponse(200, 'Answer', ai));
});

interface AiCompareFacet {
    productId: string;
    pros: string[];
    cons: string[];
    comfort?: string;
    durability?: string;
    valueForMoney?: string;
    bestFor?: string;
}
interface AiCompareResponse {
    products: AiScoredResult[];
    facets: AiCompareFacet[];
    recommendation: string;
}

export const compareProducts = asyncHandler(async (req: Request, res: Response) => {
    const { productIds } = req.body as { productIds: string[] };
    const ai = await callAiService<AiCompareResponse>(
        '/v1/compare-products',
        { productIds },
        { timeoutMs: LLM_TIMEOUT_MS },
    );
    const hydrated = await hydrateRanked(ai.products);
    return res.status(200).json(
        new ApiResponse(200, 'Comparison', {
            products: hydrated,
            facets: ai.facets,
            recommendation: ai.recommendation,
        }),
    );
});

interface AiReviewSummary {
    productId: string;
    lovedFeatures: string[];
    commonComplaints: string[];
    overallSentiment: string;
    shouldYouBuy: string;
    reviewsAnalyzed: number;
}

export const summarizeReviews = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.body as { productId: string };
    const ai = await callAiService<AiReviewSummary>(
        '/v1/summarize-reviews',
        { productId },
        { timeoutMs: LLM_TIMEOUT_MS },
    );
    return res.status(200).json(new ApiResponse(200, 'Review summary', ai));
});

export const analyticsSummary = asyncHandler(
    async (req: Request, res: Response) => {
        const days = Number(req.query.days ?? 30);
        const ai = await callAiService<unknown>(
            `/v1/analytics/summary?days=${days}`,
            undefined,
            { method: 'GET', timeoutMs: 30000 },
        );
        return res.status(200).json(new ApiResponse(200, 'Analytics summary', ai));
    },
);
