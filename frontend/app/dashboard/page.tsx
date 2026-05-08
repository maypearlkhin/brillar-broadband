import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RouterIcon from "@mui/icons-material/Router";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAxiosError } from "axios";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { axiosServer } from "@/lib/axiosServer";
import { formatServiceZone } from "@/lib/serviceZones";

export const dynamic = "force-dynamic";

type PlanPayload = {
  id: string;
  name: string;
  monthlyPrice: number;
  downloadSpeedMbps: number;
};

type SubscriptionPayload = {
  _id: string;
  planId: PlanPayload | null;
  status: string;
  billingTerm?: string;
  amount?: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
};

function getStatusColor(status: string) {
  if (status === "Installation Approved") {
    return "success";
  }

  if (status === "Rejected") {
    return "error";
  }

  return "warning";
}

function formatDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString();
}

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

  const latestSubscription = subscriptions[0];
  const latestPlan = latestSubscription?.planId ?? undefined;

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 0.12 }}>
          Account overview
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 600, mt: 0.5 }}>
          {user.email}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Service location: {formatServiceZone(user.serviceZone)}
        </Typography>
      </Box>

      {activeOutage && (
        <Alert severity="warning" variant="outlined">
          <Typography fontWeight={700}>Incident affecting your address</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {activeOutage.message}
          </Typography>
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
        <Box sx={{ flex: { md: 2 }, minWidth: 0 }}>
          <Card variant="outlined" sx={{ borderRadius: 1 }}>
            <CardContent>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ sm: "flex-start" }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Current subscription
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Primary fibre service on your account.
                    </Typography>
                  </Box>
                  <Chip
                    color={
                      latestSubscription ? getStatusColor(latestSubscription.status) : "default"
                    }
                    label={latestSubscription?.status || "No active order"}
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>

                {latestSubscription && latestPlan ? (
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ color: "text.secondary", width: 160 }}>Plan</TableCell>
                          <TableCell>{latestPlan.name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: "text.secondary" }}>Speed</TableCell>
                          <TableCell>{latestPlan.downloadSpeedMbps} Mbps</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: "text.secondary" }}>Monthly</TableCell>
                          <TableCell>S${latestPlan.monthlyPrice}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: "text.secondary" }}>Purchased term</TableCell>
                          <TableCell>{latestSubscription.billingTerm ?? "30"}Days</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: "text.secondary" }}>Paid amount</TableCell>
                          <TableCell>S${latestSubscription.amount ?? latestPlan.monthlyPrice}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: "text.secondary" }}>Start date</TableCell>
                          <TableCell>{formatDate(latestSubscription.startDate)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: "text.secondary" }}>End date</TableCell>
                          <TableCell>{formatDate(latestSubscription.endDate)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ color: "text.secondary" }}>Provision status</TableCell>
                          <TableCell>{latestSubscription.status}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">
                    No active subscription.{" "}
                    <Link href="/plans" style={{ fontWeight: 600 }}>
                      Browse plans
                    </Link>{" "}
                    to place an order.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 1, mt: 3 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={600}>
                  Order history
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All requests tied to this login.
                </Typography>

                {subscriptions.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Plan</TableCell>
                          <TableCell>Speed</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Term</TableCell>
                          <TableCell>Start date</TableCell>
                          <TableCell>End date</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {subscriptions.map((subscription) => {
                          const plan = subscription.planId;

                          if (!plan) {
                            return null;
                          }

                          return (
                            <TableRow key={subscription._id}>
                              <TableCell>
                                {new Date(subscription.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{plan.name}</TableCell>
                              <TableCell>{plan.downloadSpeedMbps} Mbps</TableCell>
                              <TableCell>S${plan.monthlyPrice}</TableCell>
                              <TableCell>{subscription.billingTerm ?? "30"}Days</TableCell>
                              <TableCell>{formatDate(subscription.startDate)}</TableCell>
                              <TableCell>{formatDate(subscription.endDate)}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  color={getStatusColor(subscription.status)}
                                  label={subscription.status}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary">No orders yet.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { md: 1 }, minWidth: 0 }}>
          <Stack spacing={2}>
            <Card variant="outlined" sx={{ borderRadius: 1 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <RouterIcon color="primary" />
                  <Box>
                    <Typography fontWeight={600}>Installation</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Technician scheduling and visit windows will appear here.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ borderRadius: 1 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <ReceiptLongIcon color="primary" />
                  <Box>
                    <Typography fontWeight={600}>Billing</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Invoice and payment history integrate in a later release.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ borderRadius: 1 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <EventAvailableIcon color="primary" />
                  <Box>
                    <Typography fontWeight={600}>Support</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trouble tickets and SLA tracking can plug into this panel.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}
