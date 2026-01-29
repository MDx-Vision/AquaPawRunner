import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Thermometer, ShieldCheck, Clock, Dog, Trophy, Heart, Phone, Check, Star, MapPin, Camera, Zap, Users } from "lucide-react";
import heroBg from "@assets/generated_images/3d_paw_print_background.png";
import dogSilhouette from "@assets/generated_images/dog_running_on_slatmill_silhouette.png";
import logo from "@assets/gopawz_logo_horizontal.png";
import { Link } from "wouter";

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
              <Link href="/portal/book">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold text-lg h-14 px-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-full" data-testid="button-book-run">
                  Book a Run
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5 font-bold text-lg h-14 px-8 rounded-full" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} data-testid="button-learn-more">
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

      {/* Services & Pricing Section */}
      <section id="services" className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-display text-4xl font-bold text-foreground">Our Services</h2>
            <p className="text-lg text-muted-foreground">
              Choose the perfect plan for your pup's fitness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Standard Session",
                subtitle: "Slatmill Run",
                price: "$45",
                duration: "30 min",
                features: [
                  "Structured exercise & endurance training",
                  "Weight management support",
                  "Climate controlled mobile gym",
                  "Photo updates included",
                  "Supervised & tailored to fitness level"
                ],
                popular: true
              },
              {
                name: "Pro Session",
                subtitle: "Fly Chase Course",
                price: "$35",
                duration: "30 min",
                features: [
                  "Lure-chase system up to 36 mph",
                  "Course lengths up to 750 ft",
                  "Mental stimulation & excitement",
                  "Perfect for high-energy dogs",
                  "Outdoor speed training"
                ],
                popular: false
              }
            ].map((plan, i) => (
              <Card key={i} className={`relative ${plan.popular ? 'border-primary border-2 shadow-2xl scale-105' : 'border-none shadow-lg'} hover:shadow-xl transition-all`} data-testid={`card-plan-${plan.name.toLowerCase().replace(' ', '-')}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl font-display">{plan.name}</CardTitle>
                  {plan.subtitle && <p className="text-sm text-muted-foreground mt-1">{plan.subtitle}</p>}
                  <div className="mt-4">
                    <span className="text-5xl font-black text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">/ session</span>
                  </div>
                  <CardDescription className="text-lg mt-2">{plan.duration} session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/portal/book" className="block">
                    <Button className={`w-full mt-6 ${plan.popular ? 'bg-secondary hover:bg-secondary/90' : ''}`} size="lg" data-testid={`button-choose-${plan.name.toLowerCase().replace(' ', '-')}`}>
                      Choose {plan.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 space-y-4">
            <p className="text-muted-foreground">
              <strong>5-Session Package:</strong> $200 (10% savings) • <strong>Multi-Dog Discount:</strong> 15% off additional dogs
            </p>
            <p className="text-muted-foreground">
              <strong>First-Time Customers:</strong> 15% off your first session!
            </p>
            <Link href="/portal">
              <Button variant="outline" size="lg" data-testid="button-view-packages">
                View Package Deals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-display text-4xl font-bold text-foreground">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Getting started is easy! Here's what to expect.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: Phone,
                title: "Book Online",
                desc: "Choose your service and preferred time slot through our easy booking system."
              },
              {
                step: "2",
                icon: MapPin,
                title: "We Come to You",
                desc: "Our mobile gym arrives at your location - home, office, or park."
              },
              {
                step: "3",
                icon: Zap,
                title: "Let's Run!",
                desc: "Your pup enjoys a safe, controlled workout on our climate-controlled slatmill."
              },
              {
                step: "4",
                icon: Camera,
                title: "Track Progress",
                desc: "Get photos, videos, and detailed reports of every session in your portal."
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                      <step.icon className="w-10 h-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-display text-4xl font-bold text-foreground">What Pet Parents Say</h2>
            <p className="text-lg text-muted-foreground">
              Don't just take our word for it - hear from our happy customers!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Valerie",
                pet: "Owner of Dancer (Goldendoodle)",
                rating: 5,
                text: "Dancer is already aware of which day of the week GoPAWZ is coming for his slatmill run. He starts to get overly excited, running from one window to the next, jumping, and whining. As soon as the door opens he darts to the van!"
              },
              {
                name: "Sarah M.",
                pet: "Owner of Max (Golden Retriever)",
                rating: 5,
                text: "GoPAWZ has been a game-changer! Max used to be so hyper at home, but now after his runs, he's calm and happy. The convenience of them coming to us is unbeatable!"
              },
              {
                name: "David L.",
                pet: "Owner of Bella (Pitbull Mix)",
                rating: 5,
                text: "I love the QR check-in system and getting photo updates during the session. It's so professional and I always know exactly when they arrive. Bella absolutely loves her workout days!"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="border-none shadow-lg" data-testid={`card-testimonial-${i}`}>
                <CardContent className="p-8 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="pt-4 border-t">
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.pet}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="font-display text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "What should my dog bring to a session?",
                a: "We keep inputs minimal. Your dog should arrive with an attitude for speed and energy to spend. We provide the safe outlet, and fresh water is always provided on board. Treats are optional and used strategically for motivation when appropriate, and only with owner's consent."
              },
              {
                q: "What if my dog doesn't like the slatmill?",
                a: "GoPAWZ sessions are non-forced and dog-led. Our non-motorized slatmills allow your dog to control pace and engagement. If your dog opts out, we pivot immediately to alternative conditioning like our Fly Chase Course, confidence-building, or enrichment work. Participation is never mandatory—positive experience is the KPI."
              },
              {
                q: "Is my dog too old or young for this?",
                a: "Sessions are customized by age, size, and physical condition. Puppies (6+ months) focus on short, confidence-based exposure. Senior dogs receive controlled, low-impact movement designed to support mobility and joint health. The pups always dictate the pace—the non-motorized slatmill never forces dogs to run."
              },
              {
                q: "What vaccinations does my dog need?",
                a: "We require current Rabies, DHPP/DAPP, Bordetella (Kennel Cough), Canine Influenza, and Leptospirosis vaccinations. You can upload and track vaccination records right in your portal!"
              },
              {
                q: "What happens if it rains?",
                a: "GoPAWZ door-to-door service operates rain, snow, or shine. The mobile gym is fully climate-controlled and weather-protected. Sessions proceed safely in most conditions. In severe weather that compromises safety, we proactively reschedule."
              },
              {
                q: "Can I stay and watch the session?",
                a: "During the initial intake assessment, owners are welcome to observe the beginning process. You may watch for the first few minutes as your pet warms up. From a legal and operational standpoint, we cannot allow anyone not insured in the van during sessions. We record sessions so you won't miss a thing!"
              },
              {
                q: "What areas do you serve?",
                a: "We serve Orange County, NY including Middletown, Bloomingburg, Wurtsboro, Otisville, Scotchtown, and Pine Bush. Our mobile unit makes it easy to reach you wherever you are!"
              }
            ].map((faq, i) => (
              <Card key={i} className="border-none shadow-md" data-testid={`card-faq-${i}`}>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3 text-foreground">{faq.q}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
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
          <Link href="/portal/book">
            <Button size="lg" className="bg-secondary text-white hover:bg-white hover:text-secondary font-black text-lg h-16 px-10 rounded-full shadow-2xl transition-all transform hover:scale-105" data-testid="button-schedule-session">
              Schedule Your First Session
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 border-t border-white/10">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2 space-y-4">
              <img src={logo} alt="GoPAWZ" className="h-12 w-auto" />
              <p className="text-white/60 max-w-sm">
                Orange County's premier mobile dog gym. We're dedicated to keeping your furry friends happy, healthy, and fit.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-lg">Quick Links</h4>
              <ul className="space-y-2 text-white/60">
                <li><Link href="/"><span className="hover:text-primary transition-colors cursor-pointer">Home</span></Link></li>
                <li><span className="hover:text-primary transition-colors cursor-pointer" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>Services</span></li>
                <li><Link href="/portal"><span className="hover:text-primary transition-colors cursor-pointer">Client Portal</span></Link></li>
                <li><Link href="/portal/book"><span className="hover:text-primary transition-colors cursor-pointer">Book Now</span></Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg">Contact</h4>
              <ul className="space-y-2 text-white/60">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-secondary" /> (845) 873-1034
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-secondary" /> Orange County, NY
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
