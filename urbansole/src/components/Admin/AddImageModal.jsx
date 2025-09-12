import { useState } from 'react';
import axios from 'axios';

export default function AddProductImagesModal({ productId, onClose }) {
  const [thumbnail, setThumbnail] = useState(null);
  const [productName, setProductName] = useState('Product');
  const [hover, setHover] = useState(null);
  const [sides, setSides] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleSidesChange = (e) => {
    const files = Array.from(e.target.files);
    // Limit to a maximum of 5 files
    if (files.length > 5) {
      setError('You can only upload a maximum of 5 side images.');
      return;
    }
    setError(null);
    setSides(files);
  };
  const getProductName = async () => {
    try {
      const response = await axios.get('https://api-shoe-ecommerce.onrender.com/api/v1/products/' + productId);
      setProductName(response.data.product.name);
    } catch (error) {
      console.error('Error fetching product name:', error);
    }
  };

  useState(() => {
    getProductName();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (thumbnail) formData.append('thumbnail', thumbnail);
      if (hover) formData.append('hover', hover);
      sides.forEach((file) => formData.append('sides', file));

      await axios.post(
        `https://api-shoe-ecommerce.onrender.com/api/v1/product-images/${productId}/images`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );

      alert('Images uploaded successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      setError('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full transform transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Add Images for {productName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image
            </label>
            <input
              type="file"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hover Image
            </label>
            <input
              type="file"
              onChange={(e) => setHover(e.target.files[0])}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Side Images (up to 5)
            </label>
            <input
              type="file"
              multiple
              onChange={handleSidesChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            {sides.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {sides.length} file(s)
              </p>
            )}
            {error && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}