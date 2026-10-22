import React from 'react';
import type { CurrencyCode } from '../types/club';
import { CURRENCIES, currencyCode } from '../utils/currency';

export const CurrencySelect: React.FC<{ value: CurrencyCode; onChange: (value: CurrencyCode) => void; label?: string }> = ({ value, onChange, label = 'Currency' }) => {
  const id = React.useId();
  return <div className="min-w-0 text-xs font-semibold text-slate-700">
    <label htmlFor={id}>{label}</label>
    <select id={id} value={value} onChange={event => onChange(currencyCode(event.target.value))}
      className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900">
      {CURRENCIES.map(currency => <option key={currency.code} value={currency.code}>{currency.code} — {currency.name}</option>)}
    </select>
  </div>;
};
