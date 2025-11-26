import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { SessionMediaUpload } from "@/components/session-media-upload";
import { SessionMediaGallery } from "@/components/session-media-gallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { formatDate } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

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

export default function UploadMedia() {
  const [, params] = useRoute("/staff/sessions/:sessionId/upload");
  const sessionId = params?.sessionId;
  const queryClient = useQueryClient();

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

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["session-media", sessionId] });
  };

  if (sessionLoading || !session || !pet || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sessionDate = formatDate(new Date(booking.date), "MMMM d, yyyy");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/staff/scanner">
            <Button variant="ghost" size="sm" data-testid="button-back-scanner">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scanner
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Upload Session Media
          </h1>
          <p className="text-lg text-gray-600">
            Share photos and videos with {pet.name}'s owner
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>
                {pet.name}'s session on {sessionDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session.notes && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{session.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <SessionMediaUpload
            sessionId={session.id}
            onUploadComplete={handleUploadComplete}
          />

          <SessionMediaGallery
            sessionId={session.id}
            petName={pet.name}
            sessionDate={sessionDate}
          />
        </div>
      </div>
    </div>
  );
}
