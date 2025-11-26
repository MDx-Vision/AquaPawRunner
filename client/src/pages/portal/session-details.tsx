import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { PortalLayout } from "./layout";
import { SessionMediaGallery } from "@/components/session-media-gallery";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { formatDate } from "date-fns";

interface Session {
  id: string;
  bookingId: string;
  petId: string;
  distance?: string;
  duration?: number;
  notes?: string;
  completedAt: string;
}

interface Pet {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  date: string;
}

export default function SessionDetails() {
  const [, params] = useRoute("/portal/sessions/:sessionId");
  const sessionId = params?.sessionId;

  const { data: session, isLoading: sessionLoading } = useQuery<Session>({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch session");
      return response.json();
    },
    enabled: !!sessionId,
  });

  const { data: pet } = useQuery<Pet>({
    queryKey: ["pet", session?.petId],
    queryFn: async () => {
      const response = await fetch(`/api/pets/${session!.petId}`);
      if (!response.ok) throw new Error("Failed to fetch pet");
      return response.json();
    },
    enabled: !!session?.petId,
  });

  const { data: booking } = useQuery<Booking>({
    queryKey: ["booking", session?.bookingId],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${session!.bookingId}`);
      if (!response.ok) throw new Error("Failed to fetch booking");
      return response.json();
    },
    enabled: !!session?.bookingId,
  });

  if (sessionLoading || !session || !pet || !booking) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  const sessionDate = formatDate(new Date(booking.date), "MMMM d, yyyy");

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/portal">
            <Button variant="ghost" size="sm" data-testid="button-back-dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{pet.name}'s Session</h1>
          <p className="text-muted-foreground">{sessionDate}</p>
        </div>

        {session.notes && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Session Notes</h3>
            <p className="text-muted-foreground">{session.notes}</p>
          </div>
        )}

        <SessionMediaGallery
          sessionId={session.id}
          petName={pet.name}
          sessionDate={sessionDate}
        />
      </div>
    </PortalLayout>
  );
}
