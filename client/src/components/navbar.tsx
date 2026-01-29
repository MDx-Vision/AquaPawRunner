import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@assets/gopawz_logo_horizontal.png";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <a className="flex items-center gap-2">
            <img src={logo} alt="GoPAWZ" className="h-10 md:h-12 w-auto" />
          </a>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 font-medium text-sm">
          <Link href="/"><a className="text-foreground/80 hover:text-primary transition-colors">Home</a></Link>
          <Link href="/about"><a className="text-foreground/80 hover:text-primary transition-colors">About Us</a></Link>
          <Link href="/services"><a className="text-foreground/80 hover:text-primary transition-colors">Services</a></Link>
          <Link href="/portal"><a className="text-foreground/80 hover:text-primary transition-colors">Client Portal</a></Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            (845) 873-1034
          </Button>
          <Link href="/portal">
            <Button className="bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
              Book Session
            </Button>
          </Link>
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
              <Link href="/about"><a className="text-lg font-medium">About Us</a></Link>
              <Link href="/services"><a className="text-lg font-medium">Services</a></Link>
              <Link href="/portal"><a className="text-lg font-medium">Client Portal</a></Link>
              <Link href="/portal">
                <Button className="w-full bg-secondary text-white">Book Now</Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
