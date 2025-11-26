import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar, Dog, Settings, LogOut, Menu, X, Syringe, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
    { name: "Book Session", href: "/portal/book", icon: Calendar },
    { name: "Vaccinations", href: "/portal/vaccinations", icon: Syringe },
    { name: "Referrals", href: "/portal/referrals", icon: Gift },
    { name: "My Pets", href: "/portal/pets", icon: Dog },
    { name: "Settings", href: "/portal/settings", icon: Settings },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-black tracking-tighter text-primary">
            Go<span className="text-secondary">PAWZ</span>
          </span>
        </Link>
      </div>
      <div className="flex-1 py-6 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={() => setIsMobileOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t">
        <button
          onClick={() => window.location.href = "/"}
          className="w-full flex items-center justify-start gap-3 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r bg-background z-20">
        <NavContent />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background z-20 flex items-center px-4 justify-between">
        <Link href="/">
          <span className="font-display text-xl font-black text-primary">
            Go<span className="text-secondary">PAWZ</span>
          </span>
        </Link>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 pt-16 md:pt-0">
        <main className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
