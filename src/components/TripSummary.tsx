
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trip } from "@/types";
import { Clock, Users, Receipt, DollarSign } from "lucide-react";

interface TripSummaryProps {
  trip: Trip;
}

export function TripSummary({ trip }: TripSummaryProps) {
  const totalExpenses = trip.expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const perPersonAverage = totalExpenses / trip.participants.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" /> {trip.name} Summary
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
                {trip.startDate} to {trip.endDate}
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
                {trip.participants.length} people
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
                {trip.expenses.length} items
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Total Cost</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                ₹{totalExpenses.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium mb-2">Per Person Average</p>
            <p className="text-2xl font-bold">₹{perPersonAverage.toFixed(2)}</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
