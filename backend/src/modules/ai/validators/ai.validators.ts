import { z } from 'zod';

export const semanticSearchSchema = z.object({
    body: z.object({
        query: z.string().trim().min(1).max(400),
        filters: z
            .object({
                category: z.string().optional(),
                brand: z.string().optional(),
                colour: z.string().optional(),
                gender: z.enum(['Male', 'Female']).optional(),
                minPrice: z.number().nonnegative().optional(),
                maxPrice: z.number().nonnegative().optional(),
                inStock: z.boolean().optional(),
            })
            .optional(),
        limit: z.number().int().min(1).max(50).optional(),
    }),
});

export type SemanticSearchBody = z.infer<typeof semanticSearchSchema>['body'];

const HOME_SECTIONS = [
    'recommended_for_you',
    'continue_shopping',
    'frequently_bought_together',
    'customers_also_bought',
    'trending',
    'recently_viewed',
    'based_on_your_style',
    'new_arrivals',
] as const;

export const recommendSchema = z.object({
    body: z.object({
        section: z.enum(HOME_SECTIONS).optional(),
        context: z.record(z.string(), z.unknown()).optional(),
        limit: z.number().int().min(1).max(50).optional(),
    }),
});

export const rerankSchema = z.object({
    body: z.object({
        productIds: z.array(z.string()).min(1).max(100),
    }),
});

export const trackEventSchema = z.object({
    body: z.object({
        type: z.enum(['view', 'click', 'add_to_cart', 'purchase', 'search']),
        productId: z.string().optional(),
        query: z.string().max(400).optional(),
        sessionId: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
    }),
});

export const chatSchema = z.object({
    body: z.object({
        sessionId: z.string().min(1).max(100),
        message: z.string().min(1).max(2000),
    }),
});

export const extractFiltersSchema = z.object({
    body: z.object({
        query: z.string().trim().min(1).max(400),
    }),
});

export const askSchema = z.object({
    body: z.object({
        question: z.string().trim().min(1).max(800),
        productId: z.string().optional(),
    }),
});

export const compareSchema = z.object({
    body: z.object({
        productIds: z.array(z.string()).min(2).max(5),
    }),
});

export const summarizeReviewsSchema = z.object({
    body: z.object({
        productId: z.string().min(1),
    }),
});
