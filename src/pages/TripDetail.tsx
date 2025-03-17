
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  FileText, 
  Image, 
  Receipt, 
  Download,
  Users
} from "lucide-react";
import { TripDetailsView } from "@/components/TripDetailsView";
import { TripGallery } from "@/components/TripGallery";
import { TripBills } from "@/components/TripBills";
import { TripChat } from "@/components/TripChat";
import { downloadTripReport } from "@/utils/expenseCalculator";

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
    return <ErrorState error={error instanceof Error ? error.message : 'Unknown error'} />;
  }
  
  const handleDownloadReport = () => {
    downloadTripReport(trip);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentTrip={trip} />
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
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="expenses">
              <Receipt className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Expenses</span>
              <span className="sm:hidden">Exp</span>
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <FileText className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Anly</span>
            </TabsTrigger>
            <TabsTrigger value="settlements">
              <Receipt className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Settlements</span>
              <span className="sm:hidden">Sett</span>
            </TabsTrigger>
            <TabsTrigger value="details">
              <Users className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
              <span className="sm:hidden">Det</span>
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <Image className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Gallery</span>
              <span className="sm:hidden">Gall</span>
            </TabsTrigger>
            <TabsTrigger value="bills">
              <FileText className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Bills</span>
              <span className="sm:hidden">Bill</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <ExpensesView trip={trip} onRefresh={() => refetch()} />
                <div className="space-y-4">
                  <Button 
                    className="w-full"
                    onClick={handleDownloadReport}
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                  <TripChat trip={trip} />
                </div>
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

          <TabsContent value="details" className="mt-0">
            <TripDetailsView trip={trip} onUpdate={() => refetch()} />
          </TabsContent>

          <TabsContent value="gallery" className="mt-0">
            <TripGallery trip={trip} />
          </TabsContent>

          <TabsContent value="bills" className="mt-0">
            <TripBills trip={trip} />
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

const ErrorState = ({ error }: { error: string }) => {
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
          <p className="text-muted-foreground mb-2">
            The trip you're looking for doesn't exist or has been deleted.
          </p>
          <p className="text-sm text-destructive mb-6">{error}</p>
          <Button asChild>
            <a href="/trips">Return to Trips</a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default TripDetail;
