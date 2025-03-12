
import { Expense, Participant, Settlement, Trip } from "@/types";

// Calculate each participant's share of an expense
export const calculateExpenseShare = (expense: Expense): number => {
  return expense.amount / expense.splitBetween.length;
};

// Calculate total paid by each participant
export const calculateTotalPaid = (
  participantId: string,
  expenses: Expense[]
): number => {
  return expenses
    .filter((expense) => expense.paidBy === participantId)
    .reduce((total, expense) => total + expense.amount, 0);
};

// Calculate total share for each participant
export const calculateTotalShare = (
  participantId: string,
  expenses: Expense[]
): number => {
  return expenses
    .filter((expense) => expense.splitBetween.includes(participantId))
    .reduce(
      (total, expense) => total + expense.amount / expense.splitBetween.length,
      0
    );
};

// Calculate balance for each participant
export const calculateBalance = (
  participantId: string,
  expenses: Expense[]
): number => {
  const totalPaid = calculateTotalPaid(participantId, expenses);
  const totalShare = calculateTotalShare(participantId, expenses);
  return +(totalPaid - totalShare).toFixed(2); // Round to 2 decimal places
};

// Update all participant balances
export const updateParticipantBalances = (trip: Trip): Trip => {
  const updatedParticipants = trip.participants.map((participant) => ({
    ...participant,
    balance: calculateBalance(participant.id, trip.expenses),
  }));

  return {
    ...trip,
    participants: updatedParticipants,
  };
};

// Generate settlement suggestions to minimize transactions
export const generateSettlements = (trip: Trip): Settlement[] => {
  // Create a copy of participants to work with
  const participants = [...trip.participants];
  
  // Sort by balance (ascending)
  participants.sort((a, b) => a.balance - b.balance);
  
  const settlements: Settlement[] = [];
  
  // Process debtors and creditors
  let i = 0; // Index for debtors (negative balance)
  let j = participants.length - 1; // Index for creditors (positive balance)
  
  while (i < j) {
    const debtor = participants[i];
    const creditor = participants[j];
    
    // Skip if balance is already settled (zero or within tolerance)
    if (Math.abs(debtor.balance) < 0.01) {
      i++;
      continue;
    }
    
    if (Math.abs(creditor.balance) < 0.01) {
      j--;
      continue;
    }
    
    // Calculate the amount to settle
    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
    
    if (amount > 0) {
      // Add settlement
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: +amount.toFixed(2), // Round to 2 decimal places
        settled: false,
      });
      
      // Update balances
      participants[i].balance += amount;
      participants[j].balance -= amount;
    }
    
    // Move to next participant if balance is settled
    if (Math.abs(participants[i].balance) < 0.01) i++;
    if (Math.abs(participants[j].balance) < 0.01) j--;
  }
  
  return settlements;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

// Calculate total expenses in a trip
export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

// Get participant name by ID
export const getParticipantName = (
  participantId: string,
  participants: Participant[]
): string => {
  const participant = participants.find((p) => p.id === participantId);
  return participant ? participant.name : "Unknown";
};
