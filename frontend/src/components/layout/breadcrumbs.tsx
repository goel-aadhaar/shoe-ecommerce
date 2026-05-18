'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on home page
  if (pathname === '/') return null;

  const paths = pathname.split('/').filter(Boolean);

  return (
    <div className="border-b border-ink/10 bg-bone-deep">
      <div className="container-inner">
        <nav aria-label="Breadcrumb" className="py-3.5">
          <ol className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/50">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-cobalt"
              >
                Index
              </Link>
            </li>

            {paths.map((path, index) => {
              const href = `/${paths.slice(0, index + 1).join('/')}`;
              const isLast = index === paths.length - 1;
              const title = path
                .charAt(0)
                .toUpperCase()
                .concat(path.slice(1).replace(/-/g, ' '));

              return (
                <li key={path} className="flex items-center gap-2">
                  <span className="text-cobalt">/</span>
                  {isLast ? (
                    <span
                      className="font-bold text-ink"
                      aria-current="page"
                    >
                      {title}
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className="transition-colors hover:text-cobalt"
                    >
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
