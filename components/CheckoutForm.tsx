"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { PlanCardData } from "@/components/PlanGrid";

type CheckoutFields = {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
};

type CheckoutErrors = Partial<Record<keyof CheckoutFields, string>>;

function getCardDigits(cardNumber: string) {
  return cardNumber.replace(/\s/g, "");
}

function validateExpiry(expiry: string) {
  const match = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);

  if (!match) {
    return "Use MM/YY format, for example 12/29.";
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
  } else if (!/^[A-Za-z ]{2,60}$/.test(cardName)) {
    errors.cardName = "Use letters and spaces only, 2-60 characters.";
  }

  if (!fields.cardNumber.trim()) {
    errors.cardNumber = "Card number is required.";
  } else if (!/^[\d ]+$/.test(fields.cardNumber)) {
    errors.cardNumber = "Card number can contain digits and spaces only.";
  } else if (!/^\d{13,19}$/.test(cardDigits)) {
    errors.cardNumber = "Card number must contain 13-19 digits.";
  }

  if (!fields.expiry.trim()) {
    errors.expiry = "Expiry is required.";
  } else {
    const expiryError = validateExpiry(fields.expiry.trim());

    if (expiryError) {
      errors.expiry = expiryError;
    }
  }

  if (!fields.cvc.trim()) {
    errors.cvc = "CVC is required.";
  } else if (!/^\d{3,4}$/.test(fields.cvc.trim())) {
    errors.cvc = "CVC must be 3 or 4 digits.";
  }

  return errors;
}

export default function CheckoutForm({ plan }: { plan: PlanCardData }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [fields, setFields] = useState<CheckoutFields>({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });
  const [fieldErrors, setFieldErrors] = useState<CheckoutErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof CheckoutFields, value: string) {
    setFields((currentFields) => ({
      ...currentFields,
      [field]: value
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined
    }));
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

    setIsSubmitting(true);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ planId: plan.id })
    });

    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message || "Checkout failed.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 6 }}>
      <Container maxWidth="md">
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h5">{plan.name}</Typography>
                  <Typography variant="h3" fontWeight={800}>
                    ${plan.monthlyPrice}
                    <Typography component="span" color="text.secondary">
                      /month
                    </Typography>
                  </Typography>
                  <Typography color="text.secondary">
                    {plan.downloadSpeedMbps} Mbps download speed with installation pending
                    after purchase.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h4">Mock checkout</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Use any card details for this MVP flow.
                    </Typography>
                  </Box>

                  {error && <Alert severity="error">{error}</Alert>}

                  <Stack component="form" spacing={2.5} onSubmit={handlePurchase}>
                    <TextField
                      label="Name on card"
                      value={fields.cardName}
                      onChange={(event) => updateField("cardName", event.target.value)}
                      error={Boolean(fieldErrors.cardName)}
                      helperText={fieldErrors.cardName || "Letters and spaces only."}
                      InputLabelProps={{ shrink: true }}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Card number"
                      placeholder="4242 4242 4242 4242"
                      value={fields.cardNumber}
                      onChange={(event) => updateField("cardNumber", event.target.value)}
                      error={Boolean(fieldErrors.cardNumber)}
                      helperText={fieldErrors.cardNumber || "Enter 13-19 digits. Spaces are allowed."}
                      InputLabelProps={{ shrink: true }}
                      required
                      fullWidth
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Expiry"
                          placeholder="12/29"
                          value={fields.expiry}
                          onChange={(event) => updateField("expiry", event.target.value)}
                          error={Boolean(fieldErrors.expiry)}
                          helperText={fieldErrors.expiry || "MM/YY"}
                          InputLabelProps={{ shrink: true }}
                          required
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="CVC"
                          placeholder="123"
                          value={fields.cvc}
                          onChange={(event) => updateField("cvc", event.target.value)}
                          error={Boolean(fieldErrors.cvc)}
                          helperText={fieldErrors.cvc || "3 or 4 digits"}
                          InputLabelProps={{ shrink: true }}
                          required
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<CreditCardIcon />}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Purchasing..." : "Purchase"}
                    </Button>
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
