import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductTable from "./ProductTable";
import AddProductModal from "./AddProductModal";

import {
  Home,
  ShoppingBag,
  BarChart,
  MessageSquare,
  Users,
} from "lucide-react";

// A simple in-memory database to simulate MERN data fetching
const generateProducts = (count) => {
  const products = [];
  const productNames = [
    "Classic Loafer",
    "Stylish Sneaker",
    "Leather Oxford",
    "Running Shoe",
    "Hiking Boot",
    "Sandals",
    "Winter Boots",
    "Formal Pumps",
    "Athletic Trainers",
    "Slip-on Moccasin",
  ];
  const categories = ["Men's", "Women's", "Kids'", "Unisex"];
  const brands = ["Nike", "Adidas", "Puma", "Reebok", "New Balance"];
  const attributes = ["Popular", "New Arrival", "Bestseller", "On Sale"];
  const statuses = ["In Stock", "Out of Stock", "Discontinued"];

  for (let i = 0; i < count; i++) {
    products.push({
      id: Math.random().toString(36).substr(2, 9),
      product: productNames[i % productNames.length],
      productId: `#${Math.floor(Math.random() * 90000) + 10000}`,
      category: categories[i % categories.length],
      price: `$${(Math.random() * 100 + 50).toFixed(2)}`,
      brand: brands[i % brands.length],
      attribute: attributes[i % attributes.length],
      status: statuses[i % statuses.length],
    });
  }
  return products;
};
const products = generateProducts(10);

const Sidebar = ({ activeTab, setActiveTab }) => (
  <aside className="w-64 bg-black text-white flex flex-col h-full rounded-l-2xl shadow-xl">
    <div className="p-6 text-2xl font-bold flex items-center space-x-2 border-b border-white">
      <ShoppingBag size={28} />
      <span>Admin Panel</span>
    </div>
    <nav className="flex-1 mt-8 space-y-2 px-4">
      <NavItem
        icon={Home}
        label="Dashboard"
        isActive={activeTab === "dashboard"}
        onClick={() => setActiveTab("dashboard")}
      />
      <NavItem
        icon={ShoppingBag}
        label="Products"
        isActive={activeTab === "products"}
        onClick={() => setActiveTab("products")}
      />
      <NavItem
        icon={BarChart}
        label="Reports"
        isActive={activeTab === "reports"}
        onClick={() => setActiveTab("reports")}
      />
      <NavItem
        icon={MessageSquare}
        label="Messages"
        isActive={activeTab === "messages"}
        onClick={() => setActiveTab("messages")}
      />
      <NavItem
        icon={Users}
        label="Customers"
        isActive={activeTab === "customers"}
        onClick={() => setActiveTab("customers")}
      />
    </nav>
    <div className="p-6 text-sm text-center">© All rights reserved</div>
  </aside>
);

const NavItem = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-3 rounded-xl transition-colors duration-200 
      ${
        isActive
          ? "bg-white font-semibold text-black"
          : "hover:bg-white hover:text-gray-600"
      }`}
  >
    <Icon size={20} className="mr-3" />
    <span>{label}</span>
  </button>
);

const Header = () => (
  <header className="p-4 bg-white border-b border-gray-200 flex items-center justify-between rounded-t-xl">
    <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <img
            src="https://api.dicebear.com/7.x/pixel-art/svg?seed=admin"
            alt="Admin"
          />
        </div>
        <div>
          <div className="font-semibold text-gray-800">Admin User</div>
          <div className="text-gray-500">Admin</div>
        </div>
      </div>
    </div>
  </header>
);

const AdminPanelApp = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState(generateProducts(10));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "https://api-shoe-ecommerce.onrender.com/api/v1/products"
      );
      console.log("got the data : ", response?.data);

      setProducts(response.data.data);
    } catch (e) {
      console.error("Failed to fetch products:", e);
      setError("Failed to load products. Please check the API connection.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (newProduct) => {
    try {
      const response = await axios.post(
        "https://api-shoe-ecommerce.onrender.com/api/v1/products",
        newProduct
      );

      console.log("Product added successfully!", response.data);
      fetchProducts(); // Refresh the product list
    } catch (e) {
      console.error("Failed to add product:", e);
      setError(
        "Failed to add product. " + (e.response?.data?.message || e.message)
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 p-8 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col pl-8">
        <Header />
        <ProductTable
          products={products}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddClick={() => setIsModalOpen(true)}
        />
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddProduct}
        />
      </div>
    </div>
  );
};

export default AdminPanelApp;
