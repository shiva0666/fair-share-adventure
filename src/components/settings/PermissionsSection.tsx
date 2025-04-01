
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { TripGroup, UserPermission } from "@/types";

// Mock data
const myTrips: TripGroup[] = [
  { id: "1", name: "Beach Vacation", type: "trip", role: "admin", startDate: "2023-07-15", endDate: "2023-07-25", status: "active" },
  { id: "2", name: "Mountain Retreat", type: "trip", role: "participant", startDate: "2023-08-10", endDate: "2023-08-15", status: "completed" },
  { id: "3", name: "City Tour", type: "trip", role: "co-admin", startDate: "2023-09-05", endDate: "2023-09-10", status: "active" },
];

const myGroups: TripGroup[] = [
  { id: "1", name: "Roommates", type: "group", role: "admin", status: "active" },
  { id: "2", name: "Office Team", type: "group", role: "participant", status: "active" },
  { id: "3", name: "Family", type: "group", role: "co-admin", status: "archived" },
];

export const PermissionsSection = () => {
  const { toast } = useToast();
  const [selectedEntity, setSelectedEntity] = useState<TripGroup | null>(null);
  const [isManagingRoles, setIsManagingRoles] = useState(false);
  const [isManagingPermissions, setIsManagingPermissions] = useState(false);
  
  const [userPermissions, setUserPermissions] = useState<UserPermission>({
    canAddExpense: true,
    canEditExpense: true,
    canAddParticipants: false,
    canRemoveParticipants: false,
    canCompleteTripGroup: false,
  });
  
  const handleRoleAssignment = () => {
    toast({
      title: "Role Updated",
      description: "The user's role has been updated successfully.",
    });
    setIsManagingRoles(false);
  };
  
  const handlePermissionChange = (permission: keyof UserPermission) => {
    setUserPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };
  
  const handlePermissionSave = () => {
    toast({
      title: "Permissions Updated",
      description: "Participant permissions have been updated successfully.",
    });
    setIsManagingPermissions(false);
  };
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">Admin</Badge>;
      case "co-admin":
        return <Badge variant="secondary">Co-Admin</Badge>;
      default:
        return <Badge variant="outline">Participant</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="trips" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trips">My Trips</TabsTrigger>
          <TabsTrigger value="groups">My Groups</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trips" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Trip Permissions</CardTitle>
              <CardDescription>
                Manage your roles and permissions in trips you are part of
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Your Role</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">{trip.name}</TableCell>
                      <TableCell>{getStatusBadge(trip.status)}</TableCell>
                      <TableCell>{getRoleBadge(trip.role)}</TableCell>
                      <TableCell>{trip.startDate && trip.endDate ? `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}` : "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {trip.role === "admin" || trip.role === "co-admin" ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedEntity(trip);
                                  setIsManagingRoles(true);
                                }}
                              >
                                Manage Roles
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedEntity(trip);
                                  setIsManagingPermissions(true);
                                }}
                              >
                                Permissions
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Permission Denied",
                                  description: "You need admin privileges to manage this trip.",
                                  variant: "destructive",
                                });
                              }}
                              disabled
                            >
                              View Only
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="groups" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Group Permissions</CardTitle>
              <CardDescription>
                Manage your roles and permissions in groups you are part of
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Your Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{getStatusBadge(group.status)}</TableCell>
                      <TableCell>{getRoleBadge(group.role)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {group.role === "admin" || group.role === "co-admin" ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedEntity(group);
                                  setIsManagingRoles(true);
                                }}
                              >
                                Manage Roles
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedEntity(group);
                                  setIsManagingPermissions(true);
                                }}
                              >
                                Permissions
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Permission Denied",
                                  description: "You need admin privileges to manage this group.",
                                  variant: "destructive",
                                });
                              }}
                              disabled
                            >
                              View Only
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Manage Roles Dialog */}
      <Dialog open={isManagingRoles} onOpenChange={setIsManagingRoles}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Roles for {selectedEntity?.name}</DialogTitle>
            <DialogDescription>
              Assign roles to participants or transfer admin rights.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="participant">Select Participant</Label>
              <Select defaultValue="john">
                <SelectTrigger id="participant">
                  <SelectValue placeholder="Select participant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john">John Smith</SelectItem>
                  <SelectItem value="emma">Emma Johnson</SelectItem>
                  <SelectItem value="michael">Michael Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Assign Role</Label>
              <Select defaultValue="participant">
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="co-admin">Co-Admin</SelectItem>
                  <SelectItem value="participant">Participant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManagingRoles(false)}>Cancel</Button>
            <Button onClick={handleRoleAssignment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manage Permissions Dialog */}
      <Dialog open={isManagingPermissions} onOpenChange={setIsManagingPermissions}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Participant Permissions for {selectedEntity?.name}</DialogTitle>
            <DialogDescription>
              Configure what participants can do in this {selectedEntity?.type}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="add-expense">Add Expenses</Label>
                <p className="text-sm text-muted-foreground">Allow participants to add new expenses</p>
              </div>
              <Switch 
                id="add-expense" 
                checked={userPermissions.canAddExpense}
                onCheckedChange={() => handlePermissionChange('canAddExpense')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="edit-expense">Edit Expenses</Label>
                <p className="text-sm text-muted-foreground">Allow participants to edit existing expenses</p>
              </div>
              <Switch 
                id="edit-expense" 
                checked={userPermissions.canEditExpense}
                onCheckedChange={() => handlePermissionChange('canEditExpense')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="add-participants">Add Participants</Label>
                <p className="text-sm text-muted-foreground">Allow participants to invite others</p>
              </div>
              <Switch 
                id="add-participants" 
                checked={userPermissions.canAddParticipants}
                onCheckedChange={() => handlePermissionChange('canAddParticipants')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="remove-participants">Remove Participants</Label>
                <p className="text-sm text-muted-foreground">Allow participants to remove others</p>
              </div>
              <Switch 
                id="remove-participants" 
                checked={userPermissions.canRemoveParticipants}
                onCheckedChange={() => handlePermissionChange('canRemoveParticipants')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="complete-trip-group">Complete {selectedEntity?.type}</Label>
                <p className="text-sm text-muted-foreground">Allow participants to mark as completed</p>
              </div>
              <Switch 
                id="complete-trip-group" 
                checked={userPermissions.canCompleteTripGroup}
                onCheckedChange={() => handlePermissionChange('canCompleteTripGroup')}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManagingPermissions(false)}>Cancel</Button>
            <Button onClick={handlePermissionSave}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
