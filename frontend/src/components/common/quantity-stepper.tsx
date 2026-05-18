'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function QuantityStepper({
  quantity,
  min = 1,
  max = 99,
  onChange,
  className = '',
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  return (
    <div
      className={`inline-flex items-center border border-ink/20 bg-paper ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= min}
        className="flex h-11 w-11 items-center justify-center text-ink transition-colors hover:bg-ink hover:text-bone disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
      >
        <Minus className="h-4 w-4" />
      </button>

      <div className="flex h-11 w-14 items-center justify-center border-x border-ink/20 font-mono text-sm font-bold text-ink">
        {String(quantity).padStart(2, '0')}
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max}
        className="flex h-11 w-11 items-center justify-center text-ink transition-colors hover:bg-ink hover:text-bone disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
