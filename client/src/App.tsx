import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Services from "@/pages/services";
import PortalDashboard from "@/pages/portal/dashboard";
import BookingPage from "@/pages/portal/booking";
import Vaccinations from "@/pages/portal/vaccinations";
import ReferralsPage from "@/pages/portal/referrals";
import SessionDetails from "@/pages/portal/session-details";
import StaffScanner from "@/pages/staff/scanner";
import UploadMedia from "@/pages/staff/upload-media";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/portal" component={PortalDashboard} />
      <Route path="/portal/book" component={BookingPage} />
      <Route path="/portal/vaccinations" component={Vaccinations} />
      <Route path="/portal/referrals" component={ReferralsPage} />
      <Route path="/portal/sessions/:sessionId" component={SessionDetails} />
      <Route path="/staff/scanner" component={StaffScanner} />
      <Route path="/staff/sessions/:sessionId/upload" component={UploadMedia} />
      <Route path="/portal/:any*" component={PortalDashboard} />
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
