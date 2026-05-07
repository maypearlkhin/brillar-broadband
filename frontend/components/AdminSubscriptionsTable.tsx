"use client";

import {
  Alert,
  Box,
  Button,
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
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
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

export default function AdminSubscriptionsTable({
  subscriptions
}: {
  subscriptions: AdminSubscriptionRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState("");

  async function updateStatus(subscriptionId: string, action: "approve" | "reject") {
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
        <Typography variant="h5">Installation queue</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Pending installations appear first. Approving updates the customer status to Installation
          Approved.
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
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((subscription) => {
              const isPending = subscription.status === "Installation Pending";

              return (
                <TableRow key={subscription.id}>
                  <TableCell
                    sx={{
                      bgcolor: isPending ? "rgba(255, 167, 38, 0.08)" : "inherit"
                    }}
                  >
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
                  <TableCell
                    sx={{
                      bgcolor: isPending ? "rgba(255, 167, 38, 0.08)" : "inherit"
                    }}
                  >
                    <Typography>{subscription.planName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {subscription.downloadSpeedMbps} Mbps, S${subscription.monthlyPrice}/month
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: isPending ? "rgba(255, 167, 38, 0.08)" : "inherit"
                    }}
                  >
                    {subscription.serviceZone}
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: isPending ? "rgba(255, 167, 38, 0.08)" : "inherit"
                    }}
                  >
                    <Chip
                      color={getStatusColor(subscription.status)}
                      label={subscription.status}
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      bgcolor: isPending ? "rgba(255, 167, 38, 0.08)" : "inherit"
                    }}
                  >
                    {isPending ? (
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckIcon />}
                          disabled={activeId === subscription.id}
                          onClick={() => updateStatus(subscription.id, "approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CloseIcon />}
                          disabled={activeId === subscription.id}
                          onClick={() => updateStatus(subscription.id, "reject")}
                        >
                          Reject
                        </Button>
                      </Stack>
                    ) : (
                      <Box component="span" sx={{ color: "text.secondary" }}>
                        Reviewed
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
