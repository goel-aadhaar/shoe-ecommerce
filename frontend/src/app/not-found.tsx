import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-ink text-bone">
      <span
        className="pointer-events-none absolute select-none font-serif text-[42vw] leading-none text-bone/[0.04]"
        aria-hidden
      >
        404
      </span>
      <div className="relative text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-volt">
          Error 404
        </p>
        <h1 className="mt-5 font-serif text-[clamp(3rem,12vw,9rem)] leading-[0.85]">
          Off The
          <br />
          <span className="text-cobalt">Map</span>
        </h1>
        <p className="mt-6 font-sans text-sm text-bone/50">
          This page laced up and walked off. Let&apos;s get you back.
        </p>
        <Link href="/" className="btn-primary mt-10">
          Back To Index
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
