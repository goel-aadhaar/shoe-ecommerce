'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus } from 'lucide-react';

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
      <button className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-bone/70 transition-colors hover:text-volt">
        {label}
        <Plus
          className={`h-3.5 w-3.5 transition-transform duration-300 ${
            isOpen ? 'rotate-45 text-volt' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      <div
        className={`fixed left-0 top-[102px] w-full border-y border-bone/10 bg-ink shadow-2xl transition-all duration-300 ${
          isOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-2 opacity-0'
        }`}
      >
        <div className="container-inner py-12">
          <div className="flex gap-16">
            {items.map((column, i) => (
              <div key={i} className="flex min-w-[220px] flex-col gap-5">
                <div className="flex items-center gap-3">
                  <span className="index-num text-xs text-cobalt">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-bone/40">
                    {column.title}
                  </h3>
                </div>
                <ul className="flex flex-col gap-1">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        href={link.href}
                        className="block font-serif text-2xl uppercase leading-tight text-bone transition-colors hover:text-volt"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {featuredImage && (
              <div className="ml-auto w-1/3 max-w-[340px]">
                <Link
                  href={featuredImage.href}
                  className="group/img relative block aspect-[4/3] overflow-hidden bg-carbon"
                  onClick={() => setIsOpen(false)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImage.src}
                    alt={featuredImage.alt}
                    className="h-full w-full object-cover opacity-70 grayscale transition-all duration-700 group-hover/img:scale-105 group-hover/img:opacity-100 group-hover/img:grayscale-0"
                  />
                  <div className="absolute inset-0 flex items-end p-6">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-volt">
                        Featured
                      </p>
                      <span className="mt-1 block font-serif text-3xl uppercase text-white">
                        {featuredImage.label}
                      </span>
                    </div>
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
