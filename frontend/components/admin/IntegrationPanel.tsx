"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { deleteData, getData, postData } from "@/lib/api";

type Integration = {
  id: string;
  script: string;
  token: string;
  endpointDomain: string;
  isActive: boolean;
};

function isValidWidgetScript(value: string) {
  return /^<script\b[^>]*\bsrc=["'][^"']+["'][^>]*>\s*<\/script>$/i.test(value.trim());
}

function isValidAccessToken(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  return /^[A-Za-z0-9._:-]{3,512}$/.test(trimmed);
}

export default function IntegrationPanel() {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [script, setScript] = useState("");
  const [token, setToken] = useState("");
  const [endpointDomain, setEndpointDomain] = useState("https://backend.atenxion.ai/api");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasIntegration = Boolean(integration);

  async function refresh() {
    setLoadError("");

    try {
      const { data } = await getData("/api/admin/integration");
      const nextIntegration = data.integration ?? null;
      setIntegration(nextIntegration);
      setScript(nextIntegration?.script ?? "");
      setToken(nextIntegration?.token ?? "");
      setEndpointDomain(nextIntegration?.endpointDomain ?? "https://backend.atenxion.ai/api");
    } catch {
      setLoadError("Unable to load integration.");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function addIntegration() {
    setError("");

    if (!script.trim()) {
      setError("Paste the widget script before adding the integration.");
      return;
    }

    if (!isValidWidgetScript(script)) {
      setError("Widget script must be a full script tag with a src attribute.");
      return;
    }

    if (!isValidAccessToken(token)) {
      setError("Access token can contain only letters, numbers, dots, underscores, colons, and hyphens.");
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await postData("/api/integration", {
        script: script.trim(),
        token: token.trim(),
        endpointDomain: endpointDomain.trim()
      });
      setIntegration(data.integration);
    } catch (err) {
      setError(
        isAxiosError(err)
          ? err.response?.data?.message || "Unable to add integration."
          : "Unable to add integration."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function removeIntegration() {
    if (!integration) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await deleteData(`/api/integration/${encodeURIComponent(integration.id)}`);
      setIntegration(null);
      setScript("");
      setToken("");
      setEndpointDomain("https://backend.atenxion.ai/api");
    } catch (err) {
      setError(
        isAxiosError(err)
          ? err.response?.data?.message || "Unable to remove integration."
          : "Unable to remove integration."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h4">Integration</Typography>
          <Chip size="small" label={hasIntegration ? "Connected" : "Not connected"} color={hasIntegration ? "success" : "default"} />
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Add one widget integration script and optional access token.
        </Typography>
      </Box>

      {loadError && <Alert severity="error">{loadError}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          borderColor: "rgba(236, 72, 153, 0.22)",
          bgcolor: "#fff",
          boxShadow: "0 10px 30px rgba(219, 39, 119, 0.08)"
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.25}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Widget box
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Store the embed script and token used by your website widget.
              </Typography>
            </Box>

            <TextField
              label="Widget script"
              value={script}
              onChange={(event) => setScript(event.target.value)}
              multiline
              minRows={4}
              fullWidth
              disabled={hasIntegration}
              required
              placeholder={'<script src="https://demo.atenxion.ai/api/atenxion-widget-script?..."></script>'}
              helperText="Paste the full embed script tag."
              error={Boolean(script.trim()) && !isValidWidgetScript(script)}
            />

            <TextField
              label="Access token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              fullWidth
              disabled={hasIntegration}
              placeholder="Optional access token"
              helperText="Optional. API or access token used by the widget."
              error={Boolean(token.trim()) && !isValidAccessToken(token)}
            />

            <TextField
              label="Endpoint Domain"
              value={endpointDomain}
              onChange={(event) => setEndpointDomain(event.target.value)}
              fullWidth
              disabled={hasIntegration}
              placeholder="https://backend.atenxion.ai/api"
              helperText="The backend API domain for sending events."
            />

            <Box>
              {hasIntegration ? (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={removeIntegration}
                  disabled={submitting}
                >
                  {submitting ? "Removing..." : "Remove"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addIntegration}
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add integration"}
                </Button>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
