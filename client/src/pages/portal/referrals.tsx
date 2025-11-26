import { useQuery } from "@tanstack/react-query";
import { PortalLayout } from "./layout";
import { ReferralDashboard } from "@/components/referral-dashboard";
import { Loader2 } from "lucide-react";
import { getUserByEmail } from "@/lib/api";

const DEMO_USER_EMAIL = "sarah@example.com";

export default function ReferralsPage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", DEMO_USER_EMAIL],
    queryFn: () => getUserByEmail(DEMO_USER_EMAIL),
  });

  if (isLoading || !user) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Refer Friends, Earn Rewards</h1>
          <p className="text-muted-foreground mt-2">
            Invite friends to GoPAWZ and earn $10 credit for each friend who books their first session!
          </p>
        </div>

        <ReferralDashboard userId={user.id} />
      </div>
    </PortalLayout>
  );
}
