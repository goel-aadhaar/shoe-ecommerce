import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-serif text-6xl font-bold text-brown-800">404</h1>
      <p className="mt-4 text-lg text-brown-600">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-copper px-6 py-2.5 text-sm font-semibold text-white hover:bg-sienna transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
