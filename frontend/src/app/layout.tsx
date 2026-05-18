import type { Metadata } from 'next';
import { Anton, Hanken_Grotesk, Space_Mono } from 'next/font/google';
import { Providers } from '@/providers/providers';
import { Navbar } from '@/components/layout/navbar';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Footer } from '@/components/layout/Footer';
import { ScrollReveal } from '@/components/common/scroll-reveal';
import './globals.css';

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'URBAN SOLE — Footwear, Engineered Loud',
  description:
    'A curated arsenal of premium sneakers. Hyped silhouettes, authentic only, shipped fast. Step louder.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${hanken.variable} ${spaceMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-bone font-sans text-ink antialiased">
        <div className="grain-layer" aria-hidden />
        <Providers>
          <ScrollReveal />
          <Navbar />
          <Breadcrumbs />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
