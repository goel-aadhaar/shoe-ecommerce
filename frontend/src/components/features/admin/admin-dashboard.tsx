'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '@/services/product.service';
import { ProductFormModal } from './product-form-modal';
import type { Product, ProductImage } from '@/types';
import { DEFAULT_PLACEHOLDER } from '@/constants';
import Image from 'next/image';

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  function fetchProducts() {
    setLoading(true);
    productService
      .getAll(1, 50)
      .then((res) => setProducts(res.data.items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-brown-900">
          Products
        </h2>
        <button
          onClick={() => {
            setEditProduct(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-md bg-copper px-4 py-2 text-sm font-medium text-white hover:bg-sienna transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-brown-100" />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brown-200 text-xs uppercase tracking-wider text-brown-500">
                <th className="py-3 pr-4">Image</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Brand</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Stock</th>
                <th className="py-3 pr-4">For</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown-100">
              {products.map((p) => {
                const img = p.thumbnail ?? (p.imageSet as ProductImage)?.thumbnail ?? DEFAULT_PLACEHOLDER;
                return (
                  <tr key={p._id} className="hover:bg-brown-50">
                    <td className="py-3 pr-4">
                      <div className="relative h-10 w-10 overflow-hidden rounded bg-brown-100">
                        <Image src={img} alt={p.name} fill sizes="40px" className="object-cover" />
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-medium text-brown-800">
                      {p.name}
                    </td>
                    <td className="py-3 pr-4 text-brown-600">{p.brand}</td>
                    <td className="py-3 pr-4 text-brown-800">
                      &#8377;{p.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          p.stock > 0 ? 'text-green-700' : 'text-red-600'
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-brown-600">{p.for}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditProduct(p);
                            setShowModal(true);
                          }}
                          className="text-brown-500 hover:text-copper"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-brown-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProductFormModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}
