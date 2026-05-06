import { Box, Container, Stack, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import PlanGrid, { type PlanCardData } from "@/components/PlanGrid";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Plan from "@/lib/models/Plan";

export const dynamic = "force-dynamic";

async function getPlans(): Promise<PlanCardData[]> {
  await connectToDatabase();

  const plans = await Plan.find({ isActive: true }).sort({ monthlyPrice: 1 }).lean();

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    monthlyPrice: plan.monthlyPrice,
    downloadSpeedMbps: plan.downloadSpeedMbps,
    features: plan.features
  }));
}

export default async function PlansPage() {
  const currentUser = getCurrentUserFromCookies();

  if (!currentUser) {
    redirect("/login?next=/plans");
  }

  if (currentUser.role === "admin") {
    redirect("/admin");
  }

  const plans = await getPlans();

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 76px)", py: 6 }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4">Choose your installation package</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Select the plan you want. The next screen will show your selected package
              beside the mock checkout form.
            </Typography>
          </Box>
          <PlanGrid plans={plans} actionLabel="Select This Plan" />
        </Stack>
      </Container>
    </Box>
  );
}
