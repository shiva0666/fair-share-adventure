
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createTrip } from "@/services/tripService";
import { SupportedCurrency, Participant } from "@/types";
import { AddParticipantForm } from "./AddParticipantForm";
import { ParticipantList } from "./ParticipantList";
import { useAuth } from "@/hooks/useAuth";

interface CreateTripDialogProps {
  open: boolean;
  onClose: () => void;
  onTripsCreated: () => void;
}

export function CreateTripDialog({
  open,
  onClose,
  onTripsCreated,
}: CreateTripDialogProps) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");
  const [participants, setParticipants] = useState<Omit<Participant, 'id' | 'balance'>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Clear form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setName("");
      setStartDate(new Date());
      setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setCurrency("USD");
      setParticipants([]);
    }
  }, [open]);

  // Add current user as first participant if user is logged in
  React.useEffect(() => {
    if (user && participants.length === 0) {
      setParticipants([
        {
          name: user.displayName || 'Me',
          email: user.email || undefined,
          phone: user.phoneNumber || undefined
        }
      ]);
    }
  }, [user]);

  const handleAddParticipant = (participant: Omit<Participant, 'id' | 'balance'>) => {
    setParticipants((prev) => [...prev, participant]);
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast({
        title: "Missing information",
        description: "Please provide a name for your trip.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Missing information",
        description: "Please select start and end dates for your trip.",
        variant: "destructive",
      });
      return;
    }

    if (participants.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one participant to your trip.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await createTrip({
        name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        currency,
        participants: participants as any, // API will handle ID assignment
      });

      toast({
        title: "Trip created",
        description: "Your trip has been created successfully.",
      });

      onTripsCreated();
      onClose();
    } catch (error) {
      console.error("Error creating trip:", error);
      toast({
        title: "Error",
        description: "There was an error creating your trip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currencyOptions: SupportedCurrency[] = [
    "USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "CNY", "SGD", "AED"
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>
            Add a new trip to track your expenses with others.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Beach Vacation, Paris Trip"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={value => setCurrency(value as SupportedCurrency)}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label className="font-medium">Participants</Label>
              {participants.length > 0 && (
                <ParticipantList
                  participants={participants}
                  onRemoveParticipant={handleRemoveParticipant}
                />
              )}
              
              <div className="pt-2 border-t mt-4">
                <Label className="text-sm font-medium">Add New Participant</Label>
                <AddParticipantForm onAddParticipant={handleAddParticipant} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
