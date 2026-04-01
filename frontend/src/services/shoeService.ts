import { Shoe } from '@/types';

// Mock data for development - replace with actual API calls
export const mockShoes: Shoe[] = [
  {
    id: '1',
    name: 'Air Max 90',
    brand: 'Nike',
    color: 'White/Black',
    price: 130,
    description: 'Classic running shoe with iconic design',
    category: 'Running',
    imageSet: {
      thumbnail: 'https://www.superkicks.in/cdn/shop/files/1_23_63d4bcad-2f4f-4dff-8606-1b9687a04aa5.png?v=1754314154',
      hover: 'https://www.superkicks.in/cdn/shop/files/1_23_63d4bcad-2f4f-4dff-8606-1b9687a04aa5.png?v=1754314154',
      gallery: []
    },
    sizes: [
      { size: '8', available: true },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: false }
    ],
    inStock: true,
    rating: 4.5,
    reviews: 128
  },
  {
    id: '2',
    name: 'Yeezy Boost 350',
    brand: 'Adidas',
    color: 'Pirate Black',
    price: 220,
    description: 'Limited edition lifestyle sneaker',
    category: 'Casual',
    imageSet: {
      thumbnail: 'https://www.superkicks.in/cdn/shop/files/1_23_63d4bcad-2f4f-4dff-8606-1b9687a04aa5.png?v=1754314154',
      hover: 'https://www.superkicks.in/cdn/shop/files/1_23_63d4bcad-2f4f-4dff-8606-1b9687a04aa5.png?v=1754314154',
      gallery: []
    },
    sizes: [
      { size: '8', available: false },
      { size: '9', available: true },
      { size: '10', available: true },
      { size: '11', available: true }
    ],
    inStock: true,
    rating: 4.8,
    reviews: 89
  }
];

// API service functions
export const shoeService = {
  async getShoes(params?: {
    page?: number;
    limit?: number;
    brand?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ shoes: Shoe[]; total: number }> {
    // In production, this would be an actual API call
    // const response = await axios.get('/api/shoes', { params });
    // return response.data;
    
    // Mock response for now
    return {
      shoes: mockShoes,
      total: mockShoes.length
    };
  },

  async getShoeById(id: string): Promise<Shoe | null> {
    // In production, this would be an actual API call
    // const response = await axios.get(`/api/shoes/${id}`);
    // return response.data;
    
    // Mock response for now
    return mockShoes.find(shoe => shoe.id === id) || null;
  },

  async searchShoes(query: string): Promise<Shoe[]> {
    // In production, this would be an actual API call
    // const response = await axios.get('/api/shoes/search', { params: { q: query } });
    // return response.data;
    
    // Mock response for now
    return mockShoes.filter(shoe => 
      shoe.name.toLowerCase().includes(query.toLowerCase()) ||
      shoe.brand.toLowerCase().includes(query.toLowerCase())
    );
  }
};
