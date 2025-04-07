
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Trip } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/expenseCalculator";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { getTripDetailUrl } from "@/lib/utils";

interface TripCardProps {
  trip: Trip;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onEdit?: (trip: Trip) => void;
  onHide?: (id: string) => void;
  variant?: "default" | "compact";
}

export function TripCard({ 
  trip, 
  onDelete, 
  onComplete, 
  onEdit, 
  onHide,
  variant = "default"
}: TripCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showHideDialog, setShowHideDialog] = useState(false);

  const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('button')) {
      navigate(getTripDetailUrl(trip.id));
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

  const handleHideConfirm = () => {
    if (onHide) {
      onHide(trip.id);
      setShowHideDialog(false);
      toast({
        title: "Trip hidden",
        description: `"${trip.name}" has been hidden from your dashboard`,
      });
    }
  };

  const handleEditTrip = () => {
    if (onEdit) {
      onEdit(trip);
    } else {
      navigate(getTripDetailUrl(trip.id));
    }
  };

  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 group hover:shadow-md cursor-pointer",
          trip.status === "completed" && "bg-muted/50",
          variant === "compact" && "h-full"
        )}
        onClick={handleCardClick}
      >
        <CardContent className={cn(
          "p-6",
          variant === "compact" && "p-4"
        )}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className={cn(
                "font-semibold line-clamp-1",
                variant === "default" ? "text-xl" : "text-lg"
              )}>
                {trip.name}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Calendar className="mr-1 h-4 w-4" />
                <span>
                  {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                </span>
              </div>
            </div>
            
            <div className="flex items-center">
              <Badge variant={trip.status === "active" ? "default" : "outline"}>
                {trip.status === "active" ? "Active" : "Completed"}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{trip.participants.length} participants</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm line-clamp-1">
                {trip.expenses.length} expenses ({formatCurrency(totalExpenses, trip.currency)})
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className={cn(
          "bg-muted/50 px-6 py-3",
          variant === "compact" && "px-4 py-2"
        )}>
          <Button 
            variant="outline" 
            size={variant === "compact" ? "sm" : "default"}
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              navigate(getTripDetailUrl(trip.id));
            }}
          >
            View Details
          </Button>
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

      {onHide && (
        <ConfirmationDialog
          isOpen={showHideDialog}
          onClose={() => setShowHideDialog(false)}
          onConfirm={handleHideConfirm}
          title="Hide Trip"
          description={`Do you want to hide "${trip.name}" from your main dashboard view?`}
          confirmLabel="Yes, Hide"
          cancelLabel="Cancel"
        />
      )}
    </>
  );
}
