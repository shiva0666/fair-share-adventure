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
import { Expense, Participant, Trip, Group, ExpenseAttachment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { FileIcon } from "lucide-react";
import { formatCurrency } from "@/utils/expenseCalculator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCamera } from "@/hooks/use-camera";

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
  const [category, setCategory] = useState(expense.category);
  const [description, setDescription] = useState(expense.description);
  const [date, setDate] = useState<Date | undefined>(expense.date ? new Date(expense.date) : undefined);
  const [paidByIds, setPaidByIds] = useState<string[]>(expense.paidBy);
  const [splitBetween, setSplitBetween] = useState<string[]>(expense.splitBetween);
  const [splitMethod, setSplitMethod] = useState<"equal" | "custom">(expense.splitMethod);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, number>>(expense.splitAmounts || {});
  const [notes, setNotes] = useState(expense.notes || "");
  const [fileAttachments, setFileAttachments] = useState<ExpenseAttachment[]>(
    expense.attachments || []
  );
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { hasCamera } = useCamera();

  useEffect(() => {
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDescription(expense.description);
    setDate(expense.date ? new Date(expense.date) : undefined);
    setPaidByIds(expense.paidBy);
    setSplitBetween(expense.splitBetween);
    setSplitMethod(expense.splitMethod);
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
            createdAt: timestamp,
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
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !description || !date || paidByIds.length === 0 || splitBetween.length === 0) {
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

    const updatedExpense: Omit<Expense, 'id'> & { id: string } = {
      id: expense.id,
      amount: parseFloat(amount),
      category,
      description,
      date: date.toISOString(),
      paidBy: paidByIds,
      splitBetween: formattedSplitBetween,
      splitMethod,
      splitAmounts: formattedSplitAmounts,
      notes: notes.trim() || undefined,
      attachments: fileAttachments.length > 0 ? fileAttachments : undefined,
    };
    
    try {
      if ('startDate' in trip && 'endDate' in trip) {
        const tripService = await import('@/services/tripService');
        if (typeof tripService.updateExpense === 'function') {
          await tripService.updateExpense(trip.id, expense.id, updatedExpense);
        } else {
          throw new Error('updateExpense function not found in tripService');
        }
      } else {
        const { updateExpense } = await import('@/services/groupService');
        await updateExpense(trip.id, expense.id, updatedExpense);
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

  const startCamera = async () => {
    if (cameraRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraRef.current.srcObject = stream;
        setShowCamera(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast({
          title: "Error",
          description: "Failed to access camera. Please check your permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const stopCamera = () => {
    if (cameraRef.current && cameraRef.current.srcObject) {
      const stream = cameraRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      cameraRef.current.srcObject = null;
      setShowCamera(false);
    }
  };

  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [showCamera]);

  const handleCapture = (imageDataURL: string) => {
    const timestamp = new Date().toISOString();
    const newAttachment: ExpenseAttachment = {
      id: `camera-${timestamp}`,
      filename: `Photo ${new Date().toLocaleString()}`,
      fileUrl: imageDataURL,
      fileType: 'image/jpeg',
      fileSize: 0, // We don't know exact size for captured images
      thumbnailUrl: imageDataURL,
      createdAt: timestamp,
      uploadedAt: timestamp
    };
    
    setFileAttachments(prev => [...prev, newAttachment]);
    setShowCamera(false);
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
              <Input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter category"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                    <Input
                      type="checkbox"
                      id={`paidBy-${participant.id}`}
                      checked={paidByIds.includes(participant.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPaidByIds([...paidByIds, participant.id]);
                        } else {
                          setPaidByIds(paidByIds.filter((id) => id !== participant.id));
                        }
                      }}
                      className="h-4 w-4"
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
                    <Input
                      type="checkbox"
                      id={`splitBetween-${participant.id}`}
                      checked={splitBetween.includes(participant.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSplitBetween([...splitBetween, participant.id]);
                        } else {
                          setSplitBetween(splitBetween.filter((id) => id !== participant.id));
                        }
                      }}
                      className="h-4 w-4"
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
                            size="xs"
                            onClick={() => distributeRemaining(participant.id, parseFloat(amount) - Object.values(splitAmounts).reduce((sum, amount) => sum + amount, 0))}
                          >
                            Distribute Remaining
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
              />
              <Label htmlFor="attachment" className="cursor-pointer rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80">
                Upload Files
              </Label>
              {hasCamera ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCamera(true)}>
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm" disabled>
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Camera Not Available</AlertDialogTitle>
                      <AlertDialogDescription>
                        It seems like your device does not have a camera or camera access is restricted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            {fileAttachments.length > 0 && (
              <ScrollArea className="h-32 rounded-md border">
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
      {showCamera && (
        <Dialog open={showCamera} onOpenChange={setShowCamera}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Take a Photo</DialogTitle>
              <DialogDescription>
                Capture an image to attach to your expense.
              </DialogDescription>
            </DialogHeader>
            <div className="relative aspect-video w-full overflow-hidden rounded-md">
              <video ref={cameraRef} className="absolute inset-0 w-full h-full object-cover" autoPlay muted playsInline />
              <canvas ref={canvasRef} className="hidden" width="640" height="480" />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowCamera(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (cameraRef.current && canvasRef.current) {
                    const video = cameraRef.current;
                    const canvas = canvasRef.current;
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const context = canvas.getContext('2d');
                    context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    const imageDataURL = canvas.toDataURL('image/jpeg');
                    handleCapture(imageDataURL);
                  }
                }}
              >
                Capture
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

import { X, Download } from "lucide-react";
