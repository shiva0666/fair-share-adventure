
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Participant, Trip } from "@/types";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { createTrip } from "@/services/tripService";
import { useQueryClient } from "@tanstack/react-query";

export function CreateTripDialog() {
  const [open, setOpen] = useState(false);
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [participants, setParticipants] = useState<Omit<Participant, 'balance'>[]>([
    { id: uuidv4(), name: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddParticipant = () => {
    setParticipants([...participants, { id: uuidv4(), name: "" }]);
  };

  const handleRemoveParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((p) => p.id !== id));
    } else {
      toast({
        title: "Cannot remove",
        description: "A trip needs at least one participant",
        variant: "destructive",
      });
    }
  };

  const handleParticipantChange = (id: string, name: string) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!tripName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a trip name",
        variant: "destructive",
      });
      return;
    }

    if (!startDate) {
      toast({
        title: "Missing information",
        description: "Please select a start date",
        variant: "destructive",
      });
      return;
    }

    if (!endDate) {
      toast({
        title: "Missing information",
        description: "Please select an end date",
        variant: "destructive",
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    const validParticipants = participants.filter((p) => p.name.trim());
    if (validParticipants.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one participant",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create participants with zero balance
      const participantsWithBalance: Participant[] = validParticipants.map(p => ({
        ...p,
        balance: 0
      }));
      
      // Create the trip
      await createTrip({
        name: tripName,
        startDate,
        endDate,
        participants: participantsWithBalance,
        status: 'active'
      });
      
      // Refetch trips
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      
      toast({
        title: "Success",
        description: "Trip created successfully!",
      });
      
      // Reset form and close dialog
      setTripName("");
      setStartDate("");
      setEndDate("");
      setParticipants([{ id: uuidv4(), name: "" }]);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create New Trip
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>
            Fill in the trip details and add participants.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tripName">Trip Name</Label>
            <Input
              id="tripName"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g., Goa Beach Vacation"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Participants</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddParticipant}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto py-2">
              {participants.map((participant, index) => (
                <div key={participant.id} className="flex items-center gap-2">
                  <Input
                    placeholder={`Participant ${index + 1}`}
                    value={participant.name}
                    onChange={(e) =>
                      handleParticipantChange(participant.id, e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveParticipant(participant.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Trip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
