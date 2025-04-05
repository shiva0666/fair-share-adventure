
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
import { ParticipantList } from "./ParticipantList";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Send, Link } from "lucide-react";

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

  // New states for participant addition
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [participantPhone, setParticipantPhone] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [addTab, setAddTab] = useState("manual");
  const [linkCopied, setLinkCopied] = useState(false);

  // Clear form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setCurrency("USD");
      setParticipants([]);
      setParticipantName("");
      setParticipantEmail("");
      setParticipantPhone("");
      setInviteLink("");
      setAddTab("manual");
      setLinkCopied(false);
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

  // Generate invite link when tab changes to link
  useEffect(() => {
    if (addTab === "link" && !inviteLink) {
      generateInviteLink();
    }
  }, [addTab]);

  const handleAddParticipant = () => {
    if (!participantName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a name for the participant.",
        variant: "destructive",
      });
      return;
    }

    setParticipants((prev) => [
      ...prev,
      {
        name: participantName.trim(),
        email: participantEmail.trim() || undefined,
        phone: participantPhone.trim() || undefined,
      },
    ]);

    // Reset form fields
    setParticipantName("");
    setParticipantEmail("");
    setParticipantPhone("");

    // Show toast if email or phone was provided
    if (participantEmail || participantPhone) {
      toast({
        title: "Invite sent",
        description: `An invitation has been sent to ${participantName}.`,
      });
    }
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const generateInviteLink = () => {
    // In a real app, this would generate a unique link with a token
    const uniqueId = Math.random().toString(36).substring(2, 10);
    setInviteLink(`https://yourapp.com/invite/${uniqueId}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    toast({
      title: "Link copied",
      description: "Invite link copied to clipboard.",
    });
    
    // Reset state after 3 seconds
    setTimeout(() => {
      setLinkCopied(false);
    }, 3000);
  };

  const handleSendInvite = () => {
    if (!participantEmail && !participantPhone) {
      toast({
        title: "Missing information",
        description: "Please provide an email or phone number to send an invite.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would send an email or SMS
    toast({
      title: "Invite sent",
      description: `An invitation has been sent to ${participantName}.`,
    });
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
            {participants.length > 0 && (
              <ParticipantList
                participants={participants}
                onRemoveParticipant={handleRemoveParticipant}
              />
            )}
            
            <div className="pt-2 border-t mt-4">
              <Label className="text-sm font-medium mb-2 block">Add Participants</Label>
              <Tabs value={addTab} onValueChange={setAddTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="manual">Add Participant</TabsTrigger>
                  <TabsTrigger value="link">Generate Invite Link</TabsTrigger>
                </TabsList>
                
                <TabsContent value="manual" className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <Label htmlFor="participantName" className="text-sm font-medium">
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="participantName"
                        placeholder="Participant name"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        className="mt-1"
                        autoComplete="off"
                        required
                      />
                    </div>
                    
                    <div className="flex-1 min-w-[200px]">
                      <Label htmlFor="participantEmail" className="text-sm font-medium">
                        Email (optional)
                      </Label>
                      <Input
                        id="participantEmail"
                        placeholder="email@example.com"
                        type="email"
                        value={participantEmail}
                        onChange={(e) => setParticipantEmail(e.target.value)}
                        className="mt-1"
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-[200px]">
                      <Label htmlFor="participantPhone" className="text-sm font-medium">
                        Phone (optional)
                      </Label>
                      <Input
                        id="participantPhone"
                        placeholder="+1234567890"
                        type="tel"
                        value={participantPhone}
                        onChange={(e) => setParticipantPhone(e.target.value)}
                        className="mt-1"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleSendInvite}
                      disabled={!participantEmail && !participantPhone}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send Invite
                    </Button>
                    <Button type="button" onClick={handleAddParticipant}>
                      Add
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="link" className="space-y-4">
                  <div className="bg-muted p-4 rounded-md">
                    <Label className="text-sm font-medium mb-2 block">Shareable Invite Link</Label>
                    <div className="flex gap-2">
                      <Input
                        value={inviteLink}
                        readOnly
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        className="bg-white"
                      />
                      <Button type="button" onClick={handleCopyLink}>
                        <Copy className="h-4 w-4 mr-1" />
                        {linkCopied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Anyone with this link can join your group. The link will expire in 7 days.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
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
