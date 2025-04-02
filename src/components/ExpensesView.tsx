
import { useState, useEffect } from "react";
import { Trip, Expense } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Filter, 
  Plus, 
  Search, 
  SlidersHorizontal,
  Edit,
  Trash,
  MoreVertical,
  Calendar,
  Users,
  Receipt,
  FileText,
  Download,
  Eye,
  CreditCard,
  Tag,
  Clock,
  Info
} from "lucide-react";
import { ExpenseItem } from "@/components/ExpenseItem";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { EditExpenseDialog } from "@/components/EditExpenseDialog";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { formatCurrency } from "@/utils/expenseCalculator";
import { useToast } from "@/hooks/use-toast";
import { deleteExpense } from "@/services/tripService";
import { Badge } from "@/components/ui/badge";
import { formatDate, getPaidByName } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateExpensePDF } from "@/utils/pdfGenerator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ExpensesViewProps {
  trip: Trip;
  onRefresh?: () => Promise<any>;
  onExpenseAdded?: () => void;
  onExpenseUpdated?: () => void;
}

export function ExpensesView({ trip, onRefresh, onExpenseAdded, onExpenseUpdated }: ExpensesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(trip.expenses);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExpenseAdded = () => {
    setIsAddExpenseDialogOpen(false);
    if (onExpenseAdded) {
      onExpenseAdded();
    } else if (onRefresh) {
      onRefresh();
    }
  };
  
  const handleExpenseUpdated = () => {
    setEditingExpense(null);
    if (onExpenseUpdated) {
      onExpenseUpdated();
    } else if (onRefresh) {
      onRefresh();
    }
  };

  useEffect(() => {
    let result = [...trip.expenses];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(expense => 
        expense.name.toLowerCase().includes(query) || 
        expense.notes?.toLowerCase().includes(query)
      );
    }
    
    if (categoryFilter) {
      result = result.filter(expense => expense.category === categoryFilter);
    }
    
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    setFilteredExpenses(result);
  }, [trip.expenses, searchQuery, categoryFilter, sortBy, sortOrder]);

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(trip.id, expenseId);
      toast({
        title: "Expense deleted",
        description: "The expense has been successfully deleted.",
      });
      setExpenseToDelete(null);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadExpense = async (expense: Expense) => {
    try {
      await generateExpensePDF(trip, expense);
      toast({
        title: "Expense downloaded",
        description: "The expense has been downloaded as a PDF.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download the expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const categories = Array.from(new Set(trip.expenses.map(e => e.category)));
  
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="p-2">
                <p className="text-sm font-medium mb-2">Category</p>
                <Select 
                  value={categoryFilter || ""} 
                  onValueChange={(value) => setCategoryFilter(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setSortBy("date")}
                className={sortBy === "date" ? "bg-accent" : ""}
              >
                Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortBy("amount")}
                className={sortBy === "amount" ? "bg-accent" : ""}
              >
                Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortBy("name")}
                className={sortBy === "name" ? "bg-accent" : ""}
              >
                Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "Descending" : "Ascending"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setIsAddExpenseDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
      
      {isAddExpenseDialogOpen && (
        <AddExpenseDialog
          trip={trip}
          open={isAddExpenseDialogOpen}
          onOpenChange={setIsAddExpenseDialogOpen}
          onExpenseAdded={handleExpenseAdded}
        />
      )}
      
      {editingExpense && (
        <EditExpenseDialog
          trip={trip}
          expense={editingExpense}
          isOpen={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
          onExpenseUpdated={handleExpenseUpdated}
        />
      )}
      
      <div className="text-sm text-muted-foreground">
        Showing {filteredExpenses.length} of {trip.expenses.length} expenses
        {categoryFilter && (
          <span> in <Badge variant="outline">{categoryFilter}</Badge></span>
        )}
        {" "}(Total: {formatCurrency(totalExpenses, trip.currency)})
      </div>
      
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-lg font-medium mb-2">No expenses found</h3>
          <p className="text-muted-foreground mb-6">
            {trip.expenses.length === 0 
              ? "Start by adding your first expense to this trip." 
              : "Try changing your search or filter criteria."}
          </p>
          <Button onClick={() => setIsAddExpenseDialogOpen(true)}>
            Add Expense
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {filteredExpenses.map(expense => (
              <div key={expense.id} className="relative group">
                <ExpenseItem
                  expense={expense}
                  participants={trip.participants}
                  onClick={() => setSelectedExpense(expense)}
                  currency={trip.currency}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedExpense(expense)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Preview</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadExpense(expense)}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Download</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingExpense(expense)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setExpenseToDelete(expense.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      
      {selectedExpense && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <span className="mr-2">{selectedExpense.name}</span>
              <Badge className="ml-auto" variant="outline">{selectedExpense.category}</Badge>
            </CardTitle>
            {selectedExpense.description && selectedExpense.description !== selectedExpense.name && (
              <CardDescription>{selectedExpense.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Amount</p>
                    <p className="text-xl font-semibold">{formatCurrency(selectedExpense.amount, trip.currency)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Date</p>
                    <p>{formatDate(selectedExpense.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Users className="h-5 w-5 mr-3 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Paid by</p>
                    <p>{getPaidByName(selectedExpense.paidBy, trip.participants)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Tag className="h-5 w-5 mr-3 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Split method</p>
                    <p className="capitalize">{selectedExpense.splitMethod || "Equal"}</p>
                    <ul className="mt-2 space-y-1">
                      {selectedExpense.splitBetween.map(participantId => {
                        const participant = trip.participants.find(p => p.id === participantId);
                        if (!participant) return null;
                        
                        let amount;
                        if (selectedExpense.splitAmounts && selectedExpense.splitAmounts[participantId]) {
                          amount = selectedExpense.splitAmounts[participantId];
                        } else {
                          amount = selectedExpense.amount / selectedExpense.splitBetween.length;
                        }
                        
                        return (
                          <li key={participantId} className="flex justify-between text-sm">
                            <span>{participant.name}</span>
                            <span>{formatCurrency(amount, trip.currency)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedExpense.notes && (
              <div className="mt-6">
                <Separator className="mb-4" />
                <div className="flex items-start">
                  <Info className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Notes</p>
                    <p className="whitespace-pre-wrap">{selectedExpense.notes}</p>
                  </div>
                </div>
              </div>
            )}
            
            {selectedExpense.attachments && selectedExpense.attachments.length > 0 && (
              <div className="mt-6">
                <Separator className="mb-4" />
                <p className="text-sm font-medium text-foreground mb-3">Attachments</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {selectedExpense.attachments.map((attachment, index) => (
                    <a 
                      key={index}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {attachment.fileType.startsWith('image/') ? (
                        <div className="aspect-square rounded-md overflow-hidden border hover:opacity-90 transition-opacity">
                          <img 
                            src={attachment.thumbnailUrl || attachment.fileUrl}
                            alt={attachment.filename}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square rounded-md overflow-hidden border hover:opacity-90 transition-opacity flex flex-col items-center justify-center p-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <p className="text-xs text-center mt-2 truncate max-w-full">
                            {attachment.filename}
                          </p>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedExpense(null)}
            >
              Close
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownloadExpense(selectedExpense)}
            >
              <Download className="h-4 w-4 mr-1" />
              Download as PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setEditingExpense(selectedExpense)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardFooter>
        </Card>
      )}
      
      <ConfirmationDialog
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={() => expenseToDelete && handleDeleteExpense(expenseToDelete)}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
