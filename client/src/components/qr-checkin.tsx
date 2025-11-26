import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { formatDistanceToNow, formatDate } from "date-fns";

interface QRCheckInProps {
  bookingId: string;
  bookingDate: Date;
}

interface QRTokenData {
  token: string;
  qrCodeImage: string;
  issuedAt: string;
  expiresAt: string;
}

interface QRStatus {
  canIssueToken: boolean;
  hasActiveToken: boolean;
  tokenExpiresAt: string | null;
  tokenIssuedAt: string | null;
  bookingStatus: string;
  checkedInAt: string | null;
}

export function QRCheckIn({ bookingId, bookingDate }: QRCheckInProps) {
  const [qrData, setQrData] = useState<QRTokenData | null>(null);
  const [status, setStatus] = useState<QRStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [showRegenerateOption, setShowRegenerateOption] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/qr-status`);
      if (!res.ok) throw new Error("Failed to fetch QR status");
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      console.error("Error fetching QR status:", err);
    }
  };

  const generateQRCode = async (forceRegenerate = false) => {
    setLoading(true);
    setError(null);
    setShowRegenerateOption(false);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/qr-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRegenerate }),
      });
      
      const data = await res.json();
      
      if (res.status === 409 && data.canForceRegenerate) {
        // Active token exists, show regenerate option
        setError(data.message);
        setShowRegenerateOption(true);
      } else if (!res.ok) {
        throw new Error(data.error || "Failed to generate QR code");
      } else {
        setQrData(data);
        await fetchStatus();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [bookingId]);

  useEffect(() => {
    if (!qrData?.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expires = new Date(qrData.expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Expired");
        setQrData(null);
        fetchStatus();
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData?.expiresAt]);

  if (status?.bookingStatus === "checked_in") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-900">Checked In</CardTitle>
          </div>
          <CardDescription>
            Successfully checked in {status.checkedInAt && formatDistanceToNow(new Date(status.checkedInAt), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!status?.canIssueToken) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-gray-400" />
            <CardTitle>QR Check-In</CardTitle>
          </div>
          <CardDescription>
            QR codes are available 24 hours before your booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your booking is on {formatDate(bookingDate, "MMM d, yyyy 'at' h:mm a")}. 
              Check back closer to your appointment time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (qrData) {
    const isExpiringSoon = qrData.expiresAt && 
      (new Date(qrData.expiresAt).getTime() - Date.now()) < 5 * 60 * 1000; // 5 minutes

    return (
      <Card data-testid="qr-checkin-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="h-6 w-6 text-primary" />
              <CardTitle>Your QR Code</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateQRCode(true)}
              disabled={loading}
              data-testid="button-refresh-qr"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <CardDescription>
            Show this QR code to staff when you arrive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border-2 border-dashed">
            <img 
              src={qrData.qrCodeImage} 
              alt="QR Code" 
              className="w-64 h-64"
              data-testid="img-qr-code"
            />
          </div>
          
          <div className={`text-center p-3 rounded-lg ${
            isExpiringSoon ? "bg-amber-50 border border-amber-200" : "bg-gray-50"
          }`}>
            <div className="text-sm text-gray-600 mb-1">
              {timeRemaining === "Expired" ? "Code Expired" : "Expires in"}
            </div>
            <div className={`text-2xl font-bold ${
              isExpiringSoon ? "text-amber-600" : "text-gray-900"
            }`} data-testid="text-qr-timer">
              {timeRemaining}
            </div>
          </div>

          {isExpiringSoon && timeRemaining !== "Expired" && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Your QR code is expiring soon. Refresh to generate a new one if needed.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="qr-generate-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <QrCode className="h-6 w-6 text-primary" />
          <CardTitle>QR Check-In</CardTitle>
        </div>
        <CardDescription>
          Generate a QR code for touchless check-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your booking is on {formatDate(bookingDate, "MMM d, yyyy 'at' h:mm a")}.
            Generate your QR code when you're ready to arrive.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={() => generateQRCode(false)} 
          disabled={loading}
          className="w-full"
          size="lg"
          data-testid="button-generate-qr"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </>
          )}
        </Button>

        {error && (
          <Alert variant={showRegenerateOption ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showRegenerateOption && (
          <Button 
            onClick={() => generateQRCode(true)} 
            disabled={loading}
            variant="destructive"
            className="w-full"
            data-testid="button-force-regenerate"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate QR Code
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
