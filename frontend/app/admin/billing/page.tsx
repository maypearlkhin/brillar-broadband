import {
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
  Typography,
} from "@mui/material";
import { redirect } from "next/navigation";
import { isAxiosError } from "axios";
import { axiosServer } from "@/lib/axiosServer";
import ServiceAlertsBar from "@/components/ServiceAlertsBar";

export const dynamic = "force-dynamic";

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  paidAt: string;
  amount: number;
  currency: string;
  billingTermDays: number;
  planName: string;
  planDownloadSpeedMbps: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subscriptionId: string;
  subscriptionStatus: string | null;
  serviceStart: string | null;
  serviceEnd: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function formatServicePeriod(row: InvoiceRow) {
  const st = row.subscriptionStatus ?? "";
  if (!row.serviceStart && ["Pending", "Scheduled"].includes(st)) {
    return "After installation";
  }
  if (!row.serviceStart && !row.serviceEnd) return "—";
  return `${formatDate(row.serviceStart)} → ${formatDate(row.serviceEnd)}`;
}

function subscriptionStatusColor(
  status: string | null,
): "default" | "success" | "warning" | "error" | "info" | "primary" {
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

export default async function AdminBillingPage() {
  let invoices: InvoiceRow[] = [];

  try {
    const res = await axiosServer().get<{ invoices: InvoiceRow[] }>("/api/admin/invoices");
    invoices = res.data.invoices ?? [];
  } catch (err) {
    if (isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        redirect("/dashboard");
      }
    }
    redirect("/login?next=/admin/billing");
  }

  return (
    <Stack spacing={3}>
      <ServiceAlertsBar />

      <Stack spacing={0.5}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
          Billing
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Customer invoices & payments
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          Payment date and plan at checkout; service window follows each subscription (new installs begin billing once
          installation is marked complete).
        </Typography>
      </Stack>

      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          {invoices.length === 0 ? (
            <Typography color="text.secondary">No invoices recorded yet.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Invoice no.</TableCell>
                    <TableCell>Paid on</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Term</TableCell>
                    <TableCell>Service period</TableCell>
                    <TableCell>Subscription</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography fontWeight={700}>
                          {row.customerName?.trim() || row.customerEmail}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {row.customerEmail}
                        </Typography>
                        {row.customerPhone?.trim() ? (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {row.customerPhone}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {row.invoiceNumber}
                      </TableCell>
                      <TableCell>{formatDate(row.paidAt)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.planName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.planDownloadSpeedMbps} Mbps
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {row.currency} ${row.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{row.billingTermDays} days</TableCell>
                      <TableCell>{formatServicePeriod(row)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.subscriptionStatus ?? "—"}
                          color={subscriptionStatusColor(row.subscriptionStatus)}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
