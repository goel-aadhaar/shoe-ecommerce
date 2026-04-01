'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Heart, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    category?: string;
    brand?: string;
    discount?: number;
    trending?: boolean;
    newArrival?: boolean;
  };
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const {
    _id,
    name,
    price,
    images = [],
    category = '',
    brand = '',
    discount = 0,
    trending = false,
    newArrival = false
  } = product;

  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
  const imageUrl = images[0] || '/placeholder-shoe.jpg';

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <Link href={`/shoe/${_id}`}>
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {trending && (
                <Badge variant="destructive" className="text-xs">
                  Trending
                </Badge>
              )}
              {newArrival && (
                <Badge variant="secondary" className="text-xs">
                  New
                </Badge>
              )}
              {discount > 0 && (
                <Badge variant="outline" className="text-xs bg-white">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    // Add to wishlist logic
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    // Add to cart logic
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Link>

        <div className="p-4">
          <div className="space-y-2">
            {/* Brand and Category */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="uppercase tracking-wide">{brand}</span>
              <span className="uppercase">{category}</span>
            </div>

            {/* Product Name */}
            <Link href={`/shoe/${_id}`}>
              <h3 className="font-medium text-sm line-clamp-2 hover:text-blue-600 transition-colors">
                {name}
              </h3>
            </Link>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">
                ₹{discountedPrice.toLocaleString('en-IN')}
              </span>
              {discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              className="w-full mt-3"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
