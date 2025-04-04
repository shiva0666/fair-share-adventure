
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
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createGroup, getAllGroups } from "@/services/groupService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ParticipantSelector } from "./ParticipantSelector";

interface CreateGroupDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
  onGroupCreated?: () => void;
}

export function CreateGroupDialog({ children, open, onClose, onGroupCreated }: CreateGroupDialogProps) {
  // Internal state for dialog
  const [isOpen, setIsOpen] = useState(open || false);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");
  const [participants, setParticipants] = useState<Omit<Participant, 'balance'>[]>([
    { id: uuidv4(), name: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetailsForParticipant, setShowDetailsForParticipant] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch previous participants from existing groups
  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: getAllGroups,
  });

  // Extract unique participants from all groups
  const previousParticipants = React.useMemo(() => {
    const allParticipants: Omit<Participant, 'balance'>[] = [];
    const participantIds = new Set<string>();
    
    groups.forEach(group => {
      group.participants.forEach(participant => {
        if (!participantIds.has(participant.id)) {
          participantIds.add(participant.id);
          const { balance, ...participantWithoutBalance } = participant;
          allParticipants.push(participantWithoutBalance);
        }
      });
    });
    
    return allParticipants;
  }, [groups]);

  // Handle external open state changes
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (!newOpen && onClose) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!groupName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a group name",
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
      
      // Create the group using the service
      await createGroup({
        name: groupName,
        description: description.trim() || undefined,
        participants: participantsWithBalance,
        currency,
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
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group-stats'] });
      
      toast({
        title: "Success",
        description: "Group created successfully!",
      });
      
      // Reset form and close dialog
      setGroupName("");
      setDescription("");
      setCurrency("USD");
      setParticipants([{ id: uuidv4(), name: "" }]);
      handleOpenChange(false);
      
      // Call the onGroupCreated callback if provided
      if (onGroupCreated) {
        onGroupCreated();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
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
            <Plus className="mr-2 h-4 w-4" /> Create New Group
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Fill in the group details and add participants.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description about this group"
            />
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
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
