"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import type { ServiceZone } from "@/lib/serviceZones";
import { formatServiceZone } from "@/lib/serviceZones";
import { deleteData, getData, postData } from "@/lib/api";

type IncidentRow = {
  id: string;
  country: string;
  district: string;
  postalCode: string;
  message: string;
  createdAt: string;
  resolvedAt: string | null;
};

export default function NetworkStatusPanel() {
  const router = useRouter();
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [zoneIndex, setZoneIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    setLoadError("");
    try {
      const [zonesRes, incidentRes] = await Promise.all([
        getData("/api/service-zones"),
        getData("/api/network/status")
      ]);

      setZones(zonesRes.data.zones ?? []);
      setIncidents(
        (incidentRes.data.incidents ?? []).map(
          (row: IncidentRow & { createdAt: string | Date; resolvedAt?: string | null }) => ({
            ...row,
            createdAt:
              typeof row.createdAt === "string"
                ? row.createdAt
                : new Date(row.createdAt).toISOString(),
            resolvedAt: row.resolvedAt
              ? typeof row.resolvedAt === "string"
                ? row.resolvedAt
                : new Date(row.resolvedAt).toISOString()
              : null
          })
        )
      );
    } catch {
      setLoadError("Unable to load incidents.");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const zone = zones[zoneIndex];

    if (!zone) {
      setError("Select a service zone.");
      return;
    }

    if (!message.trim()) {
      setError("Enter an outage message.");
      return;
    }

    setSubmitting(true);

    try {
      await postData("/api/network/status", {
        location: zone,
        message: message.trim()
      });
      setMessage("");
      await refresh();
      router.refresh();
    } catch (err) {
      setError(
        isAxiosError(err)
          ? err.response?.data?.message || "Unable to create incident."
          : "Unable to create incident."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function removeIncident(id: string) {
    if (!window.confirm("Clear this outage for all customers?")) {
      return;
    }

    try {
      await deleteData(`/api/network/status/${encodeURIComponent(id)}`);
      await refresh();
      router.refresh();
    } catch (err) {
      setLoadError(
        isAxiosError(err) ? err.response?.data?.message || "Unable to delete." : "Unable to delete."
      );
    }
  }

  const activeIncidents = incidents.filter((i) => !i.resolvedAt);
  const resolvedIncidents = incidents.filter((i) => i.resolvedAt);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Service status</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Simulate a localized outage for demo and AI support. Customers in that zone will see an
          alert on their dashboard.
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
          <Stack direction="row" spacing={1} alignItems="center">
            <WarningAmberIcon color="warning" />
            <Typography fontWeight={800}>Report outage</Typography>
          </Stack>
          <FormControl fullWidth disabled={zones.length === 0}>
            <InputLabel id="outage-zone-label">Affected area</InputLabel>
            <Select
              labelId="outage-zone-label"
              label="Affected area"
              value={zones.length ? String(zoneIndex) : ""}
              onChange={(event) => setZoneIndex(Number(event.target.value))}
            >
              {zones.map((zone, index) => (
                <MenuItem value={String(index)} key={zone.postalCode}>
                  {formatServiceZone(zone)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Outage message"
            placeholder="e.g. Fibre maintenance in progress — ETA 2 hours"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            multiline
            minRows={3}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" disabled={submitting || zones.length === 0}>
            {submitting ? "Saving..." : "Flag area offline"}
          </Button>
        </Stack>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Active incidents
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Area</TableCell>
                <TableCell>Message</TableCell>
                <TableCell align="right">Created</TableCell>
                <TableCell align="right">Clear</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">No active incidents.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                activeIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      {formatServiceZone({
                        country: incident.country,
                        district: incident.district,
                        postalCode: incident.postalCode
                      })}
                    </TableCell>
                    <TableCell>{incident.message}</TableCell>
                    <TableCell align="right">
                      {new Date(incident.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => removeIncident(incident.id)}
                      >
                        Clear
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Recently cleared (public history)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Clearing moves an incident here — customers still see it under Resolved history on Service status.
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Area</TableCell>
                <TableCell>Message</TableCell>
                <TableCell align="right">Created</TableCell>
                <TableCell align="right">Cleared</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resolvedIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">No cleared incidents yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                resolvedIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      {formatServiceZone({
                        country: incident.country,
                        district: incident.district,
                        postalCode: incident.postalCode
                      })}
                    </TableCell>
                    <TableCell>{incident.message}</TableCell>
                    <TableCell align="right">
                      {new Date(incident.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : "—"}
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
