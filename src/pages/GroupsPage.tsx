
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllGroups, deleteGroup, updateGroupStatus } from "@/services/groupService";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";
import { useToast } from "@/hooks/use-toast";
import { GroupsList } from "@/components/GroupsList";

const GroupsPage = () => {
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: groups = [], isLoading, refetch } = useQuery({
    queryKey: ["groups"],
    queryFn: getAllGroups,
  });

  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteGroup(id);
      refetch();
      
      toast({
        title: "Group deleted",
        description: "Group has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    }
  };

  const handleCompleteGroup = async (id: string) => {
    try {
      await updateGroupStatus(id, "completed");
      refetch();
      
      toast({
        title: "Group completed",
        description: "Group has been marked as completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update group status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Your Groups</h1>
            </div>
            
            <Button onClick={() => setShowAddGroupDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Group
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-[200px] bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <GroupsList 
              groups={groups} 
              onDeleteGroup={handleDeleteGroup} 
              onCompleteGroup={handleCompleteGroup} 
            />
          )}
        </div>
      </div>

      {showAddGroupDialog && (
        <CreateGroupDialog
          children={null}
          onOpenChange={(isOpen) => setShowAddGroupDialog(isOpen)}
        />
      )}
    </div>
  );
};

export default GroupsPage;
