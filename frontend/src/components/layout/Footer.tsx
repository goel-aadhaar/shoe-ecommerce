import Link from 'next/link';

const QUICK_LINKS = [
  { href: '/collections/all', label: 'All Collections' },
  { href: '/collections/men', label: "Men's" },
  { href: '/collections/women', label: "Women's" },
  { href: '/brands', label: 'Brands' },
];

const SUPPORT_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/support', label: 'Help Center' },
];

export function Footer() {
  return (
    <footer className="bg-brown-900 text-brown-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-bold text-cream tracking-wider">
              URBAN SOLE
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-brown-300">
              Timeless footwear, crafted with care. Every step tells a story
              of quality and elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-cream">
              Quick Links
            </h4>
            <ul className="mt-3 space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brown-300 hover:text-copper transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-cream">
              Support
            </h4>
            <ul className="mt-3 space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brown-300 hover:text-copper transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-brown-700 pt-6 text-center text-sm text-brown-500">
          &copy; {new Date().getFullYear()} Urban Sole. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
