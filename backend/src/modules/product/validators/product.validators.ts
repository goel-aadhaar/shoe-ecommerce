import { z } from 'zod';

export const createProductSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Product name is required').trim(),
        description: z.string().optional(),
        brand: z.string().optional(),
        price: z.number().positive('Price must be positive'),
        stock: z.number().int().min(0, 'Stock cannot be negative'),
        for: z.enum(['Male', 'Female']),
        color: z.string().optional(),
        category: z.string().optional(),
        attributes: z
            .array(z.enum(['newArrival', 'trending', 'bestSeller', 'onSale']))
            .optional(),
    }),
});

export const updateProductSchema = z.object({
    body: z.object({
        name: z.string().min(1).trim().optional(),
        description: z.string().optional(),
        brand: z.string().optional(),
        price: z.number().positive().optional(),
        stock: z.number().int().min(0).optional(),
        for: z.enum(['Male', 'Female']).optional(),
        color: z.string().optional(),
        category: z.string().optional(),
        attributes: z
            .array(z.enum(['newArrival', 'trending', 'bestSeller', 'onSale']))
            .optional(),
    }),
    params: z.object({
        id: z.string().min(1),
    }),
});
