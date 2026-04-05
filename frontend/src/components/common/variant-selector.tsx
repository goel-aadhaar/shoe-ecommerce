'use client';

interface VariantInfo {
  id: string;
  label: string;
  colorHex?: string;
  disabled?: boolean;
}

interface VariantSelectorProps {
  label: string;
  variants: VariantInfo[];
  selectedVariant: string;
  onSelect: (id: string) => void;
  type?: 'pill' | 'color';
}

export function VariantSelector({
  label,
  variants,
  selectedVariant,
  onSelect,
  type = 'pill'
}: VariantSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-brown-600">{label}:</span>
        <span className="text-sm text-brown-900 font-semibold">
          {variants.find(v => v.id === selectedVariant)?.label || 'None selected'}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selectedVariant === v.id;
          
          if (type === 'color' && v.colorHex) {
            return (
              <button
                key={v.id}
                onClick={() => !v.disabled && onSelect(v.id)}
                disabled={v.disabled}
                title={v.label}
                className={`relative h-8 w-8 rounded-full border-2 transition-all ${
                  isSelected ? 'border-copper scale-110' : 'border-transparent hover:scale-105'
                } ${v.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: v.colorHex }}
              />
            );
          }

          // Default pill block
          return (
            <button
              key={v.id}
              onClick={() => !v.disabled && onSelect(v.id)}
              disabled={v.disabled}
              className={`rounded border px-4 py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-copper bg-copper text-white'
                  : 'border-brown-200 text-brown-700 hover:border-brown-400'
              } ${v.disabled ? 'opacity-50 cursor-not-allowed bg-brown-50 hover:border-brown-200' : ''}`}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
