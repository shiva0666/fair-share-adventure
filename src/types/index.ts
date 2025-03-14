
export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  paidBy: string[] | string; // Now supports multiple payers
  payerAmounts?: Record<string, number>; // Amount contributed by each payer
  splitBetween: string[];
  splitAmounts?: Record<string, number>; // Custom split amounts by participant id
  notes?: string;
  attachments?: ExpenseAttachment[]; // Optional file attachments
}

export interface ExpenseAttachment {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string;
  balance: number;
  email?: string;
  phone?: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  expenses: Expense[];
  status: 'active' | 'completed';
  createdAt: string;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
  settled?: boolean;
}

export type ExpenseCategory = 
  | 'food' 
  | 'accommodation' 
  | 'transportation' 
  | 'activities' 
  | 'shopping' 
  | 'other';

export interface DashboardSummary {
  totalTrips: number;
  totalExpenses: number;
  activeTrips: number;
  tripFriends: number;
}
