import { z } from 'zod';

export const addToCartSchema = z.object({
    body: z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().optional(),
        selectedColor: z.string().optional(),
        selectedSize: z.string().optional(),
    }),
    query: z.any().optional(),
    params: z.any().optional(),
});
