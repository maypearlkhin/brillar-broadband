import { Alert, Box, Stack, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { isAxiosError } from "axios";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { axiosServer } from "@/lib/axiosServer";
import { formatServiceZone } from "@/lib/serviceZones";
import ServiceAlertsBar from "@/components/ServiceAlertsBar";
import CustomerDashboardPanels, {
  type SubscriptionPayload,
} from "@/components/dashboard/CustomerDashboardPanels";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentUser = getCurrentUserFromCookies();

  if (!currentUser) {
    redirect("/login?next=/dashboard");
  }

  if (currentUser.role === "admin") {
    redirect("/admin/dashboard");
  }

  type DashboardResponse = {
    user: {
      email: string;
      name: string;
      phone: string;
      serviceZone: { country: string; district: string; postalCode: string };
    } | null;
    subscriptions: SubscriptionPayload[];
    activeOutage?: {
      id: string;
      message: string;
      location: { country: string; district: string; postalCode: string };
      createdAt?: string;
    } | null;
  };

  let data: DashboardResponse;

  try {
    const response = await axiosServer().get<DashboardResponse>("/api/me/subscription");
    data = response.data;
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 401) {
      redirect("/login?next=/dashboard");
    }
    throw err;
  }

  const subscriptions = data.subscriptions ?? [];
  const user = data.user;
  const activeOutage = data.activeOutage ?? null;

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <Stack spacing={4}>
      <ServiceAlertsBar />
      <Box>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 0.12 }}>
          Subscriptions
        </Typography>
        <Stack
          spacing={0.75}
          sx={{
            mt: 1.5,
            maxWidth: 520,
            "& .acct-info-row": {
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              gap: { xs: 0.25, sm: 1 },
              typography: "body2",
            },
            "& .acct-info-label": {
              color: "text.secondary",
              fontWeight: 500,
              minWidth: { sm: 118 },
            },
            "& .acct-info-value": {
              color: "text.primary",
              fontWeight: 400,
              wordBreak: "break-word",
            },
          }}
        >
          <Box className="acct-info-row">
            <Box component="span" className="acct-info-label">
              Name
            </Box>
            <Box component="span" className="acct-info-value">
              {user.name?.trim() || "—"}
            </Box>
          </Box>
          <Box className="acct-info-row">
            <Box component="span" className="acct-info-label">
              Phone
            </Box>
            <Box component="span" className="acct-info-value">
              {user.phone?.trim() || "—"}
            </Box>
          </Box>
          <Box className="acct-info-row">
            <Box component="span" className="acct-info-label">
              Email
            </Box>
            <Box component="span" className="acct-info-value">
              {user.email}
            </Box>
          </Box>
          <Box className="acct-info-row">
            <Box component="span" className="acct-info-label">
              Service location
            </Box>
            <Box component="span" className="acct-info-value">
              {formatServiceZone(user.serviceZone)}
            </Box>
          </Box>
        </Stack>
      </Box>

      {activeOutage && (
        <Alert severity="warning" variant="outlined">
          <Typography fontWeight={700}>Incident affecting your address</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {activeOutage.message}
          </Typography>
        </Alert>
      )}

      <CustomerDashboardPanels initialSubscriptions={subscriptions} />
    </Stack>
  );
}
