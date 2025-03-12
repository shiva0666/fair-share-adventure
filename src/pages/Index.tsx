
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Your Trips</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Trip
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              You don't have any saved trips yet.
            </p>
            <Button>Create Your First Trip</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default Index;
