import Stripe from "stripe";

let stripeInstance = null;

export const getStripe = () => {
    if (!stripeInstance) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            throw new Error('STRIPE_SECRET_KEY is not set');
        }
        stripeInstance = new Stripe(key, {
            apiVersion: "2023-10-16",
        });
    }
    return stripeInstance;
};

// Remove the immediate export
// export const stripe = getStripe();
