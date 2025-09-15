import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductTable from "./ProductTable";
import AddProductModal from "./AddProductModal";
import UpdateProductModal from "./UpdateProductModal";


const dummyProducts = [
  {
    _id: "68c40c037a7016c5895bf06b",
    name: "Dummy Shoes Ka naam bahut hi jyada hi bada hai.....",
    description: "Comfortable running shoes",
    brand: "Nike",
    price: 120,
    stock: 50,
    for: "Male",
    color: "Black/White",
    category: { id: "cat1", name: "Shoes" },
    rating: 4.5,
    ratedBy: 200,
    attributes: ["newArrival", "trending", "bestSeller", "onsale"],
  },
  {
    _id: "2",
    name: "Dummy Shoes",
    description: "Comfortable running shoes",
    brand: "Nike",
    price: 120,
    stock: 50,
    for: "Male",
    color: "Black/White",
    category: { id: "cat1", name: "Shoes" },
    rating: 4.5,
    ratedBy: 200,
    attributes: ["newArrival", "trending"],
  },
];

import {
  Home,
  ShoppingBag,
  BarChart,
  MessageSquare,
  Users,
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => (
  <aside className="w-1/5 bg-black text-white flex flex-col h-full rounded-l-2xl shadow-xl">
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
  const [products, setProducts] = useState(dummyProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchProducts = async () => {
    console.log("Fetching products...");

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
    console.log("Adding product:,,,,,,,,", newProduct);
    try {
      console.log("New Product Data:", newProduct);
      const response = await axios.post(
        "https://api-shoe-ecommerce.onrender.com/api/v1/products",
        newProduct,
        { withCredentials: true }
      );

      console.log("Product added successfully!", response.data);
      fetchProducts();
    } catch (e) {
      console.error("Failed to add product:", e);
      setError(
        "Failed to add product. " + (e.response?.data?.message || e.message)
      );
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSaveUpdate = async (id, updatedProduct) => {
    console.log("Saving updated product id :", updatedProduct);
    try {
      const response = await axios.put(
        `https://api-shoe-ecommerce.onrender.com/api/v1/products/${id}`,
        updatedProduct,
        { withCredentials: true }
      );
      console.log("Product updated successfully!", response.data);
      setProducts(
        products.map((p) => (p._id === updatedProduct._id ? response.data : p))
      );
      fetchProducts();

      alert("Product updated successfully!");
      setIsEditModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update product");
    }
  };

  const handleDeleteProduct = async (id) => {
    console.log("Deleting product with id:", id);
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(
        `https://api-shoe-ecommerce.onrender.com/api/v1/products/${id}`,
        { withCredentials: true }
      );
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <>

      <div className="flex mt-20 h-screen bg-gray-100 px-10 py-5 font-sans">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} className="w-1/5" />
        <div className="w-4/5 flex flex-col pl-2">
          <Header />
          <ProductTable
            products={products}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddClick={() => setIsModalOpen(true)}
          />
          <AddProductModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddProduct}
          />

          {isEditModalOpen && selectedProduct && (
            <UpdateProductModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              product={selectedProduct}
              onSave={handleSaveUpdate}
            />
          )}
        </div>
      </div>

    </>
  );
};

export default AdminPanelApp;
