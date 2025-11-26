import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import PortalDashboard from "@/pages/portal/dashboard";
import BookingPage from "@/pages/portal/booking";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/portal" component={PortalDashboard} />
      <Route path="/portal/book" component={BookingPage} />
      <Route path="/portal/:any*" component={PortalDashboard} /> {/* Catch-all for other portal routes for now */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
