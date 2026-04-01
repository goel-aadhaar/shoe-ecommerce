'use client';

import { useState } from 'react';
import { Star, ShoppingBag, Heart, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { favouriteService } from '@/services/favourite.service';
import { ProductImageGallery } from './product-image-gallery';
import { SHOE_SIZES } from '@/constants';
import type { Product, ProductImage } from '@/types';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [adding, setAdding] = useState(false);

  const imageSet = (product.imageSet as ProductImage) ?? null;

  async function handleAddToCart() {
    if (!isAuthenticated) {
      toast.error('Please sign in to add to cart');
      return;
    }
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    setAdding(true);
    try {
      await addItem(product._id, 1, product.color, selectedSize);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  }

  async function handleFavourite() {
    if (!isAuthenticated) {
      toast.error('Please sign in to add favourites');
      return;
    }
    try {
      await favouriteService.add(product._id);
      toast.success('Added to favourites');
    } catch {
      toast.error('Already in favourites or error occurred');
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImageGallery imageSet={imageSet} productName={product.name} />

        <div className="flex flex-col">
          <p className="text-sm font-medium uppercase tracking-wider text-brown-500">
            {product.brand}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-brown-900 sm:text-4xl">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.rating)
                      ? 'fill-copper text-copper'
                      : 'text-brown-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-brown-500">
              {product.rating} ({product.ratedBy} reviews)
            </span>
          </div>

          {/* Price */}
          <p className="mt-6 font-serif text-3xl font-bold text-brown-800">
            &#8377;{product.price.toLocaleString('en-IN')}
          </p>

          {/* Color */}
          <div className="mt-6">
            <span className="text-sm font-medium text-brown-600">Color:</span>
            <span className="ml-2 text-sm text-brown-800">{product.color}</span>
          </div>

          {/* Gender */}
          <div className="mt-2">
            <span className="text-sm font-medium text-brown-600">For:</span>
            <span className="ml-2 text-sm text-brown-800">{product.for}</span>
          </div>

          {/* Size */}
          <div className="mt-6">
            <span className="text-sm font-medium text-brown-600">
              Select Size:
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {SHOE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? 'border-copper bg-copper text-white'
                      : 'border-brown-200 text-brown-700 hover:border-brown-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-brown-500" />
            {product.stock > 0 ? (
              <span className="text-green-700">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-brown-800 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-brown-900 disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleFavourite}
              className="flex items-center justify-center rounded-md border-2 border-brown-200 px-4 py-3 text-brown-600 transition-colors hover:border-copper hover:text-copper"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* Description */}
          <div className="mt-10 border-t border-brown-200 pt-6">
            <h3 className="font-serif text-lg font-semibold text-brown-800">
              Description
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brown-600">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
