export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-center font-serif text-4xl font-bold text-brown-900">
        About Urban Sole
      </h1>
      <div className="mt-10 space-y-6 text-brown-600 leading-relaxed">
        <p>
          Founded with a passion for timeless craftsmanship, Urban Sole brings
          you premium footwear that bridges the gap between classic design and
          modern comfort.
        </p>
        <p>
          Every pair in our collection is curated with care — from the supple
          leather of our formal shoes to the innovative cushioning in our
          athletic range. We believe great shoes are the foundation of great
          style.
        </p>
        <p>
          Our commitment goes beyond fashion. We partner with brands that share
          our values of quality, sustainability, and fair craftsmanship. When
          you choose Urban Sole, you&apos;re choosing footwear that&apos;s built to
          last.
        </p>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {[
          { stat: '50+', label: 'Premium Brands' },
          { stat: '10K+', label: 'Happy Customers' },
          { stat: '24/7', label: 'Customer Support' },
        ].map((item) => (
          <div
            key={item.label}
            className="text-center rounded-lg border border-brown-200 bg-white p-6"
          >
            <p className="font-serif text-3xl font-bold text-copper">
              {item.stat}
            </p>
            <p className="mt-1 text-sm text-brown-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
