"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
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
import CheckIcon from "@mui/icons-material/Check";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RouterIcon from "@mui/icons-material/Router";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import WifiIcon from "@mui/icons-material/Wifi";
import BlockIcon from "@mui/icons-material/Block";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BuildIcon from "@mui/icons-material/Build";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { getData } from "@/lib/api";
import CancelPlanButton from "@/components/dashboard/CancelPlanButton";

export type PlanPayload = {
  id: string;
  name: string;
  monthlyPrice: number;
  downloadSpeedMbps: number;
};

export type AppointmentPayload = {
  _id: string;
  scheduledDate: string;
  timeSlot: string;
  status: string;
  completedAt?: string | null;
  approvedAt?: string | null;
};

export type SubscriptionPayload = {
  _id: string;
  planId: PlanPayload | null;
  status: string;
  planStatus?: string;
  billingTerm?: string;
  amount?: number;
  startDate?: string | null;
  endDate?: string | null;
  routerId?: string | null;
  installationAppointmentId?: AppointmentPayload | null;
  installedAt?: string | null;
  activatedAt?: string | null;
  blockedAt?: string | null;
  createdAt: string;
};

const TIMELINE_STEPS = [
  { key: "Pending", label: "Order Placed", icon: ShoppingCartIcon, color: "#f59e0b" },
  { key: "Scheduled", label: "Installation Scheduled", icon: CalendarMonthIcon, color: "#6366f1" },
  { key: "Installed", label: "Installation Complete", icon: BuildIcon, color: "#0ea5e9" },
  { key: "Active", label: "WiFi Active", icon: WifiIcon, color: "#22c55e" },
] as const;

function getStepIndex(status: string) {
  if (status === "Blocked") return 4;
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
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

function provisionStatusChipLabel(status: string) {
  if (status === "Pending") return "Order placed";
  if (status === "Scheduled") return "Installation scheduled";
  if (status === "Installed") return "Installed";
  if (status === "Active") return "Active";
  return status;
}

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
}

function formatSubscriptionServiceStart(sub: SubscriptionPayload) {
  if (sub.startDate) return formatDate(sub.startDate);
  if (["Pending", "Scheduled"].includes(sub.status)) return "After installation";
  return "—";
}

function formatSubscriptionServiceEnd(sub: SubscriptionPayload) {
  if (sub.endDate) return formatDate(sub.endDate);
  if (["Pending", "Scheduled"].includes(sub.status)) return "From service start";
  return "—";
}

/** Dark green for WiFi-active milestone labels on white (pairs with green circle). */
const ACTIVE_STEP_LABEL_FG = "#166534";
const TRACK_NODE = 40;
const TRACK_LINE = 3;
const TRACK_LINE_TOP = (TRACK_NODE - TRACK_LINE) / 2;

function parseToMillis(value?: string | Date | null): number | null {
  if (value == null) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  const t = d.getTime();
  return Number.isNaN(t) ? null : t;
}

function scheduledDateToMillis(dateStr?: string | null): number | null {
  if (!dateStr?.trim()) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (m) {
    const t = new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00`).getTime();
    return Number.isNaN(t) ? null : t;
  }
  return parseToMillis(dateStr);
}

function getMonotonicTimelineMillis(sub: SubscriptionPayload): (number | null)[] {
  const ap = sub.installationAppointmentId;
  const raw: (number | null)[] = [
    parseToMillis(sub.createdAt),
    scheduledDateToMillis(ap?.scheduledDate),
    parseToMillis(ap?.completedAt) ?? parseToMillis(sub.installedAt),
    parseToMillis(sub.activatedAt),
  ];

  let prev: number | null = null;
  const out: (number | null)[] = [];
  for (let k = 0; k < raw.length; k++) {
    let t = raw[k];
    if (t == null) {
      out.push(null);
      continue;
    }
    if (prev != null && t < prev) {
      t = prev;
    }
    prev = t;
    out.push(t);
  }
  return out;
}

function timelineDateLabel(ms: number | null) {
  if (ms == null) return "—";
  return new Date(ms).toLocaleDateString();
}

function formatSlot(slot?: string) {
  if (slot === "morning") return "Morning (9am – 1pm)";
  if (slot === "afternoon") return "Afternoon (1pm – 5pm)";
  return "";
}

function ProvisioningTimeline({ subscription }: { subscription: SubscriptionPayload }) {
  const status = subscription.status;
  const currentStepIndex = getStepIndex(status);
  const isTerminal = status === "Cancelled" || status === "Rejected";
  const isBlocked = status === "Blocked";
  const stepTimes = getMonotonicTimelineMillis(subscription);

  return (
    <Box sx={{ py: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          width: "100%",
          position: "relative",
        }}
      >
        {TIMELINE_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isCompleted = !isTerminal && currentStepIndex > i;
          const isCurrent = !isTerminal && currentStepIndex === i;
          const blockedCompleted = isBlocked && i <= 3;
          const effectiveCompleted = isCompleted || blockedCompleted;
          const effectiveCurrent = isCurrent && !isBlocked;

          const labelColor =
            step.key === "Active" && (effectiveCompleted || effectiveCurrent)
              ? ACTIVE_STEP_LABEL_FG
              : effectiveCompleted || effectiveCurrent
              ? step.color
              : undefined;

          const prev = i > 0 ? TIMELINE_STEPS[i - 1] : null;
          const segmentFilled =
            i > 0 && !isTerminal && (isBlocked || currentStepIndex >= i);

          return (
            <Box
              key={step.key}
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
              }}
            >
              {prev && (
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    top: TRACK_LINE_TOP,
                    right: "50%",
                    width: "100%",
                    height: TRACK_LINE,
                    borderRadius: 999,
                    bgcolor: segmentFilled ? prev.color : "#e2e8f0",
                    transition: "background-color 0.2s ease",
                    zIndex: 0,
                  }}
                />
              )}

              <Box
                sx={{
                  width: TRACK_NODE,
                  height: TRACK_NODE,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  bgcolor:
                    effectiveCompleted || effectiveCurrent ? step.color : "#f1f5f9",
                  transition: "background-color 0.2s ease",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {effectiveCompleted ? (
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      bgcolor: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-hidden
                  >
                    <CheckIcon sx={{ fontSize: 14, color: step.color }} />
                  </Box>
                ) : effectiveCurrent ? (
                  <Icon sx={{ fontSize: 22, color: "#fff" }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: "#cbd5e1" }} />
                )}
              </Box>

              <Box
                sx={{
                  mt: 1.25,
                  width: "100%",
                  minHeight: "2.95em",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: effectiveCompleted || effectiveCurrent ? 700 : 500,
                    color: labelColor ?? "text.disabled",
                    textAlign: "center",
                    lineHeight: 1.35,
                    fontSize: "0.72rem",
                    maxWidth: 112,
                  }}
                >
                  {step.label}
                </Typography>
              </Box>

              <Box
                sx={{
                  minHeight: "1rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  width: "100%",
                  mt: 0.35,
                }}
              >
                {effectiveCompleted ? (
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.68rem",
                      textAlign: "center",
                    }}
                  >
                    {timelineDateLabel(stepTimes[i] ?? null)}
                  </Typography>
                ) : effectiveCurrent ? (
                  <Typography
                    variant="caption"
                    sx={{ fontSize: "0.68rem", fontWeight: 600, color: ACTIVE_STEP_LABEL_FG }}
                  >
                    Current
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ visibility: "hidden", fontSize: "0.68rem" }}>
                    –
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {isBlocked && (
        <Alert severity="error" icon={<BlockIcon />} sx={{ mt: 2, borderRadius: 1.5 }}>
          <Typography fontWeight={700}>WiFi Access Blocked</Typography>
          <Typography variant="body2">
            Your internet access has been suspended. Please contact support for assistance.
            {subscription.blockedAt && ` Blocked on ${formatDate(subscription.blockedAt)}.`}
          </Typography>
        </Alert>
      )}

      {isTerminal && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5 }}>
          <Typography fontWeight={700}>Subscription {status}</Typography>
          <Typography variant="body2">
            This subscription has been {status.toLowerCase()}.{" "}
            <Link href="/plans" style={{ fontWeight: 600 }}>
              Browse plans
            </Link>{" "}
            to start a new order.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}

type MeSubscriptionResponse = {
  subscriptions?: SubscriptionPayload[];
};

export default function CustomerDashboardPanels({
  initialSubscriptions,
}: {
  initialSubscriptions: SubscriptionPayload[];
}) {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);

  useEffect(() => {
    setSubscriptions(initialSubscriptions);
  }, [initialSubscriptions]);

  const refreshSubscriptions = useCallback(async () => {
    try {
      const res = await getData("/api/me/subscription");
      const body = res.data as MeSubscriptionResponse;
      const next = body.subscriptions ?? [];
      setSubscriptions(Array.isArray(next) ? next : []);
      router.refresh();
    } catch {
      /* keep last known subscriptions */
    }
  }, [router]);

  useEffect(() => {
    refreshSubscriptions();
  }, [refreshSubscriptions]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshSubscriptions();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [refreshSubscriptions]);

  const latestSubscription = subscriptions[0];
  const latestPlan = latestSubscription?.planId ?? undefined;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 3,
        alignItems: "stretch",
      }}
    >
      <Box sx={{ flex: { md: 2 }, minWidth: 0 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 4px 24px rgba(15, 23, 42, 0.07)",
            bgcolor: "background.paper",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack spacing={3}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "flex-start" }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: -0.02 }}>
                    Current subscription
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Primary fibre service on your account.
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  sx={{ pt: { xs: 0, sm: 0.25 }, justifyContent: { xs: "flex-start", sm: "flex-end" } }}
                >
                  {latestSubscription && !["Cancelled", "Rejected"].includes(latestSubscription.status) && (
                    <CancelPlanButton
                      subscriptionId={latestSubscription._id}
                      onAfterCancel={refreshSubscriptions}
                    />
                  )}
                  <Chip
                    color={
                      latestSubscription
                        ? (getStatusColor(latestSubscription.status) as
                            | "default"
                            | "success"
                            | "warning"
                            | "error"
                            | "info"
                            | "primary")
                        : "default"
                    }
                    label={
                      latestSubscription
                        ? provisionStatusChipLabel(latestSubscription.status)
                        : "No active order"
                    }
                    variant={latestSubscription ? "filled" : "outlined"}
                    sx={{
                      fontWeight: 700,
                      px: 0.75,
                      textTransform: "capitalize",
                      ...(latestSubscription?.status === "Active" && {
                        bgcolor: "#16a34a",
                        color: "#fff",
                      }),
                    }}
                  />
                </Stack>
              </Stack>

              {latestSubscription && latestPlan && (
                <>
                  <Divider sx={{ opacity: 0.9 }} />
                  <ProvisioningTimeline subscription={latestSubscription} />
                </>
              )}

              {latestSubscription && latestPlan ? (
                <>
                  <Divider sx={{ opacity: 0.9 }} />
                  <Stack divider={<Divider flexItem />} spacing={0}>
                    {(
                      [
                        ["Plan", latestPlan.name],
                        ["Speed", `${latestPlan.downloadSpeedMbps} Mbps`],
                        ["Monthly", `S$${latestPlan.monthlyPrice}`],
                        ["Purchased term", `${latestSubscription.billingTerm ?? "30"} Days`],
                        ["Paid amount", `S$${latestSubscription.amount ?? latestPlan.monthlyPrice}`],
                        ["Service start", formatSubscriptionServiceStart(latestSubscription)],
                        ["Service end", formatSubscriptionServiceEnd(latestSubscription)],
                      ] as const
                    ).map(([label, value]) => (
                      <Stack
                        key={label}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                        sx={{ py: 1.5 }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                          {label}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ textAlign: "right" }}>
                          {value}
                        </Typography>
                      </Stack>
                    ))}
                    {latestSubscription.routerId ? (
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                        sx={{ py: 1.5 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Router ID
                        </Typography>
                        <Chip
                          size="small"
                          label={latestSubscription.routerId}
                          sx={{
                            fontFamily: "ui-monospace, monospace",
                            fontWeight: 700,
                            bgcolor: "rgba(14, 165, 233, 0.14)",
                            color: "#0369a1",
                            border: "none",
                          }}
                        />
                      </Stack>
                    ) : null}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                      sx={{ py: 1.5 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Provision status
                      </Typography>
                      <Chip
                        size="small"
                        color={getStatusColor(latestSubscription.status) as "default" | "success" | "warning" | "error" | "info" | "primary"}
                        label={provisionStatusChipLabel(latestSubscription.status)}
                        sx={{
                          fontWeight: 700,
                          textTransform: "capitalize",
                          ...(latestSubscription.status === "Active" && {
                            bgcolor: "#16a34a",
                            color: "#fff",
                          }),
                        }}
                      />
                    </Stack>
                  </Stack>
                </>
              ) : (
                <Typography color="text.secondary">
                  No active subscription.{" "}
                  <Link href="/plans" style={{ fontWeight: 600 }}>
                    Browse plans
                  </Link>{" "}
                  to place an order.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2, mt: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600}>
                Order history
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All requests tied to this login.
              </Typography>

              {subscriptions.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Plan</TableCell>
                        <TableCell>Speed</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Term</TableCell>
                        <TableCell>Router ID</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subscriptions.map((subscription) => {
                        const plan = subscription.planId;

                        if (!plan) {
                          return null;
                        }

                        return (
                          <TableRow key={subscription._id}>
                            <TableCell>
                              {new Date(subscription.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{plan.name}</TableCell>
                            <TableCell>{plan.downloadSpeedMbps} Mbps</TableCell>
                            <TableCell>S${plan.monthlyPrice}</TableCell>
                            <TableCell>{subscription.billingTerm ?? "30"} Days</TableCell>
                            <TableCell>
                              {subscription.routerId ? (
                                <Chip
                                  size="small"
                                  label={subscription.routerId}
                                  variant="outlined"
                                  sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                                />
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                color={getStatusColor(subscription.status) as "default" | "success" | "warning" | "error" | "info" | "primary"}
                                label={subscription.status}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No orders yet.</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ flex: { md: 1 }, minWidth: 0 }}>
        <Stack spacing={2}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <RouterIcon color="primary" />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>Installation</Typography>
                  {!latestSubscription || ["Cancelled", "Rejected"].includes(latestSubscription.status) ? (
                    <Typography variant="body2" color="text.secondary">
                      Purchase a plan to get started with installation.
                    </Typography>
                  ) : latestSubscription.status === "Pending" ? (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Your order is pending. Schedule your installation to proceed.
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        href="/dashboard/schedule-installation"
                        component={Link}
                        startIcon={<CalendarMonthIcon />}
                      >
                        Schedule Installation
                      </Button>
                    </>
                  ) : latestSubscription.status === "Scheduled" ? (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Installation scheduled.
                      </Typography>
                      {latestSubscription.installationAppointmentId && (
                        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                          📅 {latestSubscription.installationAppointmentId.scheduledDate}{" "}
                          · {formatSlot(latestSubscription.installationAppointmentId.timeSlot)}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        Waiting for ISP team to complete installation.
                      </Typography>
                    </>
                  ) : latestSubscription.status === "Installed" ? (
                    <>
                      <Typography variant="body2" color="success.main" fontWeight={600}>
                        ✓ Installation complete
                      </Typography>
                      {latestSubscription.routerId && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          Router ID: <strong>{latestSubscription.routerId}</strong>
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        Waiting for admin to activate WiFi access.
                      </Typography>
                    </>
                  ) : latestSubscription.status === "Active" ? (
                    <>
                      <Typography variant="body2" color="success.main" fontWeight={600}>
                        ✓ Your connection is live
                      </Typography>
                      {latestSubscription.routerId && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          Router ID: <strong>{latestSubscription.routerId}</strong>
                        </Typography>
                      )}
                    </>
                  ) : latestSubscription.status === "Blocked" ? (
                    <>
                      <Typography variant="body2" color="error.main" fontWeight={600}>
                        ✕ WiFi access blocked
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        Contact support for assistance.
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Technician scheduling and visit windows will appear here.
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <ReceiptLongIcon color="primary" />
                <Box>
                  <Typography fontWeight={600}>Billing</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Payments, term dates, and receipts for prepaid plans.
                  </Typography>
                  <Button component={Link} href="/dashboard/billing" variant="outlined" size="small">
                    Open billing
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <EventAvailableIcon color="primary" />
                <Box>
                  <Typography fontWeight={600}>Support</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trouble tickets and SLA tracking can plug into this panel.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
