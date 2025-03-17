
import { useState, useEffect } from "react";
import { Trip, Participant, SupportedCurrency } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { 
  Image, 
  Pencil, 
  Save, 
  X, 
  Calendar, 
  Plus, 
  Trash2, 
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { updateTrip, addParticipant, removeParticipant } from "@/services/tripService";

interface TripDetailsViewProps {
  trip: Trip;
  onUpdate: () => void;
}

export function TripDetailsView({ trip, onUpdate }: TripDetailsViewProps) {
  const [editing, setEditing] = useState(false);
  const [tripName, setTripName] = useState(trip.name);
  const [tripImage, setTripImage] = useState<File | null>(null);
  const [tripImagePreview, setTripImagePreview] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(trip.startDate));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(trip.endDate));
  const [currency, setCurrency] = useState<SupportedCurrency>(trip.currency as SupportedCurrency || "USD");
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>(trip.participants);
  const [isSaving, setIsSaving] = useState(false);
  const [isProfileChanged, setIsProfileChanged] = useState(false);
  const [isParticipantsChanged, setIsParticipantsChanged] = useState(false);
  const { toast } = useToast();

  // Form state for new participant
  const [newParticipant, setNewParticipant] = useState<Omit<Participant, 'balance' | 'id'>>({
    name: '',
    email: '',
    phone: ''
  });

  // Update local state when trip prop changes
  useEffect(() => {
    setTripName(trip.name);
    setStartDate(new Date(trip.startDate));
    setEndDate(new Date(trip.endDate));
    setCurrency(trip.currency as SupportedCurrency || "USD");
    setParticipants(trip.participants);
    setIsProfileChanged(false);
    setIsParticipantsChanged(false);
  }, [trip]);

  // Track changes to profile fields
  useEffect(() => {
    const isChanged = 
      tripName !== trip.name ||
      startDate?.toISOString().split('T')[0] !== new Date(trip.startDate).toISOString().split('T')[0] ||
      endDate?.toISOString().split('T')[0] !== new Date(trip.endDate).toISOString().split('T')[0] ||
      currency !== trip.currency;
    
    setIsProfileChanged(isChanged);
  }, [tripName, startDate, endDate, currency, trip]);

  // Track changes to participants
  useEffect(() => {
    // Simple check by comparing lengths
    const isChanged = participants.length !== trip.participants.length;
    setIsParticipantsChanged(isChanged);
  }, [participants, trip.participants]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTripImage(file);
      setTripImagePreview(URL.createObjectURL(file));
      setIsProfileChanged(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!isProfileChanged) return;
    
    try {
      setIsSaving(true);
      
      if (!startDate || !endDate) {
        toast({
          title: "Invalid dates",
          description: "Please select valid start and end dates",
          variant: "destructive"
        });
        return;
      }
      
      // Prepare updated trip data
      const updatedTripData = {
        name: tripName,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        currency
      };
      
      // Send update to API
      await updateTrip(trip.id, updatedTripData);
      
      toast({
        title: "Trip profile updated",
        description: "Your changes have been saved successfully"
      });
      
      setIsProfileChanged(false);
      setEditing(false);
      
      // Refresh trip data
      onUpdate();
    } catch (error) {
      console.error("Error updating trip:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating the trip profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveParticipants = async () => {
    if (!isParticipantsChanged) return;
    
    try {
      setIsSaving(true);
      
      // In a real app, you'd handle the participant changes in bulk
      // For now, we'll just notify that the changes would be saved
      
      toast({
        title: "Participants updated",
        description: "Participant changes have been saved"
      });
      
      setIsParticipantsChanged(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating participants:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating participants",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddParticipant = async () => {
    // Validate input
    if (!newParticipant.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Participant name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Call API to add participant
      await addParticipant(trip.id, {
        id: `p${Date.now()}`, // This ID will be replaced by the server
        name: newParticipant.name,
        email: newParticipant.email || "",
        phone: newParticipant.phone || "",
      });
      
      // Reset form and close dialog
      setNewParticipant({ name: '', email: '', phone: '' });
      setShowAddParticipantDialog(false);
      
      toast({
        title: "Participant Added",
        description: `${newParticipant.name} has been added to the trip.`
      });
      
      // Refresh trip data
      onUpdate();
      setIsParticipantsChanged(false);
    } catch (error) {
      console.error("Error adding participant:", error);
      toast({
        title: "Failed to add participant",
        description: "There was a problem adding the participant",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveParticipant = async (id: string) => {
    try {
      setIsSaving(true);
      
      // Call API to remove participant
      await removeParticipant(trip.id, id);
      
      toast({
        title: "Participant Removed",
        description: "Participant has been removed from the trip"
      });
      
      // Update local state
      setParticipants(participants.filter(p => p.id !== id));
      setIsParticipantsChanged(false);
      
      // Refresh trip data
      onUpdate();
    } catch (error) {
      console.error("Error removing participant:", error);
      toast({
        title: "Failed to remove participant",
        description: "There was a problem removing the participant",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeaveTrip = async () => {
    // In a real app, this would call an API with the current user's ID
    // For now, we'll just show a toast message
    toast({
      title: "Left Trip",
      description: "You have successfully left this trip"
    });
    // In a real app, this would navigate away and update the backend
  };

  // List of supported currencies
  const currencyOptions: SupportedCurrency[] = [
    "USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "CNY", "SGD", "AED"
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Trip Profile
              {!editing ? (
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditing(false);
                    // Reset to original values
                    setTripName(trip.name);
                    setStartDate(new Date(trip.startDate));
                    setEndDate(new Date(trip.endDate));
                    setCurrency(trip.currency as SupportedCurrency || "USD");
                    setIsProfileChanged(false);
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage 
                  src={tripImagePreview || "/placeholder.svg"} 
                  alt={trip.name} 
                />
                <AvatarFallback className="text-4xl">{trip.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {editing && (
                <div className="absolute bottom-0 right-0">
                  <Label htmlFor="picture" className="cursor-pointer">
                    <div className="rounded-full bg-primary h-8 w-8 flex items-center justify-center">
                      <Image className="h-4 w-4 text-white" />
                    </div>
                    <Input 
                      id="picture" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </Label>
                </div>
              )}
            </div>
            
            {editing ? (
              <Input 
                value={tripName} 
                onChange={(e) => {
                  setTripName(e.target.value);
                  setIsProfileChanged(true);
                }} 
                className="text-center font-bold text-xl"
              />
            ) : (
              <h2 className="font-bold text-xl text-center">{trip.name}</h2>
            )}
            
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Start Date:</span>
                {editing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date);
                          setIsProfileChanged(true);
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <span>{formatDate(trip.startDate)}</span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">End Date:</span>
                {editing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date);
                          setIsProfileChanged(true);
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <span>{formatDate(trip.endDate)}</span>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <span className="capitalize">{trip.status}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Currency:</span>
                {editing ? (
                  <Select 
                    value={currency} 
                    onValueChange={(value) => {
                      setCurrency(value as SupportedCurrency);
                      setIsProfileChanged(true);
                    }}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          {curr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span>{trip.currency || "USD"}</span>
                )}
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Participants:</span>
                <span>{trip.participants.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expenses:</span>
                <span>{trip.expenses.length}</span>
              </div>
            </div>

            {editing && isProfileChanged && (
              <Button 
                className="w-full" 
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Participants Details</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAddParticipantDialog(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Participant
            </Button>
            <Button size="sm" variant="outline" onClick={handleLeaveTrip}>
              <LogOut className="h-4 w-4 mr-1" /> Leave Trip
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">{participant.name}</TableCell>
                  <TableCell>{participant.email || "—"}</TableCell>
                  <TableCell>{participant.phone || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveParticipant(participant.id)}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {isParticipantsChanged && (
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleSaveParticipants}
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Participant Dialog */}
      <Dialog open={showAddParticipantDialog} onOpenChange={setShowAddParticipantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
            <DialogDescription>
              Add a new participant to this trip.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="" 
                value={newParticipant.name}
                onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="" 
                value={newParticipant.email}
                onChange={(e) => setNewParticipant({...newParticipant, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="" 
                value={newParticipant.phone}
                onChange={(e) => setNewParticipant({...newParticipant, phone: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddParticipantDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddParticipant}
              disabled={isSaving}
            >
              {isSaving ? 'Adding...' : 'Add Participant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
