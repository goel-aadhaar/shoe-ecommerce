import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Minus, X, Volume2, Trash } from 'lucide-react';
// import { useNavigate } from 'react-router'

axios.defaults.withCredentials = true;

const dummyCartItems = [
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

const CartPage = () => {
  const [cartItems, setCartItems] = useState(dummyCartItems); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const navigate = useNavigate();

  function getRandomSize() {
    return Math.floor(Math.random() * (5)) + 6;
 }

  const API_BASE_URL = 'https://api-shoe-ecommerce.onrender.com/api/v1';

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/cart`);
      setCartItems(response.data.data.items); 
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Could not load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCart();
  }, []);

  if(loading){
    // shimmer
    // return(
    //     <p>Loading.......</p>
    // );
  }




    const handleUpdateQuantity = async (itemId, productId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            // Since backend addToCart increments, we need to call it properly
            await axios.post(`${API_BASE_URL}/cart`, { productId, quantity: newQuantity }, { withCredentials: true });

            setCartItems(cartItems.map(item =>
            item._id === itemId ? { ...item, quantity: newQuantity } : item
            ));
        } catch (err) {
            console.error('Failed to update quantity:', err);
            setError('Failed to update item quantity.');
        }
    };


    const handleRemoveItem = async (itemId) => {
        try {
            await axios.delete(`${API_BASE_URL}/cart/${itemId}`);
            setCartItems(cartItems.filter(item => item._id !== itemId));
        } catch (err) {
            console.error('Failed to remove item:', err);
            setError('Failed to remove item from cart.');
        }
    };

    const handleCheckout = async () => {
      try {
        const items = cartItems.map(item => ({
          productId: item?.productId?._id,
          quantity: item?.quantity,
          price: item?.productId?.price,
          selectedColor: item?.selectedColor,
          selectedSize: item?.selectedSize
        }));

        const response = await axios.post(`${API_BASE_URL}/orders`, {
          items,
          totalAmount: total.toFixed(2),
        });

        const newOrder = response.data.data.order;
        console.log("Order created successfully:", newOrder);
        
        // Redirect to the new checkout page with the order ID
        // navigate(`/checkout/${newOrder._id}`);
        
      } catch (err) {
        console.error("Checkout failed:", err);
        setError("Checkout failed. Please try again.");
      }
    };


  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item?.productId?.price * item?.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = 50;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-white text-black min-h-screen font-sans mt-16 px-16">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-5">MY SHOPPING BAG</h1>
        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8">
          
          {/* Cart Items Section */}
          <div className="flex-1 max-h-[500px] px-2 overflow-y-auto">
            {loading && <div className="text-center text-gray-500 py-12">Loading cart...</div>}
            {error && <div className="text-center text-red-500 py-12">{error}</div>}
            {!loading && !error && cartItems.length === 0 && (
              <div className="text-center text-gray-500 py-12">Your shopping bag is empty.</div>
            )}
            
            {!loading && !error && cartItems.map(item => (
                <div key={item._id} className="flex items-start py-8 border-b border-gray-200 last:border-b-0">
                    <div className="w-28 h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                    {console.log("Product " , item?.productId)}
                    <img 
                        src={item?.productId?.imageSet?.thumbnail} 
                        alt={item?.productId?.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/112x112/E5E7EB/4B5563?text=No+Image"; }}
                    />
                    <button 
                        onClick={() => handleRemoveItem(item._id)}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-400 hover:text-gray-800 transition-colors">
                        <X size={16} />
                    </button>
                    </div>

                    <div className="flex-1 ml-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">{item?.productId?.name}</h3>
                        <p className="text-sm text-gray-500">Brand: {item?.productId?.brand}</p>
                        <p className="text-sm text-gray-500 mt-1">
                        Color: {item?.selectedColor || 'Black/White'} | Size: {getRandomSize() || 'N/A'}
                        </p>
                    </div>

                    <div className="flex items-center mt-4 text-gray-600">
                        <span className="text-sm font-medium mr-4">QTY:</span>
                        <button 
                        onClick={() => handleUpdateQuantity(item?._id, item?.productId?._id, item?.quantity - 1)}
                        className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
                        <Minus size={16} />
                        </button>
                        <span className="mx-4 text-lg font-semibold text-black">{item.quantity}</span>
                        <button 
                        onClick={() => handleUpdateQuantity(item?._id, item?.productId._id, item?.quantity + 1)}
                        className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
                        <Plus size={16} />
                        </button>

                        <button 
                        onClick={() => handleRemoveItem(item?._id)} 
                        className="flex items-center ml-10 text-red-600 hover:text-red-800 transition-colors"
                        >
                        <Trash size={16} className="mr-2" />
                        Remove
                        </button>
                    </div>
                    </div>

                    <div className="text-right ml-auto">
                    <p className="text-lg font-semibold text-black">₹{(item?.productId?.price * item?.quantity).toFixed(2)}</p>
                    </div>
                </div>
                ))
            }
          </div>

          <div className="w-full lg:w-96 bg-gray-50 p-6 rounded-xl shadow-lg flex-shrink-0">
            <h2 className="text-xl font-bold mb-4">ORDER SUMMARY</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span>SUBTOTAL</span>
                <span className="font-semibold">₹{subtotal.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>SHIPPING</span>
                <span className="font-semibold">₹{shipping.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>TAX</span>
                <span className="font-semibold">₹{tax.toFixed(2) || 0}</span>
              </div>
              <div className="border-t border-gray-300 pt-4 flex justify-between items-center text-lg font-bold">
                <span>TOTAL</span>
                <span className="flex items-center space-x-2">
                  <span>₹{total.toFixed(2) || 0}</span>
                 
                </span>
              </div>
            </div>
         
              <button 
                onClick={handleCheckout}
                className="mt-6 w-full bg-black text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors">
                CHECKOUT
              </button>
            

            <div className="border-t border-gray-300 mt-6 pt-6">
              <h3 className="text-lg font-bold mb-2">✨ Recommended for you</h3>
              <button
                className="w-full text-center py-2 px-4 rounded-lg text-sm text-black border border-black hover:bg-black hover:text-white transition-colors"
              >
                Get Recommendations
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
