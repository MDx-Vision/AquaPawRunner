import { PortalLayout } from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, MapPin, Activity, Trophy } from "lucide-react";
import { Link } from "wouter";
import dogAvatar from "@assets/generated_images/golden_retriever_avatar.png";
import { useQuery } from "@tanstack/react-query";
import { getPetsByUser, getUpcomingBookings, getSessionsByUser, getPackagesByUser } from "@/lib/api";
import { format } from "date-fns";
import { QRCheckIn } from "@/components/qr-checkin";
import { BookingActions } from "@/components/booking-actions";
import { useAuth } from "@/contexts/AuthContext";

export default function PortalDashboard() {
  const { user } = useAuth();

  const { data: pets = [] } = useQuery({
    queryKey: ["pets", user?.id],
    queryFn: () => getPetsByUser(user!.id),
    enabled: !!user,
  });

  const { data: upcomingBookings = [] } = useQuery({
    queryKey: ["bookings", "upcoming", user?.id],
    queryFn: () => getUpcomingBookings(user!.id),
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions", user?.id],
    queryFn: () => getSessionsByUser(user!.id),
    enabled: !!user,
  });

  const { data: packages = [] } = useQuery({
    queryKey: ["packages", user?.id],
    queryFn: () => getPackagesByUser(user!.id),
    enabled: !!user,
  });

  const primaryPet = pets[0];
  const nextBooking = upcomingBookings[0];
  const activePackage = packages[0];
  const recentSessions = sessions.slice(0, 3);

  if (!user) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Ready for another run?</p>
          </div>
          <Link href="/portal/book">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg transition-all hover:-translate-y-0.5" data-testid="button-book-new">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Book New Session
            </Button>
          </Link>
        </div>

        {/* Pets Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {primaryPet && (
            <Card className="md:col-span-2 border-none shadow-md bg-white overflow-hidden relative group" data-testid="card-pet-primary">
              <div className="absolute top-0 right-0 p-4">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Active Member
                </span>
              </div>
              <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-primary/20 overflow-hidden shadow-inner">
                     <img src={dogAvatar} alt={primaryPet.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full border-4 border-white">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div>
                    <h2 className="text-2xl font-bold" data-testid="text-pet-name">{primaryPet.name}</h2>
                    <p className="text-muted-foreground">{primaryPet.breed} • {primaryPet.age} Years Old</p>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">
                      <Activity className="w-4 h-4 text-secondary" />
                      <span>Last Run: {sessions[0] ? format(new Date(sessions[0].completedAt), 'MMM d') : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Total: {sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60} hrs</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto mt-4 sm:mt-0" data-testid="button-view-profile">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          )}

          {nextBooking && (
            <Card className="border-none shadow-md bg-gradient-to-br from-primary to-primary/80 text-white" data-testid="card-next-booking">
              <CardHeader>
                <CardTitle className="text-lg font-medium opacity-90">Next Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-xl" data-testid="text-booking-day">
                      {format(new Date(nextBooking.date), 'EEEE')}
                    </p>
                    <p className="opacity-80" data-testid="text-booking-date">
                      {format(new Date(nextBooking.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-90">
                  <Clock className="w-4 h-4" />
                  <span data-testid="text-booking-time">{nextBooking.timeSlot}</span>
                </div>
                <div className="flex items-center gap-3 opacity-90">
                  <MapPin className="w-4 h-4" />
                  <span data-testid="text-booking-location">{nextBooking.location}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <BookingActions 
                    bookingId={nextBooking.id}
                    currentDate={new Date(nextBooking.date)}
                    currentTimeSlot={nextBooking.timeSlot}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* QR Check-In Section */}
        {nextBooking && (
          <div className="max-w-md mx-auto">
            <QRCheckIn bookingId={nextBooking.id} bookingDate={new Date(nextBooking.date)} />
          </div>
        )}

        {/* Stats & History */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary" data-testid="button-view-all-activity">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <Link key={session.id} href={`/portal/sessions/${session.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50" data-testid={`card-session-${session.id}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                          {session.duration || 0}
                        </div>
                        <div>
                          <p className="font-medium">Standard Run</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(session.completedAt), 'EEE, MMM d')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{session.distance || 'N/A'}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Completed</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Package Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {activePackage && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3" data-testid="card-package">
                  <div className="flex justify-between items-center">
                    <span className="font-medium" data-testid="text-package-name">{activePackage.name}</span>
                    <span className="text-sm text-muted-foreground">
                      Exp: {activePackage.expiresAt ? format(new Date(activePackage.expiresAt), 'MMM d') : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-secondary h-full rounded-full transition-all" 
                      style={{ width: `${(activePackage.usedSessions / activePackage.totalSessions) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary font-bold" data-testid="text-sessions-used">{activePackage.usedSessions} Used</span>
                    <span className="text-muted-foreground" data-testid="text-sessions-remaining">{activePackage.totalSessions - activePackage.usedSessions} Remaining</span>
                  </div>
                </div>
              )}
              
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                 <div>
                   <p className="font-bold text-primary">Refer a Friend</p>
                   <p className="text-sm text-muted-foreground">Get a free session!</p>
                 </div>
                 <Button size="sm" variant="outline" className="border-primary text-primary" data-testid="button-share-link">Share Link</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
