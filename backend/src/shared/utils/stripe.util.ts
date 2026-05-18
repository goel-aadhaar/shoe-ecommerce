import Stripe from 'stripe';

import { config } from '../../config.js';

let stripeInstance: Stripe | null = null;

export const getStripe = () => {
    if (!stripeInstance) {
        const key = config.stripeSecretKey;
        if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
        // The API version is pinned by the installed stripe SDK release
        // (stable per package version). Network retries + an explicit
        // timeout make transient failures self-healing.
        stripeInstance = new Stripe(key, {
            maxNetworkRetries: 2,
            timeout: 20000,
            typescript: true,
        });
    }
    return stripeInstance;
};
