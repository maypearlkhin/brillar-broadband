"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CancelIcon from "@mui/icons-material/Cancel";
import RouterIcon from "@mui/icons-material/Router";
import BuildIcon from "@mui/icons-material/Build";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import { getData, patchData } from "@/lib/api";

type Customer = {
  name: string;
  email: string;
  phone?: string;
  serviceZone?: { country: string; district: string; postalCode: string };
};

type SubscriptionPlan = {
  planId?: { name: string; downloadSpeedMbps: number; monthlyPrice: number } | null;
};

type Appointment = {
  _id: string;
  type: "installation" | "home_service";
  scheduledDate: string;
  timeSlot: "morning" | "afternoon";
  notes: string;
  status: "Pending" | "Approved" | "Completed" | "Cancelled";
  createdAt: string;
  approvedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  customerId: Customer;
  subscriptionId?: SubscriptionPlan | null;
};

type ActionTarget = { id: string; status: "Approved" | "Completed" | "Cancelled"; type: string } | null;

const STATUS_TABS = ["All", "Pending", "Approved", "Completed", "Cancelled"];

function getStatusColor(status: string) {
  switch (status) {
    case "Approved": return "success";
    case "Completed": return "info";
    case "Cancelled": return "error";
    default: return "warning";
  }
}

function formatSlot(timeSlot: string) {
  return timeSlot === "morning" ? "Morning (9am – 1pm)" : "Afternoon (1pm – 5pm)";
}

export default function ISPAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tab, setTab] = useState("All");
  const [error, setError] = useState("");
  const [actionTarget, setActionTarget] = useState<ActionTarget>(null);
  const [routerIdInput, setRouterIdInput] = useState("");
  const [routerIdError, setRouterIdError] = useState("");

  async function loadData() {
    getData("/api/appointments")
      .then((res) => setAppointments(res.data.data || []))
      .catch(() => setError("Failed to load appointments."));
  }

  useEffect(() => { loadData(); }, []);

  const filtered = tab === "All"
    ? appointments
    : appointments.filter((a) => a.status === tab);

  const installation = filtered.filter((a) => a.type === "installation");
  const homeService = filtered.filter((a) => a.type === "home_service");

  async function handleAction() {
    if (!actionTarget) return;

    // Validate router ID for installation completion
    if (actionTarget.type === "installation" && actionTarget.status === "Completed") {
      if (!routerIdInput.trim()) {
        setRouterIdError("Router ID is required to complete an installation.");
        return;
      }
    }

    try {
      await patchData(`/api/appointments/${actionTarget.id}/status`, {
        status: actionTarget.status,
        ...(actionTarget.type === "installation" && actionTarget.status === "Completed"
          ? { routerId: routerIdInput.trim() }
          : {}),
      });
      setActionTarget(null);
      setRouterIdInput("");
      setRouterIdError("");
      await loadData();
    } catch {
      setError("Failed to update appointment status.");
      setActionTarget(null);
    }
  }

  function renderAppointmentCards(items: Appointment[]) {
    return items.map((appt) => (
      <Card key={appt._id} variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Typography fontWeight={700} variant="h6">{appt.scheduledDate}</Typography>
                <Chip size="small" label={formatSlot(appt.timeSlot)} variant="outlined" />
                <Chip size="small" label={appt.status} color={getStatusColor(appt.status) as "default" | "success" | "warning" | "error" | "info"} />
                <Chip
                  size="small"
                  icon={appt.type === "installation" ? <BuildIcon /> : <HomeRepairServiceIcon />}
                  label={appt.type === "installation" ? "Installation" : "Home Service"}
                  variant="outlined"
                  color={appt.type === "installation" ? "info" : "default"}
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Customer: <strong>{appt.customerId?.name || "—"}</strong> · {appt.customerId?.email}
                {appt.customerId?.phone && ` · ${appt.customerId.phone}`}
              </Typography>
              {appt.customerId?.serviceZone && (
                <Typography variant="body2" color="text.secondary">
                  Location: {appt.customerId.serviceZone.district}, {appt.customerId.serviceZone.country} · {appt.customerId.serviceZone.postalCode}
                </Typography>
              )}
              {appt.type === "installation" && appt.subscriptionId?.planId && (
                <Chip
                  size="small"
                  icon={<RouterIcon />}
                  label={`${appt.subscriptionId.planId.name} · ${appt.subscriptionId.planId.downloadSpeedMbps} Mbps`}
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 0.5 }}
                />
              )}
              {appt.notes && (
                <Typography variant="body2" sx={{ mt: 1 }}>Notes: {appt.notes}</Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Booked: {new Date(appt.createdAt).toLocaleString()}
              </Typography>
              {appt.approvedAt && (
                <Typography variant="caption" color="success.main" display="block">
                  Approved: {new Date(appt.approvedAt).toLocaleString()}
                </Typography>
              )}
              {appt.completedAt && (
                <Typography variant="caption" color="info.main" display="block">
                  Completed: {new Date(appt.completedAt).toLocaleString()}
                </Typography>
              )}
              {appt.cancelledAt && (
                <Typography variant="caption" color="error.main" display="block">
                  Cancelled: {new Date(appt.cancelledAt).toLocaleString()}
                </Typography>
              )}
            </Box>

            <Stack spacing={1} sx={{ minWidth: 140 }}>
              {appt.status === "Pending" && (
                <>
                  <Button variant="contained" color="success" size="small" startIcon={<CheckCircleIcon />}
                    onClick={() => setActionTarget({ id: appt._id, status: "Approved", type: appt.type })} fullWidth>
                    Approve
                  </Button>
                  <Button variant="outlined" color="error" size="small" startIcon={<CancelIcon />}
                    onClick={() => setActionTarget({ id: appt._id, status: "Cancelled", type: appt.type })} fullWidth>
                    Cancel
                  </Button>
                </>
              )}
              {appt.status === "Approved" && (
                <>
                  <Button variant="contained" color="info" size="small" startIcon={<DoneAllIcon />}
                    onClick={() => {
                      setActionTarget({ id: appt._id, status: "Completed", type: appt.type });
                      setRouterIdInput("");
                      setRouterIdError("");
                    }} fullWidth>
                    Mark Complete
                  </Button>
                  <Button variant="outlined" color="error" size="small" startIcon={<CancelIcon />}
                    onClick={() => setActionTarget({ id: appt._id, status: "Cancelled", type: appt.type })} fullWidth>
                    Cancel
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </CardContent>
      </Card>
    ));
  }

  const pendingCount = appointments.filter((a) => a.status === "Pending").length;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="primary" fontWeight={700}>ISP Team</Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h5" fontWeight={600}>Appointments</Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
              Installation and home service visits are grouped separately below (same status filters apply).
            </Typography>
          </Box>
          {pendingCount > 0 && (
            <Chip label={`${pendingCount} Pending`} color="warning" />
          )}
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {STATUS_TABS.map((s) => <Tab key={s} label={s} value={s} />)}
        </Tabs>
      </Box>

      {filtered.length === 0 ? (
        <Typography color="text.secondary">No appointments found.</Typography>
      ) : (
        <Stack spacing={4}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
              <BuildIcon sx={{ color: "info.main" }} fontSize="small" aria-hidden />
              <Typography variant="h6" fontWeight={700}>Installation appointments</Typography>
              <Chip size="small" variant="outlined" color="info" label={`${installation.length}`} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Router installs tied to fibre subscriptions.
            </Typography>
            {installation.length === 0 ? (
              <Typography variant="body2" color="text.secondary">None for this filter.</Typography>
            ) : (
              <Stack spacing={2}>{renderAppointmentCards(installation)}</Stack>
            )}
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
              <HomeRepairServiceIcon sx={{ color: "text.secondary" }} fontSize="small" aria-hidden />
              <Typography variant="h6" fontWeight={700}>Home service appointments</Typography>
              <Chip size="small" variant="outlined" label={`${homeService.length}`} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Repairs and follow-up visits booked by customers.
            </Typography>
            {homeService.length === 0 ? (
              <Typography variant="body2" color="text.secondary">None for this filter.</Typography>
            ) : (
              <Stack spacing={2}>{renderAppointmentCards(homeService)}</Stack>
            )}
          </Box>
        </Stack>
      )}

      {/* Confirm Action Dialog */}
      <Dialog open={Boolean(actionTarget)} onClose={() => { setActionTarget(null); setRouterIdInput(""); setRouterIdError(""); }}>
        <DialogTitle>
          {actionTarget?.type === "installation" && actionTarget?.status === "Completed"
            ? "Complete Installation"
            : "Confirm Status Change"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this appointment as{" "}
            <strong>{actionTarget?.status}</strong>?
          </DialogContentText>

          {/* Router ID input for installation completion */}
          {actionTarget?.type === "installation" && actionTarget?.status === "Completed" && (
            <TextField
              label="Router ID"
              placeholder="e.g. RTR-SG-20260512-001"
              value={routerIdInput}
              onChange={(e) => { setRouterIdInput(e.target.value); setRouterIdError(""); }}
              error={Boolean(routerIdError)}
              helperText={routerIdError || "Assign the installed router's serial/ID to this customer."}
              fullWidth
              required
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setActionTarget(null); setRouterIdInput(""); setRouterIdError(""); }}>Cancel</Button>
          <Button
            variant="contained"
            color={actionTarget?.status === "Completed" ? "info" : actionTarget?.status === "Approved" ? "success" : "error"}
            onClick={handleAction}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
