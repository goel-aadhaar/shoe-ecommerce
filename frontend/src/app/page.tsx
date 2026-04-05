import { HeroSection } from '@/components/features/home/hero-section';
import { UspBanner } from '@/components/features/home/usp-banner';
import { FeaturedProducts } from '@/components/features/home/featured-products';
import { CategoryGrid } from '@/components/features/home/category-grid';
import { BrandShowcase } from '@/components/features/home/brand-showcase';
import { ProductSpotlight } from '@/components/features/home/product-spotlight';
import { Testimonials } from '@/components/features/home/testimonials';
import { Newsletter } from '@/components/features/home/newsletter';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <UspBanner />

      <FeaturedProducts
        title="Latest Drops"
        subtitle="Just In"
        fetchType="all"
        limit={10}
        page={1}
        viewAllHref="/collections/all"
      />

      <CategoryGrid />

      <FeaturedProducts
        title="Nike Collection"
        subtitle="Featured Brand"
        fetchType="brand"
        fetchKey="Nike"
        limit={8}
        viewAllHref="/collections/brand?brand=Nike"
      />

      <ProductSpotlight />

      <FeaturedProducts
        title="Jordan Exclusives"
        subtitle="Hype Drop"
        fetchType="brand"
        fetchKey="Jordan"
        limit={8}
        viewAllHref="/collections/brand?brand=Jordan"
      />

      <BrandShowcase />

      <FeaturedProducts
        title="Adidas Originals"
        subtitle="Classic Style"
        fetchType="brand"
        fetchKey="adidas Originals"
        limit={8}
        viewAllHref="/collections/brand?brand=adidas+Originals"
      />

      <Testimonials />
      <Newsletter />
    </>
  );
}
