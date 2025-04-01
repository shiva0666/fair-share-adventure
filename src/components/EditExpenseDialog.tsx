import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Expense, ExpenseCategory, Participant, Trip, ExpenseAttachment } from "@/types";
import { Users, Split, DollarSign, Paperclip, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateExpense } from "@/services/tripService";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { v4 as uuidv4 } from 'uuid';

interface EditExpenseDialogProps {
  trip: Trip;
  expense: Expense;
  onExpenseUpdated?: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const expenseCategories: ExpenseCategory[] = [
  "food",
  "accommodation",
  "transportation",
  "activities",
  "shopping",
  "other",
];

export function EditExpenseDialog({ trip, expense, onExpenseUpdated, isOpen, onOpenChange }: EditExpenseDialogProps) {
  const [expenseName, setExpenseName] = useState(expense.name);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [date, setDate] = useState(expense.date);
  const [paidBy, setPaidBy] = useState<string[]>(Array.isArray(expense.paidBy) ? expense.paidBy : [expense.paidBy]);
  const [payerAmounts, setPayerAmounts] = useState<Record<string, string>>(
    trip.participants.reduce((acc, p) => ({ ...acc, [p.id]: String(expense.payerAmounts?.[p.id] || "") }), {})
  );
  const [splitBetween, setSplitBetween] = useState<string[]>(expense.splitBetween);
  const [useCustomSplit, setUseCustomSplit] = useState(!!expense.splitAmounts);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>(
    trip.participants.reduce((acc, p) => ({ ...acc, [p.id]: String(expense.splitAmounts?.[p.id] || "") }), {})
  );
  const [autoDistributeRemaining, setAutoDistributeRemaining] = useState(true);
  const [notes, setNotes] = useState(expense.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowManualPayerAmounts, setAllowManualPayerAmounts] = useState(expense.payerAmounts !== undefined);
  const [fileAttachments, setFileAttachments] = useState<ExpenseAttachment[]>(expense.attachments || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (allowManualPayerAmounts) return;
    
    if (paidBy.length === 1) {
      const singlePayerId = paidBy[0];
      setPayerAmounts(prev => ({
        ...Object.keys(prev).reduce((acc, id) => ({ ...acc, [id]: "" }), {}),
        [singlePayerId]: amount
      }));
    } else if (paidBy.length > 1 && amount) {
      const amountPerPayer = (parseFloat(amount) / paidBy.length).toFixed(2);
      const updatedPayerAmounts = { ...payerAmounts };
      
      Object.keys(updatedPayerAmounts).forEach(id => {
        updatedPayerAmounts[id] = "";
      });
      
      paidBy.forEach(id => {
        updatedPayerAmounts[id] = amountPerPayer;
      });
      
      setPayerAmounts(updatedPayerAmounts);
    }
  }, [amount, paidBy, allowManualPayerAmounts]);

  useEffect(() => {
    if (useCustomSplit && autoDistributeRemaining && splitBetween.length > 0) {
      const totalAmount = parseFloat(amount || "0");
      if (isNaN(totalAmount) || totalAmount <= 0) return;

      let allocatedAmount = 0;
      let allocatedParticipants = 0;
      
      splitBetween.forEach(id => {
        const participantAmount = parseFloat(splitAmounts[id] || "0");
        if (!isNaN(participantAmount) && participantAmount > 0) {
          allocatedAmount += participantAmount;
          allocatedParticipants++;
        }
      });

      if (allocatedParticipants === splitBetween.length || splitBetween.length === 0) return;

      const remainingAmount = totalAmount - allocatedAmount;
      const remainingParticipants = splitBetween.length - allocatedParticipants;
      
      if (remainingAmount <= 0 || remainingParticipants <= 0) return;
      
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
      
      if (useCustomSplit) {
        setSplitAmounts(prev => ({ ...prev, [participantId]: "" }));
      }
    } else {
      setSplitBetween(splitBetween.filter((id) => id !== participantId));
      
      if (useCustomSplit) {
        const newSplitAmounts = { ...splitAmounts };
        delete newSplitAmounts[participantId];
        setSplitAmounts(newSplitAmounts);
      }
    }
  };

  const handlePayerSelection = (participantId: string, checked: boolean) => {
    if (checked) {
      const newPaidBy = [...paidBy, participantId];
      setPaidBy(newPaidBy);
      
      const updatedPayerAmounts = { ...payerAmounts };
      updatedPayerAmounts[participantId] = "";
      setPayerAmounts(updatedPayerAmounts);
    } else {
      if (paidBy.length > 1) {
        const newPaidBy = paidBy.filter((id) => id !== participantId);
        setPaidBy(newPaidBy);
        
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
    if (!useCustomSplit) return true;
    
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
    
    const amountValue = parseFloat(amount);
    const totalSplit = selectedParticipants.reduce(
      (sum, id) => sum + parseFloat(splitAmounts[id] || "0"), 
      0
    );
    
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
    
    const amountValue = parseFloat(amount);
    const totalPaid = paidBy.reduce(
      (sum, id) => sum + parseFloat(payerAmounts[id] || "0"),
      0
    );
    
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

    if (!validatePayerAmounts()) {
      return;
    }

    if (useCustomSplit && !validateCustomSplitAmounts()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formattedPayerAmounts = paidBy.reduce((acc, id) => ({
        ...acc,
        [id]: parseFloat(payerAmounts[id] || "0")
      }), {});
      
      const formattedSplitAmounts = useCustomSplit
        ? splitBetween.reduce((acc, id) => ({
            ...acc,
            [id]: parseFloat(splitAmounts[id] || "0")
          }), {})
        : undefined;
      
      const expenseData: Expense = {
        id: expense.id,
        name: expenseName,
        amount: amountValue,
        category,
        date,
        paidBy: paidBy.length === 1 ? paidBy[0] : paidBy,
        payerAmounts: paidBy.length > 1 ? formattedPayerAmounts : undefined,
        splitBetween,
        splitAmounts: formattedSplitAmounts,
        notes: notes.trim() || undefined,
        attachments: fileAttachments.length > 0 ? fileAttachments : undefined,
        createdAt: expense.createdAt,
      };
      
      if ('startDate' in trip && 'endDate' in trip) {
        await updateExpense(trip.id, expenseData);
      } else {
        await import('@/services/groupService').then(module => {
          return module.updateExpense(trip.id, expenseData);
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
      queryClient.invalidateQueries({ queryKey: ['group', trip.id] });
      
      if (onExpenseUpdated) {
        onExpenseUpdated();
      }
      
      toast({
        title: "Success",
        description: "Expense updated successfully!",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating expense:", error);
      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: ExpenseAttachment[] = Array.from(e.target.files).map(file => {
        const id = uuidv4();
        const fileUrl = URL.createObjectURL(file);
        
        return {
          id,
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl,
          thumbnailUrl: file.type.startsWith('image/') ? fileUrl : undefined,
          uploadedAt: new Date().toISOString(),
        };
      });
      
      setFileAttachments(prev => [...prev, ...newAttachments]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setFileAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update the expense details and how it should be split.
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
              <Label>Attachments</Label>
              <div className="flex items-center mb-2">
                <Paperclip className="h-4 w-4 mr-2" />
                <span className="text-sm text-muted-foreground">
                  Attach receipts or related documents
                </span>
              </div>
              
              {fileAttachments.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {fileAttachments.map(file => (
                    <div 
                      key={file.id} 
                      className="flex items-center border rounded-md p-2 bg-muted/50"
                    >
                      <div className="flex-1 truncate text-xs">
                        {file.filename}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleRemoveAttachment(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                Attach Files
              </Button>
              <Input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                multiple 
                onChange={handleFileUpload}
              />
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
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
