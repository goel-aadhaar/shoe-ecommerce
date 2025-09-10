import { useState } from "react";
import {X} from 'lucide-react';

const AddProductModal = ({ isOpen, onClose, onSave }) => {
  const attributeOptions = ["newArrival", "trending", "bestSeller", "onSale"];
  const categoryOptions = [
    { id: "65d506a7c3e80f93021f1e7a", name: "Men's Shoes" },
    { id: "65d506a7c3e80f93021f1e7b", name: "Women's Shoes" },
    { id: "65d506a7c3e80f93021f1e7c", name: "Kids' Shoes" },
  ];
  const forOptions = [
    {id:"65d506a7c3e80f21m1e7a", name : "Male"},
    {id:"65d506a7c3e80f23f1e7a", name: "Female"},
  ]

  const [product, setProduct] = useState({
    id: '',
    name: '',
    description: '',
    brand: '',
    for: '',
    price: '',
    stock: '',
    color: '',
    categoryId: '',
    rating: '',
    ratedBy: '',
    attributes: [],
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleAttributeChange = (e) => {
    const { value, checked } = e.target;
    setProduct(prev => {
      const currentAttributes = new Set(prev.attributes);
      if (checked) {
        currentAttributes.add(value);
      } else {
        currentAttributes.delete(value);
      }
      return { ...prev, attributes: Array.from(currentAttributes) };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Add New Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product ID<span className="text-red-500 ml-1">*</span></label>
              <input type="number" name="id" value={product.id} onChange={handleChange} minLength={4} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name<span className="text-red-500 ml-1">*</span></label>
              <input type="text" name="name" value={product.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand<span className="text-red-500 ml-1">*</span></label>
              <input type="text" name="brand" value={product.brand} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Price ($)<span className="text-red-500 ml-1">*</span></label>
              <input type="number" name="price" value={product.price} onChange={handleChange} required min={0} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock<span className="text-red-500 ml-1">*</span></label>
              <input type="number" name="stock" value={product.stock} onChange={handleChange} required min={1} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input type="text" name="color" value={product.color} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" value={product.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category<span className="text-red-500 ml-1">*</span></label>
              <select name="categoryId" value={product.categoryId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="" disabled>Select a category</option>
                {categoryOptions.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">For</label>
              <select name="for" value={product.for} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="" disabled>Select a category</option>
                {forOptions.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <input type="number" name="rating" value={product.rating} onChange={handleChange} min="0" max="5" step="0.1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rated By</label>
              <input type="number" name="ratedBy" value={product.ratedBy} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Attributes</label>
              <div className="mt-1 space-y-2">
                {attributeOptions.map((attr) => (
                  <div key={attr} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`attr-${attr}`}
                      name="attributes"
                      value={attr}
                      checked={product.attributes.includes(attr)}
                      onChange={handleAttributeChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`attr-${attr}`} className="ml-2 text-sm text-gray-700">{attr}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none">
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;