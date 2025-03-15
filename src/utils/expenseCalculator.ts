import { Expense, Participant, Settlement, Trip } from "@/types";

// Calculate each participant's share of an expense
export const calculateExpenseShare = (expense: Expense, participantId: string): number => {
  // If custom split amounts are defined
  if (expense.splitAmounts && participantId in expense.splitAmounts) {
    return expense.splitAmounts[participantId];
  }
  
  // Default equal split
  return expense.amount / expense.splitBetween.length;
};

// Calculate total paid by each participant
export const calculateTotalPaid = (
  participantId: string,
  expenses: Expense[]
): number => {
  return expenses.reduce((total, expense) => {
    // If custom payer amounts are defined
    if (expense.payerAmounts && participantId in expense.payerAmounts) {
      return total + expense.payerAmounts[participantId];
    }
    
    // Handle both string and string[] for paidBy
    if (Array.isArray(expense.paidBy)) {
      // Multiple payers - divide the amount equally between payers (if no custom amounts)
      return expense.paidBy.includes(participantId) 
        ? total + (expense.amount / expense.paidBy.length)
        : total;
    } else {
      // Single payer
      return expense.paidBy === participantId ? total + expense.amount : total;
    }
  }, 0);
};

// Calculate total share for each participant
export const calculateTotalShare = (
  participantId: string,
  expenses: Expense[]
): number => {
  return expenses
    .filter((expense) => expense.splitBetween.includes(participantId))
    .reduce(
      (total, expense) => total + calculateExpenseShare(expense, participantId),
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
export const updateParticipantBalances = (
  tripOrGroup: Trip | Omit<Group, 'startDate' | 'endDate'>
): Trip | Group => {
  // Clone the object to avoid mutating the original
  const clone = JSON.parse(JSON.stringify(tripOrGroup));
  
  // Reset all balances to 0
  clone.participants.forEach((participant: Participant) => {
    participant.balance = 0;
  });
  
  // Process each expense
  clone.expenses.forEach((expense: Expense) => {
    // Calculate who paid what
    const payers = Array.isArray(expense.paidBy) ? expense.paidBy : [expense.paidBy];
    const payerCount = payers.length;
    
    // Handle single or multiple payers
    if (payerCount === 1) {
      // Single payer - increase their balance
      const payerId = payers[0];
      const payer = clone.participants.find((p: Participant) => p.id === payerId);
      if (payer) {
        payer.balance += expense.amount;
      }
    } else if (payerCount > 1 && expense.payerAmounts) {
      // Multiple payers with custom amounts
      payers.forEach(payerId => {
        const amount = expense.payerAmounts?.[payerId] || 0;
        const payer = clone.participants.find((p: Participant) => p.id === payerId);
        if (payer) {
          payer.balance += amount;
        }
      });
    }
    
    // Calculate who owes what
    const splitBetween = expense.splitBetween;
    
    if (expense.splitAmounts) {
      // Custom split amounts
      splitBetween.forEach(participantId => {
        const amount = expense.splitAmounts?.[participantId] || 0;
        const participant = clone.participants.find((p: Participant) => p.id === participantId);
        if (participant) {
          participant.balance -= amount;
        }
      });
    } else {
      // Equal split
      const shareAmount = expense.amount / splitBetween.length;
      splitBetween.forEach(participantId => {
        const participant = clone.participants.find((p: Participant) => p.id === participantId);
        if (participant) {
          participant.balance -= shareAmount;
        }
      });
    }
  });
  
  return clone;
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

// Format currency with support for different currency codes
export const formatCurrency = (amount: number, currencyCode?: string): string => {
  const code = currencyCode || 'USD';
  
  // Currency symbols for common currencies
  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
    JPY: '¥',
    CNY: '¥',
    SGD: 'S$',
    AED: 'د.إ'
  };
  
  const symbol = CURRENCY_SYMBOLS[code] || code;
  
  // Special case for JPY which doesn't use decimals
  if (code === 'JPY') {
    return `${symbol}${Math.round(amount)}`;
  }
  
  return `${symbol}${amount.toFixed(2)}`;
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

// Generate full trip report as a string
export const generateTripReport = (trip: Trip): string => {
  // Format the date for the report
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  // Start building the report
  let report = `TRIP REPORT: ${trip.name}\n`;
  report += `Generated on: ${formattedDate}\n`;
  report += `Trip dates: ${trip.startDate} to ${trip.endDate}\n`;
  report += `Status: ${trip.status}\n\n`;
  
  // Participants
  report += `PARTICIPANTS (${trip.participants.length}):\n`;
  trip.participants.forEach(participant => {
    report += `- ${participant.name} | Balance: ${formatCurrency(participant.balance)}\n`;
  });
  
  report += `\nEXPENSES (${trip.expenses.length}):\n`;
  
  // Group expenses by date
  const expensesByDate: Record<string, Expense[]> = {};
  trip.expenses.forEach(expense => {
    if (!expensesByDate[expense.date]) {
      expensesByDate[expense.date] = [];
    }
    expensesByDate[expense.date].push(expense);
  });
  
  // Sort dates
  const sortedDates = Object.keys(expensesByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  
  // Format expenses by date
  sortedDates.forEach(date => {
    const formattedDateHeader = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    report += `\n${formattedDateHeader}:\n`;
    
    // Calculate daily total
    const dailyTotal = expensesByDate[date].reduce(
      (total, expense) => total + expense.amount, 0
    );
    
    report += `Daily Total: ${formatCurrency(dailyTotal)}\n`;
    
    // Format individual expenses
    expensesByDate[date].forEach(expense => {
      // Format the paidBy information
      let paidByText = '';
      
      if (expense.payerAmounts) {
        // Show custom payer amounts
        paidByText = Object.entries(expense.payerAmounts)
          .map(([id, amount]) => `${getParticipantName(id, trip.participants)} (${formatCurrency(amount)})`)
          .join(', ');
      } else if (Array.isArray(expense.paidBy)) {
        // Multiple payers with equal split
        paidByText = expense.paidBy
          .map(id => getParticipantName(id, trip.participants))
          .join(', ');
      } else {
        // Single payer
        paidByText = getParticipantName(expense.paidBy, trip.participants);
      }
      
      report += `- ${expense.name} | ${formatCurrency(expense.amount)} | Category: ${expense.category}\n`;
      report += `  Paid by: ${paidByText}\n`;
      
      // Show split details
      if (expense.splitAmounts) {
        report += `  Custom split:\n`;
        Object.entries(expense.splitAmounts).forEach(([id, amount]) => {
          const name = getParticipantName(id, trip.participants);
          report += `    ${name}: ${formatCurrency(amount)}\n`;
        });
      } else {
        const shareAmount = expense.amount / expense.splitBetween.length;
        report += `  Split ${expense.splitBetween.length} ways (${formatCurrency(shareAmount)}/person)\n`;
      }
      
      if (expense.notes) {
        report += `  Notes: ${expense.notes}\n`;
      }
      
      report += '\n';
    });
  });
  
  // Settlements
  const settlements = generateSettlements(trip);
  report += `\nSETTLEMENTS (${settlements.length}):\n`;
  if (settlements.length === 0) {
    report += `All balances are settled.\n`;
  } else {
    settlements.forEach(settlement => {
      const fromName = getParticipantName(settlement.from, trip.participants);
      const toName = getParticipantName(settlement.to, trip.participants);
      report += `- ${fromName} pays ${toName}: ${formatCurrency(settlement.amount)}\n`;
    });
  }
  
  // Trip totals
  const totalExpenses = calculateTotalExpenses(trip.expenses);
  report += `\nTRIP SUMMARY:\n`;
  report += `Total Expenses: ${formatCurrency(totalExpenses)}\n`;
  report += `Total Transactions: ${trip.expenses.length}\n`;
  
  return report;
};

// Download trip report as a file
export const downloadTripReport = (trip: Trip): void => {
  const report = generateTripReport(trip);
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${trip.name.replace(/\s+/g, '-').toLowerCase()}-report.txt`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};
