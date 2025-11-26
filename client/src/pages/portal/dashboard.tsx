import { PortalLayout } from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, MapPin, ChevronRight, Activity, Trophy } from "lucide-react";
import { Link } from "wouter";
import dogAvatar from "@assets/generated_images/golden_retriever_avatar.png";

export default function PortalDashboard() {
  return (
    <PortalLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, Sarah!</h1>
            <p className="text-muted-foreground">Ready for another run?</p>
          </div>
          <Link href="/portal/book">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg transition-all hover:-translate-y-0.5">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Book New Session
            </Button>
          </Link>
        </div>

        {/* Pets Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none shadow-md bg-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Active Member
              </span>
            </div>
            <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 overflow-hidden shadow-inner">
                   <img src={dogAvatar} alt="Buddy" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full border-4 border-white">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h2 className="text-2xl font-bold">Buddy</h2>
                  <p className="text-muted-foreground">Golden Retriever • 3 Years Old</p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">
                    <Activity className="w-4 h-4 text-secondary" />
                    <span>Last Run: 2 days ago</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Total: 12.5 hrs</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto mt-4 sm:mt-0">
                View Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-primary to-primary/80 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-medium opacity-90">Next Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-xl">Tomorrow</p>
                  <p className="opacity-80">Nov 28, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-90">
                <Clock className="w-4 h-4" />
                <span>10:00 AM - 10:30 AM</span>
              </div>
              <div className="flex items-center gap-3 opacity-90">
                <MapPin className="w-4 h-4" />
                <span>Home (Driveway)</span>
              </div>
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold mt-2">
                Reschedule
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats & History */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                        30
                      </div>
                      <div>
                        <p className="font-medium">Standard Run</p>
                        <p className="text-sm text-muted-foreground">Tue, Nov {26 - i}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">2.5 mi</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Package Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">10-Session Pack</span>
                  <span className="text-sm text-muted-foreground">Exp: Dec 31</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div className="bg-secondary h-full rounded-full w-[60%]" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary font-bold">6 Used</span>
                  <span className="text-muted-foreground">4 Remaining</span>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                 <div>
                   <p className="font-bold text-primary">Refer a Friend</p>
                   <p className="text-sm text-muted-foreground">Get a free session!</p>
                 </div>
                 <Button size="sm" variant="outline" className="border-primary text-primary">Share Link</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
