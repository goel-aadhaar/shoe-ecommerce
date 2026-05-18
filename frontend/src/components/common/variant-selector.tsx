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
  type = 'pill',
}: VariantSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-ink/50">
          {label}
        </span>
        <span className="font-mono text-xs font-bold uppercase text-ink">
          {variants.find((v) => v.id === selectedVariant)?.label || '—'}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = selectedVariant === v.id;

          if (type === 'color' && v.colorHex) {
            return (
              <button
                key={v.id}
                onClick={() => !v.disabled && onSelect(v.id)}
                disabled={v.disabled}
                title={v.label}
                className={`relative h-9 w-9 border-2 transition-all ${
                  isSelected
                    ? 'border-cobalt scale-110'
                    : 'border-ink/15 hover:scale-105'
                } ${v.disabled ? 'cursor-not-allowed opacity-40' : ''}`}
                style={{ backgroundColor: v.colorHex }}
              />
            );
          }

          return (
            <button
              key={v.id}
              onClick={() => !v.disabled && onSelect(v.id)}
              disabled={v.disabled}
              className={`min-w-[3rem] border px-4 py-2.5 font-mono text-sm font-bold uppercase transition-colors ${
                isSelected
                  ? 'border-cobalt bg-cobalt text-white'
                  : 'border-ink/20 text-ink hover:border-ink'
              } ${
                v.disabled
                  ? 'cursor-not-allowed border-ink/10 text-ink/30 line-through hover:border-ink/10'
                  : ''
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
