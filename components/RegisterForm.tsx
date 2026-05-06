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
import { FormEvent, useState } from "react";
import { SERVICE_ZONES, formatServiceZone } from "@/lib/serviceZones";

export default function RegisterForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zoneIndex, setZoneIndex] = useState("0");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        serviceZone: SERVICE_ZONES[Number(zoneIndex)]
      })
    });

    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message || "Registration failed.");
      return;
    }

    const loginNext = nextPath || "/plans";
    router.push(`/login?next=${encodeURIComponent(loginNext)}`);
    router.refresh();
  }

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

            {error && <Alert severity="error">{error}</Alert>}

            <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
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
              <FormControl fullWidth>
                <InputLabel id="service-zone-label">Service Zone</InputLabel>
                <Select
                  labelId="service-zone-label"
                  label="Service Zone"
                  value={zoneIndex}
                  onChange={(event) => setZoneIndex(event.target.value)}
                >
                  {SERVICE_ZONES.map((zone, index) => (
                    <MenuItem value={String(index)} key={zone.postalCode}>
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
                disabled={isSubmitting}
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
