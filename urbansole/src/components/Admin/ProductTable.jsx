import React, { useState } from "react";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import AddProductImages from "./AddImageModal";

const ProductTable = ({ products, searchTerm, setSearchTerm, onAddClick, onEditProduct, onDeleteProduct }) => {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // filter by name (safe check)
  const filteredProducts = products.filter((p) =>
    p?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  return (
    <div className="bg-white p-6 rounded-b-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">Products</h2>
            <span className="ml-2 text-gray-500 text-sm">
              ({products.length})
            </span>
          </div>
          <div className="border-l border-gray-300 pl-4">
            <h3 className="text-gray-600">Categories</h3>
          </div>
        </div>
        <div className="flex space-x-4 items-center">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-black pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={onAddClick}
            className="bg-black text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-blue-800 hover:text-blue-100 transition-colors"
          >
            <Plus size={18} />
            <span>Add new item</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attributes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product._id}>
                {/* Name */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.name}
                </td>

                {/* MongoDB _id */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product._id}
                </td>

                {/* Category (populated or id) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.category?.name || "Uncategorized"}
                </td>

                {/* Price */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{product.price}
                </td>

                {/* Brand */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.brand}
                </td>

                {/* Attributes (array) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.attributes?.length > 0 ? (
                    product.attributes.map((attr, i) => (
                      <span
                        key={i}
                        className="px-2 mr-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                      >
                        {attr}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>

                {/* Action Dropdown */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 relative">
                  <button
                    onClick={() => toggleDropdown(product._id)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  {dropdownOpen === product._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-10">
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setDropdownOpen(null);
                          onEditProduct(product);
                        }}
                      >
                        Edit Product Details
                      </button>

                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setSelectedProductId(product._id);
                          setShowAddImageModal(true);
                        }}
                      >
                        Add Product Images
                      </button>

                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setDropdownOpen(null);
                          onDeleteProduct(product._id);
                        }}
                        >
                        Delete Product
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAddImageModal && (
        <AddProductImages
          productId={selectedProductId}
          onClose={() => setShowAddImageModal(false)}
        />
      )}
    </div>
  );
};

export default ProductTable;
