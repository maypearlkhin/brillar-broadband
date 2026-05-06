import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography
} from "@mui/material";
import { redirect } from "next/navigation";
import AdminSubscriptionsTable, {
  type AdminSubscriptionRow
} from "@/components/AdminSubscriptionsTable";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Subscription from "@/lib/models/Subscription";

export const dynamic = "force-dynamic";

type PopulatedUser = {
  email: string;
  serviceZone: {
    country: string;
    district: string;
    postalCode: string;
  };
};

type PopulatedPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  downloadSpeedMbps: number;
};

export default async function AdminPage() {
  const currentUser = getCurrentUserFromCookies();

  if (!currentUser) {
    redirect("/login?next=/admin");
  }

  if (currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  await connectToDatabase();

  const subscriptions = await Subscription.find()
    .sort({ createdAt: -1 })
    .populate("userId")
    .populate("planId")
    .lean();

  const rows: AdminSubscriptionRow[] = subscriptions.map((subscription) => {
    const user = subscription.userId as unknown as PopulatedUser;
    const plan = subscription.planId as unknown as PopulatedPlan;

    return {
      id: subscription._id.toString(),
      customerEmail: user.email,
      serviceZone: `${user.serviceZone.country} (${user.serviceZone.district}) - ${user.serviceZone.postalCode}`,
      planName: plan.name,
      monthlyPrice: plan.monthlyPrice,
      downloadSpeedMbps: plan.downloadSpeedMbps,
      status: subscription.status,
      createdAt: subscription.createdAt.toISOString()
    };
  });

  const pendingCount = rows.filter((row) => row.status === "Pending Admin Approval").length;
  const approvedCount = rows.filter((row) => row.status === "Installation Approved").length;
  const rejectedCount = rows.filter((row) => row.status === "Rejected").length;
  const sortedRows = [...rows].sort((a, b) => {
    if (a.status === "Pending Admin Approval" && b.status !== "Pending Admin Approval") {
      return -1;
    }

    if (a.status !== "Pending Admin Approval" && b.status === "Pending Admin Approval") {
      return 1;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 6 }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4">Admin Dashboard</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Approve pending customer purchases or reject requests that cannot be installed.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {[
              ["Pending Approval", pendingCount, "warning.main"],
              ["Approved Installations", approvedCount, "success.main"],
              ["Rejected Requests", rejectedCount, "error.main"]
            ].map(([label, count, color]) => (
              <Grid item xs={12} md={4} key={label}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary">{label}</Typography>
                    <Typography variant="h4" sx={{ color, mt: 1 }}>
                      {count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card variant="outlined">
            <CardContent>
              <AdminSubscriptionsTable subscriptions={sortedRows} />
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
