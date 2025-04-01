
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Download, Archive, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TripGroup } from "@/types";

// Mock data
const hiddenEntities: TripGroup[] = [
  { id: "1", name: "Family Reunion", type: "trip", role: "admin", startDate: "2022-12-25", endDate: "2022-12-30", status: "completed" },
  { id: "2", name: "Camping Trip", type: "trip", role: "participant", startDate: "2023-03-15", endDate: "2023-03-20", status: "completed" },
  { id: "3", name: "College Friends", type: "group", role: "co-admin", status: "active" },
];

const archivedEntities: TripGroup[] = [
  { id: "4", name: "Beach Vacation 2022", type: "trip", role: "admin", startDate: "2022-07-15", endDate: "2022-07-25", status: "archived" },
  { id: "5", name: "Work Team", type: "group", role: "participant", status: "archived" },
];

const deletedEntities: TripGroup[] = [
  { id: "6", name: "Road Trip", type: "trip", role: "admin", startDate: "2022-05-10", endDate: "2022-05-15", status: "completed" },
  { id: "7", name: "Old Roommates", type: "group", role: "admin", status: "completed" },
];

export const AppSettingsSection = () => {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<TripGroup | null>(null);
  const [confirmAction, setConfirmAction] = useState<"restore" | "unarchive" | "delete" | null>(null);
  
  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Export Complete",
        description: `Your data has been exported in ${exportFormat.toUpperCase()} format.`,
      });
    }, 2000);
  };
  
  const handleConfirmAction = () => {
    if (!selectedEntity || !confirmAction) return;
    
    switch (confirmAction) {
      case "restore":
        toast({
          title: "Item Restored",
          description: `${selectedEntity.name} has been restored from the hidden items.`,
        });
        break;
      case "unarchive":
        toast({
          title: "Item Unarchived",
          description: `${selectedEntity.name} has been unarchived and is now active.`,
        });
        break;
      case "delete":
        toast({
          title: "Item Deleted Permanently",
          description: `${selectedEntity.name} has been permanently deleted.`,
          variant: "destructive",
        });
        break;
    }
    
    setConfirmAction(null);
    setSelectedEntity(null);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export your data or manage hidden and archived items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 border rounded-md space-y-4">
            <h3 className="text-lg font-medium">Export Data</h3>
            <p className="text-sm text-muted-foreground">
              Download your trip and group data in your preferred format
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-start sm:items-center">
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleExport} disabled={isExporting}>
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export Data"}
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Hidden Items</h3>
            <p className="text-sm text-muted-foreground">
              Trips and groups you've chosen to hide from your lists
            </p>
            
            {hiddenEntities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hiddenEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell className="font-medium">{entity.name}</TableCell>
                      <TableCell>{entity.type === 'trip' ? 'Trip' : 'Group'}</TableCell>
                      <TableCell>
                        <Badge variant={entity.status === 'active' ? 'default' : 'secondary'}>
                          {entity.status.charAt(0).toUpperCase() + entity.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedEntity(entity);
                            setConfirmAction("restore");
                          }}
                        >
                          Restore
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-4 bg-muted rounded-md">
                <p>No hidden items</p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Archived Items</h3>
            <p className="text-sm text-muted-foreground">
              Trips and groups you've archived for later reference
            </p>
            
            {archivedEntities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell className="font-medium">{entity.name}</TableCell>
                      <TableCell>{entity.type === 'trip' ? 'Trip' : 'Group'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedEntity(entity);
                              setConfirmAction("unarchive");
                            }}
                          >
                            Unarchive
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-4 bg-muted rounded-md">
                <p>No archived items</p>
              </div>
            )}
          </div>
          
          {deletedEntities.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Deleted Items</h3>
              <p className="text-sm text-muted-foreground">
                Recently deleted trips and groups (available for recovery for 30 days)
              </p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell className="font-medium">{entity.name}</TableCell>
                      <TableCell>{entity.type === 'trip' ? 'Trip' : 'Group'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Item Restored",
                                description: `${entity.name} has been restored successfully.`,
                              });
                            }}
                          >
                            Restore
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              setSelectedEntity(entity);
                              setConfirmAction("delete");
                            }}
                          >
                            Delete Permanently
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "restore" && "Restore Item"}
              {confirmAction === "unarchive" && "Unarchive Item"}
              {confirmAction === "delete" && "Delete Permanently"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "restore" && "Are you sure you want to restore this item? It will appear in your lists again."}
              {confirmAction === "unarchive" && "Are you sure you want to unarchive this item? It will be marked as active."}
              {confirmAction === "delete" && "Are you sure you want to permanently delete this item? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntity && (
            <div className="py-4">
              <p className="font-medium">{selectedEntity.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedEntity.type.charAt(0).toUpperCase() + selectedEntity.type.slice(1)}
                {selectedEntity.type === 'trip' && selectedEntity.startDate && selectedEntity.endDate && 
                  ` • ${new Date(selectedEntity.startDate).toLocaleDateString()} - ${new Date(selectedEntity.endDate).toLocaleDateString()}`
                }
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button 
              variant={confirmAction === "delete" ? "destructive" : "default"}
              onClick={handleConfirmAction}
            >
              {confirmAction === "restore" && "Restore"}
              {confirmAction === "unarchive" && "Unarchive"}
              {confirmAction === "delete" && "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
