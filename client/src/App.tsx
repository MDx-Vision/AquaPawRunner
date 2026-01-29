import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Services from "@/pages/services";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import PortalDashboard from "@/pages/portal/dashboard";
import BookingPage from "@/pages/portal/booking";
import Vaccinations from "@/pages/portal/vaccinations";
import ReferralsPage from "@/pages/portal/referrals";
import SessionDetails from "@/pages/portal/session-details";
import StaffScanner from "@/pages/staff/scanner";
import StaffSessions from "@/pages/staff/sessions";
import UploadMedia from "@/pages/staff/upload-media";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      {/* Protected portal routes */}
      <Route path="/portal">
        <ProtectedRoute>
          <PortalDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/book">
        <ProtectedRoute>
          <BookingPage />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/vaccinations">
        <ProtectedRoute>
          <Vaccinations />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/referrals">
        <ProtectedRoute>
          <ReferralsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/portal/sessions/:sessionId">
        <ProtectedRoute>
          <SessionDetails />
        </ProtectedRoute>
      </Route>

      {/* Staff routes (unprotected for now - can add staff auth later) */}
      <Route path="/staff/scanner" component={StaffScanner} />
      <Route path="/staff/sessions" component={StaffSessions} />
      <Route path="/staff/sessions/:sessionId/upload" component={UploadMedia} />

      {/* Catch-all for portal routes */}
      <Route path="/portal/:any*">
        <ProtectedRoute>
          <PortalDashboard />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
