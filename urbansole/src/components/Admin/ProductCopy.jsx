import React, { useState } from 'react';
import {Search, Plus, MoreHorizontal} from 'lucide-react';



const ProductTable = ({ products, searchTerm, setSearchTerm, onAddClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const filteredProducts = products.filter(p =>
    p?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  return (
    <div className="bg-white p-6 rounded-b-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">Products</h2>
            <span className="ml-2 text-gray-500 text-sm">({products.length})</span>
          </div>
          <div className="border-l border-gray-300 pl-4">
            <h3 className="text-gray-600">Categories</h3>
          </div>
        </div>
        <div className="flex space-x-4 items-center">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-black pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={onAddClick} className="bg-black text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-blue-800 hover:text-blue-100 transition-colors">
            <Plus size={18} />
            <span>Add new item</span>
          </button>
          {/* <button onClick={onAddClick} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-colors">
            <Plus size={18} />
            <span>Add new item</span>
          </button> */}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attribute</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product._id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.brand}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {product.attribute}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 relative">
                  <button onClick={() => toggleDropdown(product.id)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                  {dropdownOpen === product.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-10">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit Product Details</a>
                      <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete Product</a>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;