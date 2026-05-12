"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import CloseIcon from "@mui/icons-material/Close";
import WifiIcon from "@mui/icons-material/Wifi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isAxiosError } from "axios";
import { patchData } from "@/lib/api";

export type AdminSubscriptionRow = {
  id: string;
  customerName: string;
  customerEmail: string;
  serviceZone: string;
  planName: string;
  monthlyPrice: number;
  downloadSpeedMbps: number;
  status: string;
  planStatus: string;
  billingTerm: string;
  amount: number;
  routerId?: string | null;
  installationDate?: string | null;
  installedAt?: string | null;
  activatedAt?: string | null;
  blockedAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
};

function getStatusColor(status: string) {
  switch (status) {
    case "Active": return "success";
    case "Installed": return "info";
    case "Scheduled": return "primary";
    case "Blocked": return "error";
    case "Rejected":
    case "Cancelled": return "error";
    default: return "warning";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function getStatusDescription(status: string) {
  switch (status) {
    case "Pending": return "Awaiting customer to schedule installation";
    case "Scheduled": return "Waiting for ISP team to install";
    case "Installed": return "Ready for WiFi activation";
    case "Active": return "Service is live";
    case "Blocked": return "WiFi access suspended";
    case "Cancelled": return "User cancelled plan";
    case "Rejected": return "Order rejected";
    default: return "";
  }
}

export default function AdminSubscriptionsTable({
  subscriptions
}: {
  subscriptions: AdminSubscriptionRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    id: string;
    action: string;
    label: string;
    color: "success" | "error" | "info" | "warning";
  } | null>(null);

  async function handleAction(subscriptionId: string, action: string) {
    setError("");
    setActiveId(subscriptionId);

    try {
      await patchData("/api/admin/subscriptions", { subscriptionId, action });
      router.refresh();
    } catch (err) {
      setError(
        isAxiosError(err)
          ? err.response?.data?.message || "Unable to update subscription."
          : "Unable to update subscription."
      );
    } finally {
      setActiveId("");
      setConfirmDialog(null);
    }
  }

  if (subscriptions.length === 0) {
    return (
      <Typography color="text.secondary">
        No customer purchases have been submitted yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5">Provisioning Queue</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage customer subscriptions through the provisioning lifecycle. Actions are gated by installation status.
        </Typography>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Service Zone</TableCell>
              <TableCell>Router ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((subscription) => {
              const isBusy = activeId === subscription.id;

              return (
                <TableRow key={subscription.id}>
                  <TableCell>
                    {subscription.customerName.trim() ? (
                      <>
                        <Typography fontWeight={700}>{subscription.customerName.trim()}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {subscription.customerEmail}
                        </Typography>
                      </>
                    ) : (
                      <Typography fontWeight={700}>{subscription.customerEmail}</Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {new Date(subscription.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{subscription.planName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {subscription.downloadSpeedMbps} Mbps, S${subscription.monthlyPrice}/month
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {subscription.billingTerm} Days, S${subscription.amount}
                    </Typography>
                  </TableCell>
                  <TableCell>{subscription.serviceZone}</TableCell>
                  <TableCell>
                    {subscription.routerId ? (
                      <Chip
                        size="small"
                        label={subscription.routerId}
                        variant="outlined"
                        color="info"
                        sx={{ fontFamily: "monospace", fontWeight: 700 }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(subscription.status) as any}
                      label={subscription.status}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                      {getStatusDescription(subscription.status)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1} flexWrap="wrap">
                      {/* Pending: only Reject */}
                      {subscription.status === "Pending" && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CloseIcon />}
                          disabled={isBusy}
                          onClick={() => setConfirmDialog({
                            id: subscription.id,
                            action: "reject",
                            label: "Reject this subscription?",
                            color: "error"
                          })}
                        >
                          Reject
                        </Button>
                      )}

                      {/* Scheduled: only Cancel */}
                      {subscription.status === "Scheduled" && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CloseIcon />}
                          disabled={isBusy}
                          onClick={() => setConfirmDialog({
                            id: subscription.id,
                            action: "cancel",
                            label: "Cancel this subscription?",
                            color: "error"
                          })}
                        >
                          Cancel
                        </Button>
                      )}

                      {/* Installed: Activate WiFi */}
                      {subscription.status === "Installed" && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<WifiIcon />}
                          disabled={isBusy}
                          onClick={() => setConfirmDialog({
                            id: subscription.id,
                            action: "activate",
                            label: "Activate WiFi access for this customer?",
                            color: "success"
                          })}
                        >
                          Activate WiFi
                        </Button>
                      )}

                      {/* Active: Block */}
                      {subscription.status === "Active" && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<BlockIcon />}
                          disabled={isBusy}
                          onClick={() => setConfirmDialog({
                            id: subscription.id,
                            action: "block",
                            label: "Block WiFi access for this customer?",
                            color: "error"
                          })}
                        >
                          Block Access
                        </Button>
                      )}

                      {/* Blocked: Unblock */}
                      {subscription.status === "Blocked" && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<LockOpenIcon />}
                          disabled={isBusy}
                          onClick={() => setConfirmDialog({
                            id: subscription.id,
                            action: "unblock",
                            label: "Restore WiFi access for this customer?",
                            color: "success"
                          })}
                        >
                          Unblock Access
                        </Button>
                      )}

                      {/* Terminal states */}
                      {["Cancelled", "Rejected"].includes(subscription.status) && (
                        <Typography variant="body2" color="text.secondary">
                          Reviewed
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirm Dialog */}
      <Dialog open={Boolean(confirmDialog)} onClose={() => setConfirmDialog(null)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog?.label}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={confirmDialog?.color || "primary"}
            onClick={() => confirmDialog && handleAction(confirmDialog.id, confirmDialog.action)}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
