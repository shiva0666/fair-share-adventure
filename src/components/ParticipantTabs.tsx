
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Participant } from "@/types";
import { ParticipantList } from "./ParticipantList";
import { CopyIcon, Users, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCamera } from "@/hooks/use-camera";

interface ParticipantTabsProps {
  participants: Omit<Participant, 'id' | 'balance'>[];
  onAddParticipant: (participant: Omit<Participant, 'id' | 'balance'>) => void;
  onRemoveParticipant: (index: number) => void;
}

export function ParticipantTabs({ 
  participants, 
  onAddParticipant, 
  onRemoveParticipant 
}: ParticipantTabsProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteContact, setInviteContact] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [activeTab, setActiveTab] = useState("add-participant");
  const { toast } = useToast();

  // Reset form fields
  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
  };

  // Handle adding a new participant
  const handleAddParticipant = () => {
    if (!name.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter a name for the participant.",
        variant: "destructive"
      });
      return;
    }

    onAddParticipant({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined
    });
    
    resetForm();
  };

  // Handle sending invite
  const handleSendInvite = () => {
    if (!inviteContact.trim()) {
      toast({
        title: "Contact information needed",
        description: "Please enter an email or phone number to send the invite.",
        variant: "destructive"
      });
      return;
    }

    // Determine if it's an email or phone
    const isEmail = inviteContact.includes('@');
    const message = isEmail 
      ? `Invitation sent to ${inviteContact} via email`
      : `Invitation sent to ${inviteContact} via SMS`;

    // In real app, would send invitation via API
    toast({
      title: "Invite sent!",
      description: message
    });
    
    setInviteContact('');
  };

  // Generate unique invite link
  const generateLink = () => {
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const link = `https://splittos.com/invite/${uniqueId}`;
    setInviteLink(link);
    
    toast({
      title: "Link generated",
      description: "Share this link to invite participants."
    });
  };

  // Copy link to clipboard
  const copyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Copied to clipboard",
        description: "The invite link has been copied."
      });
    }
  };

  // Fetch contacts (would require additional permission handling in real app)
  const fetchContacts = async () => {
    toast({
      title: "Contact access requested",
      description: "This would open the contacts selector on a real device."
    });
    
    // This is a mock implementation - real implementation would use
    // device-specific APIs with proper permissions
  };

  return (
    <div className="space-y-4">
      {participants.length > 0 && (
        <div className="mb-4">
          <Label className="font-medium text-base">Current Participants</Label>
          <ParticipantList
            participants={participants}
            onRemoveParticipant={onRemoveParticipant}
          />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="add-participant" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Add Participant
          </TabsTrigger>
          <TabsTrigger value="generate-link" className="flex-1">
            <LinkIcon className="h-4 w-4 mr-2" />
            Generate Invite Link
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="add-participant" className="space-y-4 pt-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="participant-name">Name<span className="text-destructive">*</span></Label>
              <Input
                id="participant-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            
            <div>
              <Label htmlFor="participant-email">Email (optional)</Label>
              <Input
                id="participant-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            
            <div>
              <Label htmlFor="participant-phone">Phone Number (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="participant-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={fetchContacts}
                >
                  Contacts
                </Button>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="default" 
              className="w-full"
              onClick={handleAddParticipant}
            >
              Add Participant
            </Button>
            
            <div className="pt-4 border-t mt-2">
              <Label htmlFor="invite-contact">Send Invite</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-contact"
                  value={inviteContact}
                  onChange={(e) => setInviteContact(e.target.value)}
                  placeholder="Enter email or phone"
                  className="flex-1"
                />
                <Button 
                  type="button"
                  onClick={handleSendInvite}
                >
                  Send Invite
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="generate-link" className="space-y-4 pt-4">
          <div className="text-center pb-4">
            <p className="text-muted-foreground">
              Generate a unique link that you can share with others to invite them to this trip
            </p>
          </div>
          
          <Button 
            type="button" 
            variant="default" 
            className="w-full"
            onClick={generateLink}
          >
            Generate Invite Link
          </Button>
          
          {inviteLink && (
            <div className="mt-4">
              <Label htmlFor="invite-link">Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-link"
                  value={inviteLink}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={copyLink}
                >
                  <CopyIcon className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
