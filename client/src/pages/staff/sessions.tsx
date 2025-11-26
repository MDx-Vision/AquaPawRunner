import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Upload, Loader2, Camera } from "lucide-react";
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
  breed: string;
}

export default function StaffSessions() {
  const { data: pets = [], isLoading: petsLoading } = useQuery<Pet[]>({
    queryKey: ["all-pets"],
    queryFn: async () => {
      const response = await fetch("/api/pets");
      if (!response.ok) throw new Error("Failed to fetch pets");
      return response.json();
    },
  });

  const { data: allSessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["all-sessions"],
    queryFn: async () => {
      // Fetch sessions for each pet
      const sessionPromises = pets.map(pet =>
        fetch(`/api/pets/${pet.id}/sessions`).then(r => r.json())
      );
      const sessionArrays = await Promise.all(sessionPromises);
      return sessionArrays.flat();
    },
    enabled: pets.length > 0,
  });

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet ? `${pet.name} (${pet.breed})` : "Unknown Pet";
  };

  if (petsLoading || sessionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sortedSessions = [...allSessions].sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/staff/scanner">
            <Button variant="ghost" size="sm" data-testid="button-back-scanner">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scanner
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Session Media Upload
          </h1>
          <p className="text-lg text-gray-600">
            Upload photos and videos from completed sessions
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {sortedSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No completed sessions found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{getPetName(session.petId)}</CardTitle>
                        <CardDescription>
                          {formatDate(new Date(session.completedAt), "MMMM d, yyyy 'at' h:mm a")}
                        </CardDescription>
                      </div>
                      <Link href={`/staff/sessions/${session.id}/upload`}>
                        <Button data-testid={`button-upload-${session.id}`}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Media
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  {session.notes && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Notes:</span> {session.notes}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
