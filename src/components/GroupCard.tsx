
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Group } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MoreVertical, 
  Trash, 
  CheckCircle,
  EyeOff,
  Edit,
  Receipt
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/expenseCalculator";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface GroupCardProps {
  group: Group;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onEdit?: (group: Group) => void;
  onHide?: (id: string) => void;
}

export function GroupCard({ 
  group, 
  onDelete, 
  onComplete, 
  onEdit, 
  onHide 
}: GroupCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showHideDialog, setShowHideDialog] = useState(false);

  // Calculate total expenses
  const totalExpenses = group.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the click was not on a button
    if (!(e.target as HTMLElement).closest('button')) {
      navigate(`/groups/${group.id}`);
    }
  };

  const handleDeleteConfirm = () => {
    onDelete(group.id);
    setShowDeleteDialog(false);
    toast({
      title: "Group deleted",
      description: `"${group.name}" has been deleted successfully`,
    });
  };

  const handleCompleteConfirm = () => {
    onComplete(group.id);
    setShowCompleteDialog(false);
    toast({
      title: "Group completed",
      description: `"${group.name}" has been marked as completed`,
    });
  };

  const handleHideConfirm = () => {
    if (onHide) {
      onHide(group.id);
      setShowHideDialog(false);
      toast({
        title: "Group hidden",
        description: `"${group.name}" has been hidden from your dashboard`,
      });
    }
  };

  const handleEditGroup = () => {
    if (onEdit) {
      onEdit(group);
    } else {
      // If no edit handler is provided, just navigate to the group detail page
      navigate(`/groups/${group.id}`);
    }
  };

  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 group hover:shadow-md cursor-pointer",
          group.status === "completed" && "bg-muted/50"
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold line-clamp-1">{group.name}</h3>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {group.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={group.status === "active" ? "default" : "outline"}>
                {group.status === "active" ? "Active" : "Completed"}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleEditGroup();
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Group</span>
                  </DropdownMenuItem>
                  
                  {group.status === "active" && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      setShowCompleteDialog(true);
                    }}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <span>Mark as Completed</span>
                    </DropdownMenuItem>
                  )}
                  
                  {onHide && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      setShowHideDialog(true);
                    }}>
                      <EyeOff className="mr-2 h-4 w-4" />
                      <span>Hide Group</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    <span>Delete Group</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{group.participants.length} participants</span>
            </div>
            
            <div className="flex items-center">
              <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm line-clamp-1">
                {group.expenses.length} expenses ({formatCurrency(totalExpenses, group.currency)})
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-muted/50 px-6 py-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/groups/${group.id}`);
            }}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Group"
        description={`Are you sure you want to delete "${group.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      <ConfirmationDialog
        isOpen={showCompleteDialog}
        onClose={() => setShowCompleteDialog(false)}
        onConfirm={handleCompleteConfirm}
        title="Complete Group"
        description={`Are you sure you want to mark "${group.name}" as completed? This will archive the group.`}
        confirmLabel="Complete"
        cancelLabel="Cancel"
      />

      {onHide && (
        <ConfirmationDialog
          isOpen={showHideDialog}
          onClose={() => setShowHideDialog(false)}
          onConfirm={handleHideConfirm}
          title="Hide Group"
          description={`Do you want to hide "${group.name}" from your main dashboard view?`}
          confirmLabel="Yes, Hide"
          cancelLabel="Cancel"
        />
      )}
    </>
  );
}
