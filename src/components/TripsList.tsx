import React from "react";
import { Trip } from "@/types";
import { TripCard } from "./TripCard";
import { TripOptionsMenu } from "./TripOptionsMenu";

interface TripsListProps {
  trips: Trip[];
  onDeleteTrip: (id: string) => void;
  onCompleteTrip: (id: string) => void;
}

export function TripsList({ trips, onDeleteTrip, onCompleteTrip }: TripsListProps) {
  if (trips.length === 0) {
    return (
      <div className="text-center p-8 rounded-lg border border-dashed">
        <h3 className="text-lg font-medium mb-2">No trips found</h3>
        <p className="text-muted-foreground">
          Create your first trip to start tracking expenses!
        </p>
      </div>
    );
  }
  
  // Sort by status (active first) and then by date (newest first)
  const sortedTrips = [...trips].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "active" ? -1 : 1;
    }
    return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedTrips.map((trip) => (
        <div key={trip.id} className="relative">
          <TripCard trip={trip} />
          <div className="absolute top-2 right-2">
            <TripOptionsMenu 
              tripId={trip.id}
              onEdit={() => {
                // Handle edit action
                // For now, just navigate to trip details
                window.location.href = `/trips/${trip.id}`;
              }}
              onMarkCompleted={() => onCompleteTrip(trip.id)}
              onDelete={() => onDeleteTrip(trip.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
