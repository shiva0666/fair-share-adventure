
import { Card, CardContent } from "@/components/ui/card";
import { Trip, Expense } from "@/types";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { formatCurrency, getParticipantName } from "@/utils/expenseCalculator";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Image, Paperclip } from "lucide-react";
import { generateDailyExpensePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { EditExpenseDialog } from "./EditExpenseDialog";

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
                      trip={trip}
                      onExpenseUpdated={onRefresh}
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
  trip: Trip;
  onExpenseUpdated?: () => void;
}

function ExpenseItem({ expense, participants, trip, onExpenseUpdated }: ExpenseItemProps) {
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

  const hasAttachments = expense.attachments && expense.attachments.length > 0;

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="text-xl">{getCategoryIcon(expense.category)}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{expense.name}</h3>
              <EditExpenseDialog 
                trip={trip} 
                expense={expense} 
                onExpenseUpdated={onExpenseUpdated} 
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Paid by {paidByName} • Split {expense.splitBetween.length} ways
            </p>
            {expense.notes && (
              <p className="text-sm mt-1 italic">{expense.notes}</p>
            )}
            
            {hasAttachments && (
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                <span>{expense.attachments!.length} attachment{expense.attachments!.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {hasAttachments && (
              <div className="flex gap-2 mt-2">
                {expense.attachments!.slice(0, 3).map((attachment) => (
                  attachment.fileType.startsWith('image/') && attachment.thumbnailUrl ? (
                    <a 
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-12 h-12 rounded border overflow-hidden"
                    >
                      <img 
                        src={attachment.thumbnailUrl} 
                        alt={attachment.filename}
                        className="w-full h-full object-cover" 
                      />
                    </a>
                  ) : (
                    <a
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 rounded border bg-muted"
                    >
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </a>
                  )
                ))}
                {expense.attachments!.length > 3 && (
                  <div className="flex items-center justify-center w-12 h-12 rounded border bg-muted">
                    <span className="text-xs text-muted-foreground">+{expense.attachments!.length - 3}</span>
                  </div>
                )}
              </div>
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
