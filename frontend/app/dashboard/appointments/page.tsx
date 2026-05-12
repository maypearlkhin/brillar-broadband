"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import AddIcon from "@mui/icons-material/Add";
import BuildIcon from "@mui/icons-material/Build";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import { getData } from "@/lib/api";
import { useRouter } from "next/navigation";

type AppointmentPlan = {
  planId?: { name: string } | null;
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
  subscriptionId?: AppointmentPlan | null;
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

function AppointmentRows({ appointments }: { appointments: Appointment[] }) {
  return (
    <>
      {appointments.map((appt) => (
        <TableRow key={appt._id}>
          <TableCell>
            <Chip
              size="small"
              icon={appt.type === "installation" ? <BuildIcon /> : <HomeRepairServiceIcon />}
              label={appt.type === "installation" ? "Installation" : "Home Service"}
              variant="outlined"
              color={appt.type === "installation" ? "info" : "default"}
              sx={{ fontWeight: 600 }}
            />
          </TableCell>
          <TableCell>{appt.scheduledDate}</TableCell>
          <TableCell>{formatSlot(appt.timeSlot)}</TableCell>
          <TableCell>
            {appt.type === "installation" && appt.subscriptionId?.planId
              ? appt.subscriptionId.planId.name
              : "—"}
          </TableCell>
          <TableCell>{appt.notes || "—"}</TableCell>
          <TableCell>
            <Chip size="small" label={appt.status} color={getStatusColor(appt.status) as "default" | "success" | "warning" | "error" | "info"} />
          </TableCell>
          <TableCell>{new Date(appt.createdAt).toLocaleDateString()}</TableCell>
        </TableRow>
      ))}
    </>
  );
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

  const installation = filtered.filter((a) => a.type === "installation");
  const homeService = filtered.filter((a) => a.type === "home_service");

  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
            Appointments
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            My Appointments
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            Installation and home service visits are grouped separately below (same filters apply to both).
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/appointments/new")}
        >
          Home Service Appointment
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
        <Stack spacing={4}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }} flexWrap="wrap" useFlexGap>
              <BuildIcon sx={{ color: "info.main" }} fontSize="small" aria-hidden />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Installation
              </Typography>
              <Chip size="small" variant="outlined" color="info" label={`${installation.length} booked`} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Router installation visits tied to your fibre subscription order.
            </Typography>
            {installation.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No installation appointments for this filter.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time Slot</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Booked On</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AppointmentRows appointments={installation} />
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }} flexWrap="wrap" useFlexGap>
              <HomeRepairServiceIcon sx={{ color: "text.secondary" }} fontSize="small" aria-hidden />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Home service
              </Typography>
              <Chip size="small" variant="outlined" label={`${homeService.length} booked`} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Repairs and equipment visits booked from your account (not initial installation).
            </Typography>
            {homeService.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No home service appointments for this filter.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time Slot</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Booked On</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <AppointmentRows appointments={homeService} />
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
