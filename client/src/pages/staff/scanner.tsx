import { QRScanner } from "@/components/qr-scanner";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Upload } from "lucide-react";

export default function StaffScanner() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <Link href="/staff/sessions">
            <Button variant="default" data-testid="button-upload-media">
              <Upload className="h-4 w-4 mr-2" />
              Upload Session Media
            </Button>
          </Link>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Staff Check-In Scanner
          </h1>
          <p className="text-lg text-gray-600">
            Scan customer QR codes for quick and touchless check-in
          </p>
        </div>

        <QRScanner />
      </div>
    </div>
  );
}
