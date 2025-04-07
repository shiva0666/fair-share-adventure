
import { useState } from "react";
import { Trip } from "@/types";
import { TripCard } from "@/components/TripCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TripsListProps {
  trips: Trip[];
  onDeleteTrip: (id: string) => void;
  onCompleteTrip: (id: string) => void;
}

export function TripsList({ trips, onDeleteTrip, onCompleteTrip }: TripsListProps) {
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>(trips);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 6;

  // Filter trips by search term
  const filterTrips = (term: string) => {
    const filtered = trips.filter(
      (trip) =>
        trip.name.toLowerCase().includes(term.toLowerCase()) ||
        trip.participants.some((p) =>
          p.name.toLowerCase().includes(term.toLowerCase())
        )
    );
    setFilteredTrips(filtered);
    setCurrentPage(1); // Reset to first page
  };

  // Calculate pagination
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterTrips(term);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search trips or participants..."
          value={searchTerm}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>

      {filteredTrips.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-medium">No trips found</h3>
          <p className="text-muted-foreground mt-1">Create a new trip to get started or adjust your search.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTrips.map((trip) => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                onDelete={onDeleteTrip} 
                onComplete={onCompleteTrip} 
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
        </>
      )}
    </div>
  );
}
