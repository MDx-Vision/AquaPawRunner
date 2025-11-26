import { PortalLayout } from "./layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { CheckCircle2, Clock, Dog, CreditCard, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const services = [
  { id: "express", name: "Express Run", duration: "20 min", price: "$45", desc: "Perfect for a quick energy burn." },
  { id: "standard", name: "Standard Session", duration: "30 min", price: "$60", desc: "Our most popular choice for active dogs." },
  { id: "pro", name: "Pro Athlete", duration: "45 min", price: "$80", desc: "Endurance training for high-energy breeds." },
];

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:30 PM"
];

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = useState("standard");
  const [selectedTime, setSelectedTime] = useState("");
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handleBooking = () => {
    toast({
      title: "Booking Confirmed!",
      description: "We've sent a confirmation email to sarah@example.com",
    });
    setTimeout(() => setLocation("/portal"), 2000);
  };

  return (
    <PortalLayout>
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Book a Session</h1>
          <p className="text-muted-foreground">Customize your dog's workout experience</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                step >= i ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`}>
                {i}
              </div>
              {i < 3 && (
                <div className={`w-16 h-1 mx-2 rounded-full ${
                  step > i ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6 md:p-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Dog className="w-5 h-5 text-secondary" /> Select Service
                  </h2>
                  <RadioGroup value={selectedService} onValueChange={setSelectedService} className="grid md:grid-cols-1 gap-4">
                    {services.map((service) => (
                      <div key={service.id}>
                        <RadioGroupItem value={service.id} id={service.id} className="peer sr-only" />
                        <Label
                          htmlFor={service.id}
                          className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-lg">{service.name}</p>
                            <p className="text-sm text-muted-foreground font-normal">{service.desc}</p>
                          </div>
                          <div className="text-right mt-2 md:mt-0">
                            <p className="font-bold text-xl text-primary">{service.price}</p>
                            <p className="text-sm text-muted-foreground font-normal">{service.duration}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="flex justify-end pt-4">
                  <Button size="lg" onClick={() => setStep(2)} className="w-full md:w-auto">
                    Next Step <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary" /> Select Date & Time
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-3 border rounded-xl bg-white">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Available Slots for {date?.toLocaleDateString()}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={`w-full ${selectedTime === time ? "bg-secondary hover:bg-secondary/90 text-white border-secondary" : ""}`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                    {selectedTime && (
                      <div className="pt-4 p-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" />
                        Slot Available
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                  <Button size="lg" onClick={() => setStep(3)} disabled={!date || !selectedTime}>
                    Next Step <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in text-center py-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <CreditCard className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Confirm & Pay</h2>
                  <p className="text-muted-foreground">Please review your booking details</p>
                </div>

                <div className="bg-muted/30 rounded-xl p-6 max-w-sm mx-auto text-left space-y-4 border">
                  <div className="flex justify-between border-b pb-4">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{services.find(s => s.id === selectedService)?.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-4">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{date?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-4">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{services.find(s => s.id === selectedService)?.price}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-6 max-w-md mx-auto w-full">
                  <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                  <Button size="lg" onClick={handleBooking} className="bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg px-8">
                    Confirm Booking
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
