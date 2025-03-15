
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, calculateTotalExpenses } from "@/utils/expenseCalculator";
import { generateTripPDF } from "@/utils/pdfGenerator";
import { Trip } from "@/types";
import { Download, Users, Receipt, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface TripSummaryProps {
  trip: Trip;
}

export function TripSummary({ trip }: TripSummaryProps) {
  const { toast } = useToast();
  const totalExpenses = calculateTotalExpenses(trip.expenses);
  const expensesPerDay = trip.expenses.length > 0
    ? totalExpenses / calculateTripDays(trip.startDate, trip.endDate)
    : 0;

  const handleDownloadReport = async () => {
    try {
      await generateTripPDF(trip);
      toast({
        title: "Success",
        description: "Trip expense report downloaded successfully",
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">{trip.name}</h1>
          <p className="text-muted-foreground">
            {format(new Date(trip.startDate), "d MMMM yyyy")} - {format(new Date(trip.endDate), "d MMMM yyyy")}
          </p>
        </div>
        <Button 
          onClick={handleDownloadReport} 
          className="mt-2 sm:mt-0 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Trip Expense Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Total Expenses" 
          value={formatCurrency(totalExpenses, trip.currency)} 
          icon={<Receipt className="h-8 w-8 text-primary" />}
        />
        <SummaryCard 
          title="Participants" 
          value={trip.participants.length.toString()} 
          icon={<Users className="h-8 w-8 text-primary" />}
        />
        <SummaryCard 
          title="Daily Average" 
          value={formatCurrency(expensesPerDay, trip.currency)} 
          icon={<Calendar className="h-8 w-8 text-primary" />}
        />
        <SummaryCard 
          title="Transactions" 
          value={trip.expenses.length.toString()} 
          icon={<Receipt className="h-8 w-8 text-primary" />}
        />
      </div>
    </div>
  );
}

function SummaryCard({ 
  title, 
  value, 
  icon 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="rounded-full bg-primary/10 p-2.5">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Calculate number of days in a trip
function calculateTripDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end days
}
