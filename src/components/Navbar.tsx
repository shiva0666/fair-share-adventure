
import { Button } from "@/components/ui/button";
import { Download, LogOut, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar({ tripName }: { tripName?: string }) {
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
            <Button variant="outline" size="sm">
              View All Trips
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Email Report
            </Button>
            <Button variant="ghost" size="sm">
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
