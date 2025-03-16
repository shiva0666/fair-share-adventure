
import { useState } from "react";
import { Trip } from "@/types";
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
import { Image, Pencil, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface TripDetailsViewProps {
  trip: Trip;
  onUpdate: () => void;
}

export function TripDetailsView({ trip, onUpdate }: TripDetailsViewProps) {
  const [editing, setEditing] = useState(false);
  const [tripName, setTripName] = useState(trip.name);
  const [tripImage, setTripImage] = useState<File | null>(null);
  const [tripImagePreview, setTripImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTripImage(file);
      setTripImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    // In a real app, this would call an API to update the trip
    // For now, we'll just simulate the update
    toast({
      title: "Trip details updated",
      description: "Your changes have been saved successfully",
    });
    setEditing(false);
    onUpdate();
  };

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
                onChange={(e) => setTripName(e.target.value)} 
                className="text-center font-bold text-xl"
              />
            ) : (
              <h2 className="font-bold text-xl text-center">{trip.name}</h2>
            )}
            
            <div className="w-full space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span>{formatDate(trip.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date:</span>
                <span>{formatDate(trip.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="capitalize">{trip.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span>{trip.currency || "₹"}</span>
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
          </CardContent>
        </Card>
      </div>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Participants Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trip.participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">{participant.name}</TableCell>
                  <TableCell>{participant.email || "—"}</TableCell>
                  <TableCell>{participant.phone || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
