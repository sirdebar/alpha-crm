import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, differenceInDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd.MM.yyyy");
}

export function calculateDaysInTeam(createdAt: Date | string): number {
  const dateObj = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  return differenceInDays(new Date(), dateObj);
}
