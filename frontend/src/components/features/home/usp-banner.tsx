import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

const USPS = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders above ₹2,999',
  },
  {
    icon: ShieldCheck,
    title: '100% Authentic',
    description: 'Guaranteed genuine products',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '7-day hassle-free returns',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'We are always here to help',
  },
];

export function UspBanner() {
  return (
    <section className="border-b border-ink/10 bg-bone">
      <div className="container-inner">
        <div className="grid grid-cols-1 divide-y divide-ink/10 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {USPS.map((usp, i) => (
            <div
              key={usp.title}
              className="group flex items-start gap-5 py-8 sm:px-7 lg:border-l lg:border-ink/10 lg:first:border-l-0 lg:first:pl-0"
            >
              <span className="index-num shrink-0 pt-1 text-sm text-cobalt">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <usp.icon
                  className="h-6 w-6 text-ink transition-colors group-hover:text-cobalt"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 font-serif text-2xl uppercase leading-none text-ink">
                  {usp.title}
                </h3>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-ink/50">
                  {usp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
