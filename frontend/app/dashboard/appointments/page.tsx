"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import AddIcon from "@mui/icons-material/Add";
import { getData } from "@/lib/api";
import { useRouter } from "next/navigation";

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
};

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

export default function CustomerAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tab, setTab] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    getData("/api/appointments")
      .then((res) => setAppointments(res.data.data || []))
      .catch(() => setError("Failed to load appointments."));
  }, []);

  const filtered = tab === "All"
    ? appointments
    : appointments.filter((a) => a.status === tab);

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
            Appointments
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Home Installation Scheduling
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            Schedule a technician visit for your home installation.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/appointments/new")}
        >
          New Appointment
        </Button>
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Booked On</TableCell>
                <TableCell>Approved</TableCell>
                <TableCell>Completed</TableCell>
                <TableCell>Cancelled</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((appt) => (
                <TableRow key={appt._id}>
                  <TableCell>{appt.scheduledDate}</TableCell>
                  <TableCell>{formatSlot(appt.timeSlot)}</TableCell>
                  <TableCell>{appt.notes || "—"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={appt.status}
                      color={getStatusColor(appt.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(appt.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {appt.approvedAt ? new Date(appt.approvedAt).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>
                    {appt.completedAt ? new Date(appt.completedAt).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>
                    {appt.cancelledAt ? new Date(appt.cancelledAt).toLocaleString() : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
