
import { Card, CardContent } from "@/components/ui/card";
import { Trip, Expense } from "@/types";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { formatCurrency, getParticipantName } from "@/utils/expenseCalculator";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateDailyExpensePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface ExpensesViewProps {
  trip: Trip;
  onRefresh?: () => void;
}

export function ExpensesView({ trip, onRefresh }: ExpensesViewProps) {
  const { toast } = useToast();

  // Group expenses by date
  const expensesByDate = trip.expenses.reduce<Record<string, Expense[]>>(
    (groups, expense) => {
      const date = expense.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(expense);
      return groups;
    },
    {}
  );

  // Sort dates in descending order
  const sortedDates = Object.keys(expensesByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Calculate total for each day
  const getDayTotal = (expenses: Expense[]): number => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Handle downloading daily expense report
  const handleDownloadDailyReport = async (date: string) => {
    try {
      await generateDailyExpensePDF(trip, date);
      toast({
        title: "Success",
        description: "Daily expense report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
      console.error("PDF generation error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {sortedDates.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8 text-muted-foreground">
              No expenses added yet.
            </div>
            <AddExpenseDialog trip={trip} onExpenseAdded={onRefresh} />
          </CardContent>
        </Card>
      ) : (
        <>
          {sortedDates.map((date) => (
            <Card key={date}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {format(new Date(date), "EEEE, d MMMM yyyy")}
                  </h2>
                  <div className="flex items-center gap-3">
                    <p>Total: {formatCurrency(getDayTotal(expensesByDate[date]))}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownloadDailyReport(date)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {expensesByDate[date].map((expense) => (
                    <ExpenseItem 
                      key={expense.id} 
                      expense={expense} 
                      participants={trip.participants}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <AddExpenseDialog trip={trip} onExpenseAdded={onRefresh} />
        </>
      )}
    </div>
  );
}

interface ExpenseItemProps {
  expense: Expense;
  participants: Trip["participants"];
}

function ExpenseItem({ expense, participants }: ExpenseItemProps) {
  // Modify this function to handle both string and string[] for paidBy
  const getPaidByName = (paidBy: string | string[], participants: Trip["participants"]) => {
    if (Array.isArray(paidBy)) {
      // Handle array of payer IDs
      const payerNames = paidBy.map(id => 
        getParticipantName(id, participants)
      );
      return payerNames.join(', ');
    } else {
      // Handle single payer ID
      return getParticipantName(paidBy, participants);
    }
  };

  const paidByName = getPaidByName(expense.paidBy, participants);
  const shareAmount = expense.amount / expense.splitBetween.length;
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "food":
        return "🍔";
      case "accommodation":
        return "🏨";
      case "transportation":
        return "🚕";
      case "activities":
        return "🎯";
      case "shopping":
        return "🛍️";
      default:
        return "📝";
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="text-xl">{getCategoryIcon(expense.category)}</div>
          <div>
            <h3 className="font-medium">{expense.name}</h3>
            <p className="text-sm text-muted-foreground">
              Paid by {paidByName} • Split {expense.splitBetween.length} ways
            </p>
            {expense.notes && (
              <p className="text-sm mt-1 italic">{expense.notes}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium">{formatCurrency(expense.amount)}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(shareAmount)}/person
          </p>
        </div>
      </div>
    </div>
  );
}
