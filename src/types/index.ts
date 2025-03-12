
export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  paidBy: string;
  splitBetween: string[];
}

export interface Participant {
  id: string;
  name: string;
  balance: number;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  expenses: Expense[];
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}
