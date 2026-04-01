'use client';

import { useEffect, useState } from 'react';
import { favouriteService } from '@/services/favourite.service';
import { ProductCard } from '@/components/features/products/product-card';
import type { Favourite, Product } from '@/types';

export function FavouritesGrid() {
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favouriteService
      .getAll()
      .then((res) => setFavourites(res.data.items))
      .catch(() => setFavourites([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded bg-brown-100" />
        ))}
      </div>
    );
  }

  if (favourites.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-brown-500">
        No favourites yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {favourites.map((fav) => {
        const product = fav.productId as Product;
        if (!product?._id) return null;
        return <ProductCard key={fav._id} product={product} />;
      })}
    </div>
  );
}
