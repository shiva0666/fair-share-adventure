
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserStats } from "@/types";

// Mock data
const userStats: UserStats = {
  totalTrips: 12,
  totalGroups: 5,
  totalExpenses: 148,
  settlementsCompleted: 36,
  amountOwed: 450.75,
  amountDue: 125.50,
};

const recentActivity = [
  { id: "1", action: "Added expense", target: "Beach Vacation", amount: 85.50, date: "2023-10-15T14:32:00Z" },
  { id: "2", action: "Settled payment", target: "John Smith", amount: 120.00, date: "2023-10-12T09:45:00Z" },
  { id: "3", action: "Created group", target: "Office Team", amount: null, date: "2023-10-10T16:20:00Z" },
  { id: "4", action: "Joined trip", target: "Mountain Retreat", amount: null, date: "2023-10-05T11:10:00Z" },
  { id: "5", action: "Received payment", target: "Emma Johnson", amount: 75.25, date: "2023-10-01T17:55:00Z" },
];

export const ActivitySection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>
            Overview of your engagement on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Trips</p>
              <h3 className="text-2xl font-bold mt-1">{userStats.totalTrips}</h3>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Groups</p>
              <h3 className="text-2xl font-bold mt-1">{userStats.totalGroups}</h3>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <h3 className="text-2xl font-bold mt-1">{userStats.totalExpenses}</h3>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Settlements Completed</p>
              <h3 className="text-2xl font-bold mt-1">{userStats.settlementsCompleted}</h3>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">You are Owed</p>
              <h3 className="text-2xl font-bold mt-1 text-green-500">${userStats.amountOwed.toFixed(2)}</h3>
            </div>
            
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">You Owe</p>
              <h3 className="text-2xl font-bold mt-1 text-red-500">${userStats.amountDue.toFixed(2)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest actions and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {activity.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{activity.target}</TableCell>
                  <TableCell>
                    {activity.amount !== null ? (
                      `$${activity.amount.toFixed(2)}`
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 flex justify-center">
            <Button variant="outline">View All Activity</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
