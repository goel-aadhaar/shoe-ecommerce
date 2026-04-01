'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductFormModal({
  product,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name ?? '',
    brand: product?.brand ?? '',
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    for: product?.for ?? ('Male' as 'Male' | 'Female'),
    color: product?.color ?? '',
    description: product?.description ?? '',
  });
  const [saving, setSaving] = useState(false);

  function updateField(key: string, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await productService.update(product._id, form);
        toast.success('Product updated');
      } else {
        await productService.create(form);
        toast.success('Product created');
      }
      onSaved();
    } catch {
      toast.error(isEdit ? 'Failed to update' : 'Failed to create');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-brown-400 hover:text-brown-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-serif text-xl font-bold text-brown-900">
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-brown-700">Name</label>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                className="mt-1 w-full rounded border border-brown-200 bg-cream px-3 py-2 text-sm focus:border-copper focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => updateField('brand', e.target.value)}
                className="mt-1 w-full rounded border border-brown-200 bg-cream px-3 py-2 text-sm focus:border-copper focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700">Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => updateField('price', Number(e.target.value))}
                required
                min={0}
                className="mt-1 w-full rounded border border-brown-200 bg-cream px-3 py-2 text-sm focus:border-copper focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => updateField('stock', Number(e.target.value))}
                required
                min={0}
                className="mt-1 w-full rounded border border-brown-200 bg-cream px-3 py-2 text-sm focus:border-copper focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700">For</label>
              <select
                value={form.for}
                onChange={(e) => updateField('for', e.target.value)}
                className="mt-1 w-full rounded border border-brown-200 bg-cream px-3 py-2 text-sm focus:border-copper focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-brown-700">Color</label>
              <input
                value={form.color}
                onChange={(e) => updateField('color', e.target.value)}
                className="mt-1 w-full rounded border border-brown-200 bg-cream px-3 py-2 text-sm focus:border-copper focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-brown-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border border-brown-200 bg-cream px-3 py-2 text-sm focus:border-copper focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-brown-200 px-4 py-2 text-sm text-brown-700 hover:bg-brown-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-brown-800 px-4 py-2 text-sm font-medium text-cream hover:bg-brown-900 disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
