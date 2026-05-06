import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
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
import { redirect } from "next/navigation";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Subscription from "@/lib/models/Subscription";
import User from "@/lib/models/User";
import { formatServiceZone } from "@/lib/serviceZones";

export const dynamic = "force-dynamic";

type PopulatedPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  downloadSpeedMbps: number;
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

export default async function DashboardPage() {
  const currentUser = getCurrentUserFromCookies();

  if (!currentUser) {
    redirect("/login?next=/dashboard");
  }

  if (currentUser.role === "admin") {
    redirect("/admin");
  }

  await connectToDatabase();

  const [user, subscriptions] = await Promise.all([
    User.findById(currentUser.userId).lean(),
    Subscription.find({ userId: currentUser.userId })
      .sort({ createdAt: -1 })
      .populate("planId")
      .lean()
  ]);

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const latestSubscription = subscriptions[0];
  const latestPlan = latestSubscription?.planId as unknown as PopulatedPlan | undefined;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 6 }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4">Welcome, {user.email}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Service zone: {formatServiceZone(user.serviceZone)}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={3}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography variant="h5">Current service</Typography>
                        <Typography color="text.secondary">
                          Your latest Brillar Broadband purchase.
                        </Typography>
                      </Box>
                      <Chip
                        color={latestSubscription ? getStatusColor(latestSubscription.status) : "default"}
                        label={latestSubscription?.status || "No Active Subscription"}
                      />
                    </Stack>

                    {latestSubscription && latestPlan ? (
                      <TableContainer>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Plan
                              </TableCell>
                              <TableCell>{latestPlan.name}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Download Speed
                              </TableCell>
                              <TableCell>{latestPlan.downloadSpeedMbps} Mbps</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Monthly Price
                              </TableCell>
                              <TableCell>${latestPlan.monthlyPrice}/month</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">
                                Status
                              </TableCell>
                              <TableCell>{latestSubscription.status}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="text.secondary">
                        Choose a plan from the homepage to start installation.
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h5">All purchased installments</Typography>
                      <Typography color="text.secondary">
                        Every package you purchased with this customer account.
                      </Typography>
                    </Box>

                    {subscriptions.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Purchased Date</TableCell>
                              <TableCell>Plan</TableCell>
                              <TableCell>Speed</TableCell>
                              <TableCell>Price</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {subscriptions.map((subscription) => {
                              const plan = subscription.planId as unknown as PopulatedPlan;

                              return (
                                <TableRow key={subscription._id.toString()}>
                                  <TableCell>
                                    {new Date(subscription.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>{plan.name}</TableCell>
                                  <TableCell>{plan.downloadSpeedMbps} Mbps</TableCell>
                                  <TableCell>${plan.monthlyPrice}/month</TableCell>
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
                      <Typography color="text.secondary">
                        No purchased installments yet. Go to the plans page to choose a package.
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <RouterIcon color="primary" />
                      <Box>
                        <Typography fontWeight={800}>Installation</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Home visit scheduling will plug in after Phase 1.
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <ReceiptLongIcon color="primary" />
                      <Box>
                        <Typography fontWeight={800}>Billing</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Next cycle and top-up services are ready for future APIs.
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <EventAvailableIcon color="primary" />
                      <Box>
                        <Typography fontWeight={800}>Appointments</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Appointment lookup can build on this account context.
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
