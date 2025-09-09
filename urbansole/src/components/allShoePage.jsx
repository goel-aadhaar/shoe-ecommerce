import React, { useState, useMemo } from 'react';
import { Shoe_Card } from './shoe_card';
import FilterBar from './filter';
import shoesData from '../data/shoes.json';

// The Breadcrumb and Pagination components 
const Breadcrumb = ({ newArrival, trending, brand }) => {
  let path = "Home";
  let title = "All Products";

  if (newArrival) {
    path = "Home > New Arrivals";
    title = "New Arrivals";
  } else if (trending) {
    path = "Home > Trending";
    title = "Trending";
  } else if (brand) {
    path = `Home > Brand > ${brand}`;
    title = brand;
  }

  return (
    <div className='text-left'>
      <p className="text-gray-500">{path}</p>
      <h1 className="text-4xl text-black font-bold mt-1 tracking-wider">{title.toUpperCase()}</h1>
    </div>
  );
};

const Pagination = ({ shoesPerPage, totalShoes, paginate, currentPage }) => {
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


// Main Page Component with updated logic
export default function AllShoePage({ heading = "All Products", trending = false, newArrival = false, brand = null }) {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const SHOES_PER_PAGE = 12;

  // Calculate min and max price from the entire dataset once
  const priceConfig = useMemo(() => {
    const prices = shoesData.map(s => parseInt(s.price.replace(/[^0-9]/g, '')));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, []);
  
  const handleResetFilters = () => {
    setSelectedFilters({});
    setCurrentPage(1);
  };

  const filteredShoes = useMemo(() => {
    let shoesToShow = [...shoesData];
    
    // Initial filtering based on props
    if (newArrival) {
      shoesToShow = shoesToShow.filter(shoe => shoe.newArrival);
    } else if (trending) {
      shoesToShow = shoesToShow.filter(shoe => shoe.trending);
    } else if (brand) {
      shoesToShow = shoesToShow.filter(shoe => shoe.brand.toLowerCase() === brand.toLowerCase());
    }

    // Apply user-selected filters
    Object.entries(selectedFilters).forEach(([filterKey, filterValue]) => {
      if (!filterValue) return;

      switch (filterKey) {
        case 'Brand':
          shoesToShow = shoesToShow.filter(shoe => shoe.brand === filterValue);
          break;
        case 'Gender':
          const genderMap = { 'Men': 'male', 'Women': 'female', 'Kids': 'kids' };
          shoesToShow = shoesToShow.filter(shoe => shoe.for === genderMap[filterValue]);
          break;
        case 'Color':
          // FIX: Uses .includes() for partial matching, and converts both to lower case
          shoesToShow = shoesToShow.filter(shoe => 
            shoe.color.toLowerCase().includes(filterValue.toLowerCase())
          );
          break;
        case 'price':
            // UPDATED: Filters based on the slider's numeric value
            shoesToShow = shoesToShow.filter(shoe => {
                const shoePrice = parseInt(shoe.price.replace(/[^0-9]/g, ''));
                return shoePrice <= filterValue;
            });
            break;
      }
    });
    
    // Apply sorting
    const sortBy = selectedFilters['Sort by'];
    if (sortBy) {
        // ... (sorting logic is unchanged)
         shoesToShow.sort((a, b) => {
            const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
            const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
            if (sortBy === 'Price: Low to High') return priceA - priceB;
            if (sortBy === 'Price: High to Low') return priceB - priceA;
            return 0;
      });
    }
    
    setCurrentPage(1); // Reset to first page on any filter change
    return shoesToShow;
  }, [newArrival, trending, brand, selectedFilters]);
  
  const indexOfLastShoe = currentPage * SHOES_PER_PAGE;
  const indexOfFirstShoe = indexOfLastShoe - SHOES_PER_PAGE;
  const currentShoes = filteredShoes.slice(indexOfFirstShoe, indexOfLastShoe);

  return (
    <div className="bg-white font-sans">
      <div className="px-20 py-6">
        <Breadcrumb newArrival={newArrival} trending={trending} brand={brand} />
      </div>

      <FilterBar 
        selectedFilters={selectedFilters} 
        onFilterChange={setSelectedFilters}
        onReset={handleResetFilters}
        priceConfig={priceConfig}
      />

      <main className="px-20 py-10">
        {currentShoes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {currentShoes.map(shoe => (
              <Shoe_Card key={shoe.id} {...shoe} />
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