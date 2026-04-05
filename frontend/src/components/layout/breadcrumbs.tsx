'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on home page
  if (pathname === '/') return null;

  // Generate paths
  const paths = pathname.split('/').filter(Boolean);

  return (
    <div className="bg-brown-50 py-3">
      <div className="container-inner">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-brown-500">
            <li>
              <Link href="/" className="hover:text-copper transition-colors">
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </li>
            
            {paths.map((path, index) => {
              const href = `/${paths.slice(0, index + 1).join('/')}`;
              const isLast = index === paths.length - 1;
              const title = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

              return (
                <li key={path} className="flex items-center space-x-2">
                  <ChevronRight className="h-4 w-4" />
                  {isLast ? (
                    <span className="font-medium text-brown-900" aria-current="page">
                      {title}
                    </span>
                  ) : (
                    <Link href={href} className="hover:text-copper transition-colors">
                      {title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
