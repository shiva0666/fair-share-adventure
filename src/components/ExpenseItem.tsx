
import React from "react";
import { format, parseISO } from 'date-fns';
import { Expense, Trip, Group } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Edit, Trash } from "lucide-react";
import { formatCurrency } from "@/utils/expenseCalculator";
import { getPaidByName } from "@/lib/utils";

interface ExpenseItemProps {
  expense: Expense;
  trip: Trip | Group;
  onExpenseClick: () => void;
  onDeleteExpense: () => void;
  onEditExpense: () => void;
  onDownloadExpense: () => void;
  onPreviewExpense: () => void;
  onExpenseUpdated: () => void;
}

export function ExpenseItem({
  expense,
  trip,
  onExpenseClick,
  onDeleteExpense,
  onEditExpense,
  onDownloadExpense,
  onPreviewExpense,
  onExpenseUpdated,
}: ExpenseItemProps) {
  const formatDate = (dateString: string) => format(parseISO(dateString), "MMM d, yyyy");
  const paidByNames = getPaidByName(expense.paidBy, trip.participants);
  
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg">{expense.name}</h3>
            <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
          </div>
          <div className="space-x-2 flex items-center">
            <Button variant="ghost" size="icon" onClick={onPreviewExpense} aria-label="Preview expense">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEditExpense} aria-label="Edit expense">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDeleteExpense} aria-label="Delete expense">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">{formatCurrency(expense.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Category</span>
            <span className="font-medium">{expense.category}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Paid By</span>
            <span className="font-medium">{paidByNames}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
