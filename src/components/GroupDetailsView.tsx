
import { useState, useEffect } from "react";
import { Group, Participant, SupportedCurrency } from "@/types";
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
  Plus, 
  Trash2, 
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface GroupDetailsViewProps {
  group: Group;
  onUpdate: () => void;
}

export function GroupDetailsView({ group, onUpdate }: GroupDetailsViewProps) {
  const [editing, setEditing] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const [groupImage, setGroupImage] = useState<File | null>(null);
  const [groupImagePreview, setGroupImagePreview] = useState<string | null>(null);
  const [currency, setCurrency] = useState<SupportedCurrency>(group.currency as SupportedCurrency || "USD");
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>(group.participants);
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

  // Update local state when group prop changes
  useEffect(() => {
    setGroupName(group.name);
    setCurrency(group.currency as SupportedCurrency || "USD");
    setParticipants(group.participants);
    setIsProfileChanged(false);
    setIsParticipantsChanged(false);
  }, [group]);

  // Track changes to profile fields
  useEffect(() => {
    const isChanged = 
      groupName !== group.name ||
      currency !== group.currency;
    
    setIsProfileChanged(isChanged);
  }, [groupName, currency, group]);

  // Track changes to participants
  useEffect(() => {
    // Simple check by comparing lengths
    const isChanged = participants.length !== group.participants.length;
    setIsParticipantsChanged(isChanged);
  }, [participants, group.participants]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGroupImage(file);
      setGroupImagePreview(URL.createObjectURL(file));
      setIsProfileChanged(true);
    }
  };

  const handleSaveProfile = () => {
    // In a real app, this would call an API to update the group
    setIsSaving(true);
    
    setTimeout(() => {
      toast({
        title: "Group details updated",
        description: "Your changes have been saved successfully",
      });
      setEditing(false);
      setIsSaving(false);
      setIsProfileChanged(false);
      onUpdate();
    }, 800);
  };

  const handleSaveParticipants = () => {
    // In a real app, this would call an API to update participants
    setIsSaving(true);
    
    setTimeout(() => {
      toast({
        title: "Participants updated",
        description: "Your changes have been saved successfully",
      });
      setIsSaving(false);
      setIsParticipantsChanged(false);
      onUpdate();
    }, 800);
  };

  const handleAddParticipant = () => {
    // Validate input
    if (!newParticipant.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Participant name is required",
        variant: "destructive"
      });
      return;
    }

    // Create new participant object
    const participant: Participant = {
      id: `p${Date.now()}`, // Generate a simple ID
      name: newParticipant.name,
      email: newParticipant.email,
      phone: newParticipant.phone,
      balance: 0
    };

    // In a real application, you would make an API call here
    setIsSaving(true);
    
    setTimeout(() => {
      // Update local state
      setParticipants([...participants, participant]);
      
      // Reset form and close dialog
      setNewParticipant({ name: '', email: '', phone: '' });
      setShowAddParticipantDialog(false);
      
      toast({
        title: "Participant Added",
        description: `${participant.name} has been added to the group.`
      });
      
      setIsSaving(false);
      onUpdate();
    }, 800);
  };

  const handleRemoveParticipant = (id: string) => {
    // In a real app, this would call an API to remove the participant
    setIsSaving(true);
    
    setTimeout(() => {
      const updatedParticipants = participants.filter(p => p.id !== id);
      setParticipants(updatedParticipants);
      
      toast({
        title: "Participant Removed",
        description: "Participant has been removed from the group"
      });
      
      setIsSaving(false);
      onUpdate();
    }, 800);
  };

  const handleLeaveGroup = () => {
    // Simulate the current user leaving the group
    toast({
      title: "Left Group",
      description: "You have successfully left this group"
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
              Group Profile
              {!editing ? (
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                    // Reset form state and exit editing mode
                    setGroupName(group.name);
                    setCurrency(group.currency as SupportedCurrency || "USD");
                    setEditing(false);
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
                  src={groupImagePreview || "/placeholder.svg"} 
                  alt={group.name} 
                />
                <AvatarFallback className="text-4xl">{group.name.charAt(0)}</AvatarFallback>
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
                value={groupName} 
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setIsProfileChanged(true);
                }} 
                className="text-center font-bold text-xl"
              />
            ) : (
              <h2 className="font-bold text-xl text-center">{group.name}</h2>
            )}
            
            <div className="w-full space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <span className="capitalize">{group.status}</span>
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
                  <span>{group.currency || "USD"}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Participants:</span>
                <span>{group.participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expenses:</span>
                <span>{group.expenses.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created On:</span>
                <span>{new Date(group.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {editing && isProfileChanged && (
              <Button 
                className="w-full mt-4" 
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
            <Button size="sm" variant="outline" onClick={handleLeaveGroup}>
              <LogOut className="h-4 w-4 mr-1" /> Leave Group
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
              Add a new participant to this group.
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
