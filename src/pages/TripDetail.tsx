
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { TripSummary } from "@/components/TripSummary";
import { ExpensesView } from "@/components/ExpensesView";
import { SettlementView } from "@/components/SettlementView";
import { TripParticipants } from "@/components/TripParticipants";
import { Button } from "@/components/ui/button";
import { getTripById } from "@/services/tripService";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseAnalytics } from "@/components/ExpenseAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>("expenses");
  const navigate = useNavigate();
  
  const { data: trip, isLoading, error, refetch } = useQuery({
    queryKey: ["trip", id],
    queryFn: () => getTripById(id || ""),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !trip) {
    return <ErrorState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar tripName={trip.name} currentTrip={trip} />
      <main className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{trip.name}</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <ExpensesView trip={trip} onRefresh={() => refetch()} />
              </div>
              <div className="space-y-6">
                <TripSummary trip={trip} />
                <TripParticipants trip={trip} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <ExpenseAnalytics trip={trip} />
          </TabsContent>
          
          <TabsContent value="settlements" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ExpenseAnalytics trip={trip} />
              </div>
              <div>
                <SettlementView trip={trip} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </main>
    </div>
  );
};

const ErrorState = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Trip Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The trip you're looking for doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <a href="/trips">Return to Trips</a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TripDetail;
