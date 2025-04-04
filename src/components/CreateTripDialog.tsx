
import React, { useState, useEffect } from "react";
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
import { Participant, SupportedCurrency } from "@/types";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { createTrip, getAllTrips } from "@/services/tripService";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParticipantSelector } from "./ParticipantSelector";

interface CreateTripDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
  onTripsCreated?: () => void;
}

export function CreateTripDialog({ children, open, onClose, onTripsCreated }: CreateTripDialogProps) {
  // Internal state for dialog
  const [isOpen, setIsOpen] = useState(open || false);
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");
  const [participants, setParticipants] = useState<Omit<Participant, 'balance'>[]>([
    { id: uuidv4(), name: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetailsForParticipant, setShowDetailsForParticipant] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch previous participants from existing trips
  const { data: trips = [] } = useQuery({
    queryKey: ["trips"],
    queryFn: getAllTrips,
  });

  // Extract unique participants from all trips
  const previousParticipants = React.useMemo(() => {
    const allParticipants: Omit<Participant, 'balance'>[] = [];
    const participantIds = new Set<string>();
    
    trips.forEach(trip => {
      trip.participants.forEach(participant => {
        if (!participantIds.has(participant.id)) {
          participantIds.add(participant.id);
          const { balance, ...participantWithoutBalance } = participant;
          allParticipants.push(participantWithoutBalance);
        }
      });
    });
    
    return allParticipants;
  }, [trips]);

  // Handle external open state changes
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (!newOpen && onClose) {
      onClose();
    }
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
      
      // Create the trip with the selected currency
      await createTrip({
        name: tripName,
        startDate,
        endDate,
        participants: participantsWithBalance,
        status: 'active',
        currency
      });
      
      // Send invitations to participants with email or phone
      validParticipants.forEach(participant => {
        if (participant.email) {
          console.log(`Sending email invitation to ${participant.email}`);
          // In a real app, this would call an API to send the email
        }
        
        if (participant.phone) {
          console.log(`Sending SMS invitation to ${participant.phone}`);
          // In a real app, this would call an API to send the SMS
        }
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
      setCurrency("USD");
      setParticipants([{ id: uuidv4(), name: "" }]);
      handleOpenChange(false);
      
      // Call the onTripsCreated callback if provided
      if (onTripsCreated) {
        onTripsCreated();
      }
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

  // List of supported currencies
  const currencyOptions: SupportedCurrency[] = [
    "USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "CNY", "SGD", "AED"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Trip
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
              placeholder=""
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
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={(value) => setCurrency(value as SupportedCurrency)}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((curr) => (
                  <SelectItem key={curr} value={curr}>
                    {curr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <ParticipantSelector
            participants={participants}
            setParticipants={setParticipants}
            showDetailsForParticipant={showDetailsForParticipant}
            setShowDetailsForParticipant={setShowDetailsForParticipant}
            previousParticipants={previousParticipants}
          />
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
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
