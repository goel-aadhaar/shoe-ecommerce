// Export all types
export * from './types';

// Export all constants
export * from './constants';

// Export utilities
export * from './utils';

// Export hooks
export * from './hooks/useAuth';
export * from './hooks/useLocalStorage';

// Export services
export * from './services/authService';
export * from './services/shoeService';

// Export shared components
export { Button } from './components/shared/ui/button';
export { Card } from './components/shared/ui/card';
export { Skeleton as LoadingSpinner } from './components/shared/ui/skeleton';
export { default as ImageSlider } from './components/shared/ImageSlider';

// Export layout components
export { default as Navbar } from './components/layout/navigation/Navbar';
export { default as Footer } from './components/layout/Footer';
export { default as AppLayout } from './components/layout/AppLayout';
export { default as AboutUs } from './components/layout/AboutUs';
export { default as ContactUs } from './components/layout/ContactUs';
export { default as HelpCenter } from './components/layout/HelpCenter';
export { default as BrandsFooter } from './components/layout/BrandsFooter';
export { default as DummyNavPage } from './components/layout/DummyNavPage';

// Export feature components
export { default as ShoeCard } from './components/features/ShoeCard';
export { default as ShoeList } from './components/features/shoes/ShoeList';
export { default as AllShoesPage } from './components/features/shoes/AllShoesPage';
export { default as ShoeDetailPage } from './components/features/shoes/ShoeDetailPage';
export { default as ShoppingCartPage } from './components/features/cart/ShoppingCartPage';
export { default as UserProfilePage } from './components/features/profile/UserProfilePage';
export { default as LoginForm } from './components/features/auth/LoginForm';
export { default as RegisterForm } from './components/features/auth/RegisterForm';
export { default as LoginModal } from './components/features/auth/LoginModal';
export { default as FilterBar } from './components/features/filters/FilterBar';
export { default as BrandCarousel } from './components/features/home/BrandCarousel';
export { default as HomePage } from './components/features/home/HomePage';
export { default as NewArrivalSection } from './components/features/home/NewArrivalSection';
export { default as TrendingSection } from './components/features/home/TrendingSection';
export { default as AdCard1 } from './components/features/home/AdCard1';
export { default as AdCard2 } from './components/features/home/AdCard2';
export { default as AdCard3 } from './components/features/home/AdCard3';
export { default as BrandFullPage } from './components/features/brands/BrandFullPage';
export { default as BrandCard } from './components/features/brands/BrandCard';

// Export admin components
export { default as AdminDashboard } from './components/features/admin/AdminDashboard';
export { default as ProductCreateModal } from './components/features/admin/ProductCreateModal';
export { default as ProductEditModal } from './components/features/admin/ProductEditModal';
export { default as ProductImageModal } from './components/features/admin/ProductImageModal';
export { default as ProductManagementTable } from './components/features/admin/ProductManagementTable';

// Export checkout components
export { default as CheckoutPage } from './components/features/checkout/CheckoutPage';


// Export context providers
export { AuthContext } from './components/shared/context/AuthContext';
export { AuthProvider } from './components/shared/context/AuthProvider';
