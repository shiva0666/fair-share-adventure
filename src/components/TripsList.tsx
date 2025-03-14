
import { useState } from "react";
import { TripCard } from "@/components/TripCard";
import { Trip } from "@/types";
import { TripSearch } from "@/components/TripSearch";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";

interface TripsListProps {
  trips: Trip[];
  onDeleteTrip: (id: string) => void;
  onCompleteTrip: (id: string) => void;
}

export function TripsList({ trips, onDeleteTrip, onCompleteTrip }: TripsListProps) {
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>(trips);
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 6;
  const { toast } = useToast();

  // Confirmation dialogs state
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showFinalDeleteConfirmation, setShowFinalDeleteConfirmation] = useState(false);
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false);
  const [showFinalCompleteConfirmation, setShowFinalCompleteConfirmation] = useState(false);

  // Calculate pagination
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle delete confirmation
  const handleDeleteInitial = (id: string) => {
    setSelectedTripId(id);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteSecondary = () => {
    setShowDeleteConfirmation(false);
    setShowFinalDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedTripId) {
      onDeleteTrip(selectedTripId);
      toast({
        title: "Trip deleted",
        description: "The trip has been permanently deleted.",
      });
      setShowFinalDeleteConfirmation(false);
      setSelectedTripId(null);
    }
  };

  // Handle complete confirmation
  const handleCompleteInitial = (id: string) => {
    setSelectedTripId(id);
    setShowCompleteConfirmation(true);
  };

  const handleCompleteSecondary = () => {
    setShowCompleteConfirmation(false);
    setShowFinalCompleteConfirmation(true);
  };

  const handleCompleteConfirm = () => {
    if (selectedTripId) {
      onCompleteTrip(selectedTripId);
      toast({
        title: "Trip complete",
        description: "The trip has been marked as completed.",
      });
      setShowFinalCompleteConfirmation(false);
      setSelectedTripId(null);
    }
  };

  return (
    <div className="space-y-6">
      <TripSearch onTripsFound={setFilteredTrips} />
      
      {filteredTrips.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-medium">No trips found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTrips.map((trip) => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                onDelete={() => handleDeleteInitial(trip.id)} 
                onComplete={() => handleCompleteInitial(trip.id)} 
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {/* Delete Confirmation Dialogs */}
          <ConfirmationDialog
            isOpen={showDeleteConfirmation}
            onClose={() => setShowDeleteConfirmation(false)}
            onConfirm={handleDeleteSecondary}
            title="Delete Trip"
            description="Are you sure you want to delete this trip? This action can't be undone."
            confirmLabel="Continue"
            cancelLabel="Cancel"
          />

          <ConfirmationDialog
            isOpen={showFinalDeleteConfirmation}
            onClose={() => setShowFinalDeleteConfirmation(false)}
            onConfirm={handleDeleteConfirm}
            title="Final Confirmation"
            description="This will permanently delete the trip and all its data. Are you absolutely sure?"
            confirmLabel="Delete Trip"
            cancelLabel="Keep Trip"
          />

          {/* Complete Confirmation Dialogs */}
          <ConfirmationDialog
            isOpen={showCompleteConfirmation}
            onClose={() => setShowCompleteConfirmation(false)}
            onConfirm={handleCompleteSecondary}
            title="Complete Trip"
            description="Are you sure you want to mark this trip as completed?"
            confirmLabel="Continue"
            cancelLabel="Cancel"
          />

          <ConfirmationDialog
            isOpen={showFinalCompleteConfirmation}
            onClose={() => setShowFinalCompleteConfirmation(false)}
            onConfirm={handleCompleteConfirm}
            title="Final Confirmation"
            description="This will archive the trip and mark it as completed. Are you absolutely sure?"
            confirmLabel="Complete Trip"
            cancelLabel="Keep Active"
          />
        </>
      )}
    </div>
  );
}
