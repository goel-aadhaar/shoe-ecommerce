import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-center font-serif text-4xl font-bold text-brown-900">
        Contact Us
      </h1>
      <p className="mt-4 text-center text-brown-500">
        We&apos;d love to hear from you. Reach out anytime.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          { icon: Mail, label: 'Email', value: 'support@urbansole.com' },
          { icon: Phone, label: 'Phone', value: '+91-800-SHOES' },
          { icon: MapPin, label: 'Address', value: 'Mumbai, India' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center rounded-lg border border-brown-200 bg-white p-6 text-center"
          >
            <item.icon className="h-6 w-6 text-copper" />
            <p className="mt-3 text-sm font-medium text-brown-800">
              {item.label}
            </p>
            <p className="mt-1 text-sm text-brown-500">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
