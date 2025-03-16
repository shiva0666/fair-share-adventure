import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Trip, Group } from "@/types";
import { getAllTrips, getDashboardSummary } from "@/services/tripService";
import { getAllGroups, getGroupStats } from "@/services/groupService";
import { CreateTripDialog } from "./CreateTripDialog";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { formatCurrency } from "@/utils/expenseCalculator";
import { format, parseISO } from "date-fns";
import { User, Briefcase, DollarSign, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TripSearch } from "./TripSearch";
import { GroupCard } from "./GroupCard";
import { getTripDetailUrl, getGroupDetailUrl } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [activeGroupTab, setActiveGroupTab] = useState("all");
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  
  const {
    data: trips,
    isLoading: isTripsLoading,
    error: tripsError,
  } = useQuery({
    queryKey: ["trips"],
    queryFn: getAllTrips,
  });
  
  const {
    data: groups,
    isLoading: isGroupsLoading,
    error: groupsError,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: getAllGroups,
  });
  
  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });
  
  const {
    data: groupStats,
    isLoading: isGroupStatsLoading,
  } = useQuery({
    queryKey: ["group-stats"],
    queryFn: getGroupStats,
  });
  
  useEffect(() => {
    if (trips) {
      filterTrips(trips, activeTab);
    }
  }, [trips, activeTab]);
  
  useEffect(() => {
    if (groups) {
      filterGroups(groups, activeGroupTab);
    }
  }, [groups, activeGroupTab]);
  
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
  
  const filterGroups = (groupsToFilter: Group[], filter: string) => {
    switch (filter) {
      case "active":
        setFilteredGroups(groupsToFilter.filter(group => group.status === "active"));
        break;
      case "completed":
        setFilteredGroups(groupsToFilter.filter(group => group.status === "completed"));
        break;
      case "all":
      default:
        setFilteredGroups(groupsToFilter);
        break;
    }
  };
  
  const handleSearchResults = (searchResults: Trip[]) => {
    filterTrips(searchResults, activeTab);
  };
  
  const handleGroupSearch = (searchResults: Group[]) => {
    filterGroups(searchResults, activeGroupTab);
  };
  
  const handleDeleteGroup = async (groupId: string) => {
    if (groups) {
      const updatedGroups = groups.filter(group => group.id !== groupId);
      setFilteredGroups(updatedGroups.filter(group => {
        if (activeGroupTab === "active") return group.status === "active";
        if (activeGroupTab === "completed") return group.status === "completed";
        return true;
      }));
    }
  };
  
  const handleCompleteGroup = async (groupId: string) => {
    if (groups) {
      const updatedGroups = groups.map(group => 
        group.id === groupId ? { ...group, status: "completed" as const } : group
      );
      
      setFilteredGroups(updatedGroups.filter(group => {
        if (activeGroupTab === "active") return group.status === "active";
        if (activeGroupTab === "completed") return group.status === "completed";
        return true;
      }));
    }
  };
  
  const isLoading = isTripsLoading || isSummaryLoading || isGroupsLoading || isGroupStatsLoading;
  const hasError = tripsError || summaryError || groupsError;
  
  const totalTrips = summary?.totalTrips || 0;
  const totalGroups = groupStats?.totalGroups || 0;
  
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
      
      <div className="mb-10">
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
      
      <div className="mt-12">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Your Groups</h2>
          <div className="w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Search groups..." 
              className="w-full px-3 py-2 border rounded-md"
              onChange={(e) => {
                if (groups) {
                  const query = e.target.value.toLowerCase();
                  if (!query) {
                    filterGroups(groups, activeGroupTab);
                  } else {
                    const filtered = groups.filter(group => 
                      group.name.toLowerCase().includes(query) ||
                      group.description?.toLowerCase().includes(query)
                    );
                    filterGroups(filtered, activeGroupTab);
                  }
                }
              }}
            />
          </div>
        </div>
        
        <Tabs value={activeGroupTab} onValueChange={setActiveGroupTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Groups</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <GroupsGrid 
              groups={filteredGroups} 
              loading={isLoading} 
              onDelete={handleDeleteGroup}
              onComplete={handleCompleteGroup}
            />
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            <GroupsGrid 
              groups={filteredGroups} 
              loading={isLoading} 
              onDelete={handleDeleteGroup}
              onComplete={handleCompleteGroup}
            />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            <GroupsGrid 
              groups={filteredGroups} 
              loading={isLoading} 
              onDelete={handleDeleteGroup}
              onComplete={handleCompleteGroup}
            />
          </TabsContent>
        </Tabs>
      </div>
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
  const navigate = useNavigate();
  
  return (
    <Card className="transition-all hover:shadow-md cursor-pointer" onClick={() => navigate(getTripDetailUrl(trip.id))}>
      <CardContent className="p-0">
        <div className="block p-6">
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
                  {participant.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {trip.participants.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium border-2 border-background">
                  +{trip.participants.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
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

interface GroupsGridProps {
  groups: Group[] | undefined;
  loading: boolean;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

function GroupsGrid({ groups, loading, onDelete, onComplete }: GroupsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[200px] rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (!groups?.length) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium mb-2">No groups found</h3>
        <p className="text-muted-foreground mb-6">
          Get started by creating your first group!
        </p>
        <CreateGroupDialog>
          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Create Your First Group
          </button>
        </CreateGroupDialog>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <GroupCard 
          key={group.id} 
          group={group} 
          onDelete={onDelete}
          onComplete={onComplete}
        />
      ))}
      <CreateGroupCard />
    </div>
  );
}

function CreateGroupCard() {
  return (
    <Card className="border-dashed hover:border-primary/50 transition-colors">
      <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="py-8">
          <h3 className="font-medium mb-2">Create New Group</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Manage expenses with recurring participants
          </p>
          <CreateGroupDialog />
        </div>
      </CardContent>
    </Card>
  );
}
