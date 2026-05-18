"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import {
  User,
  Menu,
  X,
  LogOut,
  Heart,
  Package,
  Shield,
  ArrowUpRight,
} from "lucide-react";

import { SearchBar } from "./search-bar";
import { MegaMenu } from "./mega-menu";
import { CartDrawer } from "@/components/features/cart/cart-drawer";

const COLLECTIONS_MENU = [
  {
    title: "Categories",
    links: [
      { label: "All Sneakers", href: "/collections/all" },
      { label: "Men's Collection", href: "/collections/men" },
      { label: "Women's Collection", href: "/collections/women" },
    ],
  },
  {
    title: "Highlights",
    links: [
      { label: "Trending Now", href: "/collections/trending" },
      { label: "New Arrivals", href: "/collections/newArrival" },
      { label: "Best Sellers", href: "/collections/bestSeller" },
      { label: "On Sale", href: "/collections/onSale" },
    ],
  },
];

const BRANDS_MENU = [
  {
    title: "Top Brands",
    links: [
      { label: "Nike", href: "/collections/brand?brand=Nike" },
      { label: "Jordan", href: "/collections/brand?brand=Jordan" },
      { label: "Adidas", href: "/collections/brand?brand=adidas Originals" },
      { label: "Vans", href: "/collections/brand?brand=Vans" },
      { label: "Converse", href: "/collections/brand?brand=Converse" },
    ],
  },
];

const TICKER = [
  "FREE SHIPPING OVER ₹2,999",
  "100% AUTHENTIC — GUARANTEED",
  "NEW DROPS EVERY WEEK",
  "7-DAY HASSLE-FREE RETURNS",
  "STEP LOUDER",
];

const NAV_LINKS = [
  { label: "Index", href: "/" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Ticker strip */}
      <div className="bg-volt text-ink">
        <div className="marquee py-1.5">
          {[0, 1].map((dup) => (
            <div className="marquee__track" key={dup} aria-hidden={dup === 1}>
              {TICKER.concat(TICKER).map((t, i) => (
                <span
                  key={`${dup}-${i}`}
                  className="flex items-center gap-3 px-6 font-mono text-[11px] font-bold uppercase tracking-[0.25em]"
                >
                  {t}
                  <span className="inline-block h-1 w-1 bg-ink" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-ink/15 bg-ink text-bone">
        <div className="container-inner">
          <div className="flex h-[72px] items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="group flex items-baseline gap-1.5">
              <span className="font-serif text-[28px] leading-none tracking-tight text-bone transition-colors group-hover:text-volt">
                URBAN
              </span>
              <span className="font-serif text-[28px] leading-none tracking-tight text-cobalt transition-colors group-hover:text-volt">
                SOLE
              </span>
              <span className="mb-1 h-2 w-2 bg-volt" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-9 md:flex">
              <Link
                href="/"
                className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-bone/70 transition-colors hover:text-volt"
              >
                Index
              </Link>

              <MegaMenu
                label="Collections"
                items={COLLECTIONS_MENU}
                featuredImage={{
                  src: "https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&q=80&w=600",
                  alt: "New Arrivals Feature",
                  href: "/collections/newArrival",
                  label: "SPRING '25",
                }}
              />

              <MegaMenu label="Brands" items={BRANDS_MENU} />

              <Link
                href="/contact"
                className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-bone/70 transition-colors hover:text-volt"
              >
                Contact
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-5">
              <SearchBar />
              <CartDrawer />

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-bone/70 transition-colors hover:text-volt"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">
                      {user?.fullName?.split(" ")[0]}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-50 mt-4 w-56 border border-bone/15 bg-carbon py-2 shadow-2xl">
                        <p className="px-4 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">
                          Account
                        </p>
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-bone/80 hover:bg-cobalt hover:text-white"
                        >
                          <User className="h-4 w-4" /> Profile
                        </Link>
                        <Link
                          href="/profile?tab=orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-bone/80 hover:bg-cobalt hover:text-white"
                        >
                          <Package className="h-4 w-4" /> Orders
                        </Link>
                        <Link
                          href="/profile?tab=favourites"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-bone/80 hover:bg-cobalt hover:text-white"
                        >
                          <Heart className="h-4 w-4" /> Favourites
                        </Link>
                        {user?.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-volt hover:bg-volt hover:text-ink"
                          >
                            <Shield className="h-4 w-4" /> Admin
                          </Link>
                        )}
                        <div className="my-2 h-px bg-bone/10" />
                        <button
                          onClick={async () => {
                            await logout();
                            setUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-bone/50 hover:bg-destructive hover:text-white"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="group hidden items-center gap-2 bg-cobalt px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-volt hover:text-ink sm:flex"
                >
                  Sign In
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                className="text-bone md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileOpen && (
            <nav className="border-t border-bone/10 py-6 md:hidden">
              {[
                { label: "Index", href: "/" },
                { label: "All Sneakers", href: "/collections/all" },
                { label: "Trending", href: "/collections/trending" },
                { label: "New Arrivals", href: "/collections/newArrival" },
                { label: "Brands", href: "/brands" },
                { label: "Contact", href: "/contact" },
              ].map((link, i) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-baseline gap-4 border-b border-bone/10 py-3 last:border-0"
                >
                  <span className="index-num text-xs text-cobalt">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-3xl uppercase text-bone">
                    {link.label}
                  </span>
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-5 flex w-full items-center justify-center gap-2 bg-cobalt px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white"
                >
                  Sign In <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
