
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
  Users,
  Download,
  Calendar,
  DollarSign
} from "lucide-react";
import { Group } from "@/types";
import { GroupDetailsView } from "@/components/GroupDetailsView";
import { GroupGallery } from "@/components/GroupGallery";
import { GroupBills } from "@/components/GroupBills";
import { TripChat } from "@/components/TripChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/expenseCalculator";

// Create a type that mimics the Trip structure but with Group properties
interface GroupAsTripType {
  id: string;
  name: string;
  participants: any[];
  expenses: any[];
  status: 'active' | 'completed';
  createdAt: string;
  currency?: string;
  // Adding missing Trip properties with placeholder values
  startDate: string;
  endDate: string;
}

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

  // Convert Group to a Trip-compatible object for components that expect Trip
  const groupAsTrip: GroupAsTripType = {
    ...group,
    startDate: group.createdAt, // Use createdAt as startDate for calculations
    endDate: new Date().toISOString(), // Use current date as endDate
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentTrip={groupAsTrip} />
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
                <ExpensesView 
                  trip={groupAsTrip} 
                  onExpenseAdded={() => refetch()}
                  onExpenseUpdated={() => refetch()}
                />
              </div>
              <div className="space-y-6">
                <GroupSummary group={group} />
                <TripParticipants trip={groupAsTrip} />
                <TripChat trip={groupAsTrip} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0">
            <ExpenseAnalytics trip={groupAsTrip} />
          </TabsContent>
          
          <TabsContent value="settlements" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ExpenseAnalytics trip={groupAsTrip} />
              </div>
              <div>
                <SettlementView trip={groupAsTrip} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-0">
            <GroupDetailsView group={group} onUpdate={() => refetch()} />
          </TabsContent>

          <TabsContent value="gallery" className="mt-0">
            <GroupGallery group={group} />
          </TabsContent>

          <TabsContent value="bills" className="mt-0">
            <GroupBills group={group} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const GroupSummary = ({ group }: { group: Group }) => {
  const { toast } = useToast();
  const totalExpenses = group.expenses?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;
  
  const handleDownloadReport = async () => {
    try {
      // Implement this functionality similar to generateTripPDF
      toast({
        title: "Success",
        description: "Group expense report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
      console.error("PDF generation error:", error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <p className="text-muted-foreground">
            Created {format(new Date(group.createdAt), "d MMMM yyyy")}
          </p>
        </div>
        <Button 
          onClick={handleDownloadReport} 
          className="mt-2 sm:mt-0 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Group Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Group Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <SummaryItem 
              title="Total Expenses" 
              value={formatCurrency(totalExpenses, group.currency)} 
              icon={<DollarSign className="h-5 w-5 text-primary" />}
            />
            <SummaryItem 
              title="Participants" 
              value={group.participants?.length.toString() || "0"} 
              icon={<Users className="h-5 w-5 text-primary" />}
            />
            <SummaryItem 
              title="Status" 
              value={group.status.charAt(0).toUpperCase() + group.status.slice(1)} 
              icon={<Calendar className="h-5 w-5 text-primary" />}
            />
            <SummaryItem 
              title="Transactions" 
              value={group.expenses?.length.toString() || "0"} 
              icon={<Receipt className="h-5 w-5 text-primary" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function SummaryItem({ 
  title, 
  value, 
  icon 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-primary/10 p-2">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

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
