
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Trip } from "@/types";
import { searchTrips } from "@/services/tripService";
import { useDebounce } from "@/hooks/useDebounce";

interface TripSearchProps {
  onTripsFound: (trips: Trip[]) => void;
}

export function TripSearch({ onTripsFound }: TripSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery === "") {
        // If search is cleared, fetch all trips
        const allTrips = await searchTrips("");
        onTripsFound(allTrips);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await searchTrips(debouncedSearchQuery);
        onTripsFound(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, onTripsFound]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="relative">
      <div className="flex items-center w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 w-full"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full p-1 hover:bg-transparent"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
