
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Expense, Participant, Trip, ExpenseAttachment, ExpenseCategory } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { Camera, X, FileIcon } from "lucide-react";
import { CameraDialog } from "./CameraDialog";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/expenseCalculator";
import { useCamera } from "@/hooks/use-camera";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddExpenseDialogProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseAdded: (expense: Expense) => void;
}

export const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({ trip, open, onOpenChange, onExpenseAdded }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [paidByIds, setPaidByIds] = useState<string[]>([trip.participants[0]?.id || ""]);
  const [payerAmounts, setPayerAmounts] = useState<{ [participantId: string]: number }>({});
  const [splitBetween, setSplitBetween] = useState<string[]>(trip.participants.map(p => p.id));
  const [splitMethod, setSplitMethod] = useState<"equal" | "custom">("equal");
  const [splitAmounts, setSplitAmounts] = useState<{ [participantId: string]: number }>({});
  const [notes, setNotes] = useState("");
  const [fileAttachments, setFileAttachments] = useState<ExpenseAttachment[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { hasCamera } = useCamera();
  const { toast } = useToast();

  // Initialize payer amounts
  useEffect(() => {
    if (paidByIds.length > 0) {
      const totalAmount = parseFloat(amount) || 0;
      const equalAmount = totalAmount / paidByIds.length;
      
      const newPayerAmounts: { [participantId: string]: number } = {};
      paidByIds.forEach(id => {
        newPayerAmounts[id] = equalAmount;
      });
      
      setPayerAmounts(newPayerAmounts);
    }
  }, [paidByIds, amount]);

  // Initialize split amounts for equal splitting
  useEffect(() => {
    if (splitMethod === "equal" && splitBetween.length > 0) {
      const equalAmount = (parseFloat(amount) || 0) / splitBetween.length;
      const newSplitAmounts: { [participantId: string]: number } = {};
      splitBetween.forEach(participantId => {
        newSplitAmounts[participantId] = equalAmount;
      });
      setSplitAmounts(newSplitAmounts);
    }
  }, [amount, splitBetween, splitMethod]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(async file => {
      const id = uuidv4();
      const fileUrl = URL.createObjectURL(file);
      let thumbnailUrl: string | undefined = undefined;

      if (file.type.startsWith('image/')) {
        thumbnailUrl = fileUrl;
      }

      const newAttachment: ExpenseAttachment = {
        id,
        filename: file.name,
        fileUrl,
        fileType: file.type,
        fileSize: file.size,
        thumbnailUrl,
        uploadedAt: new Date().toISOString()
      };

      setFileAttachments(prev => [...prev, newAttachment]);
    });
  };

  const handleFileRemove = (indexToRemove: number) => {
    setFileAttachments(prevAttachments => 
      prevAttachments.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSplitMethodChange = (method: "equal" | "custom") => {
    setSplitMethod(method);
    if (method === "equal" && splitBetween.length > 0) {
      const equalAmount = (parseFloat(amount) || 0) / splitBetween.length;
      const newSplitAmounts: { [participantId: string]: number } = {};
      splitBetween.forEach(participantId => {
        newSplitAmounts[participantId] = equalAmount;
      });
      setSplitAmounts(newSplitAmounts);
    }
  };

  const handlePayerAmountChange = (participantId: string, value: string) => {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue) && value !== "") {
      toast({
        title: "Error",
        description: "Please enter a valid number.",
        variant: "destructive",
      });
      return;
    }

    if (value === "") {
      setPayerAmounts(prev => {
        const { [participantId]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      setPayerAmounts(prev => ({
        ...prev,
        [participantId]: parsedValue,
      }));
    }
  };

  const distributeRemaining = (participantId: string, currentAmount: number) => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
      toast({
        title: "Error",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const currentTotal = Object.values(splitAmounts).reduce((acc, val) => acc + val, 0);
    const remainingAmount = amountValue - currentTotal;
    const newAmount = currentAmount + remainingAmount;

    if (newAmount < 0) {
      toast({
        title: "Error",
        description: "Amount cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    setSplitAmounts(prev => ({
      ...prev,
      [participantId]: newAmount,
    }));
  };

  const handleSplitAmountChange = (participantId: string, value: string) => {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue) && value !== "") {
      toast({
        title: "Error",
        description: "Please enter a valid number.",
        variant: "destructive",
      });
      return;
    }

    if (value === "") {
      setSplitAmounts(prev => {
        const { [participantId]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      setSplitAmounts(prev => ({
        ...prev,
        [participantId]: parsedValue,
      }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      toast({
        title: "Error",
        description: "Please enter the expense amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date for the expense.",
        variant: "destructive",
      });
      return;
    }

    if (paidByIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one payer.",
        variant: "destructive",
      });
      return;
    }

    // Validate payer amounts if there are multiple payers
    if (paidByIds.length > 1) {
      const totalPayerAmount = Object.values(payerAmounts).reduce((sum, amount) => sum + amount, 0);
      if (Math.abs(totalPayerAmount - parseFloat(amount)) > 0.01) {
        toast({
          title: "Error",
          description: "Total paid amounts do not match the expense amount.",
          variant: "destructive",
        });
        return;
      }
    }

    if (splitBetween.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one participant to split with.",
        variant: "destructive",
      });
      return;
    }

    // Validate split amounts for custom split
    if (splitMethod === "custom") {
      const totalSplitAmount = Object.values(splitAmounts).reduce((sum, amount) => sum + amount, 0);
      if (Math.abs(totalSplitAmount - parseFloat(amount)) > 0.01) {
        toast({
          title: "Error",
          description: "Total split amount does not match the expense amount.",
          variant: "destructive",
        });
        return;
      }
    }

    const formattedSplitAmounts: { [participantId: string]: number } = {};
    for (const participantId of splitBetween) {
      formattedSplitAmounts[participantId] = splitAmounts[participantId] || 0;
    }

    const formattedPayerAmounts: { [participantId: string]: number } = {};
    for (const payerId of paidByIds) {
      formattedPayerAmounts[payerId] = payerAmounts[payerId] || (parseFloat(amount) / paidByIds.length);
    }

    const newExpense: Omit<Expense, 'id'> = {
      amount: parseFloat(amount),
      category,
      name,
      date: date.toISOString(),
      paidBy: paidByIds,
      payerAmounts: paidByIds.length > 1 ? formattedPayerAmounts : undefined,
      splitBetween,
      splitAmounts: splitMethod === "custom" ? formattedSplitAmounts : undefined,
      notes: notes.trim() || undefined,
      attachments: fileAttachments.length > 0 ? fileAttachments : undefined,
      description: name,
      splitMethod: splitMethod === "equal" ? "equal" : "custom"
    };
    
    try {
      const tripService = await import('@/services/tripService');
      const createdExpense = await tripService.addExpense(trip.id, newExpense);
      
      onExpenseAdded(createdExpense);
      toast({
        title: "Expense added",
        description: "The expense has been successfully added",
      });
      onOpenChange(false);
      
      // Reset form
      setAmount("");
      setCategory("food");
      setName("");
      setDate(new Date());
      setPaidByIds([trip.participants[0]?.id || ""]);
      setPayerAmounts({});
      setSplitBetween(trip.participants.map(p => p.id));
      setSplitMethod("equal");
      setSplitAmounts({});
      setNotes("");
      setFileAttachments([]);
      
    } catch (error) {
      console.error("Error creating expense:", error);
      toast({
        title: "Error",
        description: "Failed to create expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCameraClick = () => {
    if (hasCamera) {
      setShowCamera(true);
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCapture = (imageDataURL: string) => {
    const timestamp = new Date().toISOString();
    const newAttachment: ExpenseAttachment = {
      id: `camera-${timestamp}`,
      filename: `Photo ${new Date().toLocaleString()}`,
      fileUrl: imageDataURL,
      fileType: 'image/jpeg',
      fileSize: 0,
      thumbnailUrl: imageDataURL,
      uploadedAt: timestamp
    };
    
    setFileAttachments(prev => [...prev, newAttachment]);
    setShowCamera(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Add a new expense to track where your money is going.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  placeholder="Expense amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="accommodation">Accommodation</SelectItem>
                    <SelectItem value="activities">Activities</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Description</Label>
              <Input
                id="name"
                placeholder="Expense description"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Paid By</Label>
              {trip.participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2 mb-2">
                  <Input
                    type="checkbox"
                    id={`paidBy-${participant.id}`}
                    className="h-4 w-4"
                    checked={paidByIds.includes(participant.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPaidByIds([...paidByIds, participant.id]);
                      } else {
                        setPaidByIds(paidByIds.filter((id) => id !== participant.id));
                      }
                    }}
                  />
                  <Label htmlFor={`paidBy-${participant.id}`} className="flex-1">{participant.name}</Label>
                  {paidByIds.includes(participant.id) && paidByIds.length > 1 && (
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      className="w-24"
                      value={payerAmounts[participant.id]?.toString() || ""}
                      onChange={(e) => handlePayerAmountChange(participant.id, e.target.value)}
                    />
                  )}
                </div>
              ))}
              {paidByIds.length > 1 && (
                <div className="text-sm text-muted-foreground mt-1">
                  Total: {formatCurrency(Object.values(payerAmounts).reduce((sum, val) => sum + val, 0), trip.currency)}
                  {parseFloat(amount) > 0 && Math.abs(Object.values(payerAmounts).reduce((sum, val) => sum + val, 0) - parseFloat(amount)) > 0.01 && (
                    <span className="text-destructive ml-2">
                      (Difference: {formatCurrency(parseFloat(amount) - Object.values(payerAmounts).reduce((sum, val) => sum + val, 0), trip.currency)})
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Split Between</Label>
              {trip.participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    id={`splitBetween-${participant.id}`}
                    className="h-4 w-4"
                    checked={splitBetween.includes(participant.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSplitBetween([...splitBetween, participant.id]);
                      } else {
                        setSplitBetween(splitBetween.filter((id) => id !== participant.id));
                      }
                    }}
                  />
                  <Label htmlFor={`splitBetween-${participant.id}`}>{participant.name}</Label>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Split Method</Label>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant={splitMethod === "equal" ? "default" : "outline"}
                  onClick={() => handleSplitMethodChange("equal")}
                >
                  Split Equally
                </Button>
                <Button
                  type="button"
                  variant={splitMethod === "custom" ? "default" : "outline"}
                  onClick={() => handleSplitMethodChange("custom")}
                  disabled={splitBetween.length === 0}
                >
                  Split Manually
                </Button>
              </div>
            </div>
            {splitMethod === "custom" && splitBetween.length > 0 && (
              <div className="space-y-2">
                <Label>Split Amounts</Label>
                {trip.participants.map((participant) => {
                  if (!splitBetween.includes(participant.id)) return null;
                  return (
                    <div key={participant.id} className="flex items-center space-x-2">
                      <Label htmlFor={`amount-${participant.id}`} className="flex-1">{participant.name}</Label>
                      <Input
                        id={`amount-${participant.id}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-24"
                        value={splitAmounts[participant.id]?.toString() || ""}
                        onChange={(e) => handleSplitAmountChange(participant.id, e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            setSplitAmounts(prev => {
                              const { [participant.id]: removed, ...rest } = prev;
                              return rest;
                            });
                          }
                        }}
                      />
                    </div>
                  );
                })}
                <div className="text-sm text-muted-foreground mt-1">
                  Total: {formatCurrency(Object.values(splitAmounts).reduce((sum, val) => sum + val, 0), trip.currency)}
                  {parseFloat(amount) > 0 && Math.abs(Object.values(splitAmounts).reduce((sum, val) => sum + val, 0) - parseFloat(amount)) > 0.01 && (
                    <span className="text-destructive ml-2">
                      (Difference: {formatCurrency(parseFloat(amount) - Object.values(splitAmounts).reduce((sum, val) => sum + val, 0), trip.currency)})
                    </span>
                  )}
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSplitMethodChange("equal")}
                  className="mt-2"
                >
                  Reset to Equal Split
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  id="attachment"
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Add Attachment
                </Button>
                <Button type="button" variant="outline" onClick={handleCameraClick}>
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                {fileAttachments.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {fileAttachments.length} file(s) attached
                  </span>
                )}
              </div>
              {fileAttachments.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {fileAttachments.map((attachment, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-2">
                        <div className="aspect-square w-full overflow-hidden rounded-md bg-muted flex items-center justify-center">
                          {attachment.fileType.startsWith('image/') ? (
                            <a 
                              href={attachment.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full h-full"
                            >
                              <img 
                                src={attachment.thumbnailUrl || attachment.fileUrl} 
                                alt={attachment.filename} 
                                className="h-full w-full object-cover transition-all hover:scale-105"
                              />
                            </a>
                          ) : (
                            <a 
                              href={attachment.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex h-full w-full flex-col items-center justify-center gap-1 p-4"
                            >
                              <FileIcon className="h-8 w-8 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate max-w-full">
                                {attachment.filename}
                              </span>
                            </a>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="truncate">{attachment.filename}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleFileRemove(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </form>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleFormSubmit}>
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
      <CameraDialog
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCapture}
      />
    </Dialog>
  );
};
