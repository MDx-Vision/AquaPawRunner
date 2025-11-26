import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SessionMediaUploadProps {
  sessionId: string;
  onUploadComplete?: () => void;
}

export function SessionMediaUpload({ sessionId, onUploadComplete }: SessionMediaUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        return isImage || isVideo;
      });

      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("files", file);
      });
      formData.append("caption", caption);

      const response = await fetch(`/api/sessions/${sessionId}/upload-media`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      toast.success(`${result.media.length} file(s) uploaded successfully`);
      setUploadSuccess(true);
      
      setFiles([]);
      setCaption("");
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      toast.error("Failed to upload media");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Session Media
        </CardTitle>
        <CardDescription>
          Share photos and videos with the customer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="media-files">Photos & Videos</Label>
          <Input
            id="media-files"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={uploading}
            data-testid="input-media-files"
          />
          <p className="text-sm text-muted-foreground">
            Select multiple photos or videos (max 100MB each)
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files ({files.length})</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="relative group border rounded-lg p-2 hover:bg-accent/50 transition-colors"
                  data-testid={`file-preview-${index}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      data-testid={`button-remove-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="caption">Caption (Optional)</Label>
          <Textarea
            id="caption"
            placeholder="Add a note about this session..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={uploading}
            data-testid="input-caption"
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="w-full"
          data-testid="button-upload"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : uploadSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Uploaded Successfully
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {files.length} {files.length === 1 ? "File" : "Files"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
