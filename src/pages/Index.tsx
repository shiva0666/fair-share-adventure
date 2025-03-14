
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import Dashboard from "@/components/Dashboard";
import { CreateTripDialog } from "@/components/CreateTripDialog";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <CreateTripDialog />
        </div>
        
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
