import React, { useState } from "react";
import { Trip, Expense, Participant } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, calculateTotalExpenses, getParticipantName } from "@/utils/expenseCalculator";
import { format } from "date-fns";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

// Calculate the total expense amount for a category
const calculateCategoryTotal = (expenses: Expense[], category: string): number => {
  return expenses
    .filter(expense => expense.category === category)
    .reduce((total, expense) => total + expense.amount, 0);
};

// Calculate daily expenses
const calculateDailyExpenses = (expenses: Expense[]): Record<string, number> => {
  const dailyExpenses: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const date = expense.date;
    if (!dailyExpenses[date]) {
      dailyExpenses[date] = 0;
    }
    dailyExpenses[date] += expense.amount;
  });
  
  return dailyExpenses;
};

// Calculate expenses by participant
const calculateExpensesByParticipant = (
  expenses: Expense[],
  participants: Participant[]
): Record<string, number> => {
  const expensesByParticipant: Record<string, number> = {};
  
  participants.forEach(participant => {
    expensesByParticipant[participant.id] = 0;
  });
  
  expenses.forEach(expense => {
    if (Array.isArray(expense.paidBy)) {
      // Handle multiple payers
      expense.paidBy.forEach(payerId => {
        if (expensesByParticipant[payerId] !== undefined) {
          expensesByParticipant[payerId] += expense.amount / expense.paidBy.length;
        }
      });
    } else {
      // Handle single payer
      if (expensesByParticipant[expense.paidBy] !== undefined) {
        expensesByParticipant[expense.paidBy] += expense.amount;
      }
    }
  });
  
  return expensesByParticipant;
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border rounded-md shadow-sm">
        <p className="font-medium">{label}</p>
        <p>
          {payload[0].name}: {formatCurrency(payload[0].value, currency)}
        </p>
      </div>
    );
  }
  
  return null;
};

interface ExpenseAnalyticsProps {
  trip: Trip;
}

export function ExpenseAnalytics({ trip }: ExpenseAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const totalExpenses = calculateTotalExpenses(trip.expenses);
  
  // Calculate category data for pie chart
  const categoryData = [
    { name: "Food", value: calculateCategoryTotal(trip.expenses, "food") },
    { name: "Accommodation", value: calculateCategoryTotal(trip.expenses, "accommodation") },
    { name: "Transportation", value: calculateCategoryTotal(trip.expenses, "transportation") },
    { name: "Activities", value: calculateCategoryTotal(trip.expenses, "activities") },
    { name: "Shopping", value: calculateCategoryTotal(trip.expenses, "shopping") },
    { name: "Other", value: calculateCategoryTotal(trip.expenses, "other") },
  ].filter(item => item.value > 0);
  
  // Calculate daily expense data for line chart
  const dailyExpenses = calculateDailyExpenses(trip.expenses);
  const dailyExpenseData = Object.entries(dailyExpenses)
    .map(([date, amount]) => ({
      date: format(new Date(date), "MMM d"),
      amount,
      fullDate: date,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  
  // Calculate participant expense data for bar chart
  const expensesByParticipant = calculateExpensesByParticipant(
    trip.expenses,
    trip.participants
  );
  const participantExpenseData = Object.entries(expensesByParticipant).map(
    ([participantId, amount]) => ({
      name: getParticipantName(participantId, trip.participants),
      amount,
      id: participantId,
    })
  );
  
  // Calculate cumulative expense data for area chart
  const cumulativeExpenseData = dailyExpenseData.reduce(
    (acc: { date: string; amount: number }[], entry, index) => {
      const prevAmount = index > 0 ? acc[index - 1].amount : 0;
      acc.push({
        date: entry.date,
        amount: prevAmount + entry.amount,
      });
      return acc;
    },
    []
  );
  
  // Prepare contribution vs benefit data
  const contributionVsBenefitData = trip.participants.map(participant => {
    // What they paid (contribution)
    const amountPaid = expensesByParticipant[participant.id] || 0;
    
    // What they consumed (benefit) - equal split for simplicity
    const amountConsumed = totalExpenses / trip.participants.length;
    
    // Net balance
    const balance = amountPaid - amountConsumed;
    
    return {
      name: participant.name,
      amountPaid,
      amountConsumed,
      balance,
      id: participant.id
    };
  });
  
  // Prepare settlement visualization data
  const settlementData = trip.participants.map(participant => ({
    name: participant.name,
    balance: participant.balance,
    id: participant.id
  }));
  
  // Prepare stacked bar data for daily category expenses
  const categoryExpensesByDay: Record<string, Record<string, number>> = {};
  
  trip.expenses.forEach(expense => {
    const date = format(new Date(expense.date), "MMM d");
    if (!categoryExpensesByDay[date]) {
      categoryExpensesByDay[date] = {
        food: 0,
        accommodation: 0,
        transportation: 0,
        activities: 0,
        shopping: 0,
        other: 0,
      };
    }
    
    categoryExpensesByDay[date][expense.category] += expense.amount;
  });
  
  const dailyCategoryData = Object.entries(categoryExpensesByDay).map(
    ([date, categories]) => ({
      date,
      ...categories,
    })
  );
  
  // Prepare colors for charts
  const CATEGORY_COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c", "#d0ed57"];
  const SETTLEMENT_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28AFF", "#FF6B6B"];
  
  // For positive/negative values
  const getBalanceColor = (amount: number) => (amount >= 0 ? "#00C49F" : "#FF8042");
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily Analysis</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>
                  Breakdown of expenses by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, trip.currency)} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Daily Expenses</CardTitle>
                <CardDescription>
                  Expense trend over the trip duration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailyExpenseData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => 
                          formatCurrency(value, trip.currency).split('.')[0]
                        } 
                      />
                      <Tooltip 
                        content={<CustomTooltip currency={trip.currency} />} 
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        name="Expense"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Spending Trend</CardTitle>
                <CardDescription>
                  Cumulative expenses over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={cumulativeExpenseData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => 
                          formatCurrency(value, trip.currency).split('.')[0]
                        } 
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, trip.currency)} 
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        name="Total Spent"
                        stroke="#8884d8"
                        fill="#8884d8"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Daily Expense by Category</CardTitle>
                <CardDescription>
                  Category breakdown by day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyCategoryData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => 
                          formatCurrency(value, trip.currency).split('.')[0]
                        } 
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, trip.currency)} 
                      />
                      <Legend />
                      <Bar dataKey="food" stackId="a" name="Food" fill="#8884d8" />
                      <Bar dataKey="accommodation" stackId="a" name="Accommodation" fill="#83a6ed" />
                      <Bar dataKey="transportation" stackId="a" name="Transportation" fill="#8dd1e1" />
                      <Bar dataKey="activities" stackId="a" name="Activities" fill="#82ca9d" />
                      <Bar dataKey="shopping" stackId="a" name="Shopping" fill="#a4de6c" />
                      <Bar dataKey="other" stackId="a" name="Other" fill="#d0ed57" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Daily Analysis Tab */}
        <TabsContent value="daily" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Expense Trend</CardTitle>
                <CardDescription>
                  Expense pattern throughout the trip
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyExpenseData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => 
                          formatCurrency(value, trip.currency).split('.')[0]
                        } 
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, trip.currency)} 
                      />
                      <Legend />
                      <Bar 
                        dataKey="amount" 
                        name="Expense" 
                        fill="#8884d8" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Daily Category Distribution</CardTitle>
                <CardDescription>
                  Expense categories by day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyCategoryData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => 
                          formatCurrency(value, trip.currency).split('.')[0]
                        } 
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, trip.currency)} 
                      />
                      <Legend />
                      <Bar dataKey="food" name="Food" fill="#8884d8" />
                      <Bar dataKey="accommodation" name="Accommodation" fill="#83a6ed" />
                      <Bar dataKey="transportation" name="Transportation" fill="#8dd1e1" />
                      <Bar dataKey="activities" name="Activities" fill="#82ca9d" />
                      <Bar dataKey="shopping" name="Shopping" fill="#a4de6c" />
                      <Bar dataKey="other" name="Other" fill="#d0ed57" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Individual Contributions</CardTitle>
                <CardDescription>
                  How much each person has paid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={participantExpenseData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => 
                          formatCurrency(value, trip.currency).split('.')[0]
                        } 
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, trip.currency)} 
                      />
                      <Legend />
                      <Bar 
                        dataKey="amount" 
                        name="Contributed" 
                        fill="#8884d8" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Fair Split vs. Actual Payment</CardTitle>
                <CardDescription>
                  Expected vs. Actual Contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={contributionVsBenefitData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => 
                          formatCurrency(value, trip.currency).split('.')[0]
                        } 
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, trip.currency)} 
                      />
                      <Legend />
                      <Bar 
                        dataKey="amountPaid" 
                        name="Actual Paid" 
                        fill="#8884d8" 
                      />
                      <Bar 
                        dataKey="amountConsumed" 
                        name="Fair Share" 
                        fill="#82ca9d" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Settlements Tab */}
        <TabsContent value="settlements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Balance Overview</CardTitle>
                <CardDescription>
                  Who owes, who is owed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={settlementData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => 
                          formatCurrency(value, trip.currency).split('.')[0]
                        } 
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, trip.currency)} 
                      />
                      <Legend />
                      <Bar 
                        dataKey="balance" 
                        name="Balance"
                        fill="#8884d8"
                      >
                        {settlementData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.balance >= 0 ? "#00C49F" : "#FF8042"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Contribution vs. Benefit</CardTitle>
                <CardDescription>
                  Comparison of payment and consumption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={contributionVsBenefitData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => 
                          formatCurrency(value, trip.currency).split('.')[0]
                        } 
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value, trip.currency)} 
                      />
                      <Legend />
                      <Bar 
                        dataKey="balance" 
                        name="Net Balance"
                        fill="#8884d8"
                      >
                        {contributionVsBenefitData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.balance >= 0 ? "#00C49F" : "#FF8042"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
