
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
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Expense, Participant, Trip, Group, ExpenseAttachment, ExpenseCategory } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { X, Download, FileIcon, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/expenseCalculator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { CameraButton } from "@/components/CameraButton";

interface EditExpenseDialogProps {
  trip: Trip | Group;
  expense: Expense;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseUpdated: () => void;
}

export function EditExpenseDialog({
  trip,
  expense,
  isOpen,
  onOpenChange,
  onExpenseUpdated,
}: EditExpenseDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [name, setName] = useState(expense.name);
  const [date, setDate] = useState<Date | undefined>(expense.date ? new Date(expense.date) : undefined);
  const [paidByIds, setPaidByIds] = useState<string[]>(
    Array.isArray(expense.paidBy) ? expense.paidBy : [expense.paidBy]
  );
  const [splitBetween, setSplitBetween] = useState<string[]>(expense.splitBetween);
  const [splitMethod, setSplitMethod] = useState<"equal" | "custom">(
    expense.splitAmounts && Object.keys(expense.splitAmounts).length > 0 ? "custom" : "equal"
  );
  const [splitAmounts, setSplitAmounts] = useState<Record<string, number>>(expense.splitAmounts || {});
  const [notes, setNotes] = useState(expense.notes || "");
  const [fileAttachments, setFileAttachments] = useState<ExpenseAttachment[]>(
    expense.attachments || []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setName(expense.name);
    setDate(expense.date ? new Date(expense.date) : undefined);
    setPaidByIds(Array.isArray(expense.paidBy) ? expense.paidBy : [expense.paidBy]);
    setSplitBetween(expense.splitBetween);
    setSplitMethod(expense.splitAmounts && Object.keys(expense.splitAmounts).length > 0 ? "custom" : "equal");
    setSplitAmounts(expense.splitAmounts || {});
    setNotes(expense.notes || "");
    setFileAttachments(expense.attachments || []);
  }, [expense]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files || files.length === 0) return;

    try {
      const newAttachments = await Promise.all(
        files.map(async (file) => {
          const timestamp = new Date().toISOString();
          const fileUrl = URL.createObjectURL(file);
          const thumbnailUrl = file.type.startsWith('image/') ? fileUrl : undefined;

          return {
            id: `upload-${timestamp}`,
            filename: file.name,
            fileUrl: fileUrl,
            fileType: file.type,
            fileSize: file.size,
            thumbnailUrl: thumbnailUrl,
            uploadedAt: timestamp
          };
        })
      );

      setFileAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageCapture = (imageDataURL: string) => {
    const timestamp = new Date().toISOString();
    const filename = `photo_${timestamp}.jpg`;
    
    const newAttachment: ExpenseAttachment = {
      id: `upload-${timestamp}`,
      filename,
      fileUrl: imageDataURL,
      fileType: 'image/jpeg',
      fileSize: 0, // We don't know the exact size from the data URL
      thumbnailUrl: imageDataURL,
      uploadedAt: timestamp
    };

    setFileAttachments(prev => [...prev, newAttachment]);
    
    toast({
      title: "Photo added",
      description: "The photo has been added to your expense."
    });
  };

  const handleFileRemove = (indexToRemove: number) => {
    setFileAttachments(prevAttachments => 
      prevAttachments.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSplitMethodChange = (value: "equal" | "custom") => {
    setSplitMethod(value);
    if (value === "equal") {
      const equalAmount = parseFloat(amount) / splitBetween.length;
      const newSplitAmounts: Record<string, number> = {};
      splitBetween.forEach(participantId => {
        newSplitAmounts[participantId] = equalAmount;
      });
      setSplitAmounts(newSplitAmounts);
    }
  };

  const distributeRemaining = (participantId: string, amountToDistribute: number) => {
    const currentAmount = splitAmounts[participantId] || 0;
    const newAmount = currentAmount + amountToDistribute;
    setSplitAmounts(prev => ({ ...prev, [participantId]: newAmount }));
  };

  const handleInputChange = (participantId: string, value: string) => {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      setSplitAmounts(prev => ({ ...prev, [participantId]: 0 }));
    } else {
      setSplitAmounts(prev => ({ ...prev, [participantId]: parsedValue }));
    }
  };

  const handlePaidByChange = (participantId: string, checked: boolean) => {
    if (checked) {
      setPaidByIds(prev => [...prev, participantId]);
    } else {
      setPaidByIds(prev => prev.filter(id => id !== participantId));
    }
  };

  const handleSplitBetweenChange = (participantId: string, checked: boolean) => {
    if (checked) {
      setSplitBetween(prev => [...prev, participantId]);
    } else {
      setSplitBetween(prev => prev.filter(id => id !== participantId));
    }
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !name || !date || paidByIds.length === 0 || splitBetween.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(parseFloat(amount))) {
      toast({
        title: "Error",
        description: "Amount must be a valid number.",
        variant: "destructive",
      });
      return;
    }

    if (splitMethod === "custom") {
      const totalSplitAmount = Object.values(splitAmounts).reduce((sum, amount) => sum + amount, 0);
      if (Math.abs(totalSplitAmount - parseFloat(amount)) > 0.01) {
        toast({
          title: "Error",
          description: "Total split amount must equal the expense amount.",
          variant: "destructive",
        });
        return;
      }
    }

    const formattedSplitBetween = splitBetween.filter(participantId =>
      trip.participants.some(p => p.id === participantId)
    );

    const formattedSplitAmounts: Record<string, number> = {};
    formattedSplitBetween.forEach(participantId => {
      formattedSplitAmounts[participantId] = splitAmounts[participantId] || 0;
    });

    const updatedExpense: Expense = {
      id: expense.id,
      name,
      amount: parseFloat(amount),
      category,
      date: date.toISOString(),
      paidBy: paidByIds,
      splitBetween: formattedSplitBetween,
      splitAmounts: formattedSplitAmounts,
      notes: notes.trim() || undefined,
      attachments: fileAttachments.length > 0 ? fileAttachments : undefined,
    };
    
    try {
      if ('startDate' in trip && 'endDate' in trip) {
        const tripService = await import('@/services/tripService');
        await tripService.updateExpense(trip.id, updatedExpense);
      } else {
        const groupService = await import('@/services/groupService');
        await groupService.updateExpense(trip.id, updatedExpense);
      }

      toast({
        title: "Expense updated",
        description: "The expense has been successfully updated",
      });
      onExpenseUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating expense:", error);
      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDownload = async (fileUrl: string, filename: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update the details of your expense.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={category} 
                onValueChange={(val) => setCategory(val as ExpenseCategory)}
              >
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
          <div>
            <Label htmlFor="name">Description</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter description"
              required
            />
          </div>
          <div>
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
                  {date ? format(date, "PPP") : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date > new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Paid By</Label>
            <ScrollArea className="h-24 rounded-md border">
              <div className="p-2">
                {trip.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`paidBy-${participant.id}`}
                      checked={paidByIds.includes(participant.id)}
                      onCheckedChange={(checked) => handlePaidByChange(participant.id, checked === true)}
                    />
                    <Label htmlFor={`paidBy-${participant.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {participant.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div>
            <Label>Split Between</Label>
            <ScrollArea className="h-24 rounded-md border">
              <div className="p-2">
                {trip.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`splitBetween-${participant.id}`}
                      checked={splitBetween.includes(participant.id)}
                      onCheckedChange={(checked) => handleSplitBetweenChange(participant.id, checked === true)}
                    />
                    <Label htmlFor={`splitBetween-${participant.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {participant.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div>
            <Label>Split Method</Label>
            <Select value={splitMethod} onValueChange={handleSplitMethodChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select split method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">Equal</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {splitMethod === "custom" && (
            <div>
              <Label>Custom Split Amounts</Label>
              <ScrollArea className="h-48 rounded-md border">
                <div className="p-2 space-y-2">
                  {trip.participants.map((participant) => {
                    if (!splitBetween.includes(participant.id)) return null;
                    return (
                      <div key={participant.id} className="flex items-center justify-between space-x-2">
                        <Label htmlFor={`splitAmount-${participant.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {participant.name}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            id={`splitAmount-${participant.id}`}
                            value={splitAmounts[participant.id]?.toString() || ""}
                            onChange={(e) => handleInputChange(participant.id, e.target.value)}
                            className="w-24 text-right"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => distributeRemaining(participant.id, parseFloat(amount) - Object.values(splitAmounts).reduce((sum, amount) => sum + amount, 0))}
                          >
                            Distribute
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              type="text"
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes"
            />
          </div>
          <div>
            <Label>Attachments</Label>
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                id="attachment"
                multiple
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              <Label htmlFor="attachment" className="cursor-pointer rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
                Upload Files
              </Label>
              <CameraButton onCapture={handleImageCapture} />
            </div>
            {fileAttachments.length > 0 && (
              <ScrollArea className="h-32 rounded-md border mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-2">
                  {fileAttachments.map((attachment, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-2">
                        <div className="aspect-square w-full overflow-hidden rounded-md bg-muted flex items-center justify-center relative">
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 rounded-full opacity-70 hover:opacity-100"
                            onClick={() => handleFileRemove(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="truncate">{attachment.filename}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(attachment.fileUrl, attachment.filename)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Update Expense</Button>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
