import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fonction pour formater les prix avec la devise du salon
export function formatPrice(price: number | null | undefined, currency: string = 'XAF'): string {
  const currencySymbols: Record<string, string> = {
    'XAF': 'FCFA',
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'CAD': 'CAD',
    'CHF': 'CHF'
  };

  const symbol = currencySymbols[currency] || currency;
  const safePrice = price ?? 0;
  return `${safePrice.toLocaleString()} ${symbol}`;
}
