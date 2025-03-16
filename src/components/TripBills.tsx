
import { useState } from "react";
import { Trip } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash, 
  File
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";

interface TripBillsProps {
  trip: Trip;
}

interface Bill {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export function TripBills({ trip }: TripBillsProps) {
  // This would come from an API in a real app
  const [bills, setBills] = useState<Bill[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      
      // Simulate upload delay
      setTimeout(() => {
        const newBills = Array.from(e.target.files || []).map((file) => ({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
        }));
        
        setBills([...bills, ...newBills]);
        setUploading(false);
        
        toast({
          title: "Bills uploaded",
          description: `${newBills.length} bill(s) uploaded successfully.`,
        });
      }, 1500);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleDeleteBill = (id: string) => {
    setBills(bills.filter(bill => bill.id !== id));
    toast({
      title: "Bill deleted",
      description: "The bill has been removed.",
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: "Report downloaded",
      description: "A complete trip expense report has been downloaded.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Trip Bills & Receipts</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Label htmlFor="upload-bills" className="mb-0">
              <Button variant="default" asChild>
                <div>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Bills
                </div>
              </Button>
            </Label>
            <Input 
              id="upload-bills" 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png" 
              multiple 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </div>
        </CardHeader>
        <CardContent>
          {uploading && (
            <div className="p-8 text-center">
              <div className="animate-pulse">Uploading bills...</div>
            </div>
          )}
          
          {bills.length === 0 && !uploading ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No bills uploaded yet.</p>
              <Label htmlFor="upload-empty-bill" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <div>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload your first bill
                  </div>
                </Button>
              </Label>
              <Input 
                id="upload-empty-bill" 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png" 
                multiple 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {bill.name}
                    </TableCell>
                    <TableCell>{bill.size}</TableCell>
                    <TableCell>{new Date(bill.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => window.open(bill.url, '_blank')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => window.open(bill.url, '_blank')}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteBill(bill.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
