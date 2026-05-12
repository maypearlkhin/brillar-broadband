"use client";

import AnnouncementIcon from "@mui/icons-material/Announcement";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import HistoryIcon from "@mui/icons-material/History";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useMemo } from "react";

export type IncidentPublic = {
  id: string;
  country: string;
  district: string;
  postalCode: string;
  message: string;
  createdAt: string;
  resolvedAt: string | null;
};

export type AnnouncementPublic = {
  id: string;
  message: string;
  createdAt: string;
};

function formatArea(
  i: Pick<IncidentPublic, "country" | "district" | "postalCode">,
) {
  return `${i.country} — ${i.district} (${i.postalCode})`;
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function ServiceStatusClient({
  incidents,
  announcements,
  initialTab = "active",
}: {
  incidents: IncidentPublic[];
  announcements: AnnouncementPublic[];
  initialTab?: "active" | "notices" | "resolved";
}) {
  const tab = initialTab === "notices" ? 1 : initialTab === "resolved" ? 2 : 0;

  const active = useMemo(
    () =>
      incidents
        .filter((i) => !i.resolvedAt)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [incidents],
  );

  const resolved = useMemo(
    () =>
      incidents
        .filter((i) => i.resolvedAt)
        .sort((a, b) => +new Date(b.resolvedAt!) - +new Date(a.resolvedAt!)),
    [incidents],
  );

  return (
    <Box
      sx={{
        bgcolor: "rgba(13, 27, 50, 0.08)",
        minHeight: "100vh",
        borderRadius: 2,
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography
          variant="overline"
          sx={{ fontWeight: 700, letterSpacing: 0.12, color: "primary.main" }}
        >
          Network operations
        </Typography>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Service status
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
          Live view of maintenance and outages by area, company notices, and
          recently cleared incidents. Available to everyone — sign-in not
          required.
        </Typography>
      </Stack>

      <Tabs
        value={tab}
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 700 },
        }}
      >
        <Tab
          component={Link}
          href="/service-status?tab=active"
          icon={<CloudOffIcon />}
          iconPosition="start"
          label={`Current impacts (${active.length})`}
        />
        <Tab
          component={Link}
          href="/service-status?tab=notices"
          icon={<AnnouncementIcon />}
          iconPosition="start"
          label={`Notices (${announcements.length})`}
        />
        <Tab
          component={Link}
          href="/service-status?tab=resolved"
          icon={<HistoryIcon />}
          iconPosition="start"
          label={`Resolved history (${resolved.length})`}
        />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          {active.length === 0 ? (
            <Typography color="text.secondary">
              There are no active service impacts reported right now. Check
              notices or resolved history for recent activity.
            </Typography>
          ) : (
            active.map((incident) => (
              <Card
                key={incident.id}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                <CardContent>
                  <Stack spacing={1.25}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Chip
                        size="small"
                        color="warning"
                        label="Active impact"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Reported {formatWhen(incident.createdAt)}
                      </Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {formatArea(incident)}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.65 }}>
                      {incident.message}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          {announcements.length === 0 ? (
            <Typography color="text.secondary">
              No active general notices.
            </Typography>
          ) : (
            announcements.map((n) => (
              <Card
                key={n.id}
                variant="outlined"
                sx={{ borderRadius: 2, bgcolor: "rgba(236, 72, 153, 0.06)" }}
              >
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    Posted {formatWhen(n.createdAt)}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.65 }}>
                    {n.message}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}

      {tab === 2 && (
        <Box>
          {resolved.length === 0 ? (
            <Typography color="text.secondary">
              No resolved incidents on record yet. When operations clears an
              active impact, it appears here with the cleared time.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Affected area</TableCell>
                    <TableCell>Summary</TableCell>
                    <TableCell align="right">Started</TableCell>
                    <TableCell align="right">Cleared</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resolved.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {formatArea(row)}
                      </TableCell>
                      <TableCell>{row.message}</TableCell>
                      <TableCell align="right">
                        {formatWhen(row.createdAt)}
                      </TableCell>
                      <TableCell align="right">
                        {row.resolvedAt ? formatWhen(row.resolvedAt) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 4 }}
      >
        Need your account?{" "}
        <Link href="/login" style={{ color: "inherit", fontWeight: 700 }}>
          Sign in
        </Link>{" "}
        or{" "}
        <Link href="/register" style={{ color: "inherit", fontWeight: 700 }}>
          register
        </Link>
        .
      </Typography>
    </Box>
  );
}
