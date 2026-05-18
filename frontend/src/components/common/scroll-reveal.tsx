'use client';

import { useEffect } from 'react';

/**
 * App-wide scroll choreography. Watches for any element carrying the
 * `.scroll-reveal` class — including nodes injected later by async data —
 * and flips them to `.in-view` as they enter the viewport.
 */
export function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    const scan = () => {
      document
        .querySelectorAll('.scroll-reveal:not(.in-view)')
        .forEach((el) => io.observe(el));
    };

    scan();

    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
