export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  paidBy: string | string[];
  payerAmounts?: Record<string, number>;
  splitBetween: string[];
  splitAmounts?: Record<string, number>;
  notes?: string;
  attachments?: ExpenseAttachment[];
}

export interface ExpenseAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadedAt: string;
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
  currency?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  participants: Participant[];
  expenses: Expense[];
  status: 'active' | 'completed';
  createdAt: string;
  currency?: string;
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

export type SupportedCurrency = 
  | 'USD' 
  | 'EUR' 
  | 'GBP' 
  | 'INR' 
  | 'AUD' 
  | 'CAD' 
  | 'JPY' 
  | 'CNY' 
  | 'SGD' 
  | 'AED';

export interface DashboardSummary {
  totalTrips: number;
  totalExpenses: number;
  activeTrips: number;
  tripFriends: number;
  totalGroups?: number;
  activeGroups?: number;
}
