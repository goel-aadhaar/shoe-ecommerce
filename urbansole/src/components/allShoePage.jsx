import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Import useParams
import { Shoe_Card } from './shoe_card';
import FilterBar from './filter';
import ShimmerShoeCard from './Shimmer_UIs/shoe_card_shimmer';


const Breadcrumb = ({ queryType }) => {
  let path = "Home";
  let title = "All Products";

  if (queryType) {
    const formattedTitle = queryType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

export default function AllShoePage() {

  console.log("All shoe page called...");
  
  const [shoesData, setShoesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [attribute, setAtribute]  = useState('trending');
  const [currentPage, setCurrentPage] = useState(1);
  const SHOES_PER_PAGE = 16;

  // Get the queryType from the URL params
  const {queryType}  = useParams();

  console.log(queryType);
  
 
  useEffect(() => {
    if (queryType === 'new-arrival') {
      setAtribute('newArrival');
    } else {
      setAtribute('trending');
    }
  }, [queryType,attribute]);

  useEffect(() => {
    const fetchShoes = async () => {
      try {
        console.log("cal from the all shoe page... ");
        
        setLoading(true);
        const response = 
          await axios.get("https://api-shoe-ecommerce.onrender.com/api/v1/products/filter/attribute",{
            params: { attribute: attribute, limit: 18 }
        });
        setShoesData(response.data.data);
        setError(null);
      } catch (err) {

         console.error("Error fetching data:", err);
        setError("Failed to fetch products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchShoes();
  }, [attribute]);

  if (loading || shoesData.length < 4) {
    const Arr = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    return (
      <>
        <div className="w-full mx-auto px-24 py-12 bg-white">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-5 gap-y-7">
                {Arr.map((index) => (
                  <div Key={index}>
                    <ShimmerShoeCard/>
                  </div>
                ))}
            </div>
        </div>
      </>
    );
    
  }
  // console.log("data in all shoe page ", shoesData);
  

  // if (error) {
  //   return (
  //     <div className="bg-white font-sans text-center py-20">
  //       <h2 className="text-2xl font-semibold text-red-500">Error!</h2>
  //       <p className="text-gray-500 mt-2">{error}</p>
  //     </div>
  //   );
  // }

  const handleFilterChange = (newFilters) => {
    setSelectedFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedFilters({});
    setCurrentPage(1);
  };

  
  let filteredShoes = Array.isArray(shoesData) ? [...shoesData] : [];
  console.log("filtered shoes", filteredShoes);  

  

  // Object.entries(selectedFilters).forEach(([filterKey, filterValue]) => {
  //   if (!filterValue) return;

  //   switch (filterKey) {
  //     case 'Brand':
  //       filteredShoes = filteredShoes.filter(shoe => shoe.brand === filterValue);
  //       break;
  //     case 'Gender': {
  //       const genderMap = { 'Men': 'Male', 'Women': 'Female' };
  //       filteredShoes = filteredShoes.filter(shoe => shoe.for === genderMap[filterValue]);
  //       break;
  //     }
  //     case 'Color':
  //       filteredShoes = filteredShoes.filter(shoe =>
  //         shoe.color.toLowerCase().includes(filterValue.toLowerCase())
  //       );
  //       break;
  //     case 'price':
  //       filteredShoes = filteredShoes.filter(shoe => {
  //         return shoe.price <= filterValue;
  //       });
  //       break;
  //     default:
  //       break;
  //   }
  // });

  // const sortBy = selectedFilters['Sort by'];
  // if (sortBy) {
  //   filteredShoes.sort((a, b) => {
  //     if (sortBy === 'Price: Low to High') return a.price - b.price;
  //     if (sortBy === 'Price: High to Low') return b.price - a.price;
  //     return 0;
  //   });
  // }

  const priceConfig = shoesData && shoesData.length > 0
    ? (() => {
      const prices = shoesData.map(s => s.price || 0);
      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    })()
    : { min: 599, max: 20000 };

  const indexOfLastShoe = currentPage * SHOES_PER_PAGE;
  const indexOfFirstShoe = indexOfLastShoe - SHOES_PER_PAGE;
  const currentShoes = filteredShoes.slice(indexOfFirstShoe, indexOfLastShoe);
  // const currentShoes = filteredShoes
  
  console.log("Current shoes -> ", currentShoes.length);

  return (
    <div className="bg-white font-sans mt-10">
      <div className="px-20 py-6">
        <Breadcrumb queryType={queryType} />
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
            {currentShoes.map(shoe => (
              <Shoe_Card key={shoe.id} shoes={shoe} />
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