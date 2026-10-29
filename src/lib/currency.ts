export interface CurrencyOption {
  code: string;
  symbol: string;
  label: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'AED', symbol: 'AED', label: 'AED (AED)' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
  { code: 'SGD', symbol: 'S$', label: 'SGD (S$)' },
];

export const getCurrencySymbol = (code?: string): string => {
  if (!code) return '₹';
  const found = SUPPORTED_CURRENCIES.find(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  );
  return found ? found.symbol : code;
};

export const formatPriceWithCurrency = (amount: number | string, code?: string): string => {
  const sym = getCurrencySymbol(code);
  const num = Number(amount);
  const formatted = isNaN(num) ? amount : num.toLocaleString();
  return `${sym}${formatted}`;
};
