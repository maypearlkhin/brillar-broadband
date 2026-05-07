"use client";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import type { PlanCardData } from "@/components/PlanGrid";
import { postData } from "@/lib/api";

type CheckoutFields = {
  cardName: string;
  cardNumber: string;
  expiryDigits: string;
  cvc: string;
};

type CheckoutErrors = Partial<Record<keyof CheckoutFields, string>>;

const MAX_CARD_DIGITS = 19;
/** 19 digits + 4 spaces between groups (4+4+4+4+3). */
const MAX_CARD_INPUT_CHARS = MAX_CARD_DIGITS + Math.floor((MAX_CARD_DIGITS - 1) / 4);

function getCardDigits(cardNumber: string) {
  return cardNumber.replace(/\s/g, "");
}

/** Insert a space after every 4th digit (PAN display). */
function formatCardBlocks(digits: string) {
  const parts: string[] = [];

  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }

  return parts.join(" ");
}

function formatExpiryDisplay(expiryDigits: string) {
  if (expiryDigits.length <= 2) {
    return expiryDigits;
  }

  return `${expiryDigits.slice(0, 2)}/${expiryDigits.slice(2)}`;
}

/** Receipt line: mask PAN — show only last 4 digits (never CVC). */
function formatReceiptPan(cardNumber: string): string {
  const d = getCardDigits(cardNumber);
  if (!d.length) {
    return "—";
  }

  if (d.length <= 4) {
    return d;
  }

  const last4 = d.slice(-4);
  const hidden = d.slice(0, -4);
  const bulletGroups: string[] = [];

  for (let i = 0; i < hidden.length; i += 4) {
    bulletGroups.push("••••");
  }

  return [...bulletGroups, last4].join(" ");
}

function validateExpiry(mmYySlash: string) {
  const match = mmYySlash.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);

  if (!match) {
    return "Use a valid month (01–12) and year.";
  }

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return "Card expiry must be this month or later.";
  }

  return "";
}

function validateCheckoutFields(fields: CheckoutFields) {
  const errors: CheckoutErrors = {};
  const cardName = fields.cardName.trim();
  const cardDigits = getCardDigits(fields.cardNumber);

  if (!cardName) {
    errors.cardName = "Name on card is required.";
  } else if (!/^[A-Za-zÀ-ÿ \-'.]{2,60}$/.test(cardName)) {
    errors.cardName = "Use letters and spaces only, 2-60 characters.";
  }

  if (!fields.cardNumber.trim()) {
    errors.cardNumber = "Card number is required.";
  } else if (!/^[\d ]+$/.test(fields.cardNumber)) {
    errors.cardNumber = "Card number can contain digits and spaces only.";
  } else if (!/^\d{13,19}$/.test(cardDigits)) {
    errors.cardNumber = "Card number must contain 13-19 digits.";
  }

  if (fields.expiryDigits.length !== 4) {
    errors.expiryDigits = "Enter expiry as four digits (e.g. 2930 → 29/30).";
  } else {
    const slash = `${fields.expiryDigits.slice(0, 2)}/${fields.expiryDigits.slice(2)}`;
    const expiryError = validateExpiry(slash);

    if (expiryError) {
      errors.expiryDigits = expiryError;
    }
  }

  if (!fields.cvc.trim()) {
    errors.cvc = "CVC is required.";
  } else if (!/^\d{3,4}$/.test(fields.cvc.trim())) {
    errors.cvc = "CVC must be 3 or 4 digits.";
  }

  return errors;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Random calendar day within the next 1–7 days (installation window). */
function randomInstallDate(from: Date): Date {
  const offsetDays = 1 + Math.floor(Math.random() * 7);
  const d = new Date(from);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(12, 0, 0, 0);
  return d;
}

function AcceptedCardMarks() {
  const common = {
    height: 22,
    px: 0.85,
    borderRadius: 0.75,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid",
    flexShrink: 0,
  } as const;

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ ml: "auto" }}>
      <Box
        sx={{
          ...common,
          minWidth: 38,
          bgcolor: "#fff",
          borderColor: "rgba(26, 31, 113, 0.35)",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.55rem",
            fontWeight: 900,
            color: "#1a1f71",
            letterSpacing: "0.04em",
          }}
        >
          VISA
        </Typography>
      </Box>
      <Box
        sx={{
          ...common,
          minWidth: 40,
          bgcolor: "#fff",
          borderColor: "rgba(15, 23, 42, 0.12)",
          overflow: "hidden",
          position: "relative",
          px: 0.5,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 6,
            top: "50%",
            width: 14,
            height: 14,
            borderRadius: "50%",
            bgcolor: "#eb001b",
            opacity: 0.92,
            transform: "translateY(-50%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: 14,
            top: "50%",
            width: 14,
            height: 14,
            borderRadius: "50%",
            bgcolor: "#f79e1b",
            opacity: 0.95,
            transform: "translateY(-50%)",
          }}
        />
      </Box>
      <Box
        sx={{
          ...common,
          minWidth: 36,
          bgcolor: "#016fd0",
          borderColor: "#016fd0",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.45rem",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          AMEX
        </Typography>
      </Box>
      <Box
        sx={{
          ...common,
          minWidth: 44,
          bgcolor: "#fff",
          borderColor: "rgba(15, 23, 42, 0.12)",
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: "0.42rem",
            fontWeight: 800,
            color: "#111",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          DISC
          <Box component="span" sx={{ color: "#f97316" }}>
            O
          </Box>
          VER
        </Box>
      </Box>
    </Stack>
  );
}

type ReceiptSummaryProps = {
  plan: PlanCardData;
  fields: CheckoutFields;
  orderDateLabel: string;
};

function ReceiptSummary({ plan, fields, orderDateLabel }: ReceiptSummaryProps) {
  const nameLine = fields.cardName.trim() || "—";
  const panLine = formatReceiptPan(fields.cardNumber);
  const expiryLine =
    fields.expiryDigits.length === 4 ? formatExpiryDisplay(fields.expiryDigits) : "—";
  const amount =
    typeof plan.monthlyPrice === "number" && Number.isFinite(plan.monthlyPrice)
      ? plan.monthlyPrice.toFixed(2)
      : String(plan.monthlyPrice);

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 1,
        bgcolor: "rgba(236, 72, 153, 0.06)",
        border: "1px dashed",
        borderColor: "rgba(236, 72, 153, 0.28)",
      }}
    >
      <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 0.14, color: "primary.dark" }}>
        Order summary
      </Typography>
      <Stack spacing={1.25} sx={{ mt: 1.5 }}>
        <ReceiptRow label="Order date" value={orderDateLabel} />
        <ReceiptRow label="Plan" value={plan.name} />
        <ReceiptRow label="Amount" value={`$${amount} / month`} emphasize />
        <Divider sx={{ borderStyle: "dashed" }} />
        <ReceiptRow label="Cardholder" value={nameLine} mono />
        <ReceiptRow label="Card" value={panLine} mono small />
        <ReceiptRow label="Expires" value={expiryLine} mono />
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, lineHeight: 1.5 }}>
        Security code (CVC) is never shown on receipts.
      </Typography>
    </Box>
  );
}

function ReceiptRow({
  label,
  value,
  emphasize,
  mono,
  small,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: emphasize ? 700 : 500,
          textAlign: "right",
          wordBreak: "break-word",
          ...(mono && {
            fontFamily: 'ui-monospace, Consolas, "Courier New", monospace',
            fontSize: small ? "0.8rem" : "0.85rem",
          }),
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default function CheckoutForm({ plan }: { plan: PlanCardData }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [fields, setFields] = useState<CheckoutFields>({
    cardName: "",
    cardNumber: "",
    expiryDigits: "",
    cvc: "",
  });
  const [fieldErrors, setFieldErrors] = useState<CheckoutErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingOpen, setProcessingOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successInstallLabel, setSuccessInstallLabel] = useState("");

  const orderDateLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [],
  );

  function updateField<K extends keyof CheckoutFields>(field: K, value: CheckoutFields[K]) {
    setFields((currentFields) => ({
      ...currentFields,
      [field]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  function handleCardNameChange(raw: string) {
    const cleaned = raw
      .replace(/[^A-Za-zÀ-ÿ \-'.]/g, "")
      .slice(0, 60);
    updateField("cardName", cleaned);
  }

  function handleCardNumberChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, MAX_CARD_DIGITS);
    updateField("cardNumber", formatCardBlocks(digits));
  }

  function handleExpiryChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    updateField("expiryDigits", digits);
  }

  async function handlePurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const validationErrors = validateCheckoutFields(fields);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Please fix the highlighted payment fields before purchasing.");
      return;
    }

    setProcessingOpen(true);
    setIsSubmitting(true);

    await delay(2200 + Math.floor(Math.random() * 900));

    try {
      await postData("/api/checkout", { planId: plan.id });

      const completedAt = new Date();
      const installBy = randomInstallDate(completedAt);
      const installLabel = installBy.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      setProcessingOpen(false);
      setIsSubmitting(false);

      setSuccessInstallLabel(installLabel);
      setSuccessOpen(true);
    } catch (err) {
      setProcessingOpen(false);
      setIsSubmitting(false);
      setError(
        isAxiosError(err)
          ? err.response?.data?.message || "Checkout failed."
          : "Something went wrong. Please try again."
      );
    }
  }

  function handleSuccessContinue() {
    setSuccessOpen(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        py: { xs: 3, md: 5 },
        bgcolor: "#fdf2f8",
      }}
    >
      <Dialog open={processingOpen} disableEscapeKeyDown aria-labelledby="processing-title">
        <DialogContent sx={{ py: 4, px: 4, textAlign: "center", maxWidth: 360 }}>
          <CircularProgress color="primary" sx={{ mb: 2 }} />
          <Typography id="processing-title" variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
            Processing your payment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
            Please wait — do not close this window. Your transaction is being authorised securely.
          </Typography>
        </DialogContent>
      </Dialog>

      <Dialog
        open={successOpen}
        onClose={(_, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return;
          }
        }}
        disableEscapeKeyDown
        aria-labelledby="success-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="success-title" sx={{ pt: 3, pb: 1 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <CheckCircleOutlineIcon sx={{ fontSize: 32, color: "primary.main" }} aria-hidden />
            <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
              Payment successful
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Stack spacing={1.75} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
              {"We'll email your confirmation shortly."}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
              Our installation team will contact you to schedule a visit — usually within one week.
            </Typography>
            <Box
              sx={{
                mt: 0.5,
                p: 1.5,
                borderRadius: 1,
                bgcolor: "rgba(236, 72, 153, 0.08)",
                border: "1px solid",
                borderColor: "rgba(236, 72, 153, 0.22)",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 600 }}>
                Provisional slot
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.25 }}>
                {successInstallLabel}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button variant="contained" size="large" fullWidth onClick={handleSuccessContinue} sx={{ py: 1.15 }}>
            Continue to dashboard
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="lg">
        <Stack spacing={1} sx={{ mb: 3, textAlign: "center" }}>
          <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 0.12, color: "primary.main" }}>
            Secure checkout
          </Typography>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Complete your subscription
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 560, mx: "auto" }}>
            Review your plan and enter your payment details to confirm your subscription.
          </Typography>
        </Stack>

        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 8px 30px rgba(219, 39, 119, 0.08)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Chip label="Monthly plan" size="small" color="primary" variant="outlined" sx={{ mb: 2 }} />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                  {plan.name}
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="h3" component="span" sx={{ fontWeight: 800, color: "primary.main" }}>
                    ${plan.monthlyPrice}
                  </Typography>
                  <Typography component="span" color="text.secondary" variant="h6">
                    /month
                  </Typography>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {plan.downloadSpeedMbps} Mbps download. Installation and activation are scheduled after your order is
                  confirmed.
                </Typography>

                <ReceiptSummary plan={plan} fields={fields} orderDateLabel={orderDateLabel} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 12px 36px rgba(219, 39, 119, 0.1)",
                overflow: "hidden",
                bgcolor: "#fff",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.25}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "flex-start", sm: "flex-start" }}
                    justifyContent="space-between"
                  >
                    <Box sx={{ pr: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Payment details
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Visa, Mastercard, American Express, and Discover accepted.
                      </Typography>
                    </Box>
                    <AcceptedCardMarks />
                  </Stack>

                  <Alert
                    severity="info"
                    icon={<VerifiedUserOutlinedIcon />}
                    sx={{
                      alignItems: "flex-start",
                      bgcolor: "rgba(236, 72, 153, 0.09)",
                      color: "text.primary",
                      border: "1px solid rgba(236, 72, 153, 0.22)",
                      "& .MuiAlert-icon": { color: "primary.main" },
                    }}
                  >
                    <Typography variant="body2" component="span">
                      <strong>Secure payment.</strong> Your card details are encrypted in transit (SSL/TLS) and processed
                      securely. We follow PCI DSS practices and do not store your full card number on our servers — only
                      what is required to complete billing with our payment partner.
                    </Typography>
                  </Alert>

                  {error && <Alert severity="error">{error}</Alert>}

                  <Stack component="form" spacing={2.25} onSubmit={handlePurchase}>
                    <TextField
                      label="Name on card"
                      value={fields.cardName}
                      onChange={(event) => handleCardNameChange(event.target.value)}
                      error={Boolean(fieldErrors.cardName)}
                      helperText={fieldErrors.cardName || "Exactly as printed on your card."}
                      InputLabelProps={{ shrink: true }}
                      required
                      fullWidth
                      autoComplete="cc-name"
                      inputProps={{ maxLength: 60 }}
                    />
                    <TextField
                      label="Card number"
                      placeholder="4242 4242 4242 4242"
                      value={fields.cardNumber}
                      onChange={(event) => handleCardNumberChange(event.target.value)}
                      error={Boolean(fieldErrors.cardNumber)}
                      helperText={
                        fieldErrors.cardNumber ||
                        `Digits only — up to ${MAX_CARD_DIGITS} digits; spaced every four automatically.`
                      }
                      InputLabelProps={{ shrink: true }}
                      required
                      fullWidth
                      type="tel"
                      autoComplete="cc-number"
                      inputProps={{
                        maxLength: MAX_CARD_INPUT_CHARS,
                        inputMode: "numeric",
                        autoComplete: "cc-number",
                      }}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Expiry"
                          placeholder="29/30"
                          value={formatExpiryDisplay(fields.expiryDigits)}
                          onChange={(event) => handleExpiryChange(event.target.value)}
                          error={Boolean(fieldErrors.expiryDigits)}
                          helperText={
                            fieldErrors.expiryDigits ||
                            "Type four digits (e.g. 2930) — the slash appears automatically."
                          }
                          InputLabelProps={{ shrink: true }}
                          required
                          fullWidth
                          autoComplete="cc-exp"
                          inputProps={{ inputMode: "numeric", maxLength: 5 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="CVC"
                          placeholder="123"
                          value={fields.cvc}
                          onChange={(event) =>
                            updateField("cvc", event.target.value.replace(/\D/g, "").slice(0, 4))
                          }
                          error={Boolean(fieldErrors.cvc)}
                          helperText={fieldErrors.cvc || "3 or 4 digits on the back (front for Amex)."}
                          InputLabelProps={{ shrink: true }}
                          required
                          fullWidth
                          autoComplete="cc-csc"
                          inputProps={{ inputMode: "numeric", maxLength: 4 }}
                        />
                      </Grid>
                    </Grid>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<LockOutlinedIcon />}
                      disabled={isSubmitting}
                      sx={{ py: 1.35 }}
                    >
                      {isSubmitting ? "Processing…" : "Pay securely"}
                    </Button>

                    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ pt: 0.5 }}>
                      <LockOutlinedIcon
                        sx={{
                          fontSize: 18,
                          color: "primary.main",
                          opacity: 0.85,
                          mt: 0.25,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        Protected by encryption. Your payment is processed securely — card data is safeguarded from
                        checkout through authorization.
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
