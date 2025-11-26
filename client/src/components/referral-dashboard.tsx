import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Gift, Users, DollarSign, CheckCircle2, Clock, Trophy } from "lucide-react";
import { toast } from "sonner";
import type { Referral } from "@shared/schema";

interface ReferralDashboardProps {
  userId: string;
}

export function ReferralDashboard({ userId }: ReferralDashboardProps) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user-referral", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });

  const { data: referrals = [] } = useQuery<Referral[]>({
    queryKey: ["referrals", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/referrals`);
      if (!response.ok) throw new Error("Failed to fetch referrals");
      return response.json();
    },
  });

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${userId}/generate-referral-code`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to generate code");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-referral", userId] });
      queryClient.invalidateQueries({ queryKey: ["referrals", userId] });
      toast.success("Referral code generated!");
    },
    onError: () => {
      toast.error("Failed to generate referral code");
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const referralCode = user?.referralCode;
  const shareUrl = referralCode ? `${window.location.origin}?ref=${referralCode}` : "";

  const REWARD_AMOUNT = 10; // $10 per referral
  
  // Separate seed entry from actual referrals
  const actualReferrals = referrals.filter(r => r.referredUserId !== null);
  const completedReferrals = actualReferrals.filter(r => r.status === "completed" || r.status === "rewarded");
  const pendingReferrals = actualReferrals.filter(r => r.status === "pending");
  const totalRewards = referrals.filter(r => r.rewardGranted).length * REWARD_AMOUNT;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Gift className="h-6 w-6 text-primary" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share your code and earn rewards when friends book their first session!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!referralCode ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Generate your unique referral code to start earning rewards
              </p>
              <Button
                onClick={() => generateCodeMutation.mutate()}
                disabled={generateCodeMutation.isPending}
                data-testid="button-generate-code"
              >
                <Gift className="mr-2 h-4 w-4" />
                Generate My Code
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-primary/20">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Your Code</p>
                  <p className="text-3xl font-bold tracking-wider text-primary" data-testid="text-referral-code">
                    {referralCode}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(referralCode)}
                  data-testid="button-copy-code"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Share Link</p>
                  <p className="text-sm font-mono truncate" data-testid="text-share-url">
                    {shareUrl}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(shareUrl)}
                  data-testid="button-copy-url"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" data-testid="text-total-referrals">
              {completedReferrals.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Friends who've booked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" data-testid="text-pending-referrals">
              {pendingReferrals.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting first booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Total Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600" data-testid="text-total-rewards">
              ${totalRewards.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              In referral credits
            </p>
          </CardContent>
        </Card>
      </div>

      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-secondary" />
              Referral Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.map((referral, index) => {
                const isCodeEntry = !referral.referredUserId;
                return (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    data-testid={`referral-${index}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {isCodeEntry ? "Referral code active" : "Friend signed up"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {referral.rewardGranted && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ${REWARD_AMOUNT} credit
                        </Badge>
                      )}
                      <Badge
                        variant={
                          referral.status === "rewarded" ? "default" :
                          referral.status === "completed" ? "secondary" :
                          "outline"
                        }
                      >
                        {referral.status === "rewarded" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {isCodeEntry ? "active" : referral.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
