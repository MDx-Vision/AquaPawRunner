import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import vanImage from "@assets/generated_images/modern_mobile_dog_gym_van_exterior.png";
import happyDog from "@assets/generated_images/happy_dog_post_workout.png";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero */}
      <section className="relative py-24 bg-muted/20">
        <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="font-display text-4xl md:text-6xl font-black text-foreground leading-tight">
              Driven by <span className="text-primary">Passion</span>,<br />
              Powered by <span className="text-secondary">Paws</span>.
            </h1>
            <p className="text-xl text-muted-foreground">
              GoPAWZ was born from a simple belief: every dog deserves the chance to run free, safe, and happy—no matter where they live.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-secondary/20 rounded-full blur-3xl" />
            <img 
              src={vanImage} 
              alt="GoPAWZ Mobile Unit" 
              className="relative rounded-2xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center space-y-8">
          <h2 className="font-display text-3xl font-bold">Our Story</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            It started with a high-energy Husky named Luna and a rainy week in Orange County. We realized that even the most dedicated dog owners struggle to provide the intense physical exercise some breeds require, especially when weather, work, or physical limitations get in the way.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We built GoPAWZ to bridge that gap. By combining state-of-the-art non-motorized slatmills with a climate-controlled mobile environment, we've created a gym that comes to you. It's not just about burning energy; it's about enriching lives.
          </p>
        </div>
      </section>

      {/* Team/Mission Split */}
      <section className="py-20 bg-foreground text-white overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
               <img 
                src={happyDog}
                alt="Happy Dog" 
                className="rounded-2xl shadow-2xl border-4 border-white/10"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="font-display text-3xl md:text-4xl font-bold">Our Promise to You</h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xl font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Safety First</h3>
                    <p className="text-white/70">We never force a dog to run. Our positive reinforcement techniques ensure your pup loves every minute.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center text-secondary text-xl font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Convenience</h3>
                    <p className="text-white/70">We respect your time. Our mobile app makes booking, tracking, and managing appointments effortless.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xl font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Community</h3>
                    <p className="text-white/70">We're not just a service; we're part of the pack. We support local shelters and adoption events.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-12 border-t">
         <div className="container text-center space-y-4">
            <h3 className="font-display text-2xl font-bold">Join the Pack</h3>
            <p className="text-muted-foreground">Follow us on social media for daily doses of happy dogs.</p>
            <div className="flex justify-center gap-4 pt-4">
               <Button variant="ghost">Instagram</Button>
               <Button variant="ghost">Facebook</Button>
               <Button variant="ghost">TikTok</Button>
            </div>
         </div>
      </footer>
    </div>
  );
}
