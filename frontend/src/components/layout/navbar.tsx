"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  Heart,
  Package,
  Shield,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/collections/all", label: "Collections" },
  { href: "/collections/trending", label: "Trending" },
  { href: "/brands", label: "Brands" },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brown-900 text-cream shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-2xl font-bold tracking-wider text-cream hover:text-brown-200 transition-colors"
          >
            URBAN SOLE
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium uppercase tracking-widest text-brown-200 hover:text-copper transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-brown-200 hover:text-copper transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-copper text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-brown-200 hover:text-copper transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm">
                    {user?.fullName?.split(" ")[0]}
                  </span>
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-md border border-brown-700 bg-brown-800 py-1 shadow-xl">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-brown-100 hover:bg-brown-700"
                      >
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link
                        href="/profile?tab=orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-brown-100 hover:bg-brown-700"
                      >
                        <Package className="h-4 w-4" /> Orders
                      </Link>
                      <Link
                        href="/profile?tab=favourites"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-brown-100 hover:bg-brown-700"
                      >
                        <Heart className="h-4 w-4" /> Favourites
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-copper hover:bg-brown-700"
                        >
                          <Shield className="h-4 w-4" /> Admin
                        </Link>
                      )}
                      <hr className="my-1 border-brown-700" />
                      <button
                        onClick={async () => {
                          await logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-brown-300 hover:bg-brown-700 hover:text-red-400"
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
                className="rounded-md bg-copper px-4 py-1.5 text-sm font-medium text-white hover:bg-sienna transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-brown-200"
              onClick={() => setMobileOpen(!mobileOpen)}
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
          <nav className="border-t border-brown-700 py-4 md:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm uppercase tracking-widest text-brown-200 hover:text-copper"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
