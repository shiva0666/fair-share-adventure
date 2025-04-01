import { Card, CardContent } from "@/components/ui/card";
import { Trip, Expense } from "@/types";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { formatCurrency, getParticipantName } from "@/utils/expenseCalculator";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Image, 
  Paperclip, 
  MoreVertical, 
  Edit, 
  Eye, 
  FileText,
  Trash2
} from "lucide-react";
import { generateDailyExpensePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { EditExpenseDialog } from "./EditExpenseDialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { generateExpensePDF } from "@/utils/pdfGenerator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface ExpensesViewProps {
  trip: Trip;
  onRefresh?: () => void;
}

export function ExpensesView({ trip, onRefresh }: ExpensesViewProps) {
  const { toast } = useToast();
  const [previewExpense, setPreviewExpense] = useState<Expense | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const queryClient = useQueryClient();

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

  const sortedDates = Object.keys(expensesByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const getDayTotal = (expenses: Expense[]): number => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

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

  const handleDownloadExpense = async (expense: Expense) => {
    try {
      await generateExpensePDF(trip, expense);
      toast({
        title: "Success",
        description: "Expense details downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate expense PDF",
        variant: "destructive",
      });
      console.error("PDF generation error:", error);
    }
  };

  const handlePreviewExpense = (expense: Expense) => {
    setPreviewExpense(expense);
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    
    try {
      if ('startDate' in trip && 'endDate' in trip) {
        const { deleteExpense } = await import('@/services/tripService');
        await deleteExpense(trip.id, expenseToDelete.id);
      } else {
        const { deleteExpense } = await import('@/services/groupService');
        await deleteExpense(trip.id, expenseToDelete.id);
      }
      
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
      queryClient.invalidateQueries({ queryKey: ['group', trip.id] });
      
      if (onRefresh) {
        onRefresh();
      }
      
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setExpenseToDelete(null);
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
                    <p>Total: {formatCurrency(getDayTotal(expensesByDate[date]), trip.currency)}</p>
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
                      onDownloadExpense={handleDownloadExpense}
                      onPreviewExpense={handlePreviewExpense}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <AddExpenseDialog trip={trip} onExpenseAdded={onRefresh} />
        </>
      )}
      
      <Dialog open={!!previewExpense} onOpenChange={(open) => !open && setPreviewExpense(null)}>
        {previewExpense && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{previewExpense.name}</DialogTitle>
              <DialogDescription>
                {format(new Date(previewExpense.date), "EEEE, d MMMM yyyy")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold">{formatCurrency(previewExpense.amount, trip.currency)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-lg font-semibold capitalize">{previewExpense.category}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid By</p>
                <p className="text-base">
                  {Array.isArray(previewExpense.paidBy) 
                    ? previewExpense.paidBy.map(id => getParticipantName(id, trip.participants)).join(', ')
                    : getParticipantName(previewExpense.paidBy, trip.participants)}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Split Between</p>
                <p className="text-base">
                  {previewExpense.splitBetween.map(id => getParticipantName(id, trip.participants)).join(', ')}
                </p>
              </div>
              
              {previewExpense.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-base">{previewExpense.notes}</p>
                </div>
              )}
              
              {previewExpense.attachments && previewExpense.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Attachments</p>
                  <div className="grid grid-cols-2 gap-2">
                    {previewExpense.attachments.map(attachment => (
                      <a 
                        key={attachment.id}
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-2 border rounded hover:bg-muted/50"
                      >
                        {attachment.thumbnailUrl ? (
                          <img 
                            src={attachment.thumbnailUrl} 
                            alt={attachment.filename}
                            className="w-8 h-8 mr-2 object-cover rounded" 
                          />
                        ) : (
                          <FileText className="w-8 h-8 mr-2 text-muted-foreground" />
                        )}
                        <span className="text-sm truncate">{attachment.filename}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPreviewExpense(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => handleDownloadExpense(previewExpense)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteExpense}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ExpenseItemProps {
  expense: Expense;
  participants: Trip["participants"];
  trip: Trip;
  onExpenseUpdated?: () => void;
  onDownloadExpense: (expense: Expense) => void;
  onPreviewExpense: (expense: Expense) => void;
}

function ExpenseItem({ 
  expense, 
  participants, 
  trip, 
  onExpenseUpdated,
  onDownloadExpense,
  onPreviewExpense 
}: ExpenseItemProps) {
  const getPaidByName = (paidBy: string | string[], participants: Trip["participants"]) => {
    if (Array.isArray(paidBy)) {
      const payerNames = paidBy.map(id => 
        getParticipantName(id, participants)
      );
      return payerNames.join(', ');
    } else {
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

  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="text-xl">{getCategoryIcon(expense.category)}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{expense.name}</h3>
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
        <div className="flex items-start gap-2">
          <div className="text-right">
            <p className="font-medium">{formatCurrency(expense.amount, trip.currency)}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(shareAmount, trip.currency)}/person
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Expense</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPreviewExpense(expense)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>Preview Expense</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownloadExpense(expense)}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Download Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  const confirmDelete = document.getElementById(`delete-expense-${expense.id}-trigger`);
                  if (confirmDelete) confirmDelete.click();
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Expense</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {showEditDialog && (
            <EditExpenseDialog 
              trip={trip} 
              expense={expense} 
              onExpenseUpdated={() => {
                if (onExpenseUpdated) onExpenseUpdated();
                setShowEditDialog(false);
              }} 
              isOpen={showEditDialog}
              onOpenChange={setShowEditDialog}
            />
          )}
          
          <Button 
            id={`delete-expense-${expense.id}-trigger`} 
            className="hidden"
            onClick={() => {
              (window as any).expenseViewComponent.setExpenseToDelete(expense);
              (window as any).expenseViewComponent.setDeleteConfirmOpen(true);
            }}
          />
        </div>
      </div>
    </div>
  );
}
