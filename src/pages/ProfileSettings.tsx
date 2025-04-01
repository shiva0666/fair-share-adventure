
import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { AccountSection } from "@/components/settings/AccountSection";
import { PermissionsSection } from "@/components/settings/PermissionsSection";
import { ActivitySection } from "@/components/settings/ActivitySection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { AppSettingsSection } from "@/components/settings/AppSettingsSection";
import { HelpSupportSection } from "@/components/settings/HelpSupportSection";
import { AccountManagementSection } from "@/components/settings/AccountManagementSection";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="container mx-auto p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Profile & Settings</h1>
            <p className="text-muted-foreground">Manage your profile, account settings, and preferences</p>
          </div>

          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="app-settings">App Settings</TabsTrigger>
              <TabsTrigger value="help">Help & Support</TabsTrigger>
              <TabsTrigger value="management">Account Management</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileSection user={user} />
            </TabsContent>
            
            <TabsContent value="account">
              <AccountSection user={user} />
            </TabsContent>
            
            <TabsContent value="permissions">
              <PermissionsSection />
            </TabsContent>
            
            <TabsContent value="activity">
              <ActivitySection />
            </TabsContent>
            
            <TabsContent value="security">
              <SecuritySection />
            </TabsContent>
            
            <TabsContent value="app-settings">
              <AppSettingsSection />
            </TabsContent>
            
            <TabsContent value="help">
              <HelpSupportSection />
            </TabsContent>
            
            <TabsContent value="management">
              <AccountManagementSection />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ProfileSettings;
