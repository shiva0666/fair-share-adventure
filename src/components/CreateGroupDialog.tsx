
import React, { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createGroup } from "@/services/groupService";
import { SupportedCurrency, Participant } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { ParticipantTabs } from "./ParticipantTabs";

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
  children?: React.ReactNode;
}

export function CreateGroupDialog({
  open,
  onClose,
  onGroupCreated,
  children,
}: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");
  const [participants, setParticipants] = useState<Omit<Participant, 'id' | 'balance'>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Clear form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setCurrency("USD");
      setParticipants([]);
    }
  }, [open]);

  // Add current user as first participant if user is logged in
  useEffect(() => {
    if (user && participants.length === 0) {
      setParticipants([
        {
          name: user.name || 'Me',
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
        description: "Please provide a name for your group.",
        variant: "destructive",
      });
      return;
    }

    if (participants.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one participant to your group.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await createGroup({
        name,
        description,
        currency,
        participants: participants as any, // API will handle ID assignment
        status: 'active', // Adding the status field
      });

      toast({
        title: "Group created",
        description: "Your group has been created successfully.",
      });

      onGroupCreated();
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "There was an error creating your group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currencyOptions: SupportedCurrency[] = [
    "USD", "EUR", "GBP", "INR", "AUD", "CAD", "JPY", "CNY", "SGD", "AED"
  ];

  const renderDialogContent = () => (
    <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogDescription>
          Add a new group to track shared expenses.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6 py-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., Apartment, Book Club"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the purpose of this group"
            />
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

          <div className="space-y-4">
            <Label className="font-medium">Participants</Label>
            <ParticipantTabs
              participants={participants}
              onAddParticipant={handleAddParticipant}
              onRemoveParticipant={handleRemoveParticipant}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  // If children are provided, render them as the trigger
  if (children) {
    return (
      <>
        <Dialog open={open} onOpenChange={onClose}>
          {React.cloneElement(children as React.ReactElement, {
            onClick: () => {
              if ((children as React.ReactElement).props.onClick) {
                (children as React.ReactElement).props.onClick();
              }
            }
          })}
          {renderDialogContent()}
        </Dialog>
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {renderDialogContent()}
    </Dialog>
  );
}
