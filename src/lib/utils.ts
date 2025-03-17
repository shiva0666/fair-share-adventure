
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function getTripDetailUrl(tripId: string): string {
  if (!tripId) return "/trips";
  return `/trips/${tripId}`;
}

export function getGroupDetailUrl(groupId: string): string {
  if (!groupId) return "/groups";
  return `/groups/${groupId}`;
}

// Function to ensure we don't have undefined IDs in URLs
export function safeNavigationUrl(baseUrl: string, id?: string): string {
  if (!id) return baseUrl;
  return `${baseUrl}/${id}`;
}

// Format currency amount with appropriate symbol
export function formatAmount(amount: number, currency = "USD"): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });
  return formatter.format(amount);
}

// Create a truncated text with ellipsis if too long
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// Helper to determine if an element is fully in viewport
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Safe JSON parse with default value
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    return defaultValue;
  }
}

// Generate a random ID for new items
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
}
