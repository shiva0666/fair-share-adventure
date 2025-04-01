
import { Participant } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPaidByName(paidBy: string | string[], participants: Participant[]): string {
  if (Array.isArray(paidBy)) {
    return paidBy
      .map(id => {
        const participant = participants.find(p => p.id === id);
        return participant ? participant.name : "Unknown";
      })
      .join(", ");
  } else {
    const participant = participants.find(p => p.id === paidBy);
    return participant ? participant.name : "Unknown";
  }
}

export function getSplitMethodName(splitMethod: string | undefined, splitAmounts: Record<string, number> | undefined): string {
  if (splitMethod === "custom" || splitMethod === "manual") {
    return "Custom split";
  } else if (splitMethod === "equal" || !splitMethod) {
    return "Equal split";
  } else {
    return splitMethod;
  }
}
