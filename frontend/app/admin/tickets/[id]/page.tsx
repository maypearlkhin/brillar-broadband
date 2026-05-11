"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import { getData, patchData, postData } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: "Open" | "Resolved" | "Rejected";
  customerName: string;
  customerEmail: string;
  zoneCountry: string;
  zoneDistrict: string;
  zonePostalCode: string;
  createdAt: string;
};

type Comment = {
  _id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  userId: {
    name: string;
  };
};

export default function AdminTicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"Resolved" | "Rejected" | "Open" | null>(null);

  async function loadData() {
    try {
      const { data } = await getData(`/api/tickets/${params.id}`);
      setTicket(data.ticket);
      setComments(data.comments || []);
    } catch (err) {
      setError("Unable to load ticket details.");
    }
  }

  useEffect(() => {
    if (params.id) {
      loadData();
    }
  }, [params.id]);

  async function handleSendReply() {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await postData(`/api/tickets/${params.id}/comments`, { content: newComment });
      setNewComment("");
      await loadData();
    } catch (err) {
      setError("Failed to send reply.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleActionClick(status: "Resolved" | "Rejected" | "Open") {
    setConfirmAction(status);
  }

  async function executeChangeStatus() {
    if (!confirmAction) return;

    try {
      await patchData(`/api/admin/tickets/${params.id}/status`, { status: confirmAction });
      setConfirmAction(null);
      await loadData();
    } catch (err) {
      setError("Failed to change status.");
      setConfirmAction(null);
    }
  }

  if (error && !ticket) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!ticket) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/admin/tickets")}
        sx={{ mb: 2 }}
      >
        Back to Tickets
      </Button>

      <Grid container spacing={4} alignItems="flex-start">
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 2, mb: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {ticket.title}
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>{ticket.description}</Typography>
            </CardContent>
          </Card>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Discussion
          </Typography>

          <Card variant="outlined" sx={{ borderRadius: 2, display: "flex", flexDirection: "column", height: 500, mb: 3 }}>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2,
                bgcolor: "background.paper",
              }}
            >
              <Stack spacing={2}>
                {comments.map((comment) => (
                  <Box
                    key={comment._id}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: comment.isAdmin ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "80%",
                        bgcolor: comment.isAdmin ? "primary.main" : "grey.100",
                        color: comment.isAdmin ? "primary.contrastText" : "text.primary",
                        p: 2,
                        borderRadius: 2,
                        borderTopLeftRadius: comment.isAdmin ? 2 : 0,
                        borderTopRightRadius: comment.isAdmin ? 0 : 2,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, opacity: 0.8 }}>
                        {comment.isAdmin ? <SupportAgentIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {comment.isAdmin ? "You" : ticket.customerName}
                        </Typography>
                        <Typography variant="caption">•</Typography>
                        <Typography variant="caption">{new Date(comment.createdAt).toLocaleString()}</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        {comment.content}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider />

            {ticket.status === "Resolved" ? (
              <Box p={2} bgcolor="grey.50">
                <Alert severity="info" sx={{ m: 0 }}>This ticket has been marked as resolved. Reopen to add comments.</Alert>
              </Box>
            ) : (
              <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                <TextField
                  placeholder="Type your reply to the customer..."
                  multiline
                  maxRows={4}
                  fullWidth
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          color="primary"
                          onClick={handleSendReply}
                          disabled={submitting || !newComment.trim()}
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { bgcolor: "background.paper", borderRadius: 2 }
                  }}
                />
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 2, textTransform: "uppercase" }}>
                Ticket Details
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={ticket.status}
                      color={ticket.status === "Open" ? "primary" : ticket.status === "Resolved" ? "success" : "error"}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Reported By</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{ticket.customerName}</Typography>
                  <Typography variant="body2" color="text.secondary">{ticket.customerEmail}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Location</Typography>
                  <Typography variant="body2">{ticket.zoneDistrict}, {ticket.zoneCountry}</Typography>
                  <Typography variant="body2" color="text.secondary">{ticket.zonePostalCode}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Reported Date</Typography>
                  <Typography variant="body2">{new Date(ticket.createdAt).toLocaleString()}</Typography>
                </Box>
              </Stack>
              
              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 2, textTransform: "uppercase" }}>
                Actions
              </Typography>
              
              <Stack spacing={1}>
                {ticket.status === "Open" ? (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleActionClick("Resolved")}
                      fullWidth
                    >
                      Resolve Ticket
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<BlockIcon />}
                      onClick={() => handleActionClick("Rejected")}
                      fullWidth
                    >
                      Reject Ticket
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => handleActionClick("Open")}
                    fullWidth
                  >
                    Reopen Ticket
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={Boolean(confirmAction)} onClose={() => setConfirmAction(null)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the status of this ticket to {confirmAction}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={confirmAction === "Resolved" ? "success" : confirmAction === "Rejected" ? "error" : "primary"}
            onClick={executeChangeStatus}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
