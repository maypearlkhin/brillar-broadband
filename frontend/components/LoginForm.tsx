"use client";

import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { postData } from "@/lib/api";
import { setAuthToken } from "@/lib/authStorage";

function getSafeRedirect(nextPath: string | undefined, role: string | undefined) {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (
    nextPath &&
    nextPath.startsWith("/") &&
    !nextPath.startsWith("/login") &&
    !nextPath.startsWith("/register")
  ) {
    return nextPath;
  }

  return "/dashboard";
}

export default function LoginForm({ nextPath }: { nextPath?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await postData("/api/auth/login", { email, password });

      if (!data?.token) {
        setError("Login failed.");
        return;
      }

      setAuthToken(data.token);
      window.location.assign(getSafeRedirect(nextPath, data.user?.role));
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Login failed.");
      } else {
        setError("Login failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 6 }}>
      <Container maxWidth="sm">
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4">Welcome back</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Log in to manage your Brillar Broadband service. Your full name is collected when you{" "}
                <Link href="/register">create an account</Link> — we greet you by first name in the header.
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
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              New to Brillar?{" "}
              <Link href={nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register"}>
                Create an account
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
