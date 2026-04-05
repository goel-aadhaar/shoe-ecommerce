'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';

export function SearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch and filter results
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Fetch a large batch since there's no native text search API yet
        // In real app, this should be a ?search=query parameter
        const res = await productService.getAll(1, 100);
        const allProducts = Array.isArray(res.data) ? res.data : res.data.items;
        
        const filtered = allProducts.filter((p) => 
          p.name.toLowerCase().includes(query.toLowerCase()) || 
          p.brand.toLowerCase().includes(query.toLowerCase())
        );
        
        setResults(filtered.slice(0, 5)); // Show top 5 autocomplete results
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      // In absence of search page, redirect to all collections
      router.push(`/collections/all`);
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-brown-200 hover:text-copper transition-colors"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Search Dropdown / Input area */}
      <div 
        className={`absolute right-0 top-10 w-72 origin-top-right rounded-lg bg-white shadow-xl transition-all duration-200 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <form onSubmit={handleSubmit} className="flex items-center border-b border-brown-100 p-2">
          <Search className="h-4 w-4 text-brown-400 ml-2" />
          <input 
            type="text"
            placeholder="Search products..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-brown-900 focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={isOpen}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="p-1">
              <X className="h-4 w-4 text-brown-400 hover:text-brown-700" />
            </button>
          )}
        </form>

        {/* Autocomplete Results */}
        {(query.trim().length >= 2) && (
          <div className="max-h-80 overflow-y-auto py-2">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-copper" />
              </div>
            ) : results.length > 0 ? (
              <ul className="flex flex-col">
                {results.map((product) => (
                  <li key={product._id}>
                    <Link
                      href={`/shoe/${product._id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-brown-50"
                    >
                      <img 
                        src={product.thumbnail ?? (product.imageSet as any)?.thumbnail ?? '/placeholder.png'} 
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover bg-brown-100"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-brown-900 line-clamp-1">{product.name}</span>
                        <span className="text-xs text-brown-500">{product.brand} • ₹{product.price.toLocaleString('en-IN')}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-center text-brown-500">
                No products found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
