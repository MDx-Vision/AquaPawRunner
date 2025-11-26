import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Thermometer, ShieldCheck, Clock, Dog, Trophy, Heart, Phone } from "lucide-react";
import heroBg from "@assets/generated_images/3d_paw_print_background.png";
import dogSilhouette from "@assets/generated_images/dog_running_on_slatmill_silhouette.png";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center pt-12 pb-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Background Pattern" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-in slide-in-from-left duration-700">
            <div className="inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-bold text-secondary mb-2 border border-secondary/20">
              Orange County's 1st & Only
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[0.9]">
              Go<span className="text-primary">PAWZ</span>
              <span className="block text-3xl md:text-5xl text-muted-foreground font-bold mt-2">
                Mobile Dog Gym
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg font-medium">
              We bring the workout to you! Experience the ultimate fitness solution for your canine companion in our state-of-the-art mobile unit.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold text-lg h-14 px-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-full">
                Book a Run
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5 font-bold text-lg h-14 px-8 rounded-full">
                Learn More
              </Button>
            </div>

            <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-primary" />
                Climate Controlled
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Safe & Secure
              </div>
            </div>
          </div>

          <div className="relative animate-in slide-in-from-right duration-700 delay-200 flex justify-center">
             {/* Dog Silhouette Image */}
             <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                <img 
                  src={dogSilhouette} 
                  alt="Dynamic Dog on Slatmill" 
                  className="relative w-full max-w-[600px] drop-shadow-2xl filter contrast-110"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-display text-4xl font-bold text-foreground">Why GoPAWZ?</h2>
            <p className="text-lg text-muted-foreground">
              Our mobile slatmill sessions provide the perfect outlet for your dog's energy, regardless of the weather or your busy schedule.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Thermometer,
                title: "Climate Controlled",
                desc: "No more worrying about hot pavement or rainy days. Our van is always the perfect temperature."
              },
              {
                icon: Trophy,
                title: "Builds Muscle & Stamina",
                desc: "Non-motorized slatmills allow dogs to run at their own pace, building true functional strength."
              },
              {
                icon: Heart,
                title: "Mental Wellbeing",
                desc: "Physical exercise releases endorphins, reducing anxiety and destructive behaviors at home."
              }
            ].map((feature, i) => (
              <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-muted/30">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2 text-primary">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-grid-lg" />
        <div className="container px-4 md:px-6 relative z-10 text-center space-y-8">
          <h2 className="font-display text-4xl md:text-5xl font-black">Ready to Unleash the Energy?</h2>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto opacity-90 font-medium">
            Your dog deserves the best run of their life. We come to you!
          </p>
          <Button size="lg" className="bg-secondary text-white hover:bg-white hover:text-secondary font-black text-lg h-16 px-10 rounded-full shadow-2xl transition-all transform hover:scale-105">
            Schedule Your First Session
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 border-t border-white/10">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2 space-y-4">
              <span className="font-display text-3xl font-black tracking-tighter text-primary">
                Go<span className="text-secondary">PAWZ</span>
              </span>
              <p className="text-white/60 max-w-sm">
                Orange County's premier mobile dog gym. We're dedicated to keeping your furry friends happy, healthy, and fit.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-lg">Quick Links</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Book Now</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg">Contact</h4>
              <ul className="space-y-2 text-white/60">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-secondary" /> (555) 123-4567
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-secondary" /> Orange County, CA
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} GoPAWZ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
