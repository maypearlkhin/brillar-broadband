"use client";

import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { isAxiosError } from "axios";
import { getData, postData } from "@/lib/api";
import { setAuthToken } from "@/lib/authStorage";
import { useRouter } from "next/navigation";

function getSafeRedirect(
  nextPath: string | undefined,
  role: string | undefined,
) {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "isp_team") {
    return "/isp/appointments";
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
  const router = useRouter();

  const sendLoginEvent = async (
    userId: string,
    authorizationToken: string | undefined,
    endpointDomain: string,
    userJwtToken: string,
  ) => {
    try {
      const endpoint = `${endpointDomain}/post-login/user-login`;
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: authorizationToken || "",
        },
        body: JSON.stringify({
          userId,
          message: `User logged in successfully with userId: ${userId}`,
          Authorization: `Bearer ${userJwtToken}`,
        }),
      });
    } catch (e) {
      console.log("Failed calling api to Atenxion Backend for user login", e);
    }
  };

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

      try {
        const intRes = await getData("/api/admin/integration");
        const integration = intRes?.data?.integration;
        if (
          integration?.token &&
          integration?.endpointDomain &&
          data.user?.id &&
          data.user?.role === "customer"
        ) {
          sendLoginEvent(
            data.user.id,
            integration.token,
            integration.endpointDomain,
            data.token,
          );
        }
      } catch (err) {
        // ignore error
      }
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
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "calc(100vh - 64px)",
        py: 6,
        backgroundImage:
          "linear-gradient(rgba(7, 16, 35, 0.68), rgba(7, 16, 35, 0.68)), url('/images/login-register-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Container maxWidth="sm">
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4">Welcome back</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Log in to manage your Brillar Broadband service. Your full name
                is collected when you{" "}
                <Link href="/register">create an account</Link> — we greet you
                by first name in the header.
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
              <Link
                href={
                  nextPath
                    ? `/register?next=${encodeURIComponent(nextPath)}`
                    : "/register"
                }
              >
                Create an account
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
