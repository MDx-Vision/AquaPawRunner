import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import type { SessionMedia } from "@shared/schema";

interface SessionMediaGalleryProps {
  sessionId: string;
  petName: string;
  sessionDate: string;
}

export function SessionMediaGallery({ sessionId, petName, sessionDate }: SessionMediaGalleryProps) {
  const { data: media, isLoading } = useQuery<SessionMedia[]>({
    queryKey: ["session-media", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}/media`);
      if (!response.ok) {
        throw new Error("Failed to fetch media");
      }
      return response.json();
    },
  });

  const handleDownload = (mediaUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `${petName}-session-${index + 1}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!media || media.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Media</CardTitle>
          <CardDescription>
            Photos and videos from {petName}'s session on {sessionDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No photos or videos available for this session yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const photos = media.filter(m => m.mediaType === "photo");
  const videos = media.filter(m => m.mediaType === "video");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Session Media</CardTitle>
              <CardDescription>
                {petName}'s session on {sessionDate}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {photos.length > 0 && (
                <Badge variant="secondary" data-testid="badge-photo-count">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {photos.length} {photos.length === 1 ? "Photo" : "Photos"}
                </Badge>
              )}
              {videos.length > 0 && (
                <Badge variant="secondary" data-testid="badge-video-count">
                  <Video className="h-3 w-3 mr-1" />
                  {videos.length} {videos.length === 1 ? "Video" : "Videos"}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                  data-testid={`photo-${index}`}
                >
                  <img
                    src={photo.mediaUrl}
                    alt={photo.caption || `Photo ${index + 1}`}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(photo.mediaUrl, index)}
                      data-testid={`button-download-photo-${index}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-2 text-sm">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5" />
              Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
                  data-testid={`video-${index}`}
                >
                  <video
                    src={video.mediaUrl}
                    controls
                    className="object-cover w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(video.mediaUrl, index)}
                      data-testid={`button-download-video-${index}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  {video.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/75 text-white p-2 text-sm">
                      {video.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
