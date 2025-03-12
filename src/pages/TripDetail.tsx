
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TripSummary } from "@/components/TripSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Download } from "lucide-react";

const mockTrip = {
  id: "1",
  name: "hyd",
  startDate: "3/12/2025",
  endDate: "3/12/2025",
  participants: [
    { id: "1", name: "a", balance: 0 },
    { id: "2", name: "b", balance: 0 },
    { id: "3", name: "c", balance: 0 },
  ],
  expenses: [],
};

const TripDetail = () => {
  const [trip] = useState(mockTrip);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar tripName={trip.name} />
      <main className="container mx-auto p-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Day 1 - {trip.startDate}
                </h2>
                <p>Total: ₹0.00</p>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                No expenses added yet.
              </div>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </CardContent>
          </Card>
          <Button className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Day
          </Button>
        </div>
        <div className="space-y-6">
          <TripSummary trip={trip} />
        </div>
      </main>
    </div>
  );
};

export default TripDetail;
