
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Trip, Expense, Participant } from "@/types";
import { formatCurrency } from "./expenseCalculator";
import { format } from "date-fns";
import { getPaidByName } from "@/lib/utils";

// Helper function to create a simple PDF with basic styling
const createBasicPdf = () => {
  const pdf = new jsPDF("p", "pt", "a4");
  
  // Add company logo and name
  pdf.setFontSize(24);
  pdf.setTextColor(33, 150, 243); // Brand blue color
  pdf.text("Splittos", 40, 40);
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Expense Management Made Simple", 40, 55);
  
  pdf.setDrawColor(200, 200, 200);
  pdf.line(40, 65, 550, 65);
  
  return pdf;
};

// Function to calculate split amounts for an expense
const calculateSplitAmounts = (expense: Expense, participants: Participant[]) => {
  const splitDetails = [];
  
  // If custom split amounts are defined
  if (expense.splitAmounts) {
    for (const participantId of expense.splitBetween) {
      const participant = participants.find(p => p.id === participantId);
      if (participant) {
        splitDetails.push({
          name: participant.name,
          amount: expense.splitAmounts[participantId] || 0
        });
      }
    }
  } else {
    // Equal split
    const amount = expense.amount / expense.splitBetween.length;
    for (const participantId of expense.splitBetween) {
      const participant = participants.find(p => p.id === participantId);
      if (participant) {
        splitDetails.push({
          name: participant.name,
          amount
        });
      }
    }
  }
  
  return splitDetails;
};

// Calculate who needs to pay whom based on balances
const calculateSettlements = (participants: Participant[]) => {
  const settlements = [];
  const debtors = participants.filter(p => p.balance < 0).sort((a, b) => a.balance - b.balance);
  const creditors = participants.filter(p => p.balance > 0).sort((a, b) => b.balance - a.balance);

  // Create simplified settlement plan
  for (const debtor of debtors) {
    let remaining = Math.abs(debtor.balance);
    
    for (const creditor of creditors) {
      if (remaining <= 0 || creditor.balance <= 0) continue;
      
      const amount = Math.min(remaining, creditor.balance);
      if (amount > 0.01) { // Ignore very small amounts
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount
        });
        
        remaining -= amount;
        creditor.balance -= amount; // Mutate the balance for calculation purposes only
      }
    }
  }
  
  return settlements;
};

// Function to generate a PDF report for an entire trip
export const generateTripPDF = async (trip: Trip): Promise<void> => {
  try {
    const pdf = createBasicPdf();
    
    // Add trip information header
    pdf.setFontSize(18);
    pdf.setTextColor(50, 50, 50);
    pdf.text(`Trip Report: ${trip.name}`, 40, 100);
    
    pdf.setFontSize(12);
    const dateRange = `${format(new Date(trip.startDate), "MMM d, yyyy")} - ${format(new Date(trip.endDate), "MMM d, yyyy")}`;
    pdf.text(dateRange, 40, 120);
    
    // Add participants
    pdf.setFontSize(14);
    pdf.text("Participants:", 40, 150);
    
    pdf.setFontSize(12);
    trip.participants.forEach((participant, index) => {
      pdf.text(`• ${participant.name} (Balance: ${formatCurrency(participant.balance, trip.currency)})`, 55, 170 + (index * 20));
    });
    
    // Add expenses summary
    const expenseY = 190 + (trip.participants.length * 20);
    pdf.setFontSize(14);
    pdf.text("Expenses Summary:", 40, expenseY);
    
    let totalExpenses = 0;
    trip.expenses.forEach(expense => totalExpenses += expense.amount);
    
    pdf.setFontSize(12);
    pdf.text(`Total Expenses: ${formatCurrency(totalExpenses, trip.currency)}`, 55, expenseY + 20);
    pdf.text(`Number of Expenses: ${trip.expenses.length}`, 55, expenseY + 40);
    
    // Add settlement summary section
    pdf.setFontSize(14);
    pdf.text("Settlement Summary:", 40, expenseY + 70);
    
    // Calculate settlements
    const settlements = calculateSettlements([...trip.participants]);
    
    let currentY = expenseY + 90;
    
    if (settlements.length === 0) {
      pdf.setFontSize(12);
      pdf.text("All expenses are settled. No payments required.", 55, currentY);
      currentY += 20;
    } else {
      pdf.setFontSize(12);
      pdf.text("To settle all expenses, the following payments should be made:", 55, currentY);
      currentY += 20;
      
      settlements.forEach((settlement, index) => {
        pdf.text(`${index + 1}. ${settlement.from} pays ${formatCurrency(settlement.amount, trip.currency)} to ${settlement.to}`, 70, currentY);
        currentY += 20;
      });
    }
    
    // Add individual contribution summary
    pdf.setFontSize(14);
    pdf.text("Individual Contributions:", 40, currentY + 20);
    currentY += 40;
    
    // For each participant, show how much they paid and how much they owe/are owed
    trip.participants.forEach((participant) => {
      // Check if we need a new page
      if (currentY > 700) {
        pdf.addPage();
        currentY = 50;
      }
      
      // Calculate total paid by this participant
      let totalPaid = 0;
      trip.expenses.forEach(expense => {
        if (typeof expense.paidBy === 'string' && expense.paidBy === participant.id) {
          totalPaid += expense.amount;
        } else if (Array.isArray(expense.paidBy) && expense.paidBy.includes(participant.id)) {
          if (expense.payerAmounts && expense.payerAmounts[participant.id]) {
            totalPaid += expense.payerAmounts[participant.id];
          } else {
            totalPaid += expense.amount / expense.paidBy.length;
          }
        }
      });
      
      // Calculate share of expenses (amount used)
      let totalShare = 0;
      trip.expenses.forEach(expense => {
        if (expense.splitBetween.includes(participant.id)) {
          if (expense.splitAmounts && expense.splitAmounts[participant.id]) {
            totalShare += expense.splitAmounts[participant.id];
          } else {
            totalShare += expense.amount / expense.splitBetween.length;
          }
        }
      });
      
      pdf.setFontSize(12);
      pdf.setTextColor(33, 150, 243);
      pdf.text(`${participant.name}:`, 55, currentY);
      
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(11);
      pdf.text(`• Paid: ${formatCurrency(totalPaid, trip.currency)}`, 70, currentY + 20);
      pdf.text(`• Share of expenses: ${formatCurrency(totalShare, trip.currency)}`, 70, currentY + 40);
      
      if (participant.balance > 0) {
        pdf.text(`• Is owed: ${formatCurrency(participant.balance, trip.currency)}`, 70, currentY + 60);
      } else if (participant.balance < 0) {
        pdf.text(`• Owes others: ${formatCurrency(Math.abs(participant.balance), trip.currency)}`, 70, currentY + 60);
      } else {
        pdf.text(`• All settled (no money owed)`, 70, currentY + 60);
      }
      
      currentY += 90;
    });
    
    // Add expense details
    pdf.addPage();
    currentY = 50;
    
    pdf.setFontSize(14);
    pdf.setTextColor(50, 50, 50);
    pdf.text("Expense Details:", 40, currentY);
    currentY += 20;
    
    trip.expenses.forEach((expense, index) => {
      // Check if we need a new page
      if (currentY > 700) {
        pdf.addPage();
        currentY = 50;
      }
      
      const paidBy = typeof expense.paidBy === 'string'
        ? getPaidByName(expense.paidBy, trip.participants)
        : expense.paidBy.map(id => getPaidByName(id, trip.participants)).join(", ");
      
      pdf.setFontSize(12);
      pdf.setTextColor(33, 150, 243);
      pdf.text(`${index + 1}. ${expense.name} - ${formatCurrency(expense.amount, trip.currency)}`, 55, currentY);
      
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(10);
      pdf.text(`Date: ${format(new Date(expense.date), "MMM d, yyyy")}`, 70, currentY + 15);
      pdf.text(`Category: ${expense.category}`, 70, currentY + 30);
      pdf.text(`Paid by: ${paidBy}`, 70, currentY + 45);
      
      if (expense.notes) {
        pdf.text(`Notes: ${expense.notes}`, 70, currentY + 60);
        currentY += 75;
      } else {
        currentY += 60;
      }
    });
    
    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated by Splittos on ${format(new Date(), "MMM d, yyyy")}`, 40, 800);
    
    // Save the PDF
    pdf.save(`${trip.name}_Report.pdf`);
    
  } catch (error) {
    console.error("Error generating trip PDF:", error);
    throw error;
  }
};

// Function to generate a PDF for a single expense
export const generateExpensePDF = async (trip: Trip, expense: Expense): Promise<void> => {
  try {
    const pdf = createBasicPdf();
    
    // Add expense header
    pdf.setFontSize(18);
    pdf.setTextColor(50, 50, 50);
    pdf.text(`Expense Receipt: ${expense.name}`, 40, 100);
    
    // Add basic expense details
    pdf.setFontSize(14);
    pdf.text("Expense Details:", 40, 130);
    
    pdf.setFontSize(12);
    pdf.text(`Amount: ${formatCurrency(expense.amount, trip.currency)}`, 55, 150);
    pdf.text(`Date: ${format(new Date(expense.date), "MMM d, yyyy")}`, 55, 170);
    pdf.text(`Category: ${expense.category}`, 55, 190);
    
    // Add payer information
    const paidBy = typeof expense.paidBy === 'string'
      ? getPaidByName(expense.paidBy, trip.participants)
      : expense.paidBy.map(id => getPaidByName(id, trip.participants)).join(", ");
    
    pdf.text(`Paid by: ${paidBy}`, 55, 210);
    
    // Add split information
    pdf.setFontSize(14);
    pdf.text("Split Details:", 40, 240);
    
    // Calculate and show how the expense is split
    const splitDetails = calculateSplitAmounts(expense, trip.participants);
    
    pdf.setFontSize(12);
    let currentY = 260;
    splitDetails.forEach(split => {
      pdf.text(`• ${split.name}: ${formatCurrency(split.amount, trip.currency)}`, 55, currentY);
      currentY += 20;
    });
    
    // Add expense summary section with clear language
    pdf.setFontSize(14);
    pdf.text("Expense Summary:", 40, currentY + 20);
    currentY += 40;
    
    pdf.setFontSize(12);
    if (typeof expense.paidBy === 'string') {
      const payer = trip.participants.find(p => p.id === expense.paidBy);
      if (payer) {
        pdf.text(`${payer.name} paid ${formatCurrency(expense.amount, trip.currency)} for this expense.`, 55, currentY);
        currentY += 20;
      }
    } else if (Array.isArray(expense.paidBy)) {
      const payers = expense.paidBy.map(id => {
        const participant = trip.participants.find(p => p.id === id);
        const amount = expense.payerAmounts?.[id] || expense.amount / expense.paidBy.length;
        return {
          name: participant?.name || "Unknown",
          amount
        };
      });
      
      pdf.text(`This expense was paid by multiple people:`, 55, currentY);
      currentY += 20;
      
      payers.forEach(payer => {
        pdf.text(`• ${payer.name}: ${formatCurrency(payer.amount, trip.currency)}`, 70, currentY);
        currentY += 15;
      });
      
      currentY += 5;
    }
    
    // Who owes what
    const nonPayers = expense.splitBetween.filter(id => {
      if (typeof expense.paidBy === 'string') {
        return id !== expense.paidBy;
      } else {
        return !expense.paidBy.includes(id);
      }
    });
    
    if (nonPayers.length > 0) {
      pdf.text(`The following people owe money for this expense:`, 55, currentY);
      currentY += 20;
      
      nonPayers.forEach(id => {
        const participant = trip.participants.find(p => p.id === id);
        if (participant) {
          const amount = expense.splitAmounts?.[id] || expense.amount / expense.splitBetween.length;
          pdf.text(`• ${participant.name} owes ${formatCurrency(amount, trip.currency)}`, 70, currentY);
          currentY += 15;
        }
      });
    }
    
    // Add notes if available
    if (expense.notes) {
      pdf.setFontSize(14);
      pdf.text("Notes:", 40, currentY + 20);
      pdf.setFontSize(12);
      pdf.text(expense.notes, 55, currentY + 40);
      currentY += 60;
    }
    
    // Add trip reference
    pdf.setFontSize(14);
    pdf.text("Trip Reference:", 40, currentY + 20);
    pdf.setFontSize(12);
    pdf.text(`Trip: ${trip.name}`, 55, currentY + 40);
    const dateRange = `${format(new Date(trip.startDate), "MMM d, yyyy")} - ${format(new Date(trip.endDate), "MMM d, yyyy")}`;
    pdf.text(`Trip Dates: ${dateRange}`, 55, currentY + 60);
    
    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated by Splittos on ${format(new Date(), "MMM d, yyyy")}`, 40, 800);
    
    // Save the PDF
    pdf.save(`${expense.name}_Receipt.pdf`);
    
  } catch (error) {
    console.error("Error generating expense PDF:", error);
    throw error;
  }
};

// Function to generate a detailed PDF for a group
export const generateGroupPDF = async (group: any): Promise<void> => {
  try {
    const pdf = createBasicPdf();
    
    // Add group information header
    pdf.setFontSize(18);
    pdf.setTextColor(50, 50, 50);
    pdf.text(`Group Report: ${group.name}`, 40, 100);
    
    pdf.setFontSize(12);
    pdf.text(`Created: ${format(new Date(group.createdAt), "MMM d, yyyy")}`, 40, 120);
    
    // Add participants
    pdf.setFontSize(14);
    pdf.text("Participants:", 40, 150);
    
    pdf.setFontSize(12);
    group.participants.forEach((participant: any, index: number) => {
      pdf.text(`• ${participant.name} (Balance: ${formatCurrency(participant.balance, group.currency || 'USD')})`, 55, 170 + (index * 20));
    });
    
    // Add expenses summary
    const expenseY = 190 + (group.participants.length * 20);
    pdf.setFontSize(14);
    pdf.text("Expenses Summary:", 40, expenseY);
    
    let totalExpenses = 0;
    group.expenses.forEach((expense: any) => totalExpenses += expense.amount);
    
    pdf.setFontSize(12);
    pdf.text(`Total Expenses: ${formatCurrency(totalExpenses, group.currency || 'USD')}`, 55, expenseY + 20);
    pdf.text(`Number of Expenses: ${group.expenses.length}`, 55, expenseY + 40);
    
    // Add settlement summary section
    pdf.setFontSize(14);
    pdf.text("Settlement Summary:", 40, expenseY + 70);
    
    // Calculate settlements
    const settlements = calculateSettlements([...group.participants]);
    
    let currentY = expenseY + 90;
    
    if (settlements.length === 0) {
      pdf.setFontSize(12);
      pdf.text("All expenses are settled. No payments required.", 55, currentY);
      currentY += 20;
    } else {
      pdf.setFontSize(12);
      pdf.text("To settle all expenses, the following payments should be made:", 55, currentY);
      currentY += 20;
      
      settlements.forEach((settlement: any, index: number) => {
        pdf.text(`${index + 1}. ${settlement.from} pays ${formatCurrency(settlement.amount, group.currency || 'USD')} to ${settlement.to}`, 70, currentY);
        currentY += 20;
      });
    }
    
    // Add expense details
    pdf.setFontSize(14);
    pdf.text("Expense Details:", 40, currentY + 30);
    
    currentY = currentY + 50;
    
    group.expenses.forEach((expense: any, index: number) => {
      // Check if we need a new page
      if (currentY > 750) {
        pdf.addPage();
        currentY = 50;
      }
      
      const paidBy = typeof expense.paidBy === 'string'
        ? getPaidByName(expense.paidBy, group.participants)
        : expense.paidBy.map((id: string) => getPaidByName(id, group.participants)).join(", ");
      
      pdf.setFontSize(12);
      pdf.setTextColor(33, 150, 243);
      pdf.text(`${index + 1}. ${expense.name} - ${formatCurrency(expense.amount, group.currency || 'USD')}`, 55, currentY);
      
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(10);
      pdf.text(`Date: ${format(new Date(expense.date), "MMM d, yyyy")}`, 70, currentY + 15);
      pdf.text(`Category: ${expense.category}`, 70, currentY + 30);
      pdf.text(`Paid by: ${paidBy}`, 70, currentY + 45);
      
      if (expense.notes) {
        pdf.text(`Notes: ${expense.notes}`, 70, currentY + 60);
        currentY += 75;
      } else {
        currentY += 60;
      }
    });
    
    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated by Splittos on ${format(new Date(), "MMM d, yyyy")}`, 40, 800);
    
    // Save the PDF
    pdf.save(`${group.name}_Report.pdf`);
    
  } catch (error) {
    console.error("Error generating group PDF:", error);
    throw error;
  }
};
