import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Zap, Shield, Heart } from "lucide-react";
import { Link } from "wouter";
import heroBg from "@assets/generated_images/3d_paw_print_background.png"; // Reusing background for consistency

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden bg-primary/5">
        <div className="container px-4 md:px-6 relative z-10 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-black text-foreground mb-6">
            Fitness Packages
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
             Whether your dog is a couch potato needing a jumpstart or an elite athlete, we have a program tailored to their needs.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Express */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold">Express Run</h3>
                  <div className="mt-2 flex items-baseline text-foreground">
                    <span className="text-4xl font-black tracking-tight">$45</span>
                    <span className="ml-1 text-muted-foreground">/session</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">Great for a quick energy burn or introduction to the slatmill.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['20 Minute Session', 'Warm-up & Cool-down', 'Treats & Water', 'Performance Report'].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/portal/book">
                  <Button className="w-full font-bold" variant="outline">Book Express</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Standard */}
            <Card className="border-2 border-secondary relative transform md:-translate-y-4 shadow-xl bg-white">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                Most Popular
              </div>
              <CardContent className="p-8 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold text-primary">Standard Session</h3>
                  <div className="mt-2 flex items-baseline text-foreground">
                    <span className="text-4xl font-black tracking-tight">$60</span>
                    <span className="ml-1 text-muted-foreground">/session</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">The perfect balance of endurance and cardio for active dogs.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['30 Minute Session', 'Custom Pace Setting', 'Interval Training', 'Post-Run Massage', 'Photo & Video Updates'].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/portal/book">
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-12">Book Standard</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="border-2 border-border hover:border-primary/50 transition-all">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold">Pro Athlete</h3>
                  <div className="mt-2 flex items-baseline text-foreground">
                    <span className="text-4xl font-black tracking-tight">$80</span>
                    <span className="ml-1 text-muted-foreground">/session</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">Intense conditioning for high-energy working breeds.</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['45 Minute Session', 'Incline Training', 'Resistance Work', 'Muscle Building Focus', 'Detailed Health Metrics'].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/portal/book">
                  <Button className="w-full font-bold" variant="outline">Book Pro</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-3xl md:text-4xl font-bold">The GoPAWZ Method</h2>
              <p className="text-lg text-muted-foreground">
                Our non-motorized slatmills allow your dog to be the engine. They decide the speed, which builds confidence and prevents injury. Combined with our climate-controlled environment, it's the safest way to exercise.
              </p>
              <div className="grid gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Energy Management</h4>
                    <p className="text-muted-foreground">A tired dog is a good dog. Regular sessions reduce anxiety and destructive behavior.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Joint Safety</h4>
                    <p className="text-muted-foreground">Slatmills offer impact absorption superior to pavement, protecting growing or aging joints.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl bg-white">
               {/* Placeholder for future video/image of dog running */}
               <div className="absolute inset-0 flex items-center justify-center bg-primary/5 text-primary/20">
                 <Heart className="w-32 h-32" />
               </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-foreground text-white py-12 mt-auto">
        <div className="container text-center">
          <h2 className="font-display text-2xl font-bold mb-6">Ready to get started?</h2>
          <Link href="/portal/book">
            <Button size="lg" className="bg-secondary text-white hover:bg-white hover:text-secondary font-bold rounded-full px-8">
              Book Your First Run
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
