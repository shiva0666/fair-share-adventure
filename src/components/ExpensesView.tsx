
import React, { useState, useEffect } from "react";
import { Expense } from "@/types";
import { ExpenseItem } from "@/components/ExpenseItem";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import { formatCurrency } from "@/utils/expenseCalculator";
import { FileIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPaidByName, getSplitMethodName } from "@/lib/utils";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ExpensesViewProps {
  trip: any;
  onExpenseAdded: () => void;
  onExpensePreview?: (expense: Expense) => void;
  onExpenseUpdated?: () => void;
  showSidebar?: boolean;
}

export function ExpensesView({ 
  trip,
  onExpenseAdded,
  showSidebar = true
}: ExpensesViewProps) {
  const [expenses, setExpenses] = useState<Expense[]>(trip.expenses);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [expenseToPreview, setExpenseToPreview] = useState<Expense | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [finalDeleteConfirmOpen, setFinalDeleteConfirmOpen] = useState(false);
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Expose methods to window for delete trigger button
  useEffect(() => {
    (window as any).expenseViewComponent = {
      setExpenseToDelete,
      setDeleteConfirmOpen
    };
    
    return () => {
      (window as any).expenseViewComponent = undefined;
    };
  }, []);

  const handleExpenseAdded = (newExpense: Expense) => {
    setExpenses(prevExpenses => [...prevExpenses, newExpense]);
    onExpenseAdded();
  };

  const handleExpenseUpdated = () => {
    if ('startDate' in trip && 'endDate' in trip) {
      import('@/services/tripService').then(tripService => {
        tripService.getAllTrips().then(() => {
          if (onExpenseUpdated) onExpenseUpdated();
        });
      });
    } else {
      import('@/services/groupService').then(groupService => {
        groupService.getAllGroups().then(() => {
          if (onExpenseUpdated) onExpenseUpdated();
        });
      });
    }
  };

  const handleDownloadExpense = (expense: Expense) => {
    if (expense.attachments && expense.attachments.length > 0) {
      expense.attachments.forEach(attachment => {
        const link = document.createElement('a');
        link.href = attachment.fileUrl;
        link.download = attachment.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } else {
      toast({
        title: "No attachments",
        description: "This expense has no attachments to download.",
      });
    }
  };

  const { toast } = useToast();

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    
    setDeleteConfirmOpen(false);
    setFinalDeleteConfirmOpen(true);
  };
  
  const handleFinalDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    
    try {
      if ('startDate' in trip && 'endDate' in trip) {
        const tripService = await import('@/services/tripService');
        await tripService.deleteExpense(trip.id, expenseToDelete.id);
      } else {
        const { deleteExpense } = await import('@/services/groupService');
        await deleteExpense(trip.id, expenseToDelete.id);
      }
      
      // Update local expenses state
      setExpenses(prevExpenses => 
        prevExpenses.filter(e => e.id !== expenseToDelete.id)
      );
      
      toast({
        title: "Expense deleted",
        description: "The expense has been successfully deleted",
      });
      
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFinalDeleteConfirmOpen(false);
      setExpenseToDelete(null);
    }
  };

  // Search and sort expenses
  const filteredExpenses = expenses.filter(expense => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    return (
      expense.name.toLowerCase().includes(query) ||
      new Date(expense.date).toLocaleDateString().includes(query)
    );
  }).sort((a, b) => {
    // Sort by date
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleSortDirection}
            title={`Sort ${sortDirection === 'asc' ? 'newest first' : 'oldest first'}`}
          >
            {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
          <Button onClick={() => setShowAddExpenseDialog(true)}>
            Add Expense
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 bg-muted/50 rounded-lg">
            {searchQuery ? (
              <>
                <h3 className="text-lg font-medium">No matching expenses</h3>
                <p className="text-muted-foreground mt-1">Try a different search term</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium">No expenses yet</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Start tracking expenses for this {trip.hasOwnProperty('startDate') ? 'trip' : 'group'} by adding your first expense.
                </p>
                <Button onClick={() => setShowAddExpenseDialog(true)}>
                  Add Your First Expense
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                trip={trip}
                onExpenseClick={() => setSelectedExpense(expense)}
                onDeleteExpense={() => {
                  setExpenseToDelete(expense);
                  setDeleteConfirmOpen(true);
                }}
                onEditExpense={() => setSelectedExpense(expense)}
                onDownloadExpense={() => handleDownloadExpense(expense)}
                onPreviewExpense={() => {
                  setExpenseToPreview(expense);
                }}
                onExpenseUpdated={() => handleExpenseUpdated()}
              />
            ))}
          </div>
        )}
      </div>

      {/* Expense editing dialog */}
      {selectedExpense && (
        <EditExpenseDialog
          trip={trip}
          expense={selectedExpense}
          onExpenseUpdated={() => {
            handleExpenseUpdated();
            setSelectedExpense(null);
          }}
          isOpen={!!selectedExpense}
          onOpenChange={(open) => {
            if (!open) setSelectedExpense(null);
          }}
        />
      )}

      {/* Add expense dialog */}
      <AddExpenseDialog
        trip={trip}
        open={showAddExpenseDialog}
        onOpenChange={setShowAddExpenseDialog}
        onExpenseAdded={handleExpenseAdded}
      />

      {/* Delete confirmation dialogs */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action can't be undone."
        confirmLabel="Continue"
        cancelLabel="Cancel"
      />

      <ConfirmationDialog
        isOpen={finalDeleteConfirmOpen}
        onClose={() => setFinalDeleteConfirmOpen(false)}
        onConfirm={handleFinalDeleteConfirm}
        title="Final Confirmation"
        description="This will permanently delete the expense. Are you absolutely sure?"
        confirmLabel="Delete Expense"
        cancelLabel="Keep Expense"
      />

      {/* Expense preview */}
      {expenseToPreview && (
        <Dialog open={!!expenseToPreview} onOpenChange={(open) => !open && setExpenseToPreview(null)}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Expense Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="text-base font-medium">{expenseToPreview.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Amount</h3>
                  <p className="text-base font-medium">{formatCurrency(expenseToPreview.amount)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p className="text-base font-medium">{expenseToPreview.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                  <p className="text-base font-medium">{format(new Date(expenseToPreview.date), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Paid By</h3>
                  <p className="text-base font-medium">
                    {getPaidByName(expenseToPreview.paidBy, trip.participants)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Split Method</h3>
                  <p className="text-base font-medium">
                    {getSplitMethodName(expense.splitMethod, expenseToPreview.splitAmounts)}
                  </p>
                </div>
              </div>
              
              {/* Split between */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Split Between</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {expenseToPreview.splitBetween.map(participantId => {
                    const participant = trip.participants.find(p => p.id === participantId);
                    if (!participant) return null;
                    
                    let amount = 0;
                    if (expenseToPreview.splitAmounts) {
                      amount = expenseToPreview.splitAmounts[participantId] || 0;
                    } else {
                      // Equal split
                      amount = expenseToPreview.amount / expenseToPreview.splitBetween.length;
                    }
                    
                    return (
                      <div key={participantId} className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <span>{participant.name}</span>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Notes */}
              {expenseToPreview.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                  <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{expenseToPreview.notes}</p>
                </div>
              )}
              
              {/* Attachments */}
              {expenseToPreview.attachments && expenseToPreview.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Attachments</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {expenseToPreview.attachments.map((attachment, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-2">
                          <div className="aspect-square w-full overflow-hidden rounded-md bg-muted flex items-center justify-center">
                            {attachment.fileType.startsWith('image/') ? (
                              <a 
                                href={attachment.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full h-full"
                              >
                                <img 
                                  src={attachment.thumbnailUrl || attachment.fileUrl} 
                                  alt={attachment.filename} 
                                  className="h-full w-full object-cover transition-all hover:scale-105"
                                />
                              </a>
                            ) : (
                              <a 
                                href={attachment.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex h-full w-full flex-col items-center justify-center gap-1 p-4"
                              >
                                <FileIcon className="h-8 w-8 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground truncate max-w-full">
                                  {attachment.filename}
                                </span>
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setExpenseToPreview(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
