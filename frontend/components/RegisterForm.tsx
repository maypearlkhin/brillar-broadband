"use client";

import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import type { ServiceZone } from "@/lib/serviceZones";
import { formatServiceZone } from "@/lib/serviceZones";
import { getData, postData } from "@/lib/api";

export default function RegisterForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zones, setZones] = useState<ServiceZone[]>([]);
  /** Stable key for MUI Select — avoids index/string coercion bugs with MenuItem values. */
  const [selectedPostal, setSelectedPostal] = useState("");
  const [zonesError, setZonesError] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadZones() {
      try {
        const { data } = await getData("/api/service-zones");
        const list = (data.zones ?? []) as ServiceZone[];

        if (!cancelled) {
          setZones(list);
          setZonesError("");
          if (list.length > 0) {
            setSelectedPostal((prev) =>
              prev && list.some((z) => z.postalCode === prev) ? prev : list[0].postalCode
            );
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setZones([]);
          setSelectedPostal("");
          setZonesError(
            isAxiosError(loadError)
              ? loadError.response?.data?.message || "Unable to load service zones."
              : "Unable to load service zones."
          );
        }
      }
    }

    loadZones();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    const zone = zones.find((z) => z.postalCode === selectedPostal);

    if (!zone) {
      setError("Please select a service zone.");
      return;
    }

    setIsSubmitting(true);

    try {
      await postData("/api/auth/register", {
        name: fullName.trim(),
        email,
        password,
        serviceZone: zone
      });

      const loginNext = nextPath || "/plans";
      router.push(`/login?next=${encodeURIComponent(loginNext)}`);
      router.refresh();
    } catch (submitErr) {
      setError(
        isAxiosError(submitErr)
          ? submitErr.response?.data?.message || "Registration failed."
          : "Registration failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const zonesReady = zones.length > 0 && Boolean(selectedPostal);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 6 }}>
      <Container maxWidth="sm">
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4">Create your account</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Select a supported Brillar service zone to continue.
              </Typography>
            </Box>

            {zonesError && <Alert severity="error">{zonesError}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
              <TextField
                label="Full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
                autoComplete="name"
                helperText="Shown in the navigation bar after you sign in."
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                inputProps={{ minLength: 6 }}
                fullWidth
              />
              <FormControl fullWidth required disabled={zones.length === 0}>
                <InputLabel id="service-zone-label">Service Zone</InputLabel>
                <Select
                  labelId="service-zone-label"
                  id="service-zone-select"
                  label="Service Zone"
                  value={selectedPostal}
                  onChange={(event) => setSelectedPostal(event.target.value)}
                  MenuProps={{
                    disablePortal: false,
                    PaperProps: { sx: { maxHeight: 320 } }
                  }}
                >
                  {zones.map((zone) => (
                    <MenuItem value={zone.postalCode} key={zone.postalCode}>
                      {formatServiceZone(zone)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<PersonAddIcon />}
                disabled={isSubmitting || !zonesReady}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}>
                Log in
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
