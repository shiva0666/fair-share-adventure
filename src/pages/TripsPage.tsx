
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TripsList } from "@/components/TripsList";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllTrips, deleteTrip, updateTripStatus } from "@/services/tripService";
import { CreateTripDialog } from "@/components/CreateTripDialog";
import { useToast } from "@/hooks/use-toast";

const TripsPage = () => {
  const [showAddTripDialog, setShowAddTripDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: trips = [], isLoading, refetch } = useQuery({
    queryKey: ["trips"],
    queryFn: getAllTrips,
  });

  const handleDeleteTrip = async (id: string) => {
    try {
      await deleteTrip(id);
      refetch();
      
      toast({
        title: "Trip deleted",
        description: "Trip has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTrip = async (id: string) => {
    try {
      await updateTripStatus(id, "completed");
      refetch();
      
      toast({
        title: "Trip completed",
        description: "Trip has been marked as completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update trip status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Your Trips</h1>
            </div>
            
            <Button onClick={() => setShowAddTripDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Trip
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-[200px] bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <TripsList 
              trips={trips} 
              onDeleteTrip={handleDeleteTrip} 
              onCompleteTrip={handleCompleteTrip} 
            />
          )}
        </div>
      </div>

      {showAddTripDialog && (
        <CreateTripDialog 
          children={null}
          onOpenChange={setShowAddTripDialog}
        />
      )}
    </div>
  );
};

export default TripsPage;
