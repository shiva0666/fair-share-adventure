
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
import { Participant, SupportedCurrency } from "@/types";
import { ChevronDown, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from "@tanstack/react-query";
import { createGroup } from "@/services/groupService";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

  // Handle external open state changes
  React.useEffect(() => {
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

  const handleAddParticipant = () => {
    setParticipants([...participants, { id: uuidv4(), name: "" }]);
  };

  const handleRemoveParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((p) => p.id !== id));
      if (showDetailsForParticipant === id) {
        setShowDetailsForParticipant(null);
      }
    } else {
      toast({
        title: "Cannot remove",
        description: "A group needs at least one participant",
        variant: "destructive",
      });
    }
  };

  const handleParticipantChange = (id: string, field: keyof Omit<Participant, 'balance'>, value: string) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const toggleParticipantDetails = (id: string) => {
    setShowDetailsForParticipant(showDetailsForParticipant === id ? null : id);
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
      <DialogContent className="sm:max-w-[500px]">
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
            <div className="space-y-2 max-h-[300px] overflow-y-auto py-2">
              {participants.map((participant, index) => (
                <Collapsible 
                  key={participant.id} 
                  open={showDetailsForParticipant === participant.id}
                  onOpenChange={() => toggleParticipantDetails(participant.id)}
                  className="border rounded-md p-2"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      placeholder={`Participant ${index + 1}`}
                      value={participant.name || ""}
                      onChange={(e) => handleParticipantChange(participant.id, "name", e.target.value)}
                    />
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" type="button">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveParticipant(participant.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <CollapsibleContent className="space-y-2 mt-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`email-${participant.id}`}>Email (Optional)</Label>
                      <Input
                        id={`email-${participant.id}`}
                        type="email"
                        placeholder="Email address"
                        value={participant.email || ""}
                        onChange={(e) => handleParticipantChange(participant.id, "email", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`phone-${participant.id}`}>Phone (Optional)</Label>
                      <Input
                        id={`phone-${participant.id}`}
                        type="tel"
                        placeholder="Phone number"
                        value={participant.phone || ""}
                        onChange={(e) => handleParticipantChange(participant.id, "phone", e.target.value)}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
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
