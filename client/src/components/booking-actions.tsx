import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, XCircle, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface BookingActionsProps {
  bookingId: string;
  currentDate: Date;
  currentTimeSlot: string;
  onSuccess?: () => void;
}

export function BookingActions({ bookingId, currentDate, currentTimeSlot, onSuccess }: BookingActionsProps) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleReschedule = async () => {
    if (!newDate || !newTimeSlot) {
      setResult({ success: false, message: "Please select both date and time" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDate, newTimeSlot }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error || "Failed to reschedule" });
      } else {
        setResult({ success: true, message: data.message });
        setTimeout(() => {
          setRescheduleOpen(false);
          onSuccess?.();
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error || "Failed to cancel booking" });
      } else {
        setResult({ success: true, message: data.message });
        setTimeout(() => {
          onSuccess?.();
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
  ];

  return (
    <div className="flex gap-2">
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-reschedule-dialog">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reschedule
          </Button>
        </DialogTrigger>
        <DialogContent data-testid="dialog-reschedule">
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
            <DialogDescription>
              Current booking: {format(currentDate, "MMM d, yyyy")} at {currentTimeSlot}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Rescheduling must be done at least 12 hours in advance.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="new-date">New Date</Label>
              <Input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                data-testid="input-new-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-time">New Time Slot</Label>
              <select
                id="new-time"
                className="w-full px-3 py-2 border rounded-md"
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                data-testid="select-new-time"
              >
                <option value="">Select a time</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRescheduleOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReschedule}
                disabled={loading || !newDate || !newTimeSlot}
                data-testid="button-confirm-reschedule"
              >
                {loading ? "Rescheduling..." : "Confirm Reschedule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" data-testid="button-cancel-dialog">
            <XCircle className="h-4 w-4 mr-2" />
            Cancel Booking
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent data-testid="dialog-cancel">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to cancel this booking?</p>
              <p className="font-medium">
                {format(currentDate, "EEEE, MMMM d, yyyy")} at {currentTimeSlot}
              </p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Cancellations must be made at least 24 hours in advance for a full refund.
                  Refunds are processed within 5-10 business days.
                </AlertDescription>
              </Alert>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-cancel"
            >
              {loading ? "Cancelling..." : "Yes, Cancel Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
