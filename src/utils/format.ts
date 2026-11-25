import type { CarSummary } from '../types/car';
import type { CustomerResponse } from '../types/customer';

// 3967.5 -> "$3,967.50"
export function formatMoney(value: number): string {
  return '$' + Number(value).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// "2026-11-24" -> "Nov 24, 2026"
// (adding T00:00 makes JS read it as a local date, otherwise it can show the day before)
export function formatDate(date: string): string {
  return new Date(date + 'T00:00').toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function carName(car: CarSummary): string {
  return `${car.year} ${car.make} ${car.model}`;
}

export function customerName(customer: CustomerResponse): string {
  return `${customer.firstName} ${customer.lastName}`;
}

// "John Smith" -> "JS"
export function initials(fullName: string): string {
  const parts = fullName.split(' ');
  return parts.map((part) => part.charAt(0).toUpperCase()).join('').slice(0, 2);
}

// "MAINTENANCE" -> "Maintenance"
export function titleCase(text: string): string {
  return text.charAt(0) + text.slice(1).toLowerCase();
}
