
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
// css pending....

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useContext(AuthContext);

    const fetchCartItems = async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const config = {
                headers: { 'x-auth-token': token },
            };
            const res = await axios.get('/api/cart', config);
            setCartItems(res.data);
        } catch (err) {
            setError('Failed to fetch cart. Please try again.');
            console.error(err.response.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItems();
    },);  //  dependency might be : [token]

    const handleRemoveItem = async (cartItemId) => {
        try {
            const config = {
                headers: { 'x-auth-token': token },
            };
            await axios.delete(`/api/cart/${cartItemId}`, config);
            setCartItems(cartItems.filter(item => item._id !== cartItemId));
        } catch (err) {
            setError('Failed to remove item.');
            console.error(err.response.data);
        }
    };
    
    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
    };

    if (loading) {
        return <p>Loading cart...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (cartItems.length === 0) {
        return <p>Your cart is empty. Start shopping! 🛒</p>;
    }

    return (
        <div className="cart-container">
            <h2>Your Shopping Cart</h2>
            <div className="cart-items-list">
                {cartItems.map((item) => (
                    <div key={item._id} className="cart-item">
                        {item.productId.imgSrc && (
                            <img src={item.productId.imgSrc} alt={item.productId.name} className="item-image" />
                        )}
                        <div className="item-details">
                            <h3>{item.productId.name}</h3>
                            <p className="brand">{item.productId.brand}</p>
                            <p>Color: {item.selectedColor}</p>
                            <p>Size: {item.selectedSize}</p>
                            <p className="price">₹{item.price}</p>
                            <p>Quantity: {item.quantity}</p>
                            <button onClick={() => handleRemoveItem(item._id)}>Remove</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="cart-summary">
                <h3>Subtotal: ₹{calculateSubtotal()}</h3>
                <button className="checkout-button">Proceed to Checkout</button>
            </div>
        </div>
    );
};

export default Cart;