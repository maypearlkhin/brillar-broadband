"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { getData, postData } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: "Open" | "Resolved" | "Rejected";
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

export default function CustomerTicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        onClick={() => router.push("/dashboard/tickets")}
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
                      alignItems: comment.isAdmin ? "flex-start" : "flex-end",
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "80%",
                        bgcolor: comment.isAdmin ? "grey.100" : "primary.main",
                        color: comment.isAdmin ? "text.primary" : "primary.contrastText",
                        p: 2,
                        borderRadius: 2,
                        borderTopLeftRadius: comment.isAdmin ? 0 : 2,
                        borderTopRightRadius: comment.isAdmin ? 2 : 0,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, opacity: 0.8 }}>
                        {comment.isAdmin ? <SupportAgentIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {comment.isAdmin ? "Support Agent" : "You"}
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
                <Alert severity="info" sx={{ m: 0 }}>This ticket has been marked as resolved and is now locked.</Alert>
              </Box>
            ) : (
              <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                <TextField
                  placeholder="Type your reply here..."
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
                  <Typography variant="caption" color="text.secondary">Reported Date</Typography>
                  <Typography variant="body2">{new Date(ticket.createdAt).toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
