
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import Dashboard from "@/components/Dashboard";
import { CreateTripDialog } from "@/components/CreateTripDialog";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { Sidebar } from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();

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
                <CreateGroupDialog>
                  <Button size="sm" variant="outline">Create Group</Button>
                </CreateGroupDialog>
                <CreateTripDialog>
                  <Button size="sm">Create Trip</Button>
                </CreateTripDialog>
              </div>
            </div>
            <Dashboard />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
