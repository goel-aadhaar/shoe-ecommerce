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
  className = ""
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  return (
    <div className={`flex items-center rounded-lg border border-brown-300 bg-white ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={quantity <= min}
        className="flex h-10 w-10 items-center justify-center text-brown-500 transition-colors hover:bg-brown-50 hover:text-brown-900 disabled:opacity-50"
      >
        <Minus className="h-4 w-4" />
      </button>
      
      <div className="flex h-10 w-12 items-center justify-center font-medium text-brown-900 border-x border-brown-300">
        {quantity}
      </div>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={quantity >= max}
        className="flex h-10 w-10 items-center justify-center text-brown-500 transition-colors hover:bg-brown-50 hover:text-brown-900 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
