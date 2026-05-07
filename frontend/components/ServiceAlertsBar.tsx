import AnnouncementIcon from "@mui/icons-material/Announcement";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { axiosServer } from "@/lib/axiosServer";

export const dynamic = "force-dynamic";

type Incident = {
  resolvedAt?: string | null;
};

async function fetchCounts() {
  try {
    const api = axiosServer();
    const [netRes, annRes] = await Promise.all([
      api.get<{ incidents: Incident[] }>("/api/network/status"),
      api.get<{ announcements: unknown[] }>("/api/announcements"),
    ]);

    const incidents = netRes.data.incidents ?? [];
    const active = incidents.filter((i) => !i.resolvedAt).length;
    const announcements = (annRes.data.announcements ?? []).length;

    return { active, announcements };
  } catch {
    return { active: 0, announcements: 0 };
  }
}

/** Thin strip below the header — summary counts + link to the full service status page (public). */
export default async function ServiceAlertsBar() {
  const { active, announcements } = await fetchCounts();

  if (active === 0 && announcements === 0) {
    return null;
  }

  return (
    <Box
      component="aside"
      aria-label="Service notices and outages"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(253, 242, 248, 0.97)",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 1.25 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                mt: 0.25,
                color: active > 0 ? "warning.dark" : "primary.main",
                display: "flex",
              }}
            >
              {active > 0 ? <CloudOffIcon fontSize="small" /> : <AnnouncementIcon fontSize="small" />}
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                Service impacts &amp; notices
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {active > 0 ? (
                  <>
                    <strong>{active}</strong> active area impact{active !== 1 ? "s" : ""}
                    {announcements > 0 ? " · " : ""}
                  </>
                ) : (
                  <>No active area impacts{announcements > 0 ? " · " : ""}</>
                )}
                {announcements > 0 ? (
                  <>
                    <strong>{announcements}</strong> company notice{announcements !== 1 ? "s" : ""}
                  </>
                ) : null}
              </Typography>
            </Box>
          </Stack>
          <Button
            component={Link}
            href="/service-status"
            variant="contained"
            color="primary"
            size="small"
            sx={{ alignSelf: { xs: "stretch", sm: "center" }, fontWeight: 700 }}
          >
            View full status
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
