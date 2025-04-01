
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoginActivity } from "@/types";

// Mock data
const loginActivity: LoginActivity[] = [
  {
    id: "1",
    device: "iPhone 14 Pro",
    location: "New York, USA",
    ipAddress: "192.168.1.1",
    loginTime: "2023-10-15T14:32:00Z",
    isCurrentSession: true,
  },
  {
    id: "2",
    device: "Chrome on macOS",
    location: "San Francisco, USA",
    ipAddress: "192.168.1.2",
    loginTime: "2023-10-14T09:45:00Z",
    isCurrentSession: false,
  },
  {
    id: "3",
    device: "Firefox on Windows",
    location: "Chicago, USA",
    ipAddress: "192.168.1.3",
    loginTime: "2023-10-10T16:20:00Z",
    isCurrentSession: false,
  },
  {
    id: "4",
    device: "Safari on iPad",
    location: "Miami, USA",
    ipAddress: "192.168.1.4",
    loginTime: "2023-10-05T11:10:00Z",
    isCurrentSession: false,
  },
];

export const SecuritySection = () => {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  
  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      setShowQRDialog(true);
    } else {
      setTwoFactorEnabled(false);
      toast({
        title: "Two-Factor Authentication Disabled",
        description: "Your account is now less secure. We recommend enabling 2FA.",
      });
    }
  };
  
  const handleVerifyCode = () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you'd verify the code with the server
    setTwoFactorEnabled(true);
    setShowQRDialog(false);
    setVerificationCode("");
    toast({
      title: "Two-Factor Authentication Enabled",
      description: "Your account is now more secure with 2FA.",
    });
  };
  
  const handleProfileVisibilityToggle = () => {
    setProfileVisibility(!profileVisibility);
    toast({
      title: `Profile Visibility ${!profileVisibility ? "Public" : "Private"}`,
      description: `Your profile is now ${!profileVisibility ? "visible to all users" : "private and only visible to connections"}.`,
    });
  };
  
  const handleRemoveSession = (id: string) => {
    toast({
      title: "Session Terminated",
      description: "The selected device has been logged out.",
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Manage security options to keep your account safe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Two-Factor Authentication (2FA)</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Switch 
              id="two-factor" 
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="profile-visibility">Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">Make your profile {profileVisibility ? "public" : "private"}</p>
            </div>
            <Switch 
              id="profile-visibility" 
              checked={profileVisibility}
              onCheckedChange={handleProfileVisibilityToggle}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Login Activity</CardTitle>
          <CardDescription>
            Recent logins to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Login Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loginActivity.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">
                    {activity.device}
                    {activity.isCurrentSession && (
                      <span className="ml-2 text-xs text-green-500 font-normal">(Current)</span>
                    )}
                  </TableCell>
                  <TableCell>{activity.location}</TableCell>
                  <TableCell>{activity.ipAddress}</TableCell>
                  <TableCell>{new Date(activity.loginTime).toLocaleString()}</TableCell>
                  <TableCell>
                    {activity.isCurrentSession ? (
                      <Button variant="outline" size="sm" disabled>Current Session</Button>
                    ) : (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveSession(activity.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* 2FA Setup Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app, then enter the verification code.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="border border-input p-2 rounded-lg">
              {/* Placeholder for QR code */}
              <div className="w-48 h-48 bg-muted flex items-center justify-center">
                <p className="text-center text-sm text-muted-foreground">QR Code Placeholder</p>
              </div>
            </div>
            
            <div className="w-full space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input 
                id="verification-code" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRDialog(false)}>Cancel</Button>
            <Button onClick={handleVerifyCode}>Verify & Enable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
