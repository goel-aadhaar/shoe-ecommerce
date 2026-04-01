'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Minus, X, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CartItem } from '@/types';
import { formatPrice } from '@/utils';

axios.defaults.withCredentials = true;

interface CartItemWithProduct {
  product: {
    _id: string;
    name: string;
    brand: string;
    price: number;
    mainImage: string;
  };
  quantity: number;
  color: string;
  size: string;
}

const dummyCartItems: CartItemWithProduct[] = [
  {
    product: {
      _id: 'prod_1',
      name: 'Air Max 90',
      brand: 'Nike',
      price: 130.00,
      mainImage: 'https://placehold.co/112x112/E5E7EB/4B5563?text=Air+Max',
    },
    quantity: 1,
    color: 'White/Black',
    size: '10',
  }
];

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>(dummyCartItems); 
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const updateQuantity = async (itemId: string, newQuantity: number): Promise<void> => {
    if (newQuantity < 1) return;
    
    setLoading(true);
    try {
      // API call to update quantity
      // await axios.put(`/api/cart/${itemId}`, { quantity: newQuantity });
      
      // For now, update local state
      setCartItems(prev => 
        prev.map(item => 
          item.product._id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (err) {
      setError('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string): Promise<void> => {
    setLoading(true);
    try {
      // API call to remove item
      // await axios.delete(`/api/cart/${itemId}`);
      
      // For now, update local state
      setCartItems(prev => prev.filter(item => item.product._id !== itemId));
    } catch (err) {
      setError('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = (): number => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateTax = (): number => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = (): number => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = (): void => {
    router.push('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {cartItems.map((item) => (
              <div key={item.product._id} className="flex items-center space-x-4 mb-6 pb-6 border-b last:border-b-0">
                <img 
                  src={item.product.mainImage} 
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.product.name}</h3>
                  <p className="text-gray-600">{item.product.brand}</p>
                  <p className="text-sm text-gray-500">Color: {item.color} | Size: {item.size}</p>
                  <p className="font-bold mt-2">{formatPrice(item.product.price)}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    disabled={loading}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    disabled={loading}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <button
                  onClick={() => removeItem(item.product._id)}
                  disabled={loading}
                  className="p-2 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPrice(calculateTax())}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Proceed to Checkout
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full mt-2 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
