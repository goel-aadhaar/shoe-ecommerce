'use client';

import { useState } from 'react';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { favouriteService } from '@/services/favourite.service';
import { ProductImageGallery } from './product-image-gallery';
import { VariantSelector } from '@/components/common/variant-selector';
import { QuantityStepper } from '@/components/common/quantity-stepper';
import { SHOE_SIZES } from '@/constants';
import type { Product } from '@/types';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

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
      await addItem(product._id, quantity, product.color, selectedSize);
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

  const inStock = product.stock > 0;

  return (
    <div className="container-inner py-10 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductImageGallery product={product} />

        <div className="flex flex-col">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-cobalt">
            {product.brand}
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.85] text-ink">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.rating)
                      ? 'fill-ink text-ink'
                      : 'text-ink/15'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-ink/50">
              {product.rating} — {product.ratedBy} Reviews
            </span>
          </div>

          {/* Price */}
          <p className="mt-6 font-serif text-5xl text-ink">
            ₹{product.price.toLocaleString('en-IN')}
          </p>

          {/* Meta */}
          <div className="mt-6 grid grid-cols-2 gap-px border border-ink/15 bg-ink/15">
            <div className="bg-paper p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
                Colorway
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-ink">
                {product.color}
              </p>
            </div>
            <div className="bg-paper p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">
                Built For
              </p>
              <p className="mt-1 font-mono text-sm font-bold uppercase text-ink">
                {product.for}
              </p>
            </div>
          </div>

          {/* Size */}
          <div className="mt-8">
            <VariantSelector
              label="Select Size"
              selectedVariant={selectedSize}
              onSelect={setSelectedSize}
              variants={SHOE_SIZES.map((s) => ({ id: s, label: s }))}
            />
          </div>

          {/* Quantity + stock */}
          <div className="mt-8 flex flex-wrap items-end gap-6">
            <div>
              <span className="mb-3 block font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-ink/50">
                Quantity
              </span>
              <QuantityStepper
                quantity={quantity}
                onChange={setQuantity}
                max={product.stock}
              />
            </div>
            <div className="flex items-center gap-2 pb-3 font-mono text-xs uppercase tracking-[0.15em]">
              <span
                className={`h-2 w-2 ${inStock ? 'bg-cobalt' : 'bg-destructive'}`}
              />
              {inStock ? (
                <span className="text-ink/60">
                  In Stock — {product.stock} left
                </span>
              ) : (
                <span className="text-destructive">Out Of Stock</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || !inStock}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              {adding ? 'Adding…' : 'Add To Cart'}
            </button>
            <button
              onClick={handleFavourite}
              className="flex h-auto items-center justify-center border border-ink px-5 text-ink transition-colors hover:bg-ink hover:text-bone"
              aria-label="Add to favourites"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* Description */}
          <div className="mt-10 border-t border-ink/15 pt-7">
            <h3 className="font-serif text-xl uppercase text-ink">
              Description
            </h3>
            <p className="mt-3 font-sans text-sm leading-relaxed text-ink/60">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
