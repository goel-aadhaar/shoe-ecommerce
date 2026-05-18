import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

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

function LinkCol({
  title,
  index,
  links,
}: {
  title: string;
  index: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="index-num text-xs text-cobalt">{index}</span>
        <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-bone/40">
          {title}
        </h4>
      </div>
      <ul className="mt-6 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1.5 font-serif text-xl uppercase text-bone/85 transition-colors hover:text-volt"
            >
              {link.label}
              <ArrowUpRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-ink text-bone">
      {/* Marquee band */}
      <div className="border-y border-bone/10 bg-cobalt text-white">
        <div className="marquee py-3">
          {[0, 1].map((dup) => (
            <div className="marquee__track" key={dup} aria-hidden={dup === 1}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={`${dup}-${i}`}
                  className="flex items-center gap-5 px-6 font-serif text-2xl uppercase tracking-tight"
                >
                  Step Louder
                  <span className="inline-block h-2 w-2 bg-volt" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="container-inner py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <h3 className="font-serif text-5xl leading-[0.85] sm:text-6xl">
              <span className="text-bone">URBAN</span>
              <br />
              <span className="text-cobalt">SOLE</span>
              <span className="ml-2 inline-block h-3 w-3 bg-volt align-baseline" />
            </h3>
            <p className="mt-6 max-w-sm font-sans text-sm leading-relaxed text-bone/50">
              A curated arsenal of premium footwear. Hyped silhouettes,
              authentic only, shipped fast. Every step tells a story.
            </p>
          </div>

          <div className="lg:col-span-3 lg:col-start-7">
            <LinkCol title="Shop" index="01" links={QUICK_LINKS} />
          </div>
          <div className="lg:col-span-3">
            <LinkCol title="Support" index="02" links={SUPPORT_LINKS} />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-bone/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/40">
            &copy; {new Date().getFullYear()} Urban Sole — All Rights Reserved
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/40">
            Engineered Loud · Made For The Streets
          </p>
        </div>
      </div>
    </footer>
  );
}
