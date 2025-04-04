
import React from "react";
import { Group } from "@/types";
import { GroupCard } from "./GroupCard";
import { MoreHorizontal, Edit, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface GroupsListProps {
  groups: Group[];
  onDeleteGroup: (id: string) => void;
  onCompleteGroup: (id: string) => void;
}

export function GroupsList({ groups, onDeleteGroup, onCompleteGroup }: GroupsListProps) {
  const { toast } = useToast();
  
  if (groups.length === 0) {
    return (
      <div className="text-center p-8 rounded-lg border border-dashed">
        <h3 className="text-lg font-medium mb-2">No groups found</h3>
        <p className="text-muted-foreground">
          Create your first group to start tracking shared expenses!
        </p>
      </div>
    );
  }
  
  // Sort by status (active first) and then by date (newest first)
  const sortedGroups = [...groups].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "active" ? -1 : 1;
    }
    return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
  });
  
  const handleEdit = (groupId: string) => {
    // Navigate to group details
    window.location.href = `/groups/${groupId}`;
  };
  
  const handleMarkCompleted = (groupId: string) => {
    onCompleteGroup(groupId);
    toast({
      title: "Group marked as completed",
      description: "The group has been marked as completed successfully.",
    });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedGroups.map((group) => (
        <div key={group.id} className="relative">
          <GroupCard group={group} />
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleEdit(group.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Group
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMarkCompleted(group.id)}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDeleteGroup(group.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
