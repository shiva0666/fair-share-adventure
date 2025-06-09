
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TripDetail from "./pages/TripDetail";
import GroupDetail from "./pages/GroupDetail";
import Auth from "./pages/Auth";
import LandingPage from "./pages/LandingPage";
import Settings from "./pages/Settings";
import ProfileSettings from "./pages/ProfileSettings";
import TripsPage from "./pages/TripsPage";
import GroupsPage from "./pages/GroupsPage";
import Recommendations from "./pages/Recommendations";
import SupportUs from "./pages/SupportUs";
import Advertising from "./pages/Advertising";
import Help from "./pages/Help";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <TooltipProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Auth />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/trips" 
                  element={
                    <ProtectedRoute>
                      <TripsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/groups" 
                  element={
                    <ProtectedRoute>
                      <GroupsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/trips/:id" 
                  element={
                    <ProtectedRoute>
                      <TripDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/groups/:id" 
                  element={
                    <ProtectedRoute>
                      <GroupDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/recommendations" 
                  element={
                    <ProtectedRoute>
                      <Recommendations />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/support-us" 
                  element={
                    <ProtectedRoute>
                      <SupportUs />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/advertising" 
                  element={
                    <ProtectedRoute>
                      <Advertising />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/help" 
                  element={
                    <ProtectedRoute>
                      <Help />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfileSettings />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
