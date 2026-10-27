import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BudgetItem } from "@/types/event";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function calculateDaysRemaining(targetDate: string): {
  days: number;
  label: string;
  isPast: boolean;
} {
  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), label: `${Math.abs(diffDays)} days ago`, isPast: true };
  } else if (diffDays === 0) {
    return { days: 0, label: "Today is the day!", isPast: false };
  } else if (diffDays === 1) {
    return { days: 1, label: "Tomorrow", isPast: false };
  }
  return { days: diffDays, label: `${diffDays} days left`, isPast: false };
}

export function calculateBudgetMetrics(items: BudgetItem[], totalBudget: number) {
  const allocated = items.reduce((sum, item) => sum + (Number(item.allocated_amount) || 0), 0);
  const actual = items.reduce((sum, item) => sum + (Number(item.actual_amount) || 0), 0);
  const remaining = totalBudget - actual;
  const percentageSpent = totalBudget > 0 ? Math.min(Math.round((actual / totalBudget) * 100), 100) : 0;
  const isOverBudget = actual > totalBudget;

  return {
    allocated,
    actual,
    remaining,
    percentageSpent,
    isOverBudget,
  };
}
