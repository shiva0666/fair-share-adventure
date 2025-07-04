
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Lightbulb,
  Heart,
  Megaphone
} from "lucide-react";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { getAllTrips } from "@/services/tripService";
import { getAllGroups } from "@/services/groupService";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fetch trips and groups data for the sidebar
  const { data: trips } = useQuery({
    queryKey: ["trips"],
    queryFn: getAllTrips,
  });
  
  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: getAllGroups,
  });

  const activeTripsCount = trips?.filter(trip => trip.status === "active").length || 0;
  const activeGroupsCount = groups?.filter(group => group.status === "active").length || 0;

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Define sidebar menu items - added Recommendations, Support Us, and Advertising
  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      name: `Your Recent Trips ${activeTripsCount > 0 ? `(${activeTripsCount})` : ''}`,
      icon: <Map className="h-5 w-5" />,
      path: "/trips",
    },
    {
      name: `Your Recent Groups ${activeGroupsCount > 0 ? `(${activeGroupsCount})` : ''}`,
      icon: <Users className="h-5 w-5" />,
      path: "/groups",
    },
    {
      name: "Profile",
      icon: <UserCircle className="h-5 w-5" />,
      path: "/profile",
    },
    {
      name: "Recommendations",
      icon: <Lightbulb className="h-5 w-5" />,
      path: "/recommendations",
    },
    {
      name: "Support Us",
      icon: <Heart className="h-5 w-5" />,
      path: "/support-us",
    },
    {
      name: "Advertising",
      icon: <Megaphone className="h-5 w-5" />,
      path: "/advertising",
    },
    {
      name: "Help",
      icon: <HelpCircle className="h-5 w-5" />,
      path: "/help",
    },
  ];

  // Mobile sidebar - slide in from left
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-50 md:hidden"
          onClick={toggleSidebar}
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <div
          className={cn(
            "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            className
          )}
        >
          <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
            <h2 className="text-xl font-semibold text-sidebar-foreground">Splittos</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-sidebar-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-1 p-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
                onClick={() => isMobile && setSidebarOpen(false)}
                aria-label={item.name}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </aside>
      </>
    );
  }

  // Desktop sidebar - collapsible
  return (
    <aside
      className={cn(
        "sticky top-0 h-screen border-r border-sidebar-border transition-all duration-300 ease-in-out bg-sidebar",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <h2 className="text-xl font-semibold text-sidebar-foreground">Splittos</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "text-sidebar-foreground",
            collapsed ? "mx-auto" : ""
          )}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <div className="space-y-1 p-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center" : "gap-3",
              isActive(item.path)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
            title={collapsed ? item.name : undefined}
            aria-label={item.name}
          >
            {item.icon}
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </div>
    </aside>
  );
}
