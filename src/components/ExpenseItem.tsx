
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Expense, Participant } from "@/types";
import { CalendarIcon, Users } from 'lucide-react';
import { formatCurrency } from "@/utils/expenseCalculator";
import { formatDate, getPaidByName, getSplitMethodName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ExpenseItemProps {
  expense: Expense;
  participants: Participant[];
  onClick?: () => void;
  currency?: string;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  participants,
  onClick,
  currency = "USD"
}) => {
  const paidByName = getPaidByName(expense.paidBy, participants);
  const splitMethod = expense.splitMethod ? getSplitMethodName(expense.splitMethod, expense.splitAmounts) : "Equal split";
  
  return (
    <Card 
      className="mb-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{expense.name}</h3>
            {expense.description && (
              <p className="text-sm text-muted-foreground">{expense.description}</p>
            )}
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span>{formatDate(expense.date)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{formatCurrency(expense.amount, currency)}</div>
            <Badge variant="outline" className="mt-1">
              {expense.category}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>Paid by: {paidByName}</span>
          </div>
          <div>{splitMethod}</div>
        </div>
        
        <div className="mt-3 pt-2 border-t text-xs text-muted-foreground text-right">
          <span>Splittos</span>
        </div>
      </CardContent>
    </Card>
  );
};
