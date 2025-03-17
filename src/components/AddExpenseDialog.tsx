
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Expense, ExpenseCategory, Participant, Trip } from "@/types";
import { Plus, Users, Split, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addExpense } from "@/services/tripService";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddExpenseDialogProps {
  trip: Trip;
  onExpenseAdded?: () => void;
}

const expenseCategories: ExpenseCategory[] = [
  "food",
  "accommodation",
  "transportation",
  "activities",
  "shopping",
  "other",
];

export function AddExpenseDialog({ trip, onExpenseAdded }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidBy, setPaidBy] = useState<string[]>([trip.participants[0]?.id || ""]);
  const [payerAmounts, setPayerAmounts] = useState<Record<string, string>>(
    trip.participants.reduce((acc, p) => ({ ...acc, [p.id]: "" }), {})
  );
  const [splitBetween, setSplitBetween] = useState<string[]>(
    trip.participants.map((p) => p.id)
  );
  const [useCustomSplit, setUseCustomSplit] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>(
    trip.participants.reduce((acc, p) => ({ ...acc, [p.id]: "" }), {})
  );
  const [autoDistributeRemaining, setAutoDistributeRemaining] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Always start with manual payer amounts enabled
  const [allowManualPayerAmounts, setAllowManualPayerAmounts] = useState(true);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only initialize amounts when NOT in manual mode
  useEffect(() => {
    if (allowManualPayerAmounts) return;
    
    if (paidBy.length === 1) {
      // If only one payer, they pay the full amount
      const singlePayerId = paidBy[0];
      setPayerAmounts(prev => ({
        ...Object.keys(prev).reduce((acc, id) => ({ ...acc, [id]: "" }), {}),
        [singlePayerId]: amount
      }));
    } else if (paidBy.length > 1 && amount) {
      // Distribute equally among all payers for initial state
      const amountPerPayer = (parseFloat(amount) / paidBy.length).toFixed(2);
      const updatedPayerAmounts = { ...payerAmounts };
      
      // Reset all payer amounts first
      Object.keys(updatedPayerAmounts).forEach(id => {
        updatedPayerAmounts[id] = "";
      });
      
      // Set amounts for selected payers
      paidBy.forEach(id => {
        updatedPayerAmounts[id] = amountPerPayer;
      });
      
      setPayerAmounts(updatedPayerAmounts);
    }
  }, [amount, paidBy, allowManualPayerAmounts]);

  // Auto-distribute remaining amount in custom split
  useEffect(() => {
    if (useCustomSplit && autoDistributeRemaining && splitBetween.length > 0) {
      const totalAmount = parseFloat(amount || "0");
      if (isNaN(totalAmount) || totalAmount <= 0) return;

      // Calculate already allocated amount
      let allocatedAmount = 0;
      let allocatedParticipants = 0;
      
      splitBetween.forEach(id => {
        const participantAmount = parseFloat(splitAmounts[id] || "0");
        if (!isNaN(participantAmount) && participantAmount > 0) {
          allocatedAmount += participantAmount;
          allocatedParticipants++;
        }
      });

      // If all amounts are manually entered or no participants selected, don't auto-distribute
      if (allocatedParticipants === splitBetween.length || splitBetween.length === 0) return;

      // Calculate remaining amount and participants
      const remainingAmount = totalAmount - allocatedAmount;
      const remainingParticipants = splitBetween.length - allocatedParticipants;
      
      if (remainingAmount <= 0 || remainingParticipants <= 0) return;
      
      // Distribute remaining amount equally
      const amountPerRemaining = (remainingAmount / remainingParticipants).toFixed(2);
      
      const updatedSplitAmounts = { ...splitAmounts };
      splitBetween.forEach(id => {
        const currentAmount = parseFloat(updatedSplitAmounts[id] || "0");
        if (isNaN(currentAmount) || currentAmount <= 0) {
          updatedSplitAmounts[id] = amountPerRemaining;
        }
      });
      
      setSplitAmounts(updatedSplitAmounts);
    }
  }, [useCustomSplit, splitBetween, splitAmounts, amount, autoDistributeRemaining]);

  const handleParticipantSelection = (participantId: string, checked: boolean) => {
    if (checked) {
      setSplitBetween([...splitBetween, participantId]);
      
      // When adding a participant to split, initialize their custom amount
      if (useCustomSplit) {
        setSplitAmounts(prev => ({ ...prev, [participantId]: "" }));
      }
    } else {
      setSplitBetween(splitBetween.filter((id) => id !== participantId));
      
      // When removing a participant from split, remove their custom amount
      if (useCustomSplit) {
        const newSplitAmounts = { ...splitAmounts };
        delete newSplitAmounts[participantId];
        setSplitAmounts(newSplitAmounts);
      }
    }
  };

  const handlePayerSelection = (participantId: string, checked: boolean) => {
    if (checked) {
      // Add to payers
      const newPaidBy = [...paidBy, participantId];
      setPaidBy(newPaidBy);
      
      // In manual mode, just enable the field but don't set a value automatically
      const updatedPayerAmounts = { ...payerAmounts };
      updatedPayerAmounts[participantId] = "";
      setPayerAmounts(updatedPayerAmounts);
    } else {
      // Don't allow removing the last payer
      if (paidBy.length > 1) {
        const newPaidBy = paidBy.filter((id) => id !== participantId);
        setPaidBy(newPaidBy);
        
        // Remove this payer's amount
        const updatedPayerAmounts = { ...payerAmounts };
        updatedPayerAmounts[participantId] = "";
        setPayerAmounts(updatedPayerAmounts);
      } else {
        toast({
          title: "At least one payer required",
          description: "You must have at least one person who paid",
          variant: "destructive",
        });
      }
    }
  };

  const toggleCustomSplit = () => {
    setUseCustomSplit(!useCustomSplit);
    
    // Reset split amounts when toggling off custom split
    if (useCustomSplit) {
      const resetAmounts = trip.participants.reduce((acc, p) => ({ ...acc, [p.id]: "" }), {});
      setSplitAmounts(resetAmounts);
    }
  };

  const updatePayerAmount = (participantId: string, value: string) => {
    setPayerAmounts(prev => ({
      ...prev,
      [participantId]: value
    }));
  };

  const updateSplitAmount = (participantId: string, value: string) => {
    setSplitAmounts(prev => ({
      ...prev,
      [participantId]: value
    }));
  };

  const validateCustomSplitAmounts = () => {
    // Skip validation if not using custom split
    if (!useCustomSplit) return true;
    
    // Check if all selected participants have a value
    const selectedParticipants = splitBetween.filter(id => {
      const amount = parseFloat(splitAmounts[id] || "0");
      return !isNaN(amount) && amount >= 0;
    });
    
    if (selectedParticipants.length !== splitBetween.length) {
      toast({
        title: "Invalid custom split",
        description: "Please enter a valid amount for each selected participant",
        variant: "destructive",
      });
      return false;
    }
    
    // Check if the sum equals the total amount
    const amountValue = parseFloat(amount);
    const totalSplit = selectedParticipants.reduce(
      (sum, id) => sum + parseFloat(splitAmounts[id] || "0"), 
      0
    );
    
    // Allow for small floating-point differences
    if (Math.abs(totalSplit - amountValue) > 0.01) {
      toast({
        title: "Split amounts don't match total",
        description: `The sum of split amounts (${totalSplit.toFixed(2)}) must equal the total expense (${amountValue.toFixed(2)})`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const validatePayerAmounts = () => {
    // Check if all payers have an amount
    const payersWithAmounts = paidBy.filter(id => {
      const amount = parseFloat(payerAmounts[id] || "0");
      return !isNaN(amount) && amount >= 0;
    });
    
    if (payersWithAmounts.length !== paidBy.length) {
      toast({
        title: "Missing payer amounts",
        description: "Please enter a valid amount for each payer",
        variant: "destructive",
      });
      return false;
    }
    
    // Check if sum equals total amount
    const amountValue = parseFloat(amount);
    const totalPaid = paidBy.reduce(
      (sum, id) => sum + parseFloat(payerAmounts[id] || "0"),
      0
    );
    
    // Allow for small floating-point differences
    if (Math.abs(totalPaid - amountValue) > 0.01) {
      toast({
        title: "Payer amounts don't match total",
        description: `The sum of payer amounts (${totalPaid.toFixed(2)}) must equal the total expense (${amountValue.toFixed(2)})`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    // Validation
    if (!expenseName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter an expense name",
        variant: "destructive",
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }

    if (paidBy.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select who paid for this expense",
        variant: "destructive",
      });
      return;
    }

    if (splitBetween.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one participant to split with",
        variant: "destructive",
      });
      return;
    }

    // Validate payer amounts
    if (!validatePayerAmounts()) {
      return;
    }

    // Validate custom split amounts if enabled
    if (useCustomSplit && !validateCustomSplitAmounts()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Format payer amounts for API
      const formattedPayerAmounts = paidBy.reduce((acc, id) => ({
        ...acc,
        [id]: parseFloat(payerAmounts[id] || "0")
      }), {});
      
      // Format split amounts for the API
      const formattedSplitAmounts = useCustomSplit
        ? splitBetween.reduce((acc, id) => ({
            ...acc,
            [id]: parseFloat(splitAmounts[id] || "0")
          }), {})
        : undefined;
      
      // Create the expense
      await addExpense(trip.id, {
        name: expenseName,
        amount: amountValue,
        category,
        date,
        paidBy: paidBy.length === 1 ? paidBy[0] : paidBy, // Send as string or string[]
        payerAmounts: paidBy.length > 1 ? formattedPayerAmounts : undefined,
        splitBetween,
        splitAmounts: formattedSplitAmounts,
        notes: notes.trim() || undefined,
      });
      
      // Refetch trip
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
      queryClient.invalidateQueries({ queryKey: ['group', trip.id] });
      
      // Call callback if provided
      if (onExpenseAdded) {
        onExpenseAdded();
      }
      
      toast({
        title: "Success",
        description: "Expense added successfully!",
      });
      
      // Reset form and close dialog
      setExpenseName("");
      setAmount("");
      setCategory("food");
      setDate(new Date().toISOString().split("T")[0]);
      setPaidBy([trip.participants[0]?.id || ""]);
      setPayerAmounts(trip.participants.reduce((acc, p) => ({ ...acc, [p.id]: "" }), {}));
      setSplitBetween(trip.participants.map((p) => p.id));
      setUseCustomSplit(false);
      setSplitAmounts(trip.participants.reduce((acc, p) => ({ ...acc, [p.id]: "" }), {}));
      setNotes("");
      setAllowManualPayerAmounts(true);
      setOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the expense details and how it should be split.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="expenseName">Expense Name</Label>
              <Input
                id="expenseName"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="e.g., Dinner at Beach Shack"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Paid By</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAllowManualPayerAmounts(!allowManualPayerAmounts)}
                  className="flex items-center gap-1 text-xs"
                >
                  <DollarSign className="h-3 w-3" />
                  {allowManualPayerAmounts ? "Auto Distribute" : "Enter Amounts Manually"}
                </Button>
              </div>
              <div className="flex items-center mb-2">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-sm text-muted-foreground">
                  Select who paid and enter individual amounts
                </span>
              </div>
              <div className="space-y-2 border rounded-md p-3 max-h-[200px] overflow-y-auto">
                {trip.participants.map((participant) => (
                  <div key={`payer-${participant.id}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`payer-${participant.id}`}
                      checked={paidBy.includes(participant.id)}
                      onCheckedChange={(checked) =>
                        handlePayerSelection(
                          participant.id,
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`payer-${participant.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {participant.name}
                    </Label>
                    
                    {paidBy.includes(participant.id) && (
                      <div className="flex items-center">
                        <span className="text-sm mr-1">₹</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-24 h-8"
                          value={payerAmounts[participant.id]}
                          onChange={(e) => updatePayerAmount(participant.id, e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Split Between</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleCustomSplit}
                  className="flex items-center gap-1"
                >
                  <Split className="h-4 w-4" />
                  {useCustomSplit ? "Equal Split" : "Custom Split Amounts"}
                </Button>
              </div>
              <div className="space-y-2 border rounded-md p-3 max-h-[200px] overflow-y-auto">
                {useCustomSplit && (
                  <div className="flex items-center mb-2 p-2 bg-muted/50 rounded-md">
                    <Checkbox 
                      id="auto-distribute"
                      checked={autoDistributeRemaining}
                      onCheckedChange={(checked) => setAutoDistributeRemaining(!!checked)}
                      className="mr-2"
                    />
                    <Label 
                      htmlFor="auto-distribute" 
                      className="text-xs cursor-pointer"
                    >
                      Auto-distribute remaining amount
                    </Label>
                  </div>
                )}
                
                {trip.participants.map((participant) => (
                  <div key={`split-${participant.id}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`participant-${participant.id}`}
                      checked={splitBetween.includes(participant.id)}
                      onCheckedChange={(checked) =>
                        handleParticipantSelection(
                          participant.id,
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`participant-${participant.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {participant.name}
                    </Label>
                    
                    {useCustomSplit && splitBetween.includes(participant.id) && (
                      <div className="flex items-center">
                        <span className="text-sm mr-1">₹</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-24 h-8"
                          value={splitAmounts[participant.id]}
                          onChange={(e) => updateSplitAmount(participant.id, e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes here..."
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
