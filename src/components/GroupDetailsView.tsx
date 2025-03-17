
import { useState } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
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
  const { toast } = useToast();

  // Form state for new participant
  const [newParticipant, setNewParticipant] = useState<Omit<Participant, 'balance' | 'id'>>({
    name: '',
    email: '',
    phone: ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGroupImage(file);
      setGroupImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    // In a real app, this would call an API to update the group
    toast({
      title: "Group details updated",
      description: "Your changes have been saved successfully",
    });
    setEditing(false);
    onUpdate();
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
    // Update local state
    setParticipants([...participants, participant]);
    
    // Reset form and close dialog
    setNewParticipant({ name: '', email: '', phone: '' });
    setShowAddParticipantDialog(false);
    
    toast({
      title: "Participant Added",
      description: `${participant.name} has been added to the group.`
    });
    
    onUpdate();
  };

  const handleRemoveParticipant = (id: string) => {
    // In a real app, this would call an API to remove the participant
    const updatedParticipants = participants.filter(p => p.id !== id);
    setParticipants(updatedParticipants);
    
    toast({
      title: "Participant Removed",
      description: "Participant has been removed from the group"
    });
    
    onUpdate();
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
                  <Button variant="ghost" size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
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
                onChange={(e) => setGroupName(e.target.value)} 
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
                  <Select value={currency} onValueChange={(value) => setCurrency(value as SupportedCurrency)}>
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
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveParticipant(participant.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            <Button onClick={handleAddParticipant}>
              Add Participant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
