'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shoe_Card } from './shoe_card';
import FilterBar from './filter';
import ShimmerShoeCard from './Shimmer_UIs/shoe_card_shimmer';

const Breadcrumb = ({ queryType_ }: { queryType_: string }) => {
  let path = "Home";
  let title = "All Products";

  if (queryType_) {
    const formattedTitle = queryType_.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    path = `Home > ${formattedTitle}`;
    title = formattedTitle;
  }

  return (
    <div className='text-left'>
      <p className="text-gray-500">{path}</p>
      <h1 className="text-4xl text-black font-bold mt-1 tracking-wider">{title.toUpperCase()}</h1>
    </div>
  );
};

const Pagination = ({ shoesPerPage, totalShoes, paginate, currentPage }: {
  shoesPerPage: number;
  totalShoes: number;
  paginate: (page: number) => void;
  currentPage: number;
}) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalShoes / shoesPerPage); i++) {
    pageNumbers.push(i);
  }

  if (pageNumbers.length <= 1) return null;

  return (
    <nav className="flex justify-center my-8">
      <ul className="flex items-center space-x-2">
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-4 py-2 border rounded ${currentPage === number ? 'bg-black text-white' : 'bg-white text-black'}`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default function AllShoePage() {
  const [shoesData, setShoesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [queryType_, setqueryType] = useState('');
  const SHOES_PER_PAGE = 16;

  const pathname = usePathname();

  useEffect(() => {
    const pathParts = pathname.split('/');
    const queryType = pathParts[pathParts.length - 1];
    if (queryType) {
      setqueryType(queryType);
    }
  }, [pathname]);

  useEffect(() => {
    if (!queryType_) return;

    const fetchShoes = async () => {
      try {
        setLoading(true);

        let params: any = {};
        let suffix = "";

        switch (queryType_.toLowerCase()) {
          case 'new-arrival':
            params = { attribute: 'newArrival', limit: 18 };
            suffix = 'attribute';
            break;
          case 'trending':
            params = { attribute: 'trending', limit: 18 };
            suffix = 'attribute';
            break;
          case 'shoes':
            params = { category: 'shoes', limit: 18 };
            suffix = 'category';
            break;
          case 'clogs':
            params = { category: 'clogs', limit: 18 };
            suffix = 'category';
            break;
          case 'male':
            params = { gender: 'Male', limit: 18 };
            suffix = 'gender';
            break;
          case 'female':
            params = { gender: 'Female', limit: 18 };
            suffix = 'gender';
            break;
          default:
            params = { brand: queryType_.toLowerCase(), limit: 18 };
            suffix = 'brand';
            break;
        }

        const response = await axios.get(`/api/v1/products/filter/${suffix}`, {
          params,
        });

        setShoesData(response.data.data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchShoes();
  }, [queryType_]);

  if (loading || shoesData.length < 4) {
    const Arr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    return (
      <>
        <div className="w-full mx-auto px-24 py-12 bg-white">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-5 gap-y-7">
                {Arr.map((_, index) => (
                  <div key={index}>
                    <ShimmerShoeCard/>
                  </div>
                ))}
            </div>
        </div>
      </>
    );
  }

  const handleFilterChange = (newFilters: any) => {
    setSelectedFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
    setCurrentPage(1);
  };

  let filteredShoes = Array.isArray(shoesData) ? [...shoesData] : [];
  console.log("filtered shoes", filteredShoes);

  Object.entries(selectedFilters).forEach(([filterKey, filterValue]) => {
    if (!filterValue) return;
    switch (filterKey) {
      case 'Brand':
        filteredShoes = filteredShoes.filter((shoe: any) => shoe.brand === filterValue);
        break;
      case 'Gender': {
        const genderMap: { [key: string]: string } = { 'Men': 'Male', 'Women': 'Female' };
        filteredShoes = filteredShoes.filter((shoe: any) => shoe.for === genderMap[filterValue]);
        break;
      }
      case 'Color':
        filteredShoes = filteredShoes.filter((shoe: any) =>
          shoe.color.toLowerCase().includes(String(filterValue).toLowerCase())
        );
        break;
      case 'price':
        filteredShoes = filteredShoes.filter((shoe: any) => {
          return shoe.price <= filterValue;
        });
        break;
      default:
        break;
    }
  });

  const sortBy = selectedFilters['Sort by'];
  if (sortBy) {
    filteredShoes.sort((a: any, b: any) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      return 0;
    });
  }

  const priceConfig = shoesData && shoesData.length > 0
    ? (() => {
      const prices = (shoesData as any[]).map(s => s.price || 0);
      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    })()
    : { min: 599, max: 20000 };

  const indexOfLastShoe = currentPage * SHOES_PER_PAGE;
  const indexOfFirstShoe = indexOfLastShoe - SHOES_PER_PAGE;
  const currentShoes = filteredShoes.slice(indexOfFirstShoe, indexOfLastShoe);

  console.log("Current shoes -> ", currentShoes.length);

  return (
    <div className="bg-white font-sans mt-10">
      <div className="px-20 py-6">
        <Breadcrumb queryType_={queryType_} />
      </div>

      <FilterBar
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        priceConfig={priceConfig}
      />

      <main className="px-20 py-10">
        {currentShoes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {currentShoes.map((shoe: any) => (
              <Link 
                key={shoe._id} 
                href={`/shoe/${shoe._id}`}
              >
                <Shoe_Card shoes={shoe}/> 
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold">No products found</h2>
            <p className="text-gray-500 mt-2">Try adjusting your filters or hit 'Reset' to see all products.</p>
          </div>
        )}
      </main>

      <Pagination
        shoesPerPage={SHOES_PER_PAGE}
        totalShoes={filteredShoes.length}
        paginate={setCurrentPage}
        currentPage={currentPage}
      />
    </div>
  );
}
