
import { useMemo } from "react";
import { Trip, Expense } from "@/types";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { formatCurrency } from "@/utils/expenseCalculator";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ExpenseAnalyticsProps {
  trip: Trip;
}

export function ExpenseAnalytics({ trip }: ExpenseAnalyticsProps) {
  // Calculate expenses by category
  const expensesByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    
    trip.expenses.forEach((expense) => {
      const category = expense.category;
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += expense.amount;
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [trip.expenses]);
  
  // Calculate expenses by day
  const expensesByDay = useMemo(() => {
    const dailyExpenses: Record<string, number> = {};
    
    trip.expenses.forEach((expense) => {
      const date = expense.date;
      if (!dailyExpenses[date]) {
        dailyExpenses[date] = 0;
      }
      dailyExpenses[date] += expense.amount;
    });
    
    return Object.entries(dailyExpenses)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, amount]) => ({
        date: format(parseISO(date), "MMM dd"),
        fullDate: date,
        amount
      }));
  }, [trip.expenses]);
  
  // Calculate participant contributions
  const participantContributions = useMemo(() => {
    const contributions: Record<string, number> = {};
    
    // Initialize all participants with 0
    trip.participants.forEach((participant) => {
      contributions[participant.id] = 0;
    });
    
    // Calculate how much each person paid
    trip.expenses.forEach((expense) => {
      if (Array.isArray(expense.paidBy)) {
        // Multiple payers with specific amounts
        if (expense.payerAmounts) {
          expense.paidBy.forEach((payerId) => {
            contributions[payerId] += expense.payerAmounts?.[payerId] || 0;
          });
        } else {
          // Equal split among payers
          const shareAmount = expense.amount / expense.paidBy.length;
          expense.paidBy.forEach((payerId) => {
            contributions[payerId] += shareAmount;
          });
        }
      } else {
        // Single payer
        contributions[expense.paidBy] += expense.amount;
      }
    });
    
    return Object.entries(contributions).map(([id, amount]) => ({
      name: trip.participants.find(p => p.id === id)?.name || "Unknown",
      value: amount
    }));
  }, [trip.expenses, trip.participants]);
  
  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  // Formatting options for tooltips
  const formatTooltipValue = (value: number) => formatCurrency(value);
  
  if (trip.expenses.length === 0) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">No Expenses Yet</h2>
        <p className="text-muted-foreground">
          Start adding expenses to see analytics and insights here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Trip Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category distribution chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Breakdown of expenses across categories</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer 
              config={{
                pie: { color: "#0088FE" },
              }}
            >
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltipValue} />
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Participant contributions chart */}
        <Card>
          <CardHeader>
            <CardTitle>Participant Contributions</CardTitle>
            <CardDescription>Amount paid by each participant</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer
              config={{
                bar: { color: "#00C49F" },
              }}
            >
              <BarChart
                data={participantContributions}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={formatTooltipValue} />
                <Bar dataKey="value" fill="#00C49F" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Daily expenses trend chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Daily Expenses Trend</CardTitle>
            <CardDescription>How expenses evolved throughout the trip</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer
              config={{
                line: { color: "#8884d8" },
              }}
            >
              <LineChart
                data={expensesByDay}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelFormatter={(label) => {
                    const item = expensesByDay.find(item => item.date === label);
                    return item ? format(parseISO(item.fullDate), "EEEE, MMMM d, yyyy") : label;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  name="Daily Expense"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
