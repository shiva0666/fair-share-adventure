
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { Participant } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy");
  } catch (error) {
    console.error("Invalid date:", dateString);
    return dateString;
  }
}

export function getPaidByName(paidBy: string | string[], participants: Participant[]): string {
  if (Array.isArray(paidBy)) {
    if (paidBy.length === 0) return "Unknown";
    
    const names = paidBy.map(id => {
      const participant = participants.find(p => p.id === id);
      return participant ? participant.name : "Unknown";
    });
    
    return names.join(", ");
  } else {
    const participant = participants.find(p => p.id === paidBy);
    return participant ? participant.name : "Unknown";
  }
}

export function getSplitMethodName(method: string, amounts?: Record<string, number>): string {
  if (method === "equal") return "Equal split";
  if (method === "custom" && amounts) return "Custom split";
  if (method === "percentage") return "Percentage split";
  return "Equal split";
}

export function getTripDetailUrl(tripId: string): string {
  return `/trips/${tripId}`;
}

export function getGroupDetailUrl(groupId: string): string {
  return `/groups/${groupId}`;
}
