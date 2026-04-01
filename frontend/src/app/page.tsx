import { HeroSection } from '@/components/features/home/hero-section';
import { FeaturedProducts } from '@/components/features/home/featured-products';
import { CategoryGrid } from '@/components/features/home/category-grid';
import { BrandShowcase } from '@/components/features/home/brand-showcase';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts
        title="Trending Now"
        attribute="trending"
        viewAllHref="/collections/trending"
      />
      <CategoryGrid />
      <FeaturedProducts
        title="New Arrivals"
        attribute="newArrival"
        viewAllHref="/collections/newArrival"
      />
      <BrandShowcase />
      <FeaturedProducts
        title="Best Sellers"
        attribute="bestSeller"
        viewAllHref="/collections/bestSeller"
      />
    </>
  );
}
