import { Box, Stack, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import PlanCatalogSections from "@/components/PlanCatalogSections";
import { type PlanCardData } from "@/components/PlanGrid";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { axiosServer } from "@/lib/axiosServer";

export const dynamic = "force-dynamic";

async function getPlans(): Promise<PlanCardData[]> {
  try {
    const { data } = await axiosServer().get<{ plans: PlanCardData[] }>("/api/plans");
    return data.plans ?? [];
  } catch {
    return [];
  }
}

export default async function PlansPage() {
  const currentUser = getCurrentUserFromCookies();

  if (!currentUser) {
    redirect("/login?next=/plans");
  }

  if (currentUser.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (currentUser.role === "isp_team") {
    redirect("/isp/dashboard");
  }

  const plans = await getPlans();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={600}>
          Plans &amp; upgrade
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
          Two residential catalogue lines, three tiers each. Select a tier to continue to checkout — changes apply on
          your next billing cycle after provisioning.
        </Typography>
      </Box>
      <PlanCatalogSections plans={plans} actionLabel="Continue to checkout" />
    </Stack>
  );
}
