import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scan, CheckCircle2, XCircle, AlertCircle, Keyboard } from "lucide-react";

interface ScanResult {
  success: boolean;
  booking?: any;
  pet?: any;
  message?: string;
  error?: string;
  checkedInAt?: string;
}

export function QRScanner() {
  const [manualToken, setManualToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scannerUserId, setScannerUserId] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processCheckIn = async (token: string) => {
    if (!token.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const res = await fetch("/api/check-in/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          scannerUserId: scannerUserId || "staff",
          scannerLocation: "mobile-gym"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({
          success: false,
          error: data.error || "Check-in failed"
        });
      } else {
        setResult(data);
        setManualToken("");
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: "Network error. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCheckIn(manualToken);
  };

  useEffect(() => {
    // Auto-focus the input for quick scanning
    inputRef.current?.focus();
  }, [result]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card data-testid="qr-scanner-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scan className="h-6 w-6 text-primary" />
            <CardTitle>QR Check-In Scanner</CardTitle>
          </div>
          <CardDescription>
            Scan or enter QR codes to check in customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="scanner-id">Staff ID (Optional)</Label>
            <Input
              id="scanner-id"
              placeholder="Enter your staff ID"
              value={scannerUserId}
              onChange={(e) => setScannerUserId(e.target.value)}
              data-testid="input-staff-id"
            />
          </div>

          <div className="border-t pt-6">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-token">
                  <div className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4" />
                    Enter QR Code Token
                  </div>
                </Label>
                <Input
                  ref={inputRef}
                  id="qr-token"
                  placeholder="Paste or type QR code token"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  disabled={loading}
                  data-testid="input-qr-token"
                  className="font-mono"
                />
              </div>

              <Button 
                type="submit" 
                disabled={!manualToken.trim() || loading}
                className="w-full"
                size="lg"
                data-testid="button-checkin"
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Scan className="mr-2 h-4 w-4" />
                    Check In
                  </>
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"} data-testid="scan-result">
          <CardContent className="pt-6">
            {result.success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-600 p-2">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900" data-testid="text-success-message">
                      {result.message}
                    </h3>
                    <p className="text-sm text-green-700">
                      Check-in completed successfully
                    </p>
                  </div>
                </div>

                {result.pet && (
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Pet Name:</span>
                        <span className="ml-2 font-semibold" data-testid="text-pet-name">{result.pet.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Breed:</span>
                        <span className="ml-2 font-semibold">{result.pet.breed}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Age:</span>
                        <span className="ml-2 font-semibold">{result.pet.age}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Service:</span>
                        <span className="ml-2 font-semibold">{result.booking?.serviceType}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-red-600 p-2">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Check-In Failed</h3>
                  <p className="text-sm text-red-700 mt-1" data-testid="text-error-message">
                    {result.error}
                  </p>
                  {result.checkedInAt && (
                    <p className="text-xs text-red-600 mt-2">
                      Previously checked in at {new Date(result.checkedInAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Quick Tip:</strong> Keep this scanner open and ready. When customers arrive, 
          they can show their QR code and you can quickly scan or enter the token to check them in.
        </AlertDescription>
      </Alert>
    </div>
  );
}
