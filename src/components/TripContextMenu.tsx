
import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { Trip } from "@/types";
import { Eye, Download, Share, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTripDetailUrl } from "@/lib/utils";
import { generateTripPDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface TripContextMenuProps {
  trip: Trip;
  children: React.ReactNode;
}

export function TripContextMenu({ trip, children }: TripContextMenuProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewTrip = () => {
    navigate(getTripDetailUrl(trip.id));
  };

  const handleDownloadReport = async () => {
    try {
      await generateTripPDF(trip);
      toast({
        title: "Report downloaded",
        description: "The trip report has been downloaded as a PDF.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={handleViewTrip}>
          <Eye className="mr-2 h-4 w-4" />
          <span>View Trip</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDownloadReport}>
          <Download className="mr-2 h-4 w-4" />
          <span>Download Report</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <FileText className="mr-2 h-4 w-4" />
          <span>View Expenses</span>
        </ContextMenuItem>
        <ContextMenuItem>
          <Share className="mr-2 h-4 w-4" />
          <span>Share Trip</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
