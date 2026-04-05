import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

const USPS = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders above Rs. 2,999',
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
    <section className="border-y border-brown-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {USPS.map((usp) => (
            <div
              key={usp.title}
              className="group flex items-start gap-4"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-copper/10 transition-colors group-hover:bg-copper/20">
                <usp.icon className="h-6 w-6 text-copper" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brown-800">
                  {usp.title}
                </h3>
                <p className="mt-1 text-sm text-brown-500">{usp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
