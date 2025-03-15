
import { useMemo, useState } from "react";
import { Trip, Expense, Participant } from "@/types";
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
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
  ZAxis
} from "recharts";
import { 
  formatCurrency, 
  calculateExpenseShare, 
  calculateTotalPaid, 
  calculateTotalShare 
} from "@/utils/expenseCalculator";
import { format, parseISO, isValid } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExpenseAnalyticsProps {
  trip: Trip;
}

export function ExpenseAnalytics({ trip }: ExpenseAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF5733', '#C70039', '#900C3F'];
  
  // Format options for tooltips
  const formatTooltipValue = (value: number) => formatCurrency(value, trip.currency);
  
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
  
  // Calculate participant contributions (how much each person paid)
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
      id,
      paid: amount,
      owed: calculateTotalShare(id, trip.expenses),
      balance: amount - calculateTotalShare(id, trip.expenses)
    }));
  }, [trip.expenses, trip.participants]);
  
  // Calculate expenses by category and day
  const expensesByCategoryAndDay = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    const allDates = new Set<string>();
    const allCategories = new Set<string>();
    
    // Collect all dates and categories
    trip.expenses.forEach((expense) => {
      allDates.add(expense.date);
      allCategories.add(expense.category);
      
      if (!result[expense.date]) {
        result[expense.date] = {};
      }
      
      if (!result[expense.date][expense.category]) {
        result[expense.date][expense.category] = 0;
      }
      
      result[expense.date][expense.category] += expense.amount;
    });
    
    // Convert to array format for charts
    return Array.from(allDates).sort().map(date => {
      const dateData: any = {
        date: format(parseISO(date), "MMM dd"),
        fullDate: date,
      };
      
      // Add all categories (even those with 0 value)
      Array.from(allCategories).forEach(category => {
        dateData[category] = result[date][category] || 0;
      });
      
      return dateData;
    });
  }, [trip.expenses]);
  
  // Find most and least expensive days
  const { mostExpensiveDay, leastExpensiveDay } = useMemo(() => {
    if (expensesByDay.length === 0) return { mostExpensiveDay: null, leastExpensiveDay: null };
    
    const mostExpensive = [...expensesByDay].sort((a, b) => b.amount - a.amount)[0];
    const leastExpensive = [...expensesByDay].sort((a, b) => a.amount - b.amount)[0];
    
    return { 
      mostExpensiveDay: mostExpensive, 
      leastExpensiveDay: leastExpensive 
    };
  }, [expensesByDay]);
  
  // Calculate who owes whom (settlement data)
  const settlementData = useMemo(() => {
    const debtors = participantContributions.filter(p => p.balance < 0)
      .sort((a, b) => a.balance - b.balance); // Most negative first
      
    const creditors = participantContributions.filter(p => p.balance > 0)
      .sort((a, b) => b.balance - a.balance); // Most positive first
    
    const settlements = [];
    
    // Deep copy of participants to track remaining balances
    const debtorsRemaining = debtors.map(d => ({ ...d, remaining: Math.abs(d.balance) }));
    const creditorsRemaining = creditors.map(c => ({ ...c, remaining: c.balance }));
    
    // For each debtor (negative balance)
    for (const debtor of debtorsRemaining) {
      // Skip if debtor's debt is already settled
      if (debtor.remaining < 0.01) continue;
      
      // For each creditor (positive balance)
      for (const creditor of creditorsRemaining) {
        // Skip if creditor is already fully paid
        if (creditor.remaining < 0.01) continue;
        
        // Calculate settlement amount
        const amount = Math.min(debtor.remaining, creditor.remaining);
        
        if (amount > 0.01) {
          settlements.push({
            from: debtor.name,
            to: creditor.name,
            amount: amount
          });
          
          // Update remaining balances
          debtor.remaining -= amount;
          creditor.remaining -= amount;
        }
        
        // Break if debtor's debt is fully settled
        if (debtor.remaining < 0.01) break;
      }
    }
    
    return settlements;
  }, [participantContributions]);
  
  // Calculate cumulative expenses over time
  const cumulativeExpenses = useMemo(() => {
    let total = 0;
    return expensesByDay.map(day => {
      total += day.amount;
      return {
        ...day,
        cumulative: total
      };
    });
  }, [expensesByDay]);
  
  // Calculate scatter data for contribution vs benefit
  const contributionVsBenefitData = useMemo(() => {
    return participantContributions.map(participant => ({
      name: participant.name,
      paid: participant.paid,
      owed: participant.owed,
      balance: participant.balance
    }));
  }, [participantContributions]);
  
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participant Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends & Patterns</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard 
              title="Total Expenses" 
              value={formatCurrency(expensesByCategory.reduce((sum, item) => sum + item.value, 0), trip.currency)} 
              description="Sum of all expenses" 
            />
            <SummaryCard 
              title="Most Expensive Day" 
              value={mostExpensiveDay ? formatCurrency(mostExpensiveDay.amount, trip.currency) : "N/A"} 
              description={mostExpensiveDay ? `On ${format(parseISO(mostExpensiveDay.fullDate), "EEE, MMM d")}` : ""}
            />
            <SummaryCard 
              title="Avg. Daily Expense" 
              value={formatCurrency(expensesByCategory.reduce((sum, item) => sum + item.value, 0) / expensesByDay.length, trip.currency)} 
              description={`Across ${expensesByDay.length} days`}
            />
          </div>
          
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
          
          {/* Daily expenses trend chart */}
          <Card>
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
                      return item && isValid(parseISO(item.fullDate)) 
                        ? format(parseISO(item.fullDate), "EEEE, MMMM d, yyyy") 
                        : label;
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
          
          {/* Cumulative expenses chart */}
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Expenses</CardTitle>
              <CardDescription>Total spending over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer
                config={{
                  area: { color: "#82ca9d" },
                }}
              >
                <AreaChart
                  data={cumulativeExpenses}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => {
                      const item = cumulativeExpenses.find(item => item.date === label);
                      return item && isValid(parseISO(item.fullDate)) 
                        ? format(parseISO(item.fullDate), "EEEE, MMMM d, yyyy") 
                        : label;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Cumulative Spending"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Participant Analysis Tab */}
        <TabsContent value="participants" className="space-y-6">
          {/* Fair Split vs Actual Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Fair Share vs Actual Payments</CardTitle>
              <CardDescription>Compare what each person should have paid vs what they actually paid</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
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
                  <Legend />
                  <Bar dataKey="paid" name="Amount Paid" fill="#0088FE" />
                  <Bar dataKey="owed" name="Fair Share" fill="#00C49F" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          {/* Net Balance Per Person */}
          <Card>
            <CardHeader>
              <CardTitle>Net Balance Per Person</CardTitle>
              <CardDescription>Who overpaid or underpaid (positive = gets money back)</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer
                config={{
                  bar: { color: "#0088FE" },
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
                  <Legend />
                  <Bar 
                    dataKey="balance" 
                    name="Net Balance" 
                    fill={(data) => (data.balance >= 0 ? "#00C49F" : "#FF8042")}
                  >
                    {participantContributions.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.balance >= 0 ? "#00C49F" : "#FF8042"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          {/* Contribution vs Benefit Scatter Plot */}
          <Card>
            <CardHeader>
              <CardTitle>Contribution vs Benefit</CardTitle>
              <CardDescription>Compare how much each person paid vs how much they benefited</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer
                config={{
                  scatter: { color: "#8884d8" },
                }}
              >
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid />
                  <XAxis 
                    type="number" 
                    dataKey="paid" 
                    name="Amount Paid" 
                    label={{ value: "Amount Paid", position: "insideBottom", offset: -5 }} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="owed" 
                    name="Fair Share" 
                    label={{ value: "Fair Share", angle: -90, position: "insideLeft" }} 
                  />
                  <ZAxis range={[100, 100]} />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelFormatter={(_, payload) => {
                      if (payload && payload.length > 0) {
                        return payload[0].payload.name;
                      }
                      return "";
                    }}
                  />
                  <Scatter 
                    name="Participants" 
                    data={contributionVsBenefitData} 
                    fill="#8884d8" 
                  />
                </ScatterChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          {/* Settlement Details */}
          <Card>
            <CardHeader>
              <CardTitle>Who Owes Whom?</CardTitle>
              <CardDescription>Suggested settlements to balance expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {settlementData.length === 0 ? (
                <div className="text-center py-4">
                  All balances are settled! Everyone paid their fair share.
                </div>
              ) : (
                <div className="space-y-2">
                  {settlementData.map((settlement, index) => (
                    <div key={index} className="p-3 border rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-medium">{settlement.from}</span>
                        <span className="mx-2">→</span>
                        <span className="font-medium">{settlement.to}</span>
                      </div>
                      <div className="font-bold">
                        {formatCurrency(settlement.amount, trip.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Trends & Patterns Tab */}
        <TabsContent value="trends" className="space-y-6">
          {/* Expenses by Category and Day */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category and Day</CardTitle>
              <CardDescription>See how different categories contributed to daily expenses</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer
                config={{
                  bar: { color: "#8884d8" },
                }}
              >
                <BarChart
                  data={expensesByCategoryAndDay}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                  {Array.from(new Set(trip.expenses.map(e => e.category))).map((category, index) => (
                    <Bar 
                      key={category} 
                      dataKey={category} 
                      stackId="a" 
                      name={category.charAt(0).toUpperCase() + category.slice(1)} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          {/* Category Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Category Comparison</CardTitle>
              <CardDescription>Compare expense distribution across categories</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer
                config={{
                  bar: { color: "#FF8042" },
                }}
              >
                <BarChart
                  data={expensesByCategory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                  <Bar dataKey="value" name="Amount" fill="#FF8042">
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          {/* Participant Spending Pattern */}
          <Card>
            <CardHeader>
              <CardTitle>Participant Spending Pattern</CardTitle>
              <CardDescription>Multi-faceted view of participant expenses</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer
                config={{
                  bar: { color: "#0088FE" },
                  line: { color: "#FF8042" },
                }}
              >
                <ComposedChart
                  data={participantContributions}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis dataKey="name" scale="band" />
                  <YAxis />
                  <Tooltip formatter={formatTooltipValue} />
                  <Legend />
                  <Bar dataKey="paid" name="Amount Paid" barSize={20} fill="#0088FE" />
                  <Bar dataKey="owed" name="Fair Share" barSize={20} fill="#00C49F" />
                  <Line type="monotone" dataKey="balance" name="Net Balance" stroke="#FF8042" />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ 
  title, 
  value, 
  description 
}: { 
  title: string; 
  value: string; 
  description: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
