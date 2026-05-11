"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import { getData } from "@/lib/api";

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

const MAX_SLOTS = 5;

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Pending:   { bg: "#fff8ed", border: "#f59e0b", text: "#92400e", dot: "#f59e0b" },
  Approved:  { bg: "#f0fdf4", border: "#22c55e", text: "#14532d", dot: "#22c55e" },
  Completed: { bg: "#eff6ff", border: "#3b82f6", text: "#1e3a8a", dot: "#3b82f6" },
  Cancelled: { bg: "#f9fafb", border: "#d1d5db", text: "#9ca3af", dot: "#d1d5db" },
};

function getWeekDates(weekOffset: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Start from Monday of the offset week
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function formatDayHeader(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

function formatWeekRange(dates: string[]) {
  if (dates.length === 0) return "";
  const start = new Date(dates[0] + "T00:00:00");
  const end = new Date(dates[dates.length - 1] + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

function EventPill({ appt }: { appt: Appointment }) {
  const s = STATUS_STYLES[appt.status] ?? STATUS_STYLES.Pending;
  return (
    <Tooltip
      title={
        <Stack spacing={0.25}>
          <Typography variant="caption" fontWeight={700}>{appt.customerId?.name}</Typography>
          <Typography variant="caption">{appt.customerId?.email}</Typography>
          {appt.customerId?.serviceZone && (
            <Typography variant="caption">
              {appt.customerId.serviceZone.district}, {appt.customerId.serviceZone.country}
            </Typography>
          )}
          {appt.notes && <Typography variant="caption" sx={{ fontStyle: "italic" }}>"{appt.notes}"</Typography>}
          <Typography variant="caption" sx={{ opacity: 0.7 }}>Status: {appt.status}</Typography>
        </Stack>
      }
      arrow
    >
      <Box
        sx={{
          display: "flex", alignItems: "center", gap: 0.75,
          px: 1.25, py: 0.6, borderRadius: "6px",
          bgcolor: s.bg, borderLeft: `3px solid ${s.border}`,
          cursor: "default",
          opacity: appt.status === "Cancelled" ? 0.55 : 1,
          "&:hover": { opacity: 0.8 },
        }}
      >
        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.dot, flexShrink: 0 }} />
        <Typography
          variant="caption" fontWeight={600} noWrap
          sx={{ color: s.text, textDecoration: appt.status === "Cancelled" ? "line-through" : "none", flex: 1, minWidth: 0 }}
        >
          {appt.customerId?.name || "Customer"}
        </Typography>
      </Box>
    </Tooltip>
  );
}

function SlotCell({ date, timeSlot, appointments }: { date: string; timeSlot: "morning" | "afternoon"; appointments: Appointment[] }) {
  const cellAppts = appointments.filter((a) => a.scheduledDate === date && a.timeSlot === timeSlot);
  const active = cellAppts.filter((a) => a.status !== "Cancelled");
  const isFull = active.length >= MAX_SLOTS;

  return (
    <Box sx={{
      flex: 1, minHeight: 110, p: 1.25, display: "flex", flexDirection: "column", gap: 0.6,
      borderRight: "1px solid", borderColor: "divider",
      bgcolor: isFull ? "rgba(239,68,68,0.04)" : "transparent",
      "&:last-child": { borderRight: "none" },
    }}>
      <Typography variant="caption" sx={{
        color: isFull ? "error.main" : active.length > 0 ? "text.secondary" : "text.disabled",
        fontWeight: isFull ? 700 : 400, mb: 0.25,
      }}>
        {active.length}/{MAX_SLOTS}{isFull && " · Full"}
      </Typography>
      {cellAppts.length > 0
        ? cellAppts.map((appt) => <EventPill key={appt._id} appt={appt} />)
        : <Typography variant="caption" sx={{ color: "text.disabled", fontStyle: "italic" }}>—</Typography>}
    </Box>
  );
}

export default function ISPDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);

  const dates = getWeekDates(weekOffset);
  const todayStr = new Date().toISOString().slice(0, 10);
  const isCurrentWeek = dates.includes(todayStr);

  useEffect(() => {
    getData("/api/appointments")
      .then((res) => setAppointments(res.data.data || []))
      .catch(() => setError("Failed to load appointments."))
      .finally(() => setLoading(false));
  }, []);

  const totalActive = appointments.filter((a) => a.status !== "Cancelled" && dates.includes(a.scheduledDate)).length;
  const totalPending = appointments.filter((a) => a.status === "Pending" && dates.includes(a.scheduledDate)).length;

  const timeSlots = [
    { key: "morning" as const, label: "Morning", time: "9am – 1pm", Icon: WbSunnyOutlinedIcon, color: "#f59e0b" },
    { key: "afternoon" as const, label: "Afternoon", time: "1pm – 5pm", Icon: NightlightRoundIcon, color: "#6366f1" },
  ];

  return (
    <Stack spacing={2.5}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          <Typography variant="overline" color="primary" fontWeight={700}>ISP Team Portal</Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="h5" fontWeight={700}>Team Calendar</Typography>
            <Stack direction="row" spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                <strong>{totalActive}</strong> active
              </Typography>
              {totalPending > 0 && (
                <Typography variant="body2" sx={{ color: "warning.dark", fontWeight: 600 }}>
                  · {totalPending} pending
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Week navigation */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "white", borderRadius: 2, border: "1px solid", borderColor: "divider", px: 1.5, py: 0.75 }}>
          <IconButton size="small" onClick={() => setWeekOffset((o) => o - 1)}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography variant="body2" fontWeight={600} sx={{ minWidth: 180, textAlign: "center" }}>
            {formatWeekRange(dates)}
          </Typography>
          <IconButton size="small" onClick={() => setWeekOffset((o) => o + 1)}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
          {!isCurrentWeek && (
            <Button
              size="small"
              startIcon={<TodayIcon sx={{ fontSize: 14 }} />}
              onClick={() => setWeekOffset(0)}
              sx={{ ml: 0.5, fontWeight: 600, fontSize: "0.75rem" }}
            >
              Today
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto", borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {/* Day header row */}
          <Box sx={{ display: "flex", borderBottom: "1px solid", borderColor: "divider" }}>
            <Box sx={{ width: 100, flexShrink: 0, borderRight: "1px solid", borderColor: "divider" }} />
            {dates.map((date) => {
              const { weekday, day } = formatDayHeader(date);
              const isToday = todayStr === date;
              return (
                <Box key={date} sx={{
                  flex: 1, minWidth: 120, py: 1.5, textAlign: "center",
                  borderRight: "1px solid", borderColor: "divider",
                  "&:last-child": { borderRight: "none" },
                  bgcolor: isToday ? "primary.50" : "transparent",
                }}>
                  <Typography variant="caption" sx={{ color: isToday ? "primary.main" : "text.secondary", fontWeight: 700, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {weekday}
                  </Typography>
                  <Typography variant="body2" fontWeight={isToday ? 800 : 500} sx={{ color: isToday ? "primary.main" : "text.primary" }}>
                    {day}
                  </Typography>
                  {isToday && <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "primary.main", mx: "auto", mt: 0.5 }} />}
                </Box>
              );
            })}
          </Box>

          {/* Slot rows */}
          {timeSlots.map((slot, idx) => (
            <Box key={slot.key} sx={{ display: "flex", borderBottom: idx < timeSlots.length - 1 ? "1px solid" : "none", borderColor: "divider" }}>
              <Box sx={{ width: 100, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5, py: 2, px: 1, borderRight: "1px solid", borderColor: "divider", bgcolor: "grey.50" }}>
                <slot.Icon sx={{ fontSize: 18, color: slot.color }} />
                <Typography variant="caption" fontWeight={700} sx={{ color: slot.color, textAlign: "center" }}>{slot.label}</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ textAlign: "center", lineHeight: 1.2 }}>{slot.time}</Typography>
              </Box>
              {dates.map((date) => (
                <SlotCell key={date} date={date} timeSlot={slot.key} appointments={appointments} />
              ))}
            </Box>
          ))}
        </Box>
      )}

      {/* Legend */}
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
        <Typography variant="caption" color="text.secondary">Legend:</Typography>
        {Object.entries(STATUS_STYLES).map(([status, s]) => (
          <Box key={status} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.dot }} />
            <Typography variant="caption" color="text.secondary">{status}</Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
