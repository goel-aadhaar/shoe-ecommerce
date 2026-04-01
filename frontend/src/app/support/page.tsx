const FAQS = [
  {
    q: 'How do I track my order?',
    a: 'Go to your Profile > Orders to see the status of all your orders.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 30-day return policy for unworn items in original packaging.',
  },
  {
    q: 'Do you offer international shipping?',
    a: 'Currently we ship within India. International shipping is coming soon.',
  },
  {
    q: 'How can I change my order?',
    a: 'Please contact our support team within 24 hours of placing your order.',
  },
  {
    q: 'Are the shoes authentic?',
    a: 'Yes, we only sell 100% authentic products sourced directly from brands.',
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-center font-serif text-4xl font-bold text-brown-900">
        Help Center
      </h1>
      <p className="mt-4 text-center text-brown-500">
        Find answers to frequently asked questions.
      </p>

      <div className="mt-12 space-y-4">
        {FAQS.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-lg border border-brown-200 bg-white"
          >
            <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-brown-800 hover:text-copper">
              {faq.q}
            </summary>
            <p className="px-6 pb-4 text-sm text-brown-600">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
