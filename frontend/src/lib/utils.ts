import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fonction pour formater les prix avec la devise du salon
export function formatPrice(price: number, currency: string = 'XAF'): string {
  const currencySymbols: Record<string, string> = {
    'XAF': 'FCFA',
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'CAD': 'CAD',
    'CHF': 'CHF'
  };
  
  const symbol = currencySymbols[currency] || currency;
  return `${price.toLocaleString()} ${symbol}`;
}
