import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with conflict resolution.
 * Lightweight alternative to full clsx + twMerge — we inline clsx here
 * to avoid an extra dependency.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string for display (e.g., "Sep 23, 2026").
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Calculate days overdue from today. Returns negative if future, 0 if today.
 */
export function daysOverdue(dueDate: string | null): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Priority badge color class mapping.
 */
export function priorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-danger/20 text-danger";
    case "medium":
      return "bg-warning/20 text-warning";
    case "low":
      return "bg-success/20 text-success";
    default:
      return "bg-bg-tertiary text-text-secondary";
  }
}

/**
 * Status badge color class mapping.
 */
export function statusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-success/20 text-success";
    case "overdue":
      return "bg-danger/20 text-danger";
    case "pending":
      return "bg-warning/20 text-warning";
    default:
      return "bg-bg-tertiary text-text-secondary";
  }
}

/**
 * Generate a simple UUID v4 (for client-side optimistic IDs).
 */
export function generateId(): string {
  return crypto.randomUUID();
}
