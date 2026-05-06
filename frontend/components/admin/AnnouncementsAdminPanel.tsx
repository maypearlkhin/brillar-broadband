"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip
} from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type AnnouncementRow = {
  id: string;
  message: string;
  isActive: boolean;
  createdAt: string;
};

export default function AnnouncementsAdminPanel() {
  const router = useRouter();
  const [items, setItems] = useState<AnnouncementRow[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    setLoadError("");
    const response = await fetch("/api/admin/announcements", { cache: "no-store" });

    if (!response.ok) {
      setLoadError("Unable to load announcements.");
      return;
    }

    const data = await response.json();
    setItems(data.announcements ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Enter a message.");
      return;
    }

    setSubmitting(true);

    const response = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message.trim() })
    });

    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(data.message || "Unable to publish.");
      return;
    }

    setMessage("");
    await refresh();
    router.refresh();
  }

  async function removeAnnouncement(id: string) {
    if (!window.confirm("Remove this announcement from the customer dashboard?")) {
      return;
    }

    const response = await fetch(`/api/announcements/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const data = await response.json();
      setLoadError(data.message || "Unable to remove.");
      return;
    }

    await refresh();
    router.refresh();
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Announcements</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Publish maintenance or global notices. Customers see active announcements on their
          dashboard.
        </Typography>
      </Box>

      {loadError && <Alert severity="error">{loadError}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2
        }}
      >
        <Stack spacing={2}>
          <Typography fontWeight={800}>New announcement</Typography>
          <TextField
            label="Message"
            placeholder="Scheduled maintenance tonight 11pm–1am."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            multiline
            minRows={4}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Publishing..." : "Publish"}
          </Button>
        </Stack>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          All announcements
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Message</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Published</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">No announcements yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ maxWidth: 420 }}>{row.message}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.isActive ? "Active" : "Removed"}
                        color={row.isActive ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="Remove announcement"
                        color="error"
                        disabled={!row.isActive}
                        onClick={() => removeAnnouncement(row.id)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Stack>
  );
}
