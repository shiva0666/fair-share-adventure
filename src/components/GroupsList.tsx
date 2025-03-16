
import { useState } from "react";
import { Group } from "@/types";
import { GroupCard } from "@/components/GroupCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";

interface GroupsListProps {
  groups: Group[];
  onDeleteGroup: (id: string) => void;
  onCompleteGroup: (id: string) => void;
}

export function GroupsList({ groups, onDeleteGroup, onCompleteGroup }: GroupsListProps) {
  const [filteredGroups, setFilteredGroups] = useState<Group[]>(groups);
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 6;
  const { toast } = useToast();

  // Confirmation dialogs state
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false);

  // Calculate pagination
  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = filteredGroups.slice(indexOfFirstGroup, indexOfLastGroup);
  const totalPages = Math.ceil(filteredGroups.length / groupsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle delete confirmation
  const handleDelete = (id: string) => {
    setSelectedGroupId(id);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedGroupId) {
      onDeleteGroup(selectedGroupId);
      setShowDeleteConfirmation(false);
      setSelectedGroupId(null);
    }
  };

  // Handle complete confirmation
  const handleComplete = (id: string) => {
    setSelectedGroupId(id);
    setShowCompleteConfirmation(true);
  };

  const handleCompleteConfirm = () => {
    if (selectedGroupId) {
      onCompleteGroup(selectedGroupId);
      setShowCompleteConfirmation(false);
      setSelectedGroupId(null);
    }
  };

  return (
    <div className="space-y-6">
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-medium">No groups found</h3>
          <p className="text-muted-foreground mt-1">Create a new group to get started.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentGroups.map((group) => (
              <GroupCard 
                key={group.id} 
                group={group} 
                onDelete={() => handleDelete(group.id)} 
                onComplete={() => handleComplete(group.id)} 
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {/* Confirmation Dialogs */}
          <ConfirmationDialog
            isOpen={showDeleteConfirmation}
            onClose={() => setShowDeleteConfirmation(false)}
            onConfirm={handleDeleteConfirm}
            title="Delete Group"
            description="Are you sure you want to delete this group? This action can't be undone."
            confirmLabel="Delete"
            cancelLabel="Cancel"
          />

          <ConfirmationDialog
            isOpen={showCompleteConfirmation}
            onClose={() => setShowCompleteConfirmation(false)}
            onConfirm={handleCompleteConfirm}
            title="Complete Group"
            description="Are you sure you want to mark this group as completed? This will archive the group."
            confirmLabel="Complete"
            cancelLabel="Cancel"
          />
        </>
      )}
    </div>
  );
}
