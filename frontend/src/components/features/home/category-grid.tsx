import Link from 'next/link';

const CATEGORIES = [
  {
    name: 'Shoes',
    href: '/collections/shoes',
    description: 'Classic & athletic footwear',
  },
  {
    name: 'Clogs',
    href: '/collections/clogs',
    description: 'Comfort meets style',
  },
  {
    name: "Men's Collection",
    href: '/collections/men',
    description: 'Curated for him',
  },
  {
    name: "Women's Collection",
    href: '/collections/women',
    description: 'Curated for her',
  },
];

export function CategoryGrid() {
  return (
    <section className="bg-brown-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-3xl font-bold text-brown-900">
          Shop by Category
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative flex flex-col items-center justify-center rounded-lg border-2 border-brown-200 bg-white p-8 text-center transition-all hover:border-copper hover:shadow-lg"
            >
              <h3 className="font-serif text-xl font-bold text-brown-800 group-hover:text-copper transition-colors">
                {cat.name}
              </h3>
              <p className="mt-2 text-sm text-brown-500">{cat.description}</p>
              <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-copper opacity-0 transition-opacity group-hover:opacity-100">
                Browse &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
