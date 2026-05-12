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
import ServiceAlertsBar from "@/components/ServiceAlertsBar";

export const dynamic = "force-dynamic";

type ApiSubscription = {
  _id: string;
  status: string;
  planStatus?: string;
  billingTerm?: string;
  amount?: number;
  startDate?: string | null;
  endDate?: string | null;
  routerId?: string | null;
  installationAppointmentId?: {
    scheduledDate?: string;
    timeSlot?: string;
    status?: string;
  } | null;
  installedAt?: string | null;
  activatedAt?: string | null;
  blockedAt?: string | null;
  createdAt: string;
  userId: {
    email: string;
    name?: string;
    phone?: string;
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
    planStatus: subscription.planStatus ?? "active",
    billingTerm: subscription.billingTerm ?? "30",
    amount: subscription.amount ?? subscription.planId.monthlyPrice,
    routerId: subscription.routerId ?? null,
    installationDate: subscription.installationAppointmentId?.scheduledDate ?? null,
    installedAt: subscription.installedAt ?? null,
    activatedAt: subscription.activatedAt ?? null,
    blockedAt: subscription.blockedAt ?? null,
    startDate: subscription.startDate ?? null,
    endDate: subscription.endDate ?? null,
    createdAt: subscription.createdAt
  }));

  const pendingCount = rows.filter((r) => r.status === "Pending").length;
  const scheduledCount = rows.filter((r) => r.status === "Scheduled").length;
  const installedCount = rows.filter((r) => r.status === "Installed").length;
  const activeCount = rows.filter((r) => r.status === "Active").length;
  const blockedCount = rows.filter((r) => r.status === "Blocked").length;

  const sortedRows = [...rows].sort((a, b) => {
    const order: Record<string, number> = {
      Installed: 0,   // needs admin action (activate)
      Pending: 1,
      Scheduled: 2,
      Active: 3,
      Blocked: 4,
      Cancelled: 5,
      Rejected: 6,
    };
    const oa = order[a.status] ?? 99;
    const ob = order[b.status] ?? 99;
    if (oa !== ob) return oa - ob;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const statCards: [string, number, string][] = [
    ["Pending", pendingCount, "warning.main"],
    ["Scheduled", scheduledCount, "primary.main"],
    ["Installed (awaiting activation)", installedCount, "info.main"],
    ["Active", activeCount, "success.main"],
    ["Blocked", blockedCount, "error.main"],
  ];

  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={4}>
        <ServiceAlertsBar />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Subscriptions
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Manage the full provisioning lifecycle — from pending orders to WiFi activation and access control.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {statCards.map(([label, count, color]) => (
            <Grid item xs={6} md key={String(label)}>
              <Card variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                  <Typography color="text.secondary" variant="body2" noWrap>
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
