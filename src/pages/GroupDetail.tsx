
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { ExpensesView } from "@/components/ExpensesView";
import { SettlementView } from "@/components/SettlementView";
import { TripParticipants } from "@/components/TripParticipants";
import { Button } from "@/components/ui/button";
import { getGroupById } from "@/services/groupService";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseAnalytics } from "@/components/ExpenseAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>("expenses");
  const navigate = useNavigate();
  
  const { data: group, isLoading, error, refetch } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroupById(id || ""),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !group) {
    return <ErrorState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar groupName={group.name} currentGroup={group} />
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
          <h1 className="text-2xl font-bold">{group.name}</h1>
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
                <ExpensesView trip={group} onRefresh={() => refetch()} />
              </div>
              <div className="space-y-6">
                <GroupSummary group={group} />
                <TripParticipants trip={group} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <ExpenseAnalytics trip={group} />
          </TabsContent>
          
          <TabsContent value="settlements" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ExpenseAnalytics trip={group} />
              </div>
              <div>
                <SettlementView trip={group} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const GroupSummary = ({ group }: { group: any }) => {
  const totalExpenses = group.expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">Group Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium">{group.status.charAt(0).toUpperCase() + group.status.slice(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Participants</span>
          <span className="font-medium">{group.participants.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Expenses</span>
          <span className="font-medium">{group.expenses.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="font-medium">{group.currency || '₹'}{totalExpenses.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Created On</span>
          <span className="font-medium">{new Date(group.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
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
          <h2 className="text-2xl font-bold mb-2">Group Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The group you're looking for doesn't exist or has been deleted.
          </p>
          <Button asChild>
            <a href="/groups">Return to Groups</a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default GroupDetail;
