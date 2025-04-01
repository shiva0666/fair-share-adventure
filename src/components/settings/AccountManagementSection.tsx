
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { LogOut, AlertTriangle, QrCode, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const AccountManagementSection = () => {
  const { logoutUser } = useAuth();
  const { toast } = useToast();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  
  const referralCode = "INVITE123"; // Mock referral code
  const appVersion = "1.0.0"; // Mock app version
  
  const handleLogout = () => {
    logoutUser();
  };
  
  const handleDeactivateAccount = () => {
    // In a real app, you'd call an API to deactivate the account
    toast({
      title: "Account Deactivated",
      description: "Your account has been deactivated. You can reactivate it by logging in again.",
    });
    logoutUser();
  };
  
  const handleDeleteAccount = () => {
    if (confirmText !== "DELETE") {
      toast({
        title: "Confirmation Required",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }
    
    if (!password) {
      toast({
        title: "Password Required",
        description: "Please enter your password to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you'd verify the password and call an API to delete the account
    toast({
      title: "Account Deleted",
      description: "Your account has been permanently deleted. Thank you for using our service.",
    });
    logoutUser();
  };
  
  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Referral Code Copied",
      description: "Your referral code has been copied to clipboard. Share it with your friends!",
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
          <CardDescription>
            Manage your account settings and session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
          
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">Referral Program</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Invite friends to join and earn rewards when they sign up
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowReferralDialog(true)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Invite Friends
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-2">App Information</h3>
            <p className="text-sm">Version: {appVersion}</p>
            <p className="text-sm text-muted-foreground">© 2023 DiviTrip. All rights reserved.</p>
          </div>
          
          <div className="pt-4 border-t space-y-2">
            <h3 className="text-lg font-medium">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Actions in this section are permanent and cannot be undone
            </p>
            
            <Button 
              variant="outline" 
              className="w-full text-amber-500 border-amber-500 hover:bg-amber-500/10"
              onClick={() => setShowDeactivateDialog(true)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Deactivate Account
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Referral Dialog */}
      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Friends</DialogTitle>
            <DialogDescription>
              Share your referral code with friends and earn rewards when they sign up.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="border border-input p-2 rounded-lg">
                <div className="w-32 h-32 bg-muted flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2 w-full">
                <Label htmlFor="referral-code">Your Referral Code</Label>
                <div className="flex space-x-2">
                  <Input id="referral-code" value={referralCode} readOnly />
                  <Button onClick={handleCopyReferralCode}>Copy</Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">How it works</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                <li>Share your referral code with friends</li>
                <li>They get $5 credit when they sign up using your code</li>
                <li>You get $5 credit for each friend who signs up</li>
                <li>There's no limit to how many friends you can refer</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowReferralDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Deactivate Account Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate your account? Your data will be preserved, and you can reactivate it by logging in again.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/50 rounded-md p-4">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Your profile and data will be hidden from other users but not deleted. You can reactivate your account at any time by logging in.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>Cancel</Button>
            <Button 
              variant="default"
              className="bg-amber-500 hover:bg-amber-600"
              onClick={handleDeactivateAccount}
            >
              Deactivate Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete your account? This action cannot be undone, and all your data will be lost.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-destructive/10 border border-destructive/50 rounded-md p-4">
              <p className="text-sm text-destructive">
                This will permanently delete your account, all your trips, groups, expenses, and personal data. This action cannot be undone.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">Type "DELETE" to confirm</Label>
              <Input 
                id="confirm-delete" 
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Enter your password</Label>
              <PasswordInput 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your current password"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
