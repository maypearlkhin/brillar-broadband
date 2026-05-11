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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CancelIcon from "@mui/icons-material/Cancel";
import { getData, patchData } from "@/lib/api";

type Customer = {
  name: string;
  email: string;
  serviceZone?: { country: string; district: string; postalCode: string };
};

type Appointment = {
  _id: string;
  scheduledDate: string;
  timeSlot: "morning" | "afternoon";
  notes: string;
  status: "Pending" | "Approved" | "Completed" | "Cancelled";
  createdAt: string;
  approvedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  customerId: Customer;
};

type ActionTarget = { id: string; status: "Approved" | "Completed" | "Cancelled" } | null;

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

  async function loadData() {
    getData("/api/appointments")
      .then((res) => setAppointments(res.data.data || []))
      .catch(() => setError("Failed to load appointments."));
  }

  useEffect(() => { loadData(); }, []);

  const filtered = tab === "All"
    ? appointments
    : appointments.filter((a) => a.status === tab);

  async function handleAction() {
    if (!actionTarget) return;
    try {
      await patchData(`/api/appointments/${actionTarget.id}/status`, { status: actionTarget.status });
      setActionTarget(null);
      await loadData();
    } catch {
      setError("Failed to update appointment status.");
      setActionTarget(null);
    }
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
              Manage customer home installation appointments.
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
        <Stack spacing={2}>
          {filtered.map((appt) => (
            <Card key={appt._id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                  <Box>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                      <Typography fontWeight={700} variant="h6">
                        {appt.scheduledDate}
                      </Typography>
                      <Chip size="small" label={formatSlot(appt.timeSlot)} variant="outlined" />
                      <Chip size="small" label={appt.status} color={getStatusColor(appt.status) as any} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Customer: <strong>{appt.customerId?.name || "—"}</strong> · {appt.customerId?.email}
                    </Typography>
                    {appt.customerId?.serviceZone && (
                      <Typography variant="body2" color="text.secondary">
                        Location: {appt.customerId.serviceZone.district}, {appt.customerId.serviceZone.country} · {appt.customerId.serviceZone.postalCode}
                      </Typography>
                    )}
                    {appt.notes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Notes: {appt.notes}
                      </Typography>
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
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => setActionTarget({ id: appt._id, status: "Approved" })}
                          fullWidth
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => setActionTarget({ id: appt._id, status: "Cancelled" })}
                          fullWidth
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {appt.status === "Approved" && (
                      <>
                        <Button
                          variant="contained"
                          color="info"
                          size="small"
                          startIcon={<DoneAllIcon />}
                          onClick={() => setActionTarget({ id: appt._id, status: "Completed" })}
                          fullWidth
                        >
                          Mark Complete
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => setActionTarget({ id: appt._id, status: "Cancelled" })}
                          fullWidth
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Confirm Action Dialog */}
      <Dialog open={Boolean(actionTarget)} onClose={() => setActionTarget(null)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this appointment as{" "}
            <strong>{actionTarget?.status}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionTarget(null)}>Cancel</Button>
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
