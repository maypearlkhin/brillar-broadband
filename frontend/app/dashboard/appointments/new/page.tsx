"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VerifiedIcon from "@mui/icons-material/Verified";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { getData, postData } from "@/lib/api";
import { useRouter } from "next/navigation";

type SlotWindow = {
  timeSlot: "morning" | "afternoon";
  available: number;
  isFull: boolean;
};

type DaySlot = {
  date: string;
  windows: SlotWindow[];
};

function formatDateLabel(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const STEPS = [
  {
    icon: CalendarMonthIcon,
    color: "#6366f1",
    title: "Choose your slot",
    desc: "Pick an available date and window.",
  },
  {
    icon: VerifiedIcon,
    color: "#22c55e",
    title: "Team confirms",
    desc: "ISP team reviews and approves.",
  },
  {
    icon: HomeRepairServiceIcon,
    color: "#f59e0b",
    title: "Technician visits",
    desc: "Arrives in your selected window.",
  },
  {
    icon: SupportAgentIcon,
    color: "#0ea5e9",
    title: "You're connected",
    desc: "Raise a ticket anytime after.",
  },
];

export default function NewAppointmentPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<DaySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<
    "morning" | "afternoon" | ""
  >("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getData("/api/appointments/slots")
      .then((res) => setSlots(res.data.data || []))
      .catch(() => setError("Failed to load available slots."))
      .finally(() => setLoadingSlots(false));
  }, []);

  const selectedDayData = slots.find((d) => d.date === selectedDate);
  const morningWindow = selectedDayData?.windows.find(
    (w) => w.timeSlot === "morning",
  );
  const afternoonWindow = selectedDayData?.windows.find(
    (w) => w.timeSlot === "afternoon",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      setError("Please select both a date and a time slot.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await postData("/api/appointments", {
        scheduledDate: selectedDate,
        timeSlot: selectedSlot,
        notes,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to book appointment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Box sx={{ maxWidth: 480, mx: "auto", py: 8, textAlign: "center" }}>
        <CheckCircleOutlineIcon
          sx={{ fontSize: 64, color: "success.main", mb: 2 }}
        />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Appointment Booked!
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Your appointment for <strong>{formatDateLabel(selectedDate)}</strong>{" "}
          ({selectedSlot === "morning" ? "9am – 1pm" : "1pm – 5pm"}) has been
          submitted.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            onClick={() => router.push("/dashboard/appointments")}
          >
            View My Appointments
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setSuccess(false);
              setSelectedDate("");
              setSelectedSlot("");
              setNotes("");
            }}
          >
            Book Another
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/dashboard/appointments")}
        sx={{ mb: 1.5 }}
        size="small"
      >
        Back to Appointments
      </Button>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
        {/* LEFT — Form */}
        <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Book a Home Appointment
            </Typography>

            {loadingSlots ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack component="form" onSubmit={handleSubmit} spacing={1.75}>
                {error && (
                  <Alert severity="error" sx={{ py: 0.5 }}>
                    {error}
                  </Alert>
                )}

                {/* Date */}
                <FormControl fullWidth required size="small">
                  <InputLabel id="date-label">Select Date</InputLabel>
                  <Select
                    labelId="date-label"
                    label="Select Date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot("");
                      setError("");
                    }}
                  >
                    {slots.map((day) => {
                      const allFull = day.windows.every((w) => w.isFull);
                      return (
                        <MenuItem
                          key={day.date}
                          value={day.date}
                          disabled={allFull}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                              gap: 1,
                            }}
                          >
                            <span>{formatDateLabel(day.date)}</span>
                            {allFull && (
                              <Typography variant="caption" color="error">
                                Full
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <FormHelperText>Next 7 available days</FormHelperText>
                </FormControl>

                {/* Time Slot — custom toggle (not ToggleButtonGroup to avoid black) */}
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    Time Slot{" "}
                    <Typography component="span" color="error">
                      *
                    </Typography>
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1,
                    }}
                  >
                    {[
                      {
                        value: "morning" as const,
                        label: "Morning",
                        time: "9am – 1pm",
                        Icon: WbSunnyOutlinedIcon,
                        iconColor: "#f59e0b",
                        w: morningWindow,
                      },
                      {
                        value: "afternoon" as const,
                        label: "Afternoon",
                        time: "1pm – 5pm",
                        Icon: NightlightRoundIcon,
                        iconColor: "#6366f1",
                        w: afternoonWindow,
                      },
                    ].map(({ value, label, time, Icon, iconColor, w }) => {
                      const isSelected = selectedSlot === value;
                      const isDisabled = !selectedDate || w?.isFull;
                      return (
                        <Box
                          key={value}
                          onClick={() => {
                            if (!isDisabled) setSelectedSlot(value);
                          }}
                          sx={{
                            border: "1.5px solid",
                            borderColor: isSelected ? "#d97706" : "divider",
                            borderRadius: 1.5,
                            px: 1.5,
                            py: 4.6,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.4,
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            opacity: isDisabled ? 0.45 : 1,
                            bgcolor: isSelected ? "#fef3c7" : "background.paper",
                            transition: "all 0.15s",
                            "&:hover": !isDisabled
                              ? { borderColor: "#fbbf24", bgcolor: "#fffbeb" }
                              : {},
                          }}
                        >
                          <Icon
                            sx={{
                              fontSize: 22,
                              color: isSelected ? "#d97706" : iconColor,
                              mb: 0.25,
                            }}
                          />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: isSelected ? "#92400e" : "text.primary", lineHeight: 1.2 }}
                          >
                            {label}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ lineHeight: 1.2 }}
                          >
                            {time}
                          </Typography>
                          {selectedDate && w && (
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{
                                color: w.isFull
                                  ? "error.main"
                                  : "success.main",
                                fontWeight: 600,
                                lineHeight: 1.2,
                                mt: 0.25,
                              }}
                            >
                              {w.isFull
                                ? "Full"
                                : `${w.available} spots left`}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                  {!selectedDate && (
                    <FormHelperText>Select a date first</FormHelperText>
                  )}
                </Box>

                {/* Notes */}
                <TextField
                  label="Notes (optional)"
                  placeholder="Any special instructions..."
                  multiline
                  rows={1}
                  fullWidth
                  size="small"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  inputProps={{ maxLength: 500 }}
                />

                {/* Summary — always visible */}
                <Box
                  sx={{
                    borderRadius: 1.5,
                    px: 2,
                    py: 1.25,
                    borderLeft: "3px solid",
                    borderColor: selectedDate && selectedSlot ? "primary.main" : "divider",
                    bgcolor: selectedDate && selectedSlot ? "primary.50" : "grey.50",
                    transition: "all 0.2s",
                  }}
                >
                  {selectedDate && selectedSlot ? (
                    <Typography variant="body2" color="primary.dark" fontWeight={600}>
                      📅 {formatDateLabel(selectedDate)} ·{" "}
                      {selectedSlot === "morning" ? "Morning (9am – 1pm)" : "Afternoon (1pm – 5pm)"}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      Select a date and time slot to see your appointment summary here.
                    </Typography>
                  )}
                </Box>


                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!selectedDate || !selectedSlot || submitting}
                    sx={{ flex: 1 }}
                  >
                    {submitting ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Confirm Appointment"
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/dashboard/appointments")}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* RIGHT — Info panel */}
        <Stack spacing={2.5} sx={{ height: "100%" }}>
          {/* What happens next - 2x2 grid */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                What happens next?
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                {STEPS.map((step, i) => (
                  <Box
                    key={i}
                    sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: `${step.color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        mt: 0.1,
                      }}
                    >
                      <step.icon sx={{ fontSize: 14, color: step.color }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        display="block"
                        lineHeight={1.3}
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        lineHeight={1.4}
                      >
                        {step.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Weekly Availability */}
          {slots.length > 0 && (
            <Card variant="outlined" sx={{ borderRadius: 2, flex: 1 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                  Weekly Availability
                </Typography>

                <Stack divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
                  {slots.map((day) => {
                    const morning = day.windows.find((w) => w.timeSlot === "morning");
                    const afternoon = day.windows.find((w) => w.timeSlot === "afternoon");
                    const hasSpots = !morning?.isFull || !afternoon?.isFull;
                    const d = new Date(day.date + "T00:00:00");
                    const dayName = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

                    return (
                      <Box key={day.date} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1 }}>
                        <Typography variant="body2" color="text.primary" fontWeight={500}>
                          {dayName}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: hasSpots ? "success.main" : "error.main" }} />
                          <Typography variant="body2" fontWeight={700} sx={{ color: hasSpots ? "success.dark" : "error.main" }}>
                            {hasSpots ? "Open" : "Full"}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          )}


        </Stack>
      </Box>
    </Box>
  );
}
