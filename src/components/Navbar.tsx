
import { Button } from "@/components/ui/button";
import { Download, LogOut, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Trip } from "@/types";
import { downloadTripReport } from "@/utils/expenseCalculator";
import { useToast } from "@/hooks/use-toast";

export function Navbar({ tripName, currentTrip }: { tripName?: string; currentTrip?: Trip }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDownloadReport = () => {
    if (currentTrip) {
      downloadTripReport(currentTrip);
      toast({
        title: "Success",
        description: "Trip report has been downloaded",
      });
    } else {
      toast({
        title: "Error",
        description: "Unable to generate report. Trip data not available.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-xl font-semibold">
          DiviTrip
        </Link>
        {tripName && <span className="text-xl">{tripName}</span>}
      </div>
      <div className="flex items-center space-x-2">
        {tripName && (
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              View All Trips
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Email Report
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Trip Report
            </Button>
          </>
        )}
        <div className="flex items-center space-x-2 ml-4">
          <span>shiva</span>
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
