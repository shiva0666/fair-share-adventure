
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Participant } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Plus, X, Users, Link2, Phone, Mail, UserPlus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ParticipantSelectorProps {
  participants: Omit<Participant, 'balance'>[];
  setParticipants: React.Dispatch<React.SetStateAction<Omit<Participant, 'balance'>[]>>;
  showDetailsForParticipant: string | null;
  setShowDetailsForParticipant: React.Dispatch<React.SetStateAction<string | null>>;
  previousParticipants?: Omit<Participant, 'balance'>[];
}

export function ParticipantSelector({
  participants,
  setParticipants,
  showDetailsForParticipant,
  setShowDetailsForParticipant,
  previousParticipants = []
}: ParticipantSelectorProps) {
  const { toast } = useToast();
  const [invitationLink, setInvitationLink] = useState<string>("");
  const [showInvitationLinkDialog, setShowInvitationLinkDialog] = useState(false);
  const [newContactInfo, setNewContactInfo] = useState({
    phone: "",
    email: ""
  });
  const [activeTab, setActiveTab] = useState("manual");

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
        description: "At least one participant is required",
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

  const generateInvitationLink = () => {
    // In a real app, this would generate a unique link with the group/trip ID
    const link = `https://splittos.app/invite/${uuidv4().substring(0, 8)}`;
    setInvitationLink(link);
    setShowInvitationLinkDialog(true);
  };

  const copyInvitationLink = () => {
    navigator.clipboard.writeText(invitationLink);
    toast({
      title: "Link copied!",
      description: "Invitation link copied to clipboard"
    });
  };

  const handleAddByContact = (type: "phone" | "email") => {
    if ((type === "phone" && !newContactInfo.phone) || 
        (type === "email" && !newContactInfo.email)) {
      toast({
        title: "Missing information",
        description: `Please enter a valid ${type === "phone" ? "phone number" : "email address"}`,
        variant: "destructive"
      });
      return;
    }

    // Create a new participant with the contact info
    const newParticipant = {
      id: uuidv4(),
      name: type === "phone" ? `Contact (${newContactInfo.phone})` : `Contact (${newContactInfo.email})`,
      [type]: type === "phone" ? newContactInfo.phone : newContactInfo.email
    };

    setParticipants([...participants, newParticipant]);

    // Send invitation (simulated)
    sendInvitation(type, type === "phone" ? newContactInfo.phone : newContactInfo.email);

    // Reset form
    setNewContactInfo({
      phone: "",
      email: ""
    });

    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to the ${type === "phone" ? "phone number" : "email address"}`
    });
  };

  const sendInvitation = (type: "phone" | "email", contact: string) => {
    // In a real app, this would send an actual email or SMS
    console.log(`Sending invitation via ${type} to ${contact}`);
    // This is where you would integrate with your SMS or email sending service
  };

  const addExistingParticipant = (participant: Omit<Participant, 'balance'>) => {
    // Check if participant already exists in the current list
    if (participants.some(p => p.id === participant.id)) {
      toast({
        title: "Already added",
        description: `${participant.name} is already in this group/trip`
      });
      return;
    }

    setParticipants([...participants, { ...participant }]);
    toast({
      title: "Participant added",
      description: `${participant.name} has been added successfully`
    });

    // If they have email or phone, send invitation
    if (participant.email) {
      sendInvitation("email", participant.email);
    } else if (participant.phone) {
      sendInvitation("phone", participant.phone);
    }
  };

  return (
    <div className="space-y-4">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="manual">
            <UserPlus className="h-4 w-4 mr-2 hidden sm:inline" />
            Manual
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Users className="h-4 w-4 mr-2 hidden sm:inline" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="invitation">
            <Link2 className="h-4 w-4 mr-2 hidden sm:inline" />
            Link
          </TabsTrigger>
          <TabsTrigger value="phone">
            <Phone className="h-4 w-4 mr-2 hidden sm:inline" />
            Phone
          </TabsTrigger>
          <TabsTrigger value="existing" disabled={previousParticipants.length === 0}>
            <Users className="h-4 w-4 mr-2 hidden sm:inline" />
            Friends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4">
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
        </TabsContent>

        <TabsContent value="contacts" className="mt-4">
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Import participants from your contacts.
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Contact import",
                  description: "This feature will be available soon!"
                });
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Import from Google Contacts
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Contact import",
                  description: "This feature will be available soon!"
                });
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Import from Device Contacts
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="invitation" className="mt-4">
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Generate a link that people can use to join this group/trip.
            </p>
            <Button 
              onClick={generateInvitationLink} 
              variant="outline"
              className="w-full"
            >
              <Link2 className="h-4 w-4 mr-2" />
              Generate Invitation Link
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="phone" className="mt-4">
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={newContactInfo.phone}
                  onChange={(e) => setNewContactInfo({...newContactInfo, phone: e.target.value})}
                />
                <Button 
                  type="button" 
                  onClick={() => handleAddByContact("phone")}
                >
                  Add
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newContactInfo.email}
                  onChange={(e) => setNewContactInfo({...newContactInfo, email: e.target.value})}
                />
                <Button 
                  type="button" 
                  onClick={() => handleAddByContact("email")}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="existing" className="mt-4">
          <ScrollArea className="h-[200px] border rounded-md p-2">
            {previousParticipants.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground p-4">
                No previous participants found
              </p>
            ) : (
              <div className="space-y-2">
                {previousParticipants.map((participant) => (
                  <div 
                    key={participant.id} 
                    className="flex items-center justify-between border-b p-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {participant.email || participant.phone || "No contact info"}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addExistingParticipant(participant)}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Invitation Link Dialog */}
      <Dialog open={showInvitationLinkDialog} onOpenChange={setShowInvitationLinkDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invitation Link</DialogTitle>
            <DialogDescription>
              Share this link with others to invite them to join.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invitation-link">Link</Label>
              <div className="flex gap-2">
                <Input
                  id="invitation-link"
                  value={invitationLink}
                  readOnly
                  className={cn(
                    "flex-1 bg-muted",
                  )}
                />
                <Button onClick={copyInvitationLink}>
                  Copy
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInvitationLinkDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
