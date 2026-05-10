import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Privacy from "./pages/Privacy";
import QuickScore from "./pages/QuickScore";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import HealthScore from "./pages/HealthScore";
import TaxOptimizer from "./pages/TaxOptimizer";
import FirePlanner from "./pages/FirePlanner";
import LifeEventAdvisor from "./pages/LifeEventAdvisor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <UserProfileProvider>
            <Toaster />
            <Sonner />
            <AppLayout>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
                <Route path="/quick-score" element={<ProtectedRoute><QuickScore /></ProtectedRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/score" element={<ProtectedRoute><HealthScore /></ProtectedRoute>} />
                <Route path="/tax" element={<ProtectedRoute><TaxOptimizer /></ProtectedRoute>} />
                <Route path="/fire" element={<ProtectedRoute><FirePlanner /></ProtectedRoute>} />
                <Route path="/life-event" element={<ProtectedRoute><LifeEventAdvisor /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </UserProfileProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
