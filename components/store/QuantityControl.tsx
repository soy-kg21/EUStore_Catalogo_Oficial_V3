'use client';

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

export default function QuantityControl({ quantity, name, onChange }: {
  quantity: number;
  name: string;
  onChange: (quantity: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft !== null && draft !== '') {
      onChange(Math.min(100, Math.max(1, Number(draft))));
    }
    setDraft(null);
  };
  const step = (amount: number) => {
    setDraft(null);
    onChange(Math.min(100, Math.max(1, quantity + amount)));
  };

  return (
    <div className="quantity-control" role="group" aria-label={`Unidades de ${name}`}>
      <button type="button" disabled={quantity <= 1} onClick={() => step(-1)} aria-label={`Restar una unidad de ${name}`}><Minus size={16} /></button>
      <input
        type="text"
        inputMode="numeric"
        role="spinbutton"
        aria-label={`Cantidad ${name}`}
        aria-valuemin={1}
        aria-valuemax={100}
        aria-valuenow={quantity}
        autoComplete="off"
        maxLength={3}
        value={draft ?? String(quantity)}
        onFocus={event => event.currentTarget.select()}
        onChange={event => {
          const value = event.target.value;
          if (!/^\d{0,3}$/.test(value)) return;
          setDraft(value);
          const next = Number(value);
          if (value !== '' && next >= 1 && next <= 100) onChange(next);
        }}
        onBlur={commit}
        onKeyDown={event => {
          if (event.key === 'Enter') event.currentTarget.blur();
          if (event.key === 'Escape') setDraft(null);
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            step(event.key === 'ArrowUp' ? 1 : -1);
          }
        }}
      />
      <button type="button" disabled={quantity >= 100} onClick={() => step(1)} aria-label={`Sumar una unidad de ${name}`}><Plus size={16} /></button>
    </div>
  );
}
