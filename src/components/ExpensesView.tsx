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
  Trash2,
  Camera
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
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ExpensesViewProps {
  trip: Trip;
  onRefresh?: () => void;
}

export function ExpensesView({ trip, onRefresh }: ExpensesViewProps) {
  const { toast } = useToast();
  const [previewExpense, setPreviewExpense] = useState<Expense | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Make the component instance available globally for event handlers
  useEffect(() => {
    (window as any).expenseViewComponent = {
      setExpenseToDelete,
      setDeleteConfirmOpen
    };
    
    return () => {
      delete (window as any).expenseViewComponent;
    };
  }, []);

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
        const tripService = await import('@/services/tripService');
        if (typeof tripService.deleteExpense === 'function') {
          await tripService.deleteExpense(trip.id, expenseToDelete.id);
        } else {
          throw new Error('deleteExpense function not found in tripService');
        }
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
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Expense Navigation Sidebar */}
      <div className="w-full lg:w-64 shrink-0">
        <Card className="sticky top-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Expense Dates</h3>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-1 pr-2">
                {sortedDates.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No expenses yet</p>
                ) : (
                  sortedDates.map((date) => (
                    <Button
                      key={date}
                      variant={selectedDate === date ? "default" : "ghost"}
                      className="w-full justify-start text-left"
                      onClick={() => {
                        setSelectedDate(date);
                        // Scroll to the date section
                        const element = document.getElementById(`expense-date-${date}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm">{format(new Date(date), "d MMM yyyy")}</span>
                        <span className="text-xs text-muted-foreground">
                          {expensesByDate[date].length} expense{expensesByDate[date].length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Expenses Content */}
      <div className="flex-1 space-y-6">
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
              <Card key={date} id={`expense-date-${date}`}>
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
      </div>
      
      <Dialog open={!!previewExpense} onOpenChange={(open) => !open && setPreviewExpense(null)}>
        {previewExpense && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl">{previewExpense.name}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {format(new Date(previewExpense.date), "EEEE, d MMMM yyyy")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(previewExpense.amount, trip.currency)}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                  <p className="text-xl font-semibold capitalize">{previewExpense.category}</p>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-2">Paid By</p>
                <div className="font-medium">
                  {Array.isArray(previewExpense.paidBy) 
                    ? previewExpense.paidBy.map(id => getParticipantName(id, trip.participants)).join(', ')
                    : getParticipantName(previewExpense.paidBy, trip.participants)}
                </div>
                
                {previewExpense.payerAmounts && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(previewExpense.payerAmounts).map(([payerId, amount]) => (
                      <div key={payerId} className="flex justify-between text-sm">
                        <span>{getParticipantName(payerId, trip.participants)}</span>
                        <span>{formatCurrency(amount, trip.currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-2">Split Between</p>
                <div className="grid grid-cols-2 gap-2">
                  {previewExpense.splitBetween.map(id => (
                    <div key={id} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span>{getParticipantName(id, trip.participants)}</span>
                    </div>
                  ))}
                </div>
                
                {previewExpense.splitAmounts && (
                  <div className="mt-3 space-y-1">
                    <Separator className="my-2" />
                    <p className="text-sm font-medium">Custom Split Amounts</p>
                    {Object.entries(previewExpense.splitAmounts).map(([splitId, amount]) => (
                      <div key={splitId} className="flex justify-between text-sm">
                        <span>{getParticipantName(splitId, trip.participants)}</span>
                        <span>{formatCurrency(amount, trip.currency)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {previewExpense.notes && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                  <p className="text-base">{previewExpense.notes}</p>
                </div>
              )}
              
              {previewExpense.attachments && previewExpense.attachments.length > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Attachments</p>
                  <div className="grid grid-cols-2 gap-3">
                    {previewExpense.attachments.map(attachment => (
                      <a 
                        key={attachment.id}
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border rounded hover:bg-muted/50 transition-colors"
                      >
                        {attachment.thumbnailUrl ? (
                          <img 
                            src={attachment.thumbnailUrl} 
                            alt={attachment.filename}
                            className="w-12 h-12 mr-3 object-cover rounded" 
                          />
                        ) : (
                          <FileText className="w-12 h-12 mr-3 text-muted-foreground" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {(attachment.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  
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
              const expenseViewComponent = (window as any).expenseViewComponent;
              if (expenseViewComponent) {
                expenseViewComponent.setExpenseToDelete(expense);
                expenseViewComponent.setDeleteConfirmOpen(true);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
