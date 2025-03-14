
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trip } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar, MapPin, Users, Trash, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/expenseCalculator";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

export function TripCard({ trip, onDelete, onComplete }: TripCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Calculate total expenses
  const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the click was not on a button
    if (!(e.target as HTMLElement).closest('button')) {
      navigate(`/trips/${trip.id}`);
    }
  };

  const handleDeleteConfirm = () => {
    onDelete(trip.id);
    setShowDeleteDialog(false);
    toast({
      title: "Trip deleted",
      description: `"${trip.name}" has been deleted successfully`,
    });
  };

  const handleCompleteConfirm = () => {
    onComplete(trip.id);
    setShowCompleteDialog(false);
    toast({
      title: "Trip completed",
      description: `"${trip.name}" has been marked as completed`,
    });
  };

  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 group hover:shadow-md cursor-pointer",
          trip.status === "completed" && "bg-muted/50"
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold line-clamp-1">{trip.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Calendar className="mr-1 h-4 w-4" />
                <span>
                  {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                </span>
              </div>
            </div>
            <Badge variant={trip.status === "active" ? "default" : "outline"}>
              {trip.status === "active" ? "Active" : "Completed"}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{trip.participants.length} participants</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm line-clamp-1">
                {trip.expenses.length} expenses ({formatCurrency(totalExpenses)})
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-muted/50 px-6 py-3 flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
          
          {trip.status === "active" ? (
            <Button 
              variant="outline" 
              size="sm"
              className="text-primary hover:text-primary-foreground hover:bg-primary"
              onClick={(e) => {
                e.stopPropagation();
                setShowCompleteDialog(true);
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/trips/${trip.id}`);
              }}
            >
              View Details
            </Button>
          )}
        </CardFooter>
      </Card>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Trip"
        description={`Are you sure you want to delete "${trip.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      <ConfirmationDialog
        isOpen={showCompleteDialog}
        onClose={() => setShowCompleteDialog(false)}
        onConfirm={handleCompleteConfirm}
        title="Complete Trip"
        description={`Are you sure you want to mark "${trip.name}" as completed? This will archive the trip.`}
        confirmLabel="Complete"
        cancelLabel="Cancel"
      />
    </>
  );
}
