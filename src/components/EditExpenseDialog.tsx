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
import { Expense, ExpenseCategory, Participant, Trip, ExpenseAttachment } from "@/types";
import { Edit, Users, Split, DollarSign, Trash2, Paperclip, Camera, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateExpense, deleteExpenseAttachment } from "@/services/tripService";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { v4 as uuidv4 } from 'uuid';

interface EditExpenseDialogProps {
  trip: Trip;
  expense: Expense;
  onExpenseUpdated?: () => void;
}

const expenseCategories: ExpenseCategory[] = [
  "food",
  "accommodation",
  "transportation",
  "activities",
  "shopping",
  "other",
];

export function EditExpenseDialog({ trip, expense, onExpenseUpdated }: EditExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [expenseName, setExpenseName] = useState(expense.name);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState<ExpenseCategory>(expense.category as ExpenseCategory);
  const [date, setDate] = useState(expense.date);
  const [paidBy, setPaidBy] = useState<string[]>(
    Array.isArray(expense.paidBy) ? expense.paidBy : [expense.paidBy]
  );
  const [payerAmounts, setPayerAmounts] = useState<Record<string, string>>(
    trip.participants.reduce((acc, p) => {
      const amount = expense.payerAmounts?.[p.id] || 
        (Array.isArray(expense.paidBy) && expense.paidBy.includes(p.id) 
          ? expense.amount / expense.paidBy.length 
          : (expense.paidBy === p.id ? expense.amount : 0));
      return { ...acc, [p.id]: amount ? amount.toString() : "" };
    }, {})
  );
  const [splitBetween, setSplitBetween] = useState<string[]>(expense.splitBetween);
  const [useCustomSplit, setUseCustomSplit] = useState(!!expense.splitAmounts);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>(
    trip.participants.reduce((acc, p) => {
      const amount = expense.splitAmounts?.[p.id] || 
        (expense.splitBetween.includes(p.id) ? expense.amount / expense.splitBetween.length : 0);
      return { ...acc, [p.id]: amount ? amount.toString() : "" };
    }, {})
  );
  const [autoDistributeRemaining, setAutoDistributeRemaining] = useState(true);
  const [notes, setNotes] = useState(expense.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<ExpenseAttachment[]>(expense.attachments || []);
  const [showCamera, setShowCamera] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [streamRef, setStreamRef] = useState<MediaStream | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      if (streamRef) {
        streamRef.getTracks().forEach(track => track.stop());
      }
    };
  }, [streamRef]);

  useEffect(() => {
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
  }, [amount, paidBy]);

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
      
      if (amount) {
        const amountPerPayer = (parseFloat(amount) / newPaidBy.length).toFixed(2);
        const updatedPayerAmounts = { ...payerAmounts };
        
        newPaidBy.forEach(id => {
          updatedPayerAmounts[id] = amountPerPayer;
        });
        
        setPayerAmounts(updatedPayerAmounts);
      }
    } else {
      if (paidBy.length > 1) {
        const newPaidBy = paidBy.filter((id) => id !== participantId);
        setPaidBy(newPaidBy);
        
        const updatedPayerAmounts = { ...payerAmounts };
        updatedPayerAmounts[participantId] = "";
        
        if (amount && newPaidBy.length > 0) {
          const amountPerPayer = (parseFloat(amount) / newPaidBy.length).toFixed(2);
          newPaidBy.forEach(id => {
            updatedPayerAmounts[id] = amountPerPayer;
          });
        }
        
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setFiles(prev => [...prev, ...fileList]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      await deleteExpenseAttachment(trip.id, expense.id, attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      toast({
        title: "Attachment removed",
        description: "The attachment has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error removing attachment",
        description: "Failed to remove the attachment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStreamRef(stream);
      setShowCamera(true);
      
      if (videoRef) {
        videoRef.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef) {
      streamRef.getTracks().forEach(track => track.stop());
      setStreamRef(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.drawImage(videoRef, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
          setFiles(prev => [...prev, file]);
          stopCamera();
        }
      }, "image/jpeg");
    }
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
      
      let updatedAttachments = [...attachments];
      if (files.length > 0) {
        const currentTime = new Date().toISOString();
        const newAttachments = files.map(file => ({
          id: uuidv4(),
          filename: file.name,
          fileUrl: URL.createObjectURL(file),
          fileType: file.type,
          thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
          createdAt: currentTime,
          uploadedAt: currentTime
        }));
        
        updatedAttachments = [...attachments, ...newAttachments];
      }
      
      await updateExpense(trip.id, {
        ...expense,
        name: expenseName,
        amount: amountValue,
        category,
        date,
        paidBy: paidBy.length === 1 ? paidBy[0] : paidBy,
        payerAmounts: paidBy.length > 1 ? formattedPayerAmounts : undefined,
        splitBetween,
        splitAmounts: formattedSplitAmounts,
        notes: notes.trim() || undefined,
        attachments: updatedAttachments.length > 0 ? updatedAttachments : undefined,
      });
      
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
      
      if (onExpenseUpdated) {
        onExpenseUpdated();
      }
      
      toast({
        title: "Success",
        description: "Expense updated successfully!",
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        stopCamera();
      }
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
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
              <Label>Attachments</Label>
              <div className="flex flex-wrap gap-2 mt-1 mb-2">
                {attachments.map((attachment) => (
                  <div 
                    key={attachment.id} 
                    className="relative group border rounded-md p-2 w-24 h-24 flex flex-col items-center justify-center text-center"
                  >
                    {attachment.fileType.startsWith('image/') && attachment.thumbnailUrl ? (
                      <img 
                        src={attachment.thumbnailUrl} 
                        alt={attachment.filename}
                        className="max-h-16 max-w-full object-contain" 
                      />
                    ) : (
                      <div className="text-3xl">📄</div>
                    )}
                    <p className="text-xs truncate w-full mt-1">{attachment.filename}</p>
                    
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {files.map((file, index) => (
                  <div 
                    key={index}
                    className="relative group border rounded-md p-2 w-24 h-24 flex flex-col items-center justify-center text-center"
                  >
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={file.name}
                        className="max-h-16 max-w-full object-contain" 
                      />
                    ) : (
                      <div className="text-3xl">📄</div>
                    )}
                    <p className="text-xs truncate w-full mt-1">{file.name}</p>
                    
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {showCamera && (
                <div className="relative border rounded-md p-2 mb-4">
                  <video 
                    ref={(ref) => setVideoRef(ref)}
                    autoPlay 
                    playsInline
                    className="w-full h-[200px] object-cover rounded"
                  ></video>
                  <div className="flex justify-center gap-2 mt-2">
                    <Button type="button" size="sm" onClick={capturePhoto}>Capture</Button>
                    <Button type="button" size="sm" variant="outline" onClick={stopCamera}>Cancel</Button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                  Attach Files
                </Button>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={startCamera}
                >
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Paid By</Label>
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
            onClick={() => {
              stopCamera();
              setOpen(false);
            }}
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
