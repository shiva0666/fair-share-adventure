import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllTrips, getDashboardSummary, deleteTrip, updateTripStatus } from "@/services/tripService";
import { Trip } from "@/types";
import { calculateTotalExpenses, formatCurrency } from "@/utils/expenseCalculator";
import { Users, Clock, Receipt, DollarSign, Trash, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useState } from "react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { CreateTripDialog } from "./CreateTripDialog";

export function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const { data: trips, isLoading: isTripsLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: getAllTrips
  });

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary
  });

  const recentTrips = trips
    ? [...trips]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : [];

  const handleDeleteTrip = async () => {
    if (!selectedTripId) return;
    
    try {
      await deleteTrip(selectedTripId);
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      
      toast({
        title: "Trip deleted",
        description: "The trip has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedTripId(null);
    }
  };

  const handleCompleteTrip = async () => {
    if (!selectedTripId) return;
    
    try {
      await updateTripStatus(selectedTripId, "completed");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      
      toast({
        title: "Trip completed",
        description: "The trip has been marked as completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update trip status",
        variant: "destructive",
      });
    } finally {
      setCompleteDialogOpen(false);
      setSelectedTripId(null);
    }
  };

  const openDeleteDialog = (tripId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedTripId(tripId);
    setDeleteDialogOpen(true);
  };

  const openCompleteDialog = (tripId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedTripId(tripId);
    setCompleteDialogOpen(true);
  };

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
              <CreateTripDialog>
                <Button>Create Your First Trip</Button>
              </CreateTripDialog>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTrips.map((trip) => (
                <TripRow 
                  key={trip.id} 
                  trip={trip} 
                  onDelete={openDeleteDialog}
                  onComplete={openCompleteDialog}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteTrip}
        title="Delete Trip"
        description="Are you sure you want to delete this trip? This action cannot be undone."
        confirmLabel="Delete"
      />

      <ConfirmationDialog
        isOpen={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        onConfirm={handleCompleteTrip}
        title="Complete Trip"
        description="Are you sure you want to mark this trip as completed?"
        confirmLabel="Complete"
      />
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

interface TripRowProps {
  trip: Trip;
  onDelete: (tripId: string, event: React.MouseEvent) => void;
  onComplete: (tripId: string, event: React.MouseEvent) => void;
}

function TripRow({ trip, onDelete, onComplete }: TripRowProps) {
  const totalAmount = calculateTotalExpenses(trip.expenses);
  
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors">
      <Link to={`/trip/${trip.id}`} className="flex-1">
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
      </Link>
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
        
        <div className="flex space-x-2">
          {trip.status === 'active' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => onComplete(trip.id, e)}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <CheckSquare className="h-4 w-4" />
              <span className="sr-only">Complete</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => onDelete(trip.id, e)}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </div>
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
