
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TripOptionsMenuProps {
  tripId: string;
  onEdit: () => void;
  onMarkCompleted: () => void;
  onDelete: () => void;
  asDropdown?: boolean;
}

export function TripOptionsMenu({
  tripId,
  onEdit,
  onMarkCompleted,
  onDelete,
  asDropdown = true,
}: TripOptionsMenuProps) {
  const { toast } = useToast();

  const handleEdit = () => {
    onEdit();
  };

  const handleMarkCompleted = () => {
    onMarkCompleted();
    toast({
      title: "Trip marked as completed",
      description: "The trip has been marked as completed successfully.",
    });
  };

  const handleDelete = () => {
    onDelete();
  };

  if (asDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Trip
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleMarkCompleted}>
            <Check className="mr-2 h-4 w-4" />
            Mark as Completed
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Trip
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="w-full h-full cursor-context-menu" />
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Trip
        </ContextMenuItem>
        <ContextMenuItem onClick={handleMarkCompleted}>
          <Check className="mr-2 h-4 w-4" />
          Mark as Completed
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Trip
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
