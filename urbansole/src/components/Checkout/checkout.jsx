// new file: src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router';

const API_BASE_URL = 'https://api-shoe-ecommerce.onrender.com/api/v1';

const Checkout = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const { orderId } = useParams();
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // In a real app, you would fetch the order details by orderId
            
                // const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
                // setOrder(response.data.data);
                
                // Mocking order details for demonstration
                setOrder({ _id: orderId, totalAmount: 188.40 });
            } catch (err) {
                setError('Failed to load order details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handlePayment = async (event) => {
        event.preventDefault();

        if (!stripe || !elements || !order) {
            return;
        }

        setPaymentProcessing(true);
        setPaymentError(null);

        try {
            // Step 1: Create a PaymentIntent on the server
            const { data } = await axios.post(`${API_BASE_URL}/payments/stripe`, {
                orderId: order._id,
                amount: order.totalAmount,
            });

            const clientSecret = data.data.clientSecret;
            const paymentId = data.data.payment.transactionId;

            // Step 2: Confirm the card payment with Stripe using the client secret
            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (error) {
                console.error(error);
                setPaymentError(error.message);
                await axios.post(`${API_BASE_URL}/payments/confirm`, {
                    transactionId: paymentId,
                    status: 'failed',
                });
            } else if (paymentIntent.status === 'succeeded') {
                // Step 3: Confirm the payment status on your server
                await axios.post(`${API_BASE_URL}/payments/confirm`, {
                    transactionId: paymentId,
                    status: 'success',
                });
                alert('Payment successful!');
                navigate(`/order-confirmation/${order._id}`);
            }
        } catch (err) {
            console.error(err);
            setPaymentError('An error occurred during payment.');
        } finally {
            setPaymentProcessing(false);
        }
    };

    if (loading) return <div className="text-center mt-16">Loading order details...</div>;
    if (error) return <div className="text-center text-red-500 mt-16">{error}</div>;

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-6">Checkout</h1>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Order Summary */}
                    <div className="lg:w-1/2">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span>Subtotal</span>
                                <span>₹{(order.totalAmount / 1.08).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span>Tax</span>
                                <span>₹{(order.totalAmount * 0.08 / 1.08).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 text-lg font-bold">
                                <span>Total</span>
                                <span>₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="lg:w-1/2">
                        <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                        <form onSubmit={handlePayment} className="space-y-4">
                            <div className="border border-gray-300 p-4 rounded-lg">
                                <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
                            </div>
                            {paymentError && <div className="text-red-500 text-sm">{paymentError}</div>}
                            <button
                                type="submit"
                                disabled={!stripe || paymentProcessing}
                                className="w-full bg-black text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                {paymentProcessing ? 'Processing...' : `Pay ₹${order.totalAmount.toFixed(2)}`}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;