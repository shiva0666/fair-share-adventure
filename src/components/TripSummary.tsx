
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trip } from "@/types";
import { Clock, Users, Receipt } from "lucide-react";
import { calculateTotalExpenses, formatCurrency } from "@/utils/expenseCalculator";
import { format } from "date-fns";

interface TripSummaryProps {
  trip: Trip;
}

export function TripSummary({ trip }: TripSummaryProps) {
  const totalExpenses = calculateTotalExpenses(trip.expenses);
  const perPersonAverage = trip.participants.length > 0 
    ? totalExpenses / trip.participants.length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" /> Trip Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Trip Period</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {format(new Date(trip.startDate), "MMM d, yyyy")} to {format(new Date(trip.endDate), "MMM d, yyyy")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Participants</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {trip.participants.length} {trip.participants.length === 1 ? 'person' : 'people'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Expenses</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {trip.expenses.length} {trip.expenses.length === 1 ? 'item' : 'items'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Total Cost</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {formatCurrency(totalExpenses)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2">Per Person Average</p>
            <p className="text-2xl font-bold">{formatCurrency(perPersonAverage)}</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
