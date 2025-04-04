
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import Dashboard from "@/components/Dashboard";
import { CreateTripDialog } from "@/components/CreateTripDialog";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showCreateTripDialog, setShowCreateTripDialog] = useState(false);

  const handleGroupCreated = () => {
    setShowCreateGroupDialog(false);
    // You could add a refetch here if needed
  };

  const handleTripCreated = () => {
    setShowCreateTripDialog(false);
    // You could add a refetch here if needed
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {!isMobile && <Sidebar />}
        <main className="flex-1">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowCreateGroupDialog(true)}
                >
                  Create Group
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setShowCreateTripDialog(true)}
                >
                  Create Trip
                </Button>
              </div>
            </div>
            <Dashboard />
          </div>
        </main>
      </div>

      <CreateGroupDialog
        open={showCreateGroupDialog}
        onClose={() => setShowCreateGroupDialog(false)}
        onGroupCreated={handleGroupCreated}
      />
      
      <CreateTripDialog
        open={showCreateTripDialog}
        onClose={() => setShowCreateTripDialog(false)}
        onTripsCreated={handleTripCreated}
      />
    </div>
  );
};

export default Index;
