'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface MegaMenuProps {
  label: string;
  items: {
    title: string;
    links: { label: string; href: string }[];
  }[];
  featuredImage?: {
    src: string;
    alt: string;
    href: string;
    label: string;
  };
}

export function MegaMenu({ label, items, featuredImage }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 py-4 text-sm font-medium uppercase tracking-widest text-brown-200 transition-colors hover:text-copper">
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-copper' : ''
          }`}
        />
      </button>

      {/* Dropdown Container */}
      <div
        className={`fixed left-0 top-[64px] w-full border-t border-brown-700 bg-brown-900 shadow-xl transition-all duration-300 ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <div className="container-inner py-8">
          <div className="flex gap-12">
            {/* Links Columns */}
            {items.map((column, i) => (
              <div key={i} className="flex min-w-[200px] flex-col gap-4">
                <h3 className="font-serif text-lg font-bold text-cream">
                  {column.title}
                </h3>
                <ul className="flex flex-col gap-3 text-sm">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        href={link.href}
                        className="text-brown-300 transition-colors hover:text-copper"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Featured Image (Optional) */}
            {featuredImage && (
              <div className="ml-auto w-1/3 max-w-[300px]">
                <Link
                  href={featuredImage.href}
                  className="group/img relative block aspect-[4/3] overflow-hidden rounded-lg bg-brown-800"
                  onClick={() => setIsOpen(false)}
                >
                  <img
                    src={featuredImage.src}
                    alt={featuredImage.alt}
                    className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover/img:scale-105 group-hover/img:opacity-100"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover/img:bg-black/0">
                    <span className="font-serif text-xl font-bold tracking-wider text-white">
                      {featuredImage.label}
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
