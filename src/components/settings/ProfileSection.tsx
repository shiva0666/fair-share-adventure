
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/types";

interface ProfileSectionProps {
  user: UserProfile | any;
}

export const ProfileSection = ({ user }: ProfileSectionProps) => {
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [isEditing, setIsEditing] = useState(false);
  
  const joinedDate = user?.joinedDate || new Date().toISOString().split('T')[0];
  
  const handleSaveProfile = () => {
    // In a real app, you'd save the user profile to the database
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
    setIsEditing(false);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            View and manage your personal information that others see
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user?.photoURL} alt={user?.name} />
                  <AvatarFallback className="text-2xl">
                    {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => toast({
                    title: "Upload Photo",
                    description: "This feature is coming soon!"
                  })}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Member since {new Date(joinedDate).toLocaleDateString()}</p>
            </div>
            
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Your full name" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Username (Optional)</Label>
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="Your username" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Your email address" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="Your phone number" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                      <p className="text-base">{name || "Not set"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Username</p>
                      <p className="text-base">{username || "Not set"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Email Address</p>
                      <p className="text-base">{email || "Not set"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Phone Number</p>
                      <p className="text-base">{phone || "Not set"}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
