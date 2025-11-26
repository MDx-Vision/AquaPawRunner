import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, Phone, Calendar, Thermometer, ShieldCheck, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <a className="flex items-center gap-2">
            <span className="font-display text-2xl font-black tracking-tighter text-primary md:text-3xl">
              Go<span className="text-secondary">PAWZ</span>
            </span>
          </a>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 font-medium text-sm">
          <Link href="/"><a className="text-foreground/80 hover:text-primary transition-colors">Home</a></Link>
          <Link href="#"><a className="text-foreground/80 hover:text-primary transition-colors">About Us</a></Link>
          <Link href="#"><a className="text-foreground/80 hover:text-primary transition-colors">Services</a></Link>
          <Link href="#"><a className="text-foreground/80 hover:text-primary transition-colors">Contact</a></Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            (555) 123-4567
          </Button>
          <Button className="bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
            Book Session
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-6 pt-10">
              <Link href="/"><a className="text-lg font-bold">Home</a></Link>
              <Link href="#"><a className="text-lg font-medium">About Us</a></Link>
              <Link href="#"><a className="text-lg font-medium">Services</a></Link>
              <Link href="#"><a className="text-lg font-medium">Contact</a></Link>
              <Button className="w-full bg-secondary text-white">Book Now</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
