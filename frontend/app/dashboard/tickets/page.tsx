"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getData, postData } from "@/lib/api";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: "Open" | "Resolved" | "Rejected";
  createdAt: string;
};

export default function CustomerTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTab, setCurrentTab] = useState<"Open" | "Resolved" | "Rejected">("Open");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadTickets() {
    try {
      const { data } = await getData("/api/tickets");
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to load tickets", err);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = tickets.filter((t) => t.status === currentTab);

  async function handleReportIssue() {
    setError("");
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setSubmitting(true);
    try {
      await postData("/api/tickets", { title, description });
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setCurrentTab("Open");
      loadTickets();
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to create ticket.");
      } else {
        setError("Failed to create ticket.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Support Tickets</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Report technical issues and track your ongoing support requests.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          Report an Issue
        </Button>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newVal) => setCurrentTab(newVal)}>
          <Tab label="Open" value="Open" />
          <Tab label="Resolved" value="Resolved" />
          <Tab label="Rejected" value="Rejected" />
        </Tabs>
      </Box>

      <Stack spacing={2}>
        {filteredTickets.length === 0 ? (
          <Typography color="text.secondary">No {currentTab.toLowerCase()} tickets found.</Typography>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket._id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardActionArea onClick={() => router.push(`/dashboard/tickets/${ticket._id}`)}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {ticket.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Reported on {new Date(ticket.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={ticket.status}
                      color={ticket.status === "Open" ? "primary" : ticket.status === "Resolved" ? "success" : "error"}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          ))
        )}
      </Stack>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report an Issue</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Issue Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              minRows={4}
              fullWidth
              required
              helperText="Please describe the issue in detail."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleReportIssue} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
