import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_KEY, {
    apiVersion: "2023-10-16",
});

// Mock or real stripe payment intent creation
export const createStripePayment = async (amount, currency = "usd") => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method_types: ["card"],
        });
        return paymentIntent;
    } catch (error) {
        throw new Error(error.message);
    }
};
