import { type GenerativeModel,GoogleGenerativeAI } from '@google/generative-ai';

import { config } from '../../../config.js';
import { ProductDescription } from '../repositories/product-description.model.js';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

export async function generateAndStoreEmbedding(
    shoeId: string,
    descriptionText: string,
) {
    if (!genAI) {
        if (!config.geminiApiKey) {
            throw new Error(
                'GEMINI_API_KEY is missing from environment variables',
            );
        }
        genAI = new GoogleGenerativeAI(config.geminiApiKey);
        model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    }

    try {
        const result = await model!.embedContent(descriptionText);
        const vector = result.embedding.values as number[];

        const savedDoc = await ProductDescription.findOneAndUpdate(
            { shoe_id: shoeId },
            {
                shoe_id: shoeId,
                description: descriptionText,
                embedding_description: vector,
            },
            { upsert: true, new: true },
        );

        return savedDoc;
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : String(error);
        if (message.includes('429')) {
            await new Promise((r) => setTimeout(r, 10000));
        }
    }

    return undefined;
}
