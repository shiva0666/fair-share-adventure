
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Trip } from "@/types";
import { getAllTrips, getDashboardSummary } from "@/services/tripService";
import { CreateTripDialog } from "./CreateTripDialog";
import { formatCurrency } from "@/utils/expenseCalculator";
import { format, parseISO } from "date-fns";
import { User, Briefcase, DollarSign, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TripSearch } from "./TripSearch";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  
  const {
    data: trips,
    isLoading: isTripsLoading,
    error: tripsError,
  } = useQuery({
    queryKey: ["trips"],
    queryFn: getAllTrips,
  });
  
  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });
  
  useEffect(() => {
    if (trips) {
      filterTrips(trips, activeTab);
    }
  }, [trips, activeTab]);
  
  const filterTrips = (tripsToFilter: Trip[], filter: string) => {
    switch (filter) {
      case "active":
        setFilteredTrips(tripsToFilter.filter(trip => trip.status === "active"));
        break;
      case "completed":
        setFilteredTrips(tripsToFilter.filter(trip => trip.status === "completed"));
        break;
      case "all":
      default:
        setFilteredTrips(tripsToFilter);
        break;
    }
  };
  
  const handleSearchResults = (searchResults: Trip[]) => {
    filterTrips(searchResults, activeTab);
  };
  
  const isLoading = isTripsLoading || isSummaryLoading;
  const hasError = tripsError || summaryError;
  
  const totalTrips = summary?.totalTrips || 0;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {isLoading ? (
        <SummaryCardsSkeleton />
      ) : hasError ? (
        <div className="text-red-500 mb-6">Failed to load dashboard data</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            title="Total Trips"
            value={summary?.totalTrips || 0}
            icon={<Briefcase className="h-5 w-5" />}
            description="Trips created"
            color="bg-blue-500"
          />
          <SummaryCard
            title="Active Trips"
            value={summary?.activeTrips || 0}
            icon={<User className="h-5 w-5" />}
            description="Ongoing trips"
            color="bg-green-500"
          />
          <SummaryCard
            title="Total Expenses"
            value={summary?.totalExpenses || 0}
            icon={<DollarSign className="h-5 w-5" />}
            description="Expenses added"
            color="bg-amber-500"
          />
          <SummaryCard
            title="Trip Friends"
            value={summary?.tripFriends || 0}
            icon={<Users className="h-5 w-5" />}
            description="Unique participants"
            color="bg-purple-500"
          />
        </div>
      )}
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Your Trips</h2>
        <div className="w-full sm:w-72">
          <TripSearch onTripsFound={handleSearchResults} />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Trips</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <TripsGrid trips={filteredTrips} loading={isLoading} />
        </TabsContent>
        
        <TabsContent value="active" className="mt-0">
          <TripsGrid trips={filteredTrips} loading={isLoading} />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          <TripsGrid trips={filteredTrips} loading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

function SummaryCard({ title, value, icon, description, color }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <div className="text-white">{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface TripsGridProps {
  trips: Trip[] | undefined;
  loading: boolean;
}

function TripsGrid({ trips, loading }: TripsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[200px] rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (!trips?.length) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium mb-2">No trips found</h3>
        <p className="text-muted-foreground mb-6">
          Get started by creating your first trip!
        </p>
        <CreateTripDialog>
          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Create Your First Trip
          </button>
        </CreateTripDialog>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
      <CreateTripCard />
    </div>
  );
}

interface TripCardProps {
  trip: Trip;
}

function TripCard({ trip }: TripCardProps) {
  const totalExpenses = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const formatDate = (dateString: string) => format(parseISO(dateString), "MMM d, yyyy");
  
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-0">
        <a href={`/trip/${trip.id}`} className="block p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">{trip.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </p>
            </div>
            <div className={`px-2 py-1 rounded-md text-xs font-medium ${
              trip.status === "active" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
            }`}>
              {trip.status === "active" ? "Active" : "Completed"}
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="font-medium">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Participants</span>
              <span className="font-medium">{trip.participants.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expense Count</span>
              <span className="font-medium">{trip.expenses.length}</span>
            </div>
          </div>
          
          {trip.participants.length > 0 && (
            <div className="mt-4 flex -space-x-2">
              {trip.participants.slice(0, 5).map((participant, index) => (
                <div 
                  key={participant.id}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium border-2 border-background"
                  title={participant.name}
                >
                  {participant.name.charAt(0)}
                </div>
              ))}
              {trip.participants.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium border-2 border-background">
                  +{trip.participants.length - 5}
                </div>
              )}
            </div>
          )}
        </a>
      </CardContent>
    </Card>
  );
}

function CreateTripCard() {
  return (
    <Card className="border-dashed hover:border-primary/50 transition-colors">
      <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="py-8">
          <h3 className="font-medium mb-2">Create New Trip</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Plan a new adventure with friends
          </p>
          <CreateTripDialog />
        </div>
      </CardContent>
    </Card>
  );
}
