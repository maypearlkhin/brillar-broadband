import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAxiosError } from "axios";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { axiosServer } from "@/lib/axiosServer";
import ServiceAlertsBar from "@/components/ServiceAlertsBar";
import BillingReceiptButton, {
  type ReceiptPayload,
} from "@/components/dashboard/BillingReceiptButton";

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

type InvoicePayload = {
  id: string;
  invoiceNumber: string;
  subscriptionId: string;
  paidAt: string;
  amount: number;
  currency: string;
  billingTermDays: number;
  planName: string;
  planDownloadSpeedMbps: number;
  customerName?: string;
};

type UserPayload = {
  name?: string;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatServicePeriod(sub: SubscriptionPayload) {
  if (!sub.startDate && ["Pending", "Scheduled"].includes(sub.status)) {
    return "After installation";
  }
  return `${formatDate(sub.startDate)} → ${formatDate(sub.endDate)}`;
}

function formatServiceStart(sub: SubscriptionPayload) {
  if (sub.startDate) return formatDate(sub.startDate);
  if (["Pending", "Scheduled"].includes(sub.status)) return "After installation";
  return "—";
}

function formatServiceEnd(sub: SubscriptionPayload) {
  if (sub.endDate) return formatDate(sub.endDate);
  if (["Pending", "Scheduled"].includes(sub.status)) return "From service start";
  return "—";
}

function termLabel(term?: string) {
  const days = term ?? "30";
  return `${days}-day prepaid term`;
}

function getStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "success";
    case "Installed":
      return "info";
    case "Scheduled":
      return "primary";
    case "Rejected":
    case "Cancelled":
      return "error";
    case "Blocked":
      return "error";
    default:
      return "warning";
  }
}

function buildReceiptPayload(
  sub: SubscriptionPayload,
  invoice: InvoicePayload | undefined,
  accountHolderName: string,
): ReceiptPayload {
  const plan = sub.planId!;
  const billingTermDays =
    invoice?.billingTermDays ??
    (Number.isFinite(Number(sub.billingTerm)) ? Number(sub.billingTerm) : 30);
  return {
    invoiceNumber:
      invoice?.invoiceNumber ?? `ORD-${String(sub._id).slice(-8).toUpperCase()}`,
    paidAt: invoice?.paidAt ?? sub.createdAt,
    customerName: (invoice?.customerName || accountHolderName || "").trim() || undefined,
    planName: invoice?.planName ?? plan.name,
    downloadSpeedMbps: invoice?.planDownloadSpeedMbps ?? plan.downloadSpeedMbps,
    billingTermDays,
    amount: invoice?.amount ?? sub.amount ?? plan.monthlyPrice,
    currency: invoice?.currency ?? "SGD",
    serviceStart: sub.startDate,
    serviceEnd: sub.endDate,
    subscriptionStatus: sub.status,
  };
}

export default async function BillingPage() {
  const currentUser = getCurrentUserFromCookies();

  if (!currentUser) {
    redirect("/login?next=/dashboard/billing");
  }

  if (currentUser.role === "admin") {
    redirect("/admin/dashboard");
  }

  type DashboardResponse = {
    user?: UserPayload | null;
    subscriptions: SubscriptionPayload[];
    invoices?: InvoicePayload[];
  };

  let subscriptions: SubscriptionPayload[] = [];
  let invoices: InvoicePayload[] = [];
  let accountName = "";

  try {
    const response = await axiosServer().get<DashboardResponse>("/api/me/subscription");
    subscriptions = response.data.subscriptions ?? [];
    invoices = response.data.invoices ?? [];
    accountName = response.data.user?.name?.trim() ?? "";
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 401) {
      redirect("/login?next=/dashboard/billing");
    }
    throw err;
  }

  const invoiceBySubscriptionId = new Map<string, InvoicePayload>();
  for (const inv of invoices) {
    invoiceBySubscriptionId.set(inv.subscriptionId, inv);
  }

  const latest = subscriptions[0];
  const latestPlan = latest?.planId ?? null;
  const payableSubscriptions = subscriptions.filter((s) => s.planId);
  const paymentRows = [...payableSubscriptions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const accountDisplay =
    accountName.length > 0 ? accountName : "your account";

  return (
    <Stack spacing={3}>
      <ServiceAlertsBar />

      <Box>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 0.12 }}>
          Billing
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
          Payments &amp; invoices
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
          Brillar Broadband operates on prepaid service terms. Charges apply once per selected billing period (30,
          90, 180, or 365 days of service credit). Renew before your term ends to avoid interruption.
        </Typography>
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Current subscription
          </Typography>

          {!latest || !latestPlan ? (
            <Typography color="text.secondary">
              No subscription on file.{" "}
              <Link href="/plans" style={{ fontWeight: 700 }}>
                View plans
              </Link>{" "}
              to purchase service.
            </Typography>
          ) : (
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {latestPlan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {latestPlan.downloadSpeedMbps} Mbps · {termLabel(latest.billingTerm)}
                  </Typography>
                </Box>
                <Chip
                  label={latest.status}
                  color={
                    getStatusColor(latest.status) as
                      | "default"
                      | "success"
                      | "warning"
                      | "error"
                      | "info"
                      | "primary"
                  }
                  sx={{ fontWeight: 700, alignSelf: "flex-start" }}
                />
              </Stack>
              <Divider />
              <Stack divider={<Divider flexItem />} spacing={0}>
                {[
                  ["Amount paid", `S$${(latest.amount ?? latestPlan.monthlyPrice).toFixed(2)}`],
                  ["Order date", formatDate(latest.createdAt)],
                  ["Service start", formatServiceStart(latest)],
                  ["Service end", formatServiceEnd(latest)],
                ].map(([label, value]) => (
                  <Stack key={label} direction="row" justifyContent="space-between" sx={{ py: 1.25 }}>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 1 }}>
                <Button variant="contained" component={Link} href="/plans">
                  Renew or change plan
                </Button>
                <BillingReceiptButton
                  receipt={buildReceiptPayload(
                    latest,
                    invoiceBySubscriptionId.get(String(latest._id)),
                    accountName,
                  )}
                />
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Payment history
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Charges and invoices for <strong>{accountDisplay}</strong>, most recent first.
          </Typography>

          {paymentRows.length === 0 ? (
            <Typography color="text.secondary">No purchases yet.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Paid on</TableCell>
                    <TableCell>Invoice no.</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Term</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Service period</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Invoice</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentRows.map((sub) => {
                    const plan = sub.planId!;
                    const inv = invoiceBySubscriptionId.get(String(sub._id));
                    const paid = inv?.amount ?? sub.amount ?? plan.monthlyPrice;
                    const paidOn = inv?.paidAt ?? sub.createdAt;
                    const invoiceNo =
                      inv?.invoiceNumber ?? `ORD-${String(sub._id).slice(-8).toUpperCase()}`;

                    return (
                      <TableRow key={sub._id}>
                        <TableCell>{formatDate(paidOn)}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{invoiceNo}</TableCell>
                        <TableCell>{plan.name}</TableCell>
                        <TableCell>{inv ? `${inv.billingTermDays} days` : termLabel(sub.billingTerm)}</TableCell>
                        <TableCell align="right">S${paid.toFixed(2)}</TableCell>
                        <TableCell>{formatServicePeriod(sub)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={sub.status}
                            color={
                              getStatusColor(sub.status) as
                                | "default"
                                | "success"
                                | "warning"
                                | "error"
                                | "info"
                                | "primary"
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <BillingReceiptButton
                            receipt={buildReceiptPayload(sub, inv, accountName)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
