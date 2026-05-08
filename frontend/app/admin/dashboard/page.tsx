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
import { isAxiosError } from "axios";
import AdminSubscriptionsTable, {
  type AdminSubscriptionRow
} from "@/components/AdminSubscriptionsTable";
import { axiosServer } from "@/lib/axiosServer";

export const dynamic = "force-dynamic";

type ApiSubscription = {
  _id: string;
  status: string;
  billingTerm?: string;
  amount?: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  userId: {
    email: string;
    name?: string;
    serviceZone: {
      country: string;
      district: string;
      postalCode: string;
    };
  };
  planId: {
    id: string;
    name: string;
    monthlyPrice: number;
    downloadSpeedMbps: number;
  };
};

export default async function AdminDashboardPage() {
  let data: { subscriptions: ApiSubscription[] };

  try {
    const response = await axiosServer().get<{ subscriptions: ApiSubscription[] }>(
      "/api/admin/subscriptions"
    );
    data = response.data;
  } catch (err) {
    if (isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        redirect("/dashboard");
      }
    }
    redirect("/login?next=/admin/dashboard");
  }

  const rows: AdminSubscriptionRow[] = data.subscriptions.map((subscription) => ({
    id: subscription._id,
    customerName: subscription.userId.name ?? "",
    customerEmail: subscription.userId.email,
    serviceZone: `${subscription.userId.serviceZone.country} (${subscription.userId.serviceZone.district}) - ${subscription.userId.serviceZone.postalCode}`,
    planName: subscription.planId.name,
    monthlyPrice: subscription.planId.monthlyPrice,
    downloadSpeedMbps: subscription.planId.downloadSpeedMbps,
    status: subscription.status,
    billingTerm: subscription.billingTerm ?? "30",
    amount: subscription.amount ?? subscription.planId.monthlyPrice,
    startDate: subscription.startDate ?? null,
    endDate: subscription.endDate ?? null,
    createdAt: subscription.createdAt
  }));

  const pendingCount = rows.filter((row) => row.status === "Installation Pending").length;
  const approvedCount = rows.filter((row) => row.status === "Installation Approved").length;
  const rejectedCount = rows.filter((row) => row.status === "Rejected").length;

  const sortedRows = [...rows].sort((a, b) => {
    if (a.status === "Installation Pending" && b.status !== "Installation Pending") {
      return -1;
    }

    if (a.status !== "Installation Pending" && b.status === "Installation Pending") {
      return 1;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Subscriptions
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Review orders pending installation or reject requests that cannot be fulfilled.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {[
            ["Pending installation", pendingCount, "warning.main"],
            ["Approved", approvedCount, "success.main"],
            ["Rejected", rejectedCount, "error.main"]
          ].map(([label, count, color]) => (
            <Grid item xs={12} md={4} key={String(label)}>
              <Card variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    {label}
                  </Typography>
                  <Typography variant="h4" sx={{ color, mt: 0.5, fontWeight: 700 }}>
                    {count}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card variant="outlined" sx={{ borderRadius: 1 }}>
          <CardContent>
            <AdminSubscriptionsTable subscriptions={sortedRows} />
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
