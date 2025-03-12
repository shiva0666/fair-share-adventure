
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllTrips, getDashboardSummary } from "@/services/tripService";
import { Trip } from "@/types";
import { calculateTotalExpenses, formatCurrency } from "@/utils/expenseCalculator";
import { Users, Clock, Receipt, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export function Dashboard() {
  const { data: trips, isLoading: isTripsLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: getAllTrips
  });

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary
  });

  // Get recent trips (last 5)
  const recentTrips = trips
    ? [...trips]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isSummaryLoading ? (
          <>
            <SummarySkeleton />
            <SummarySkeleton />
            <SummarySkeleton />
            <SummarySkeleton />
          </>
        ) : (
          <>
            <SummaryCard
              title="Total Trips"
              value={summary?.totalTrips.toString() || "0"}
              icon={<Clock className="h-8 w-8 text-blue-500" />}
              description="All-time"
            />
            <SummaryCard
              title="Active Trips"
              value={summary?.activeTrips.toString() || "0"}
              icon={<Clock className="h-8 w-8 text-green-500" />}
              description="In progress"
            />
            <SummaryCard
              title="Expenses"
              value={summary?.totalExpenses.toString() || "0"}
              icon={<Receipt className="h-8 w-8 text-purple-500" />}
              description="All expenses"
            />
            <SummaryCard
              title="Trip Friends"
              value={summary?.tripFriends.toString() || "0"}
              icon={<Users className="h-8 w-8 text-orange-500" />}
              description="Unique participants"
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
        </CardHeader>
        <CardContent>
          {isTripsLoading ? (
            <div className="space-y-4">
              <TripRowSkeleton />
              <TripRowSkeleton />
              <TripRowSkeleton />
            </div>
          ) : recentTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">You don't have any trips yet</p>
              <Link to="/">
                <Button>Create Your First Trip</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTrips.map((trip) => (
                <TripRow key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="rounded-full bg-muted p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummarySkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function TripRow({ trip }: { trip: Trip }) {
  const totalAmount = calculateTotalExpenses(trip.expenses);
  
  return (
    <Link to={`/trip/${trip.id}`}>
      <div className="flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-2">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{trip.name}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">{formatCurrency(totalAmount)}</p>
            <p className="text-sm text-muted-foreground">
              {trip.participants.length} {trip.participants.length === 1 ? 'person' : 'people'}
            </p>
          </div>
          <div className={`rounded-full px-2 py-1 text-xs ${
            trip.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {trip.status === 'active' ? 'Active' : 'Completed'}
          </div>
        </div>
      </div>
    </Link>
  );
}

function TripRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}
